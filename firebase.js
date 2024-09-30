// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "scfr1-daedc.firebaseapp.com",
  projectId: "scfr1-daedc",
  storageBucket: "scfr1-daedc.appspot.com",
  messagingSenderId: "924898991971",
  appId: "1:924898991971:web:c19603534581ba0ea3bd56",
  measurementId: "G-WRKQYST48Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);