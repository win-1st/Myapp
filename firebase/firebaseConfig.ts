// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoTaD7To1yE8aGzWxiN6rXA0DEFQcIjYg",
  authDomain: "test-41bfd.firebaseapp.com",
  projectId: "test-41bfd",
  storageBucket: "test-41bfd.firebasestorage.app",
  messagingSenderId: "54225826714",
  appId: "1:54225826714:web:bc1c3c98e999a84b650023",
  measurementId: "G-MERDVEW0LV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);