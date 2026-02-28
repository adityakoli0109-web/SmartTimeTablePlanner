import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvbEDoYqyYG0xX4sk1BSaw4Jc1tiUTZhA",
  authDomain: "study-planner-hackthon.firebaseapp.com",
  projectId: "study-planner-hackthon",
  storageBucket: "study-planner-hackthon.firebasestorage.app",
  messagingSenderId: "489927891382",
  appId: "1:489927891382:web:f26669fa2342d7d0788917",
  measurementId: "G-JDPCFP58YX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
