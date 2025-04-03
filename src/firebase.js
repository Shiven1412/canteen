import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";


 const firebaseConfig = {
  apiKey: "AIzaSyBjTBiCT8VbCby5gJmsB-A3hmPpBOLmNSU",
  authDomain: "acoec-7eb5f.firebaseapp.com",
  databaseURL: "https://acoec-7eb5f-default-rtdb.firebaseio.com",
  projectId: "acoec-7eb5f",
  storageBucket: "acoec-7eb5f.firebasestorage.app",
  messagingSenderId: "207027958334",
  appId: "1:207027958334:web:e3dbc34c304d55fecc576f",
  measurementId: "G-VHF6WR9CVD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { auth, database };
