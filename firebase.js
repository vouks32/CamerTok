import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

// Configuration Firebase (à remplacer par vos propres infos)
const firebaseConfig = {
  apiKey: "AIzaSyBDFygmSGuKr7T4Eg4zVzmMzLbXq9bMsek",
  authDomain: "community-8d9a2.firebaseapp.com",
  projectId: "community-8d9a2",
  storageBucket: "community-8d9a2.firebasestorage.app",
  messagingSenderId: "355282374642",
  appId: "1:355282374642:web:4997f3273d1054c336256b",
  measurementId: "G-VF5WXEFQJX"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services Firebase
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };