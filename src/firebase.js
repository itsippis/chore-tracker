// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIoQn4EnrEva2Hv9BQJsFadl9eqkbO-hY",
  authDomain: "chore-tracker-1d7ee.firebaseapp.com",
  projectId: "chore-tracker-1d7ee",
  storageBucket: "chore-tracker-1d7ee.firebasestorage.app",
  messagingSenderId: "430363178653",
  appId: "1:430363178653:web:43ffd66fb5aa93f8d5c674",
  measurementId: "G-SN0DT427B6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);