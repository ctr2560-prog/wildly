# Claude Code Handoff: Wildly Platform

Date: 2026-06-15  
Project path: `/Users/cameronrodgers/wildly`  
Local dev URL: `http://127.0.0.1:5173/`

## Current Goal

Continue building the Wildly by Taronga platform. The immediate work today focused on:

- Getting the app running locally.
- Fixing Firestore read permission errors.
- Updating the public homepage hero so the large laptop mockup uses a static dashboard screenshot.
- Preserving the current visual request: the screenshot should show the full dashboard, including the gap between the left sidebar and main content.

## Repo Overview

This is a Vite + React single page app with Firebase Auth and Firestore.

Key files:

- `src/main.jsx`: Main app implementation. Very large single file, currently about 5k+ lines.
- `landing.css`: Public marketing/homepage styles.
- `styles.css`: Teacher dashboard/app styles.
- `staff.css`: Staff console styles.
- `src/firebase.js`: Firebase project config for `wildly-762f5`.
- `firestore.rules`: Firestore security rules.
- `firebase.json`: Added so Firebase CLI knows where rules live.
- `.firebaserc`: Added to link default project to `wildly-762f5`.
- `public/assets/wildly-dashboard-homepage.png`: New static screenshot used in homepage laptop mockup.

Package scripts:

```bash
npm run dev
npm run build
npm run preview
```

The dev server has been running with:

```bash
npm run dev -- --host 127.0.0.1
```

## App Routes

Hash routing is implemented manually in `src/main.jsx`.

Important routes:

- `/` or `/#`: Public homepage.
- `/#login`: Teacher login.
- `/#get-started`: Signup.
- `/#about-you`: User profile setup.
- `/#teacher`: Teacher dashboard.
- `/#teacher/preview`: Teacher dashboard preview mode; no auth required.
- `/#teacher/subjects`
- `/#teacher/subjects/:subject`
- `/#teacher/resources`
- `/#teacher/content/:id`
- `/#teacher/taronga-tv`
- `/#teacher/taronga-tv/:id`
- `/#teacher/professional-learning`
- `/#teacher/live/:sessionId`
- `/#teacher/present/:contentId`
- `/#student`
- `/#student/code/:code`
- `/#staff`

## Access Notes

Teacher demo:

- On login, use `demo@zoo`.
- This creates a local demo session and bypasses Firebase password auth.
- Demo profile displays as Demo Teacher.

Staff console:

- Temporary frontend-only password is `admin`.
- Defined at `src/main.jsx:346`.
- Important: this is only a browser/session lock. It is not real security.

Real staff editing:

- Firestore writes are now restricted by rules to authenticated users whose `users/{uid}.role` is one of:
  - `Education Staff`
  - `Curriculum Leader`
  - `School Leader`

Because the current staff console only has a local password, staff editing/publishing will fail unless the browser is also authenticated with a Firebase user that has one of those roles.

## Firebase State

Firebase project:

- Project ID: `wildly-762f5`
- CLI account used successfully: `thebiologybloke@gmail.com`

The app uses live Firebase config in `src/firebase.js`.

Firestore rules were deployed successfully:

```bash
firebase deploy --only firestore:rules --project wildly-762f5
```

Read verification succeeded after deploy:

- `dashboardConfig/main` readable.
- `contentItems` readable.

Current rules summary:

- Public reads allowed for:
  - `dashboardConfig`
  - `contentItems`
  - `lessons`
  - `learningPaths`
  - `resources`
  - `professionalLearning`
  - `tarongaTvVideos`
  - `liveSessions`
- Content writes restricted to staff roles.
- `users/{uid}` read/write restricted to owner or staff.
- `liveResponses` can be created/updated publicly so students can submit responses without auth.
- `liveResponses` reads require auth.

Security note:

- This is safer than the previous rules, which had `allow write: if true` on everything.
- It is still a prototype-grade rule set. Live sessions and responses need a stronger ownership/session model later.

## Recent Changes Made

### Firestore fallback behavior

Changed Firestore read error handling in `src/main.jsx`:

- `useContentItems`
- `useProfessionalLearningItems`
- `useTarongaTvVideos`
- `useDashboardConfig`

Permission-denied now sets status to `"fallback"` instead of `"error"` and uses built-in fallback data.

Teacher-facing route no longer renders the Firestore warning banners above the dashboard.

Staff console still shows specific fallback/error status because staff editing depends on real Firestore write access.

### Homepage screenshot change

User wanted the dashboard screenshot shown in the big screen/laptop area on the homepage.

Current implementation:

- Added asset key:
  - `dashboardScreenshot: assetPath("assets/wildly-dashboard-homepage.png")`
- Homepage laptop now renders:
  - `<img className="teacher-preview-image" src={assets.dashboardScreenshot} ... />`
- Removed the previous live `iframe` from the homepage laptop.
- Removed the floating secondary student/laptop overlay from the homepage hero because it made the screenshot look cluttered.

Relevant source:

- `src/main.jsx:23`: asset map.
- `src/main.jsx:1181`: `LandingPage`.
- `landing.css` around `.device-stage`, `.laptop`, `.laptop-screen`, `.teacher-preview-image`.

Current CSS intent:

- `.laptop-screen` uses `aspect-ratio: 16 / 9`.
- `.teacher-preview-image` uses `object-fit: contain` to preserve the full screenshot without cropping.
- This was changed specifically because the user said: “I just want this screenshot in there, there is a gap between the left panel and the other content.”

Do not re-zoom or crop the screenshot unless explicitly asked. The user wants the screenshot as-is.

## Current Working Tree

At the time of this handoff, these files are modified/untracked:

