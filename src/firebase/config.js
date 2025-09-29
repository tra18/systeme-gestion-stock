import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase (vos vraies clés)
const firebaseConfig = {
  apiKey: "AIzaSyDE-TBWNZ_Y4WdPHaezRXIf1vizPEralVY",
  authDomain: "stock-bcbd3.firebaseapp.com",
  projectId: "stock-bcbd3",
  storageBucket: "stock-bcbd3.appspot.com",
  messagingSenderId: "901950451449",
  appId: "1:901950451449:web:stock-bcbd3"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
