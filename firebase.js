import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((err) => {
      console.error("Service Worker registration failed:", err);
    });
}

const firebaseConfig = {
  apiKey: 'AIzaSyBDFygmSGuKr7T4Eg4zVzmMzLbXq9bMsek',
  authDomain: 'community-8d9a2.firebaseapp.com',
  projectId: "community-8d9a2",
  storageBucket: "community-8d9a2.firebasestorage.app",
  messagingSenderId: "355282374642",
  appId: "1:355282374642:web:4997f3273d1054c336256b",
  measurementId: "G-VF5WXEFQJX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let messaging = null

try {
  messaging = getMessaging(app);
  
} catch (error) {
  console.log('ERROR ', error)
  alert(error)
}



// Initialize Firestore

export { messaging, getToken, onMessage };