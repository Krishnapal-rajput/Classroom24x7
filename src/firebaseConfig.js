// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB5mfPipjTFoqXyFJBAWcDwi_RwlxX2aTo",
  authDomain: "classroom24x7-30e6a.firebaseapp.com",
  projectId: "classroom24x7-30e6a",
  storageBucket: "classroom24x7-30e6a.appspot.com",
  messagingSenderId: "369901028944",
  appId: "1:369901028944:web:5f659933031361f7617355"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// Set session-based auth persistence
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("✅ Firebase auth set to browser session persistence");
  })
  .catch((error) => {
    console.error("⚠️ Failed to set persistence:", error);
  });

export { db, auth };
