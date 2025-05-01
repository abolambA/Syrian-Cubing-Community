// Logic for the Add Results page (add_results.html)

document.addEventListener("DOMContentLoaded", () => {
    console.log("Add Results JS loaded.");

    // --- DOM Elements ---
    const form = document.getElementById("add-results-form");
    const competitorNameHeading = document.getElementById("competitor-name-heading");
    const solveInputs = [
        document.getElementById("solve1"),
        document.getElementById("solve2"),
        document.getElementById("solve3"),
        document.getElementById("solve4"),
        document.getElementById("solve5"),
    ];
    const calculatedAo5Span = document.getElementById("calculated-ao5");
    const messageElement = document.getElementById("add-results-msg");
    const submitButton = form.querySelector("button[type=\'submit\']");

    // --- Firebase Refs (from firebase-config.js) ---
    // Assuming firebase, auth, db are initialized globally or imported

    // --- State ---
    let competitorId = null;
    let competitorName = null;
    // TODO: Get current event ID, maybe from URL param or global state?
    let currentEventId = '3x3'; // Hardcoded for now, needs dynamic handling

    // --- Functions ---

    /**
     * Gets competitor ID and name from URL parameters.
     */
    function getCompetitorInfoFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        competitorId = urlParams.get("competitorId");
        competitorName = urlParams.get("name"); // Already decoded by browser

        if (competitorName && competitorNameHeading) {
            competitorNameHeading.textContent = `${getText(\'adding_results_for\')}${competitorName}`;
        } else if (competitorId) {
             competitorNameHeading.textContent = `${getText(\'adding_results_for\')} ID: ${competitorId}`;
             // Optionally fetch name from DB if not in URL
        } else {
            competitorNameHeading.textContent = "Error: Competitor ID not found in URL.";
            if(form) form.style.display = 'none'; // Hide form if no ID
        }
    }

    /**
     * Updates the displayed calculated Ao5 based on current input values.
     */
    function updateAo5Display() {
        if (!calculatedAo5Span) return;

        const solves = solveInputs.map(input => input.value.trim());
        const validSolves = solves.map(s => parseTime(s)); // Use parseTime from utils.js

        // Check if all 5 inputs have some value (even if potentially invalid for now)
        if (solves.some(s => s === \'\')) {
            calculatedAo5Span.textContent = getText(\'ao5_calculating\');
            return;
        }
        
        // Check for invalid formats immediately
        if (validSolves.some(isNaN)) {
             // Find the first invalid input for a more specific message if desired
             calculatedAo5Span.textContent = getText(\'invalid_time_format\');
             calculatedAo5Span.style.color = \'red\';
             return;
        }

        calculatedAo5Span.style.color = \'inherit\'; // Reset color
        const ao5 = calculateAo5(validSolves); // Use calculateAo5 from utils.js
        calculatedAo5Span.textContent = formatTime(ao5); // Use formatTime from utils.js
    }

    /**
     * Handles form submission to add results for the competitor.
     */
    async function handleAddResults(event) {
        event.preventDefault();
        if (!db || !auth || !auth.currentUser || !competitorId) {
            messageElement.textContent = "Error: Firebase not initialized, user not logged in, or competitor ID missing.";
            messageElement.style.color = "red";
            return;
        }

        const solves = solveInputs.map(input => input.value.trim().toUpperCase());
        const parsedSolves = solves.map(s => parseTime(s));

        // Validation
        if (solves.length !== 5 || solves.some(s => s === \'\')) {
            messageElement.textContent = getText(\'need_5_solves\');
            messageElement.style.color = "red";
            return;
        }
        if (parsedSolves.some(isNaN)) {
            messageElement.textContent = getText(\'invalid_time_format\');
            messageElement.style.color = "red";
            return;
        }

        const finalAo5 = calculateAo5(parsedSolves);

        submitButton.disabled = true;
        messageElement.textContent = "Submitting results...";
        messageElement.style.color = "orange";

        try {
            // Store results in a subcollection or dedicated results collection
            // Option 1: Subcollection under competitor
            // const resultRef = db.collection(\'competitors\').doc(competitorId)
            //                     .collection(\'results\').doc(currentEventId);

            // Option 2: Dedicated results collection (often better for querying leaderboards)
            const resultRef = db.collection(\'results").doc(`${competitorId}_${currentEventId}`);

            await resultRef.set({
                competitorId: competitorId,
                competitorName: competitorName, // Store name for easier display
                eventId: currentEventId,
                solves: solves, // Store original input strings (DNF, times)
                average: finalAo5 === \'DNF\' ? Infinity : parseFloat(finalAo5), // Store numeric average or Infinity for DNF for sorting
                submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                // Add admin UID who submitted? auth.currentUser.uid
            }, { merge: true }); // Use merge if you might update results later

            console.log("Results added successfully for:", competitorId, "Event:", currentEventId);
            messageElement.textContent = getText(\'results_added\');
            messageElement.style.color = "green";

            // Clear the form
            form.reset();
            calculatedAo5Span.textContent = getText(\'ao5_calculating\');

            // Optionally redirect back to admin page after a delay
            setTimeout(() => {
                window.location.href = \'admin.html\';
                // messageElement.textContent = \'\'; // Clear message
            }, 1500);

        } catch (error) {
            console.error("Error adding results:", error);
            messageElement.textContent = `${getText(\'results_add_failed\')} ${error.message}`;
            messageElement.style.color = "red";
        } finally {
            submitButton.disabled = false;
        }
    }

    // --- Event Listeners ---
    solveInputs.forEach(input => {
        // Update Ao5 on input change or blur
        input.addEventListener(\'input\', updateAo5Display);
        input.addEventListener(\'blur\', updateAo5Display);
    });

    if (form) {
        form.addEventListener("submit", handleAddResults);
    }

    // --- Auth Check ---
    if (auth) {
        auth.onAuthStateChanged(user => {
            if (!user) {
                console.log("User not logged in, disabling form...");
                if(form) form.style.display = \'none\';
                messageElement.textContent = "You must be logged in as an admin to add results.";
                messageElement.style.color = "red";
            }
            // Add admin role check here if necessary
        });
    } else {
         if(form) form.style.display = \'none\';
         messageElement.textContent = "Firebase Auth not available.";
         messageElement.style.color = "red";
    }

    // --- Initial Load ---
    getCompetitorInfoFromURL();
    setLanguage(currentLang); // Apply initial language settings
    updateAo5Display(); // Initial calculation check (likely shows \'Calculating...\')

});

