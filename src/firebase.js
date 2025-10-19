import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFIYG31btOUET8Mt7TdZlxh-7SBMISnNg",
  authDomain: "sparklesautospa-41f11.firebaseapp.com",
  projectId: "sparklesautospa-41f11",
  storageBucket: "sparklesautospa-41f11.appspot.com",
  messagingSenderId: "432482132728",
  appId: "1:432482132728:web:8924915a9d26e6a60f510d",
  measurementId: "G-CNZS9RGBFK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);