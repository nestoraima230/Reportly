import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB4jy6tWPZPATYoxcvmDvfYOCs3fRIKygU",
  authDomain: "reportly-2ab0a.firebaseapp.com",
  projectId: "reportly-2ab0a",
  storageBucket: "reportly-2ab0a.firebasestorage.app",
  messagingSenderId: "11492335753",
  appId: "1:11492335753:web:0ea4c7415c60977c812658"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
