// Logic for the Admin Panel (admin.html)

document.addEventListener('DOMContentLoaded', () => {
    console.log("Admin JS loaded.");

    // --- DOM Elements ---
    const adminContent = document.getElementById("admin-content");
    const adminLoginSection = document.getElementById("admin-login");
    const loginForm = document.getElementById("login-form"); // Changed
    const emailInput = document.getElementById("admin-email"); // New
    const passwordInput = document.getElementById("admin-password"); // New
    const loginError = document.getElementById("login-error"); // Moved
    const statusSelect = document.getElementById("status-select");
    const updateStatusBtn = document.getElementById("update-status-btn");
    const statusUpdateMsg = document.getElementById("status-update-msg");
    const competitorList = document.getElementById("competitor-list");
    const viewLeaderboardLink = document.getElementById("view-leaderboard-link"); // For potential logout button placement
    const controlsDiv = viewLeaderboardLink ? viewLeaderboardLink.parentElement : null;

    // --- Firebase Refs (from firebase-config.js) ---
    // Assuming firebase, auth, db are initialized globally or imported

    // --- Functions ---

    /**
     * Shows the main admin content and hides the login prompt.
     */
    function showAdminContent() {
        if (adminLoginSection) adminLoginSection.style.display = 'none';
        if (adminContent) adminContent.style.display = 'block';
        addLogoutButton();
        fetchCurrentStatus();
        fetchCompetitors();
    }

    /**
     * Shows the login prompt and hides the admin content.
     */
    function showLoginPrompt() {
        if (adminContent) adminContent.style.display = 'none';
        if (adminLoginSection) adminLoginSection.style.display = 'block';
        removeLogoutButton();
    }

    /**
     * Adds a logout button to the header controls.
     */
    function addLogoutButton() {
        if (!controlsDiv || document.getElementById('logout-btn')) return; // Already exists
        const logoutButton = document.createElement('button');
        logoutButton.id = 'logout-btn';
        logoutButton.textContent = getText('logout_btn'); // Use translated text
        logoutButton.setAttribute('data-lang', 'logout_btn');
        logoutButton.addEventListener('click', handleLogout);
        controlsDiv.appendChild(logoutButton);
    }

    /**
     * Removes the logout button from the header controls.
     */
    function removeLogoutButton() {
        const logoutButton = document.getElementById('logout-btn');
        if (logoutButton) {
            logoutButton.remove();
        }
    }

    /**
     * Handles Email/Password Sign-In.
     */
    async function handleLogin(event) {
        event.preventDefault(); // Prevent form submission
        if (!auth || !emailInput || !passwordInput || !loginError) {
            console.error("Firebase Auth or form elements not initialized.");
            if(loginError) loginError.textContent = "Login form error.";
            return;
        }

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            loginError.textContent = "Logging in..."; // Provide feedback
            loginError.style.color = "orange";
            await auth.signInWithEmailAndPassword(email, password);
            // Auth state change will handle showing admin content
            console.log("Login successful, auth state change should trigger UI update.");
            loginError.textContent = ""; // Clear message on success
        } catch (error) {
            console.error("Login failed:", error);
            let errorMessage = getText("login_failed"); // Default error
            // Provide more specific feedback if possible
            if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
                errorMessage = getText("invalid_credentials");
            } else if (error.code === "auth/invalid-email") {
                errorMessage = getText("invalid_email_format");
            }
            loginError.textContent = `${errorMessage} (${error.code})`;
            loginError.style.color = "red";
        }
    }

    /**
     * Handles Logout.
     */
    async function handleLogout() {
        if (!auth) return;
        try {
            await auth.signOut();
            // Auth state change will handle showing login prompt
            console.log("Logout successful.");
        } catch (error) {
            console.error("Logout failed:", error);
            // Optionally display an error message
        }
    }

    /**
     * Fetches the current competition status from Firestore.
     */
    async function fetchCurrentStatus() {
        if (!db || !statusSelect) return;
        try {
            const docRef = db.collection('competition').doc('status');
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                const statusData = docSnap.data();
                statusSelect.value = statusData.currentStatus || 'not_started';
            } else {
                console.log("Status document doesn't exist, defaulting to 'not_started'.");
                statusSelect.value = 'not_started';
            }
        } catch (error) {
            console.error("Error fetching status:", error);
            statusUpdateMsg.textContent = getText('status_update_failed');
            statusUpdateMsg.style.color = 'red';
        }
    }

    /**
     * Updates the competition status in Firestore.
     */
    async function updateStatus() {
        if (!db || !statusSelect || !updateStatusBtn) return;
        const newStatus = statusSelect.value;
        updateStatusBtn.disabled = true;
        statusUpdateMsg.textContent = 'Updating...';
        statusUpdateMsg.style.color = 'orange';

        try {
            const docRef = db.collection('competition').doc('status');
            await docRef.set({ currentStatus: newStatus }, { merge: true });
            statusUpdateMsg.textContent = getText('status_updated');
            statusUpdateMsg.style.color = 'green';
            console.log("Status updated to:", newStatus);
        } catch (error) {
            console.error("Error updating status:", error);
            statusUpdateMsg.textContent = getText('status_update_failed');
            statusUpdateMsg.style.color = 'red';
        }
        updateStatusBtn.disabled = false;
        setTimeout(() => statusUpdateMsg.textContent = '', 3000); // Clear message after 3s
    }

    /**
     * Fetches the list of competitors from Firestore.
     */
    async function fetchCompetitors() {
        if (!db || !competitorList) return;
        competitorList.innerHTML = `<li>${getText('fetching_data')}</li>`;
        try {
            const snapshot = await db.collection('competitors').orderBy('name').get();
            if (snapshot.empty) {
                competitorList.innerHTML = `<li>${getText('no_competitors')}</li>`;
                return;
            }
            competitorList.innerHTML = ''; // Clear loading message
            snapshot.forEach(doc => {
                const competitor = doc.data();
                const competitorId = doc.id;
                const listItem = document.createElement('li')                listItem.innerHTML = `
                    <!-- <img src="${competitor.photoURL || \'img/default_avatar.png\'}" alt="${competitor.name}" class="competitor-photo-small"> --> <!-- Photo removed -->
                    <span><i class="fas fa-user"></i> ${competitor.name}</span>
                    <a href="add_results.html?competitorId=${competitorId}&name=${encodeURIComponent(competitor.name)}" class="button icon-button add-results-btn" data-lang="add_results_btn"><i class="fas fa-stopwatch"></i> ${getText("add_results_btn")}</a>
                    <button class="button icon-button delete-competitor-btn" data-competitor-id="${competitorId}" data-lang="delete_competitor_btn"><i class="fas fa-trash-alt"></i> ${getText("delete_competitor_btn")}</button>
                `;
                competitorList.appendChild(listItem);
            });

            // Add event listeners for delete buttons after they are created
            addDeleteButtonListeners();

        } catch (error) {
            console.error("Error fetching competitors:", error);
            competitorList.innerHTML = `<li>Error loading competitors.</li>`;
        }
    }

    /**
     * Adds event listeners to all delete competitor buttons.
     */
    function addDeleteButtonListeners() {
        document.querySelectorAll('.delete-competitor-btn').forEach(button => {
            button.addEventListener('click', handleDeleteCompetitor);
        });
    }

    /**
     * Handles the deletion of a competitor.
     */
    async function handleDeleteCompetitor(event) {
        const button = event.target;
        const competitorId = button.getAttribute('data-competitor-id');
        if (!competitorId || !db) return;

        if (confirm(getText('confirm_delete'))) {
            button.disabled = true;
            button.textContent = 'Deleting...';
            try {
                // TODO: Consider deleting associated results and photo from storage as well (more complex)
                await db.collection('competitors').doc(competitorId).delete();
                console.log("Competitor deleted:", competitorId);
                // Remove the list item from the UI
                button.closest('li').remove();
                // Optionally show a success message
                alert(getText('competitor_deleted'));
                // Refetch if needed, or just remove UI element
                // fetchCompetitors(); // Could refetch, but removing the element is faster
            } catch (error) {
                console.error("Error deleting competitor:", error);
                alert(getText('competitor_delete_failed'));
                button.disabled = false;
                button.textContent = getText('delete_competitor_btn');
            }
        }
    }

    // --- Event Listeners ---
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin); // Changed from loginButton click
    }

    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', updateStatus);
    }

    // --- Authentication State Observer ---
    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in.
                console.log("User is signed in:", user.uid);
                // TODO: Add check here to verify if the logged-in user is an authorized admin
                // This might involve checking a custom claim or a specific document in Firestore.
                // For now, assume any logged-in user is an admin.
                showAdminContent();
            } else {
                // User is signed out.
                console.log("User is signed out.");
                showLoginPrompt();
            }
        });
    } else {
        console.error("Firebase Auth is not available. Cannot set up auth listener.");
        showLoginPrompt(); // Show login prompt if auth fails to initialize
        if(loginError) loginError.textContent = 'Firebase Auth failed to initialize.';
    }

    // --- Initial Language Setup ---
    // Ensure language is applied after DOM is loaded
    setLanguage(currentLang);

});

