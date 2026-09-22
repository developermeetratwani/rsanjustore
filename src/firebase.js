import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_jQldHSap_mUBkXsBKcpo7OzJ2FJWq6Q",
  authDomain: "r-sanju.firebaseapp.com",
  projectId: "r-sanju",
  storageBucket: "r-sanju.firebasestorage.app",
  messagingSenderId: "653155509458",
  appId: "1:653155509458:web:298d62d2df7c0acce2390b",
  measurementId: "G-TPE0KSQ5PH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
