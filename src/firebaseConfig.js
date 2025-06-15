// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ Corrected config
const firebaseConfig = {
  apiKey: "AIzaSyB5mfPipjTFoqXyFJBAWcDwi_RwlxX2aTo",
  authDomain: "classroom24x7-30e6a.firebaseapp.com",
  projectId: "classroom24x7-30e6a",
  storageBucket: "classroom24x7-30e6a.appspot.com", // ✅ FIXED HERE
  messagingSenderId: "369901028944",
  appId: "1:369901028944:web:5f659933031361f7617355"
};

// ✅ Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth };
