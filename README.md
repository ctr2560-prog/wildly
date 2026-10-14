# Wildly by Taronga

Wildly is a learning management system and teacher resource library concept for Taronga education experiences.

## Current App

- Public landing page: `/`
- Teacher dashboard: `/teacher`
- Taronga staff console: `/staff`

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The app is built with Vite and React, ready to connect to Firebase Auth and Firestore.

## Interface

The public homepage lives in `src/home-page.jsx` and `src/home-page.css`.
`src/public-design.css` applies the shared visual direction to public navigation,
subject browsing and supporting pages. `src/teacher-design.css` applies it to the
teacher workspace and sign-in. Shared colours and type roles are in `src/tokens.css`;
Montserrat and the wildlife assets are served locally.

The task-first dashboard is isolated in `src/teacher-home.jsx` and
`src/teacher-home.css`. `src/subject-identity.js` keeps curriculum photography
consistent across the public site and teacher workspace. The homepage teaching
example supports arrow-key tab navigation and is labelled as an example, not a
published resource. Public catalogue errors are distinguished from genuinely
empty collections; neither displays fallback samples as live content.

Use `/#teacher/preview` to review the dashboard without signing in. The existing
`demo@zoo` sign-in enables local demo navigation; it does not authenticate with
Firebase. Protected content falls back to sample data in preview/demo mode.

### Staff workspace

`src/staff-workspace.jsx` contains the grouped staff navigation, publishing overview
and native editor dialog. `src/staff-design.css` scopes the staff visual system;
existing publishing handlers and Firebase permissions are unchanged. The content
studio supports title/subject/stage search and publication-status filtering.

Open `/staff-preview.html` on the Vite development server to review the staff UI
without authenticating. This separate, development-only fixture uses sample data,
local no-op save callbacks and no live-data subscriptions. PDF uploads and account
administration are unavailable there. It is not an entry in the production build.
The real staff portal remains at `/#staff` and requires Firebase sign-in.

Run `npm run build` for the production check. Browser QA should cover desktop and
mobile navigation, content search/status filters, all five publishing editors,
Escape/Tab focus behaviour, and the real sign-in layout. Live publishing still
requires testing with an authorised staff account; preview checks do not verify
Firestore or Storage permissions.
