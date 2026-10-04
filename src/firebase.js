import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAeNwkeUZhkELm4t8IOObZrSgtthnmDaoo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "study-planner-vue.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "study-planner-vue",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "study-planner-vue.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "918368706960",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:918368706960:web:98e0a044cffe9107209315"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
