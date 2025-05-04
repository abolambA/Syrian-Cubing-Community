// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC63h9948HcU2YVrb5zNU9umu8rZRPYbnc",
    authDomain: "syrian-comp.firebaseapp.com",
    projectId: "syrian-comp",
    storageBucket: "syrian-comp.firebasestorage.app",
    messagingSenderId: "275069504753",
    appId: "1:275069504753:web:4ef3fb9d62cdf7b5886d50"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firestore database reference
const db = firebase.firestore();

// Collection references
const competitorsRef = db.collection('competitors');
const resultsRef = db.collection('results');
const statusRef = db.collection('status');

// Check connection status
let isOnline = true;
const connectedRef = firebase.database().ref('.info/connected');

connectedRef.on('value', (snap) => {
    isOnline = snap.val() === true;
});

// Initialize status document if it doesn't exist
async function initializeStatusDocument() {
    try {
        if (!isOnline) {
            console.warn('Firebase is offline. Status document initialization delayed.');
            return;
        }

        const statusDoc = await statusRef.doc('current').get();
        if (!statusDoc.exists) {
            await statusRef.doc('current').set({
                status: 'not_started',
                currentEvent: '3x3',
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error initializing status document:', error);
        utils.showNotification('Error connecting to database. Please check your internet connection.', 'error');
    }
}

// Export connection status checker
function checkConnection() {
    return isOnline;
}

// Call initialization function
initializeStatusDocument();

// Export the connection checker
window.firebaseUtils = {
    checkConnection
};