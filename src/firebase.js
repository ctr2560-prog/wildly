import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcjwwPNLIJicrGWn9ZPfxgZVOqpMSbVwo",
  authDomain: "wildly-762f5.firebaseapp.com",
  projectId: "wildly-762f5",
  storageBucket: "wildly-762f5.firebasestorage.app",
  messagingSenderId: "653395380203",
  appId: "1:653395380203:web:8c57c9e0106e9b43cb3bae",
  measurementId: "G-JE7QNFVSTE",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app);
  })
  .catch(() => {
    // Analytics is optional; the LMS should still run when it is blocked.
  });
