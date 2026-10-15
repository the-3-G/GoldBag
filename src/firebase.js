// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJj1C6iv7oYuT6OFMANRv5yvElWAAU5Pk",
  authDomain: "investcoin-a817c.firebaseapp.com",
  projectId: "investcoin-a817c",
  storageBucket: "investcoin-a817c.firebasestorage.app",
  messagingSenderId: "289683454442",
  appId: "1:289683454442:web:3bdb3b3b1adb0cfdf49a93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Cloud Functions
export const functions = getFunctions(app);

export default app;
