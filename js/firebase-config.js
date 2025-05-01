// Firebase Configuration

const firebaseConfig = {
  apiKey: "AIzaSyC63h9948HcU2YVrb5zNU9umu8rZRPYbnc",
  authDomain: "syrian-comp.firebaseapp.com",
  projectId: "syrian-comp",
  storageBucket: "syrian-comp.firebasestorage.app", // Keep for reference, but storage won't be used
  messagingSenderId: "275069504753",
  appId: "1:275069504753:web:4ef3fb9d62cdf7b5886d50"
};

// Initialize Firebase (using compat libraries as indicated in HTML comments)
// Ensure you include the Firebase SDK scripts in your HTML files before this script.
/*
Example HTML includes:
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js"></script>
// Storage SDK removed as per user request
// <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-storage-compat.js"></script>
*/

let app;
try {
  app = firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully.");
} catch (e) {
  console.error("Error initializing Firebase:", e);
  // Display an error message to the user on the page if initialization fails
  const body = document.querySelector("body");
  if (body) {
      const errorDiv = document.createElement("div");
      errorDiv.textContent = "Error initializing Firebase. Please check your configuration and ensure SDKs are loaded.";
      errorDiv.style.color = "red";
      errorDiv.style.padding = "20px";
      errorDiv.style.textAlign = "center";
      errorDiv.style.fontWeight = "bold";
      body.prepend(errorDiv);
  }
}

// Get references to Firebase services (using compat)
const auth = app ? firebase.auth() : null;
const db = app ? firebase.firestore() : null;
// const storage = app ? firebase.storage() : null; // Storage removed as per user request

// Export the services for use in other scripts if needed (or use them directly)
// Example: window.auth = auth; window.db = db;

