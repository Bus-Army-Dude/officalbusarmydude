/ Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApZG9pI7NwWxdMcflLEqpyDaC5uOhWCWU",
  authDomain: "rivers-work-tracker.firebaseapp.com",
  projectId: "rivers-work-tracker",
  storageBucket: "rivers-work-tracker.firebasestorage.app",
  messagingSenderId: "962060928306",
  appId: "1:962060928306:web:480c427466fc501257c32b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
