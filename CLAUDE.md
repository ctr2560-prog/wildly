# Wildly by Taronga — CLAUDE.md

## What is this project?

Wildly is a learning management system / teacher resource library for Taronga education content — lessons, learning paths, resources, Taronga TV videos, professional learning, and live in-class activity sessions. It's part of a wider **"Taronga Education" ecosystem** alongside **Taronga Tracka** (`/Users/cameronrodgers/taronga-tracka-vite`, separate repo) — the two apps share one login and one Firebase backend. **Read the "Taronga Education ecosystem" section below before touching auth, identity, or Firestore rules-related code.**

Live URL: `https://wildlybytaronga.com.au` (GitHub Pages, custom domain via `public/CNAME`).

CLAUDE_HANDOFF.md in this repo is stale (dated 2026-06-15, describes a file layout — `src/data/defaults.js`, `src/lib/firebase-hooks.js` — that no longer exists). Treat this file as current, not that one.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 7 |
| State | Local component state + Firestore `onSnapshot` hooks (no Redux/Context library) |
| Backend | Firebase — Firestore, Auth (email + password), Analytics (optional) |
| Hosting | GitHub Pages (`.github/workflows/deploy-pages.yml`), custom domain `wildlybytaronga.com.au` |
| Routing | Manual hash-based routing (`window.location.hash`), no router library |

`node_modules` is a symlink to `/Users/cameronrodgers/taronga-tracka/node_modules` (an old, unrelated pre-Vite-migration Tracka checkout — not `taronga-tracka-vite`). This is a pre-existing quirk, not a bug: the installed versions there happen to satisfy this repo's `package.json` exactly (react 19.2.4, firebase 12.10.0, vite 7.3.1). Leave it as-is; don't "fix" it by pointing it elsewhere without checking version compatibility first.

---

## File Structure

```
wildly/
├── src/
│   ├── main.jsx              # Thin entry point (~44 lines) — decides public vs authenticated app via hash route
│   ├── public-app.jsx         # Marketing/landing site (~1500 lines)
│   ├── authenticated-app.jsx  # The actual app: auth, teacher dashboard, staff console, student/live-session pages (~4700+ lines, one file)
│   ├── firebase.js            # Firebase config — points at the SHARED "tarongatracka" project
│   ├── bootstrap.css
├── landing.css                 # Public marketing page styles + shared .auth-* login/signup styles
├── styles.css                  # Teacher dashboard/app styles
├── staff.css                   # Staff console styles (separate namespace from .auth-*)
├── public/
│   ├── CNAME                   # wildlybytaronga.com.au
│   └── assets/                 # Served assets — the ACTUAL served copy (top-level /assets/ source folder has diverged and is not auto-synced; only public/assets/ matters)
├── .firebaserc                  # Points at "tarongatracka" (shared project) — no firebase.json, no firestore.rules (see below)
└── .github/workflows/deploy-pages.yml   # Auto-builds and deploys to GitHub Pages on every push to main
```

`authenticated-app.jsx` is a large single file mixing routing, data hooks, and UI. Known follow-up (from the original handoff, never done): split into `features/landing`, `features/teacher`, `features/staff`, `features/student` etc. Not urgent — just be aware line numbers shift easily when editing.

---

## Taronga Education ecosystem — shared backend (live)

This app shares its entire Firebase backend with Taronga Tracka. **Full details, including the canonical Firestore rules, live in `taronga-tracka-vite/CLAUDE.md`'s "Taronga Education ecosystem" section — read that too, not just this file.**

