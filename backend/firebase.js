// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import admin from "firebase-admin";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries'

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZENYRBfU22kzoaRJxsARhhRBDFgWG7_k",
  authDomain: "friendzone-417c2.firebaseapp.com",
  projectId: "friendzone-417c2",
  storageBucket: "friendzone-417c2.firebasestorage.app",
  messagingSenderId: "31728952873",
  appId: "1:31728952873:web:850ee1f7b358e30739de38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth so other files can use them
export const db = admin.firestore();
export const auth = getAuth(app);