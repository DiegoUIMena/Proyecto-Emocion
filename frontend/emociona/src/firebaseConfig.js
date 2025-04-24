// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importar el servicio de autenticación
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


const firebaseConfig = {
  apiKey: "AIzaSyAuDat2HDDr4B3OrbufPfRGbdH_eNhLtfM",
  authDomain: "emocion-c9ae3.firebaseapp.com",
  projectId: "emocion-c9ae3",
  storageBucket: "emocion-c9ae3.firebasestorage.app",
  messagingSenderId: "2074762899",
  appId: "1:2074762899:web:45d7bde9b032b794a13766",
  measurementId: "G-KNYDJNGGQQ"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { auth, db, analytics, messaging, getToken, onMessage };

