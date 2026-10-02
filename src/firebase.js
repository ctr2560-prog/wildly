import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Shared "Taronga Education" Firebase project — same backend as Taronga Tracka,
// so one email+password account works across both apps.
const firebaseConfig = {
  apiKey: "AIzaSyCFS0oFiThCyjgoRxgoJ6nyO34fzgyW2IM",
  authDomain: "tarongatracka.firebaseapp.com",
  projectId: "tarongatracka",
  storageBucket: "tarongatracka.firebasestorage.app",
  messagingSenderId: "925190436532",
  appId: "1:925190436532:web:47d2c5016dc1b28d7d09e1",
};

export const app = initializeApp(firebaseConfig);

// ─────────────────────────────────────────────────────────────────────────────────────────
// App Check — proves a request came from the real app rather than a script.
//
// ⚠️ WHY THIS IS HERE. Wildly shares the `tarongatracka` Firebase project with Taronga Tracka,
// and large parts of that project must accept unauthenticated requests because Tracka's
// students have no logins. Demonstrated 2026-10-02: a 15-line script using only the public
// config above read 104 student records in 1.4 seconds. App Check rejects requests without a
// valid attestation token before the security rules are even evaluated.
//
// ⚠️⚠️ WILDLY MUST SHIP THIS BEFORE ENFORCEMENT IS SWITCHED ON IN THE FIREBASE CONSOLE.
// The project is shared, so enforcement is project-wide: the moment it is enabled, any app not
// sending a token is cut off instantly. If Tracka enforces while Wildly is not sending tokens,
// WILDLY GOES DOWN with no warning. This file is what prevents that.
//
// ⚠️ Wildly and Tracka register the SAME Firebase appId, so one App Check registration covers
// both — but the reCAPTCHA v3 site key is DOMAIN-SCOPED. The key must list BOTH
// `wildlybytaronga.com.au` AND `tarongatracka.com.au` (plus localhost for dev), or whichever
// domain is missing will fail every request once enforcement is on.
//
// Inert until VITE_APPCHECK_SITE_KEY is set, so this is safe to ship today. Rollout order:
//   1. Console → App Check → register with reCAPTCHA v3, both domains on the key.
//   2. Set VITE_APPCHECK_SITE_KEY here AND in Tracka, both in the GitHub Actions build env.
//   3. Watch "unverified requests" in the Console until it is near zero for real traffic.
//   4. ONLY THEN enable Enforcement, per service.
const appCheckSiteKey = import.meta.env.VITE_APPCHECK_SITE_KEY;
if (appCheckSiteKey) {
  if (import.meta.env.VITE_APPCHECK_DEBUG === "true") {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    // Never let an App Check failure take the LMS down. With enforcement ON the requests fail
    // anyway and that is correct; with it OFF the app behaves exactly as before.
    console.warn("[appCheck] could not initialise:", err);
  }
}
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app);
  })
  .catch(() => {
    // Analytics is optional; the LMS should still run when it is blocked.
  });
