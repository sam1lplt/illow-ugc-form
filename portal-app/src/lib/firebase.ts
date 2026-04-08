import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWvIuBR-4f9eBQb0OvdwKnUfSJFyCaoz4",
  authDomain: "pillow-ugc-database.firebaseapp.com",
  projectId: "pillow-ugc-database",
  storageBucket: "pillow-ugc-database.firebasestorage.app",
  messagingSenderId: "122351696078",
  appId: "1:122351696078:web:7b8b7d5bfa0f3f646b389f",
  measurementId: "G-J9FRE5RK1K"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