The short version:
- `src/firebase.js` points at the `tarongatracka` Firebase project — the same one Tracka uses. Not `wildly-762f5` (an old, now-unused project; don't repoint back to it).
- Teacher identity lives at `teachers/{email}` (email lowercased), **not** `users/{uid}`. This is Tracka's identity model — Wildly adopted it, not the other way around, because Tracka has real live teacher accounts and Wildly didn't when this was set up.
- Signup (`AuthScreen`, `mode="signup"`, in `authenticated-app.jsx`) collects exactly what Tracka's own registration form collects: email, password, confirm password, school (autocomplete via the local `schoolOptions` array + a "can't find school" manual-entry fallback). Nothing else — no name/country/role prompt during signup. Writes `{ email, schoolName, createdAt, products: arrayUnion('wildly') }` to `teachers/{email}`.
- **No forced profile-completion step.** Any authenticated user — whether the account originated on Tracka or on Wildly — is sent straight to `#teacher` on login and on session-restore (`useSessionUser`'s effect). There used to be a mandatory "About You" redirect gate here; it was removed because it made existing Tracka teachers jump through an extra step the first time they used Wildly.
- `AboutYouPage` (collects name/country/role, writes the same `teachers/{email}` doc with `merge:true`) still exists and is still reachable — click the profile pill in the top-right of the teacher dashboard header (`#about-you`) — it's just optional now, not mandatory.
- `useUsers()` (staff console's user list) reads the `teachers` collection and sorts client-side (not Firestore `orderBy("name")`), since plenty of `teachers/{email}` docs (anyone who only ever used Tracka) have no `name` field, and `orderBy` would silently drop them from the query.
- Content collections (`contentItems`, `dashboardConfig`, `professionalLearning`, `tarongaTvVideos`, `upcomingEvents`, `liveSessions`, `liveResponses`) are Wildly-only and don't collide with anything Tracka uses — every hook falls back to a hardcoded JS default (`defaultContentItems` etc., near the top of `authenticated-app.jsx`) when Firestore is empty, so the app works even with zero Firestore documents.

**⚠️ Protections:**
1. **This repo has no `firestore.rules` file, on purpose.** Rules for the shared project live only in `taronga-tracka-vite/firestore.rules`. If you (or a tool) ever create a `firestore.rules` file here, **delete it, don't deploy it** — deploying rules from this repo would overwrite the real ruleset with an incomplete one and could lock Tracka out of its own data. Same for `firebase.json` — also deleted on purpose, also don't recreate for Hosting (this app deploys via GitHub Pages, not Firebase Hosting).
2. **Don't change `src/firebase.js` back to a standalone project** without updating `taronga-tracka-vite/CLAUDE.md` too — the two repos' docs must stay in sync about which project is authoritative.
3. **A `git push` to `main` auto-deploys to the live site** (`.github/workflows/deploy-pages.yml` builds and publishes on every push) — there's no separate manual deploy step to pause on here, unlike Tracka. Treat every push to this repo as a production release.
4. **Editing Wildly's own features/content/UI is completely safe** and cannot affect Tracka — the only shared surface is the `teachers/{email}` doc shape and the identity/auth flow described above. Normal feature work here doesn't need any special care beyond the usual.
5. Cross-domain single sign-on does **not** exist yet — a teacher still logs into each app separately (with the same credentials). Don't assume a Tracka session carries over automatically; it doesn't.

---

## Auth model

There are two Firebase-Auth-gated areas.

**Teacher auth** (`AuthScreen`, `#login` / `#get-started`):
- Real `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`, as described above.
- `demo@zoo` is a client-only bypass for quick demos. It never touches Firebase Auth.

**Staff console:**
- Staff are the root admin (`ROOT_ADMIN_EMAILS`, thebiologybloke@gmail.com) or anyone with a doc at `staffAdmins/{email}`. This is the same rule as `isWildlyStaff()` in Tracka's `firestore.rules`, which is the real security boundary.
- Staff are managed in the console's Users / Control Room panels.
- The old `teachers.role` field grants nothing (since 2026-10-03).
- The Control Room passcode and local "admin" password were removed.

**App Check** (reCAPTCHA Enterprise, `src/firebase.js`) is **enforced** on Firestore and Storage:
- Local dev and Wildly Studio need a registered debug token.
- Studio posts as a staff member with a per-Mac debug token (see `~/wildly-studio/CLAUDE.md`).

---

## Teacher lesson pages, check-in quiz and class results (2026-10-23)

Lessons usually come from **Wildly Studio** (`~/wildly-studio`), which posts `contentItems` with slides, a sheet PDF, a lesson plan .docx and a check-in quiz.

### Lesson / unit page (`page === "content"`, classes `ld-*` in `src/teacher-design.css`)
Top to bottom:
1. Photo banner.
2. Toolbar: the **Lesson plan** (or Unit plan) button first, then the syllabus outcomes, then Save.
3. Learning intention and success-criteria ticks.
4. About this lesson.
5. "Run this lesson", as 2×2 step cards: Check-in quiz → Present the lesson → Student worksheet → Check-in again.
6. Teacher files.

Keep it flat and plain, to match the rest of the teacher site. Cameron rejected anything that "looks like AI": pills, shadows, gradients and uppercase labels.

### Check-in quiz player (`QuizPresenterPage`, classes `kq-*` in `styles.css`)
- Routes:
  - `#teacher/quiz/<id>`: pre check-in.
  - `#teacher/quiz/<id>/again`: post check-in.
  - `…/pre/<classId>` or `…/again/<classId>`: the same, with the class already picked.
- A Taronga take on Kahoot: big coloured tiles with a shape and the body move, and a 20 s timer.
- Response mode `heads-shoulders`: first answer = hands on head, second = hands on shoulders. **No A/B letters.**
- The teacher taps the answer most of the class shows, and the screen shows right/wrong plus the "Did you know?" fact.
- The start screen has a "Which class?" dropdown listing all the teacher's classes (Wildly and Tracka). Finishing saves `{ classId, contentId, round: "pre"|"post", score, total }` with `recordQuizResult` and assigns the lesson to that class if needed.
- The end of the post round shows "You improved by X!", "Great work!" (same score) or "Let's revise" (lower), with the start and end scores side by side.

### My Classes → class page
"Check-in results" shows pre / post / change for each quizzed lesson, the class averages, and ▶ Pre / ▶ Post buttons.

**Where results live:** quiz results, classes and assignments are stored in the teacher's **browser workspace** (`localStorage`, `wildly-teacher-workspace:<email>`), not Firestore. So pre and post results only meet up when they're run on the same browser. Moving them to Firestore would need a rule change in the Tracka repo, which Cameron hasn't approved.

### Local preview with sample data
To preview without real data, temporarily wrap `useContentItems`'s return with a `/*LOCAL-DEMO*/ … /*LOCAL-DEMO-END*/` block that injects a quiz when `import.meta.env.DEV` is set. **Remove it before committing.** Pushes to `main` go live.

---

## Known rough edges (pre-existing, not yet fixed)

- `displayName` falls back to the hardcoded placeholder `"Mr. Thompson"` when `profile.name` isn't set (`authenticated-app.jsx` line ~1427) — cosmetic, not a bug, just a leftover placeholder from earlier development.
- `authenticated-app.jsx` is one very large file — a future refactor into smaller feature modules would help, not urgent.
