import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB4jy6tWPZPATYoxcvmDvfYOCs3fRIKygU",
  authDomain: "reportly-2ab0a.firebaseapp.com",
  projectId: "reportly-2ab0a",
  storageBucket: "reportly-2ab0a.appspot.com", 
  appId: "1:11492335753:web:0ea4c7415c60977c812658"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
