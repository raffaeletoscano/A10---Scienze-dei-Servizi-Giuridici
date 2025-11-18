import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configurazione Firebase del progetto "a10librettouniversitario"
const firebaseConfig = {
  apiKey: "AIzaSyCXwAO2HKCe97yKY7S8FAvgu_NVkhis-4g",
  authDomain: "a10librettouniversitario.firebaseapp.com",
  projectId: "a10librettouniversitario",
  storageBucket: "a10librettouniversitario.firebasestorage.app",
  messagingSenderId: "228579928034",
  appId: "1:228579928034:web:33eacc34e0c736fb9c3bbb",
  measurementId: "G-14PMQWLRF7"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta i servizi necessari per l'App
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
