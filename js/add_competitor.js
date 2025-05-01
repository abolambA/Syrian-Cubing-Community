// Logic for the Add Competitor page (add_competitor.html)

document.addEventListener("DOMContentLoaded", () => {
    console.log("Add Competitor JS loaded.");

    // --- DOM Elements ---
    const form = document.getElementById("add-competitor-form");
    const competitorNameInput = document.getElementById("competitor-name");
    // const competitorPhotoInput = document.getElementById("competitor-photo"); // Removed
    // const photoPreview = document.getElementById("photo-preview"); // Removed
    const messageElement = document.getElementById("add-competitor-msg");
    const submitButton = form.querySelector("button[type='submit']");

    // --- Firebase Refs (from firebase-config.js) ---
    // Assuming firebase, auth, db are initialized globally or imported

    // --- State ---
    // let selectedFile = null; // Removed

    // --- Functions ---

    /**
     * Handles file selection and displays a preview.
     */
    // function handleFileSelect(event) { ... } // Removed

    /**
     * Handles form submission to add a new competitor.
     */
    async function handleAddCompetitor(event) {
        event.preventDefault();
        // Removed storage check
        if (!db || !auth || !auth.currentUser) {
            messageElement.textContent = "Error: Firebase DB/Auth not initialized or user not logged in.";
            messageElement.style.color = "red";
            return;
        }

        const competitorName = competitorNameInput.value.trim();
        if (!competitorName) {
            messageElement.textContent = "Competitor name cannot be empty.";
            messageElement.style.color = "red";
            return;
        }

        submitButton.disabled = true;
        messageElement.textContent = "Adding competitor...";
        messageElement.style.color = "orange";

        try {
            // Photo upload block removed
            /*
            let photoURL = null;
            // 1. Upload photo if selected
            if (selectedFile) {
                messageElement.textContent = "Uploading photo...";
                const filePath = `competitor_photos/${Date.now()}_${selectedFile.name}`;
                const fileRef = storage.ref(filePath);
                const uploadTask = await fileRef.put(selectedFile);
                photoURL = await uploadTask.ref.getDownloadURL();
                console.log("Photo uploaded successfully:", photoURL);
                messageElement.textContent = getText("photo_uploaded");
                messageElement.style.color = "green";
            }
            */

            // 2. Add competitor data to Firestore (without photoURL)
            messageElement.textContent = "Saving competitor data...";
            const competitorsRef = db.collection("competitors");
            await competitorsRef.add({
                name: competitorName,
                // photoURL: photoURL, // Removed
                addedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            console.log("Competitor added successfully:", competitorName);
            messageElement.textContent = getText("competitor_added");
            messageElement.style.color = "green";

            // Clear the form (name only)
            form.reset();
            // photoPreview.style.display = "none"; // Removed
            // selectedFile = null; // Removed

            // Optionally redirect back to admin page after a delay
            setTimeout(() => {
                // window.location.href = "admin.html";
                messageElement.textContent = ""; // Clear message
            }, 2000);

        } catch (error) {
            console.error("Error adding competitor:", error);
            messageElement.textContent = `${getText("competitor_add_failed")} ${error.message}`;
            messageElement.style.color = "red";
            // Removed storage-specific error check
            /*
            if (error.code && error.code.includes("storage")) {
                 messageElement.textContent = `${getText("photo_upload_failed")} ${error.message}`;
            }
            */
        } finally {
            submitButton.disabled = false;
        }
    }

    // --- Event Listeners ---
    // Removed photo input listener
    // if (competitorPhotoInput) { ... }

    if (form) {
        form.addEventListener("submit", handleAddCompetitor);
    }

    // --- Auth Check ---
    // Redirect if not logged in (or show login prompt)
    if (auth) {
        auth.onAuthStateChanged(user => {
            if (!user) {
                console.log("User not logged in, redirecting...");
                // Redirect to admin login or show a message
                // For simplicity, just disable the form if not logged in
                if(form) form.style.display = 'none';
                messageElement.textContent = "You must be logged in as an admin to add competitors.";
                messageElement.style.color = "red";
            }
            // Add admin role check here if necessary
        });
    } else {
         if(form) form.style.display = 'none';
         messageElement.textContent = "Firebase Auth not available.";
         messageElement.style.color = "red";
    }

    // --- Initial Language Setup ---
    setLanguage(currentLang);
});