```text
 M firestore.rules
 M landing.css
 M src/main.jsx
?? .firebaserc
?? "assets/ teacher-pl.jpg.png"
?? assets/about-bottom.png
?? assets/about-top.png
?? firebase.json
?? public/assets/wildly-dashboard-homepage.png
?? CLAUDE_HANDOFF.md
```

The three untracked `assets/...` files existed before the latest homepage screenshot work:

- `assets/ teacher-pl.jpg.png`
- `assets/about-bottom.png`
- `assets/about-top.png`

Do not delete or revert them without checking with the user.

## Verification Already Run

Build passes:

```bash
npm run build
```

Latest build warning:

- Vite warns that the JS chunk is larger than 500 kB.
- This is expected because `src/main.jsx` is a very large single entry file.
- Future improvement: split routes/components and code-split route-level screens.

Local app responds:

```bash
curl -I http://127.0.0.1:5173/
```

Expected `200 OK`.

## Important Implementation Landmarks

In `src/main.jsx`:

- `const assets`: line ~23.
- `defaultContentItems`: line ~152.
- `staffPassword`: line ~346.
- `LandingPage`: line ~1181.
- `TeacherDashboard`: line ~1855.
- `defaultDashboardConfig`: line ~3004.
- `useContentItems`: line ~3087.
- `useDashboardConfig`: line ~3310.
- `StaffConsole`: line ~3428.
- `StudentPage`: line ~5107.
- `TeacherLiveSessionPage`: line ~5172.

## Design/UX Notes From User

The user is iterating visually and prefers direct changes over abstract explanation.

Recent homepage visual direction:

- Use the exact dashboard screenshot in the big screen.
- Preserve the gap between the left panel/sidebar and the main content in that screenshot.
- Avoid making the screenshot look “funky” by over-cropping, over-zooming, or adding extra overlay mockups.

## Recommended Next Tasks

### 1. Verify homepage visually in the user’s Chrome

Ask the user to hard refresh:

```text
Cmd + Shift + R
```

The homepage should show the full static dashboard screenshot inside the big laptop. If it still looks off, adjust only layout/frame sizing first; avoid cropping the image.

### 2. Commit current stable work

Before major changes, review and commit:

- Firestore rules changes.
- Firebase project config files.
- Homepage screenshot asset.
- Homepage laptop image wiring.
- Firestore fallback UI handling.

Be careful with unrelated untracked assets in `assets/`.

### 3. Proper staff authentication

Current staff console is only protected by local password `admin`, but Firestore writes now require Firebase-authenticated staff roles.

Recommended approach:

- Require real Firebase login for staff operations.
- Add an admin/staff route or combine staff password with Firebase auth.
- Use `users/{uid}.role` to decide whether staff panels can save.
- Show a clear “Signed in as staff” state.

### 4. Refactor `src/main.jsx`

The app is currently too large for comfortable iteration.

Suggested split:

- `src/App.jsx`: routing shell.
- `src/data/defaults.js`: default content, dashboard config, stock images.
- `src/lib/routes.js`: route helpers.
- `src/lib/firebase-hooks.js`: Firestore hooks.
- `src/components/common/*`: Icon, banners, links.
- `src/features/landing/*`
- `src/features/teacher/*`
- `src/features/staff/*`
- `src/features/student/*`

Do this incrementally and verify after each extraction.

### 5. Add emulator option

Currently local dev talks to live Firebase.

Recommended:

- Add Firebase emulator config.
- Add env flag such as `VITE_USE_FIREBASE_EMULATORS=true`.
- Connect Auth/Firestore emulators in `src/firebase.js` only when flag is set.
- Add seed script for default dashboard/content.

### 6. Improve security model

Current rules are okay for prototype reads, but need tightening:

- `liveSessions` should be owned by teacher UID.
- `liveResponses` should require valid session code/session state.
- Public response writes should be rate-limited or mediated later.
- Staff content writes should validate document shape.
- User roles should ideally be custom claims or managed by trusted backend/admin flow, not self-editable profile fields.

### 7. Replace screenshot asset with curated exact asset if provided

The current screenshot was captured locally from `/#teacher/preview`.

If the user provides an exact desired screenshot file, replace:

```text
public/assets/wildly-dashboard-homepage.png
```

Keep the same filename to avoid code changes.

## Commands Useful For Claude Code

Start local dev:

```bash
cd /Users/cameronrodgers/wildly
npm run dev -- --host 127.0.0.1
```

Build:

```bash
npm run build
```

Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules --project wildly-762f5
```

Check Firebase projects:

```bash
firebase projects:list
```

Read dashboard/content quickly:

```bash
node -e "import('./src/firebase.js').then(async ({db}) => { const {doc,getDoc,collection,getDocs,limit,query}=await import('firebase/firestore'); const config=await getDoc(doc(db,'dashboardConfig','main')); console.log('config exists', config.exists()); const snap=await getDocs(query(collection(db,'contentItems'), limit(1))); console.log('content size', snap.size); process.exit(0); }).catch((error)=>{ console.error(error.code || error.name, error.message); process.exit(1); })"
```

## Known Issues / Risks

- `src/main.jsx` is too large and mixes routing, data, UI, and Firebase hooks.
- Homepage screenshot is static, so it will not reflect future dashboard edits unless recaptured.
- Staff console can open with local password but cannot write unless the browser is authenticated as a staff-role Firebase user.
- Live Firebase is used during local dev.
- Some public write paths remain for student responses.
- Bundle size warning remains.
- There is no test suite.

## User Preference Signal

User wants practical changes and visual iteration. Keep responses short and concrete. When changing visuals, verify with screenshots where possible.
