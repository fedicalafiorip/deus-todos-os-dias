import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZOMsUwRuaaCX-34ZzLbuDwMF3dH_EWlc",
  authDomain: "my-reads-and-journal.firebaseapp.com",
  projectId: "my-reads-and-journal",
  storageBucket: "my-reads-and-journal.firebasestorage.app",
  messagingSenderId: "893014191108",
  appId: "1:893014191108:web:bf20305a467f12dcb79951"
};

const app = initializeApp(firebaseConfig);

export const auth     = getAuth(app);
export const db       = getFirestore(app);
export const provider = new GoogleAuthProvider();
