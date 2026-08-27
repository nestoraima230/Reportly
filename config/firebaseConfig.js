import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

const firebaseConfig = {
  apiKey: extra.firebaseApiKey || "AIzaSyB4jy6tWPZPATYoxcvmDvfYOCs3fRIKygU",
  authDomain: extra.firebaseAuthDomain || "reportly-2ab0a.firebaseapp.com",
  projectId: extra.firebaseProjectId || "reportly-2ab0a",
  storageBucket: extra.firebaseStorageBucket || "reportly-2ab0a.appspot.com", 
  appId: extra.firebaseAppId || "1:11492335753:web:0ea4c7415c60977c812658"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
