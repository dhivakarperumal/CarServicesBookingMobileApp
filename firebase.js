import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGwrctTbnK0L66bHmSAPbWlZWToQQ5NLQ",
  authDomain: "carservicebooking-e7a0e.firebaseapp.com",
  projectId: "carservicebooking-e7a0e",
  storageBucket: "carservicebooking-e7a0e.firebasestorage.app",
  messagingSenderId: "601936319467",
  appId: "1:601936319467:web:3d8c25122318fe593f7fae",
};

const app = initializeApp(firebaseConfig);

// ✅ Persistent Auth for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Google Provider (works with Expo Google auth flow)
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export default app;