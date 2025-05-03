// Logic for the Admin Panel (admin.html)

document.addEventListener('DOMContentLoaded', () => {
    console.log("Admin JS loaded.");

    // --- DOM Elements ---
    const adminContent = document.getElementById("admin-content");
    const adminLoginSection = document.getElementById("admin-login");
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("admin-email");
    const passwordInput = document.getElementById("admin-password");
    const loginError = document.getElementById("login-error");
    const statusSelect = document.getElementById("status-select");
    const updateStatusBtn = document.getElementById("update-status-btn");
    const statusUpdateMsg = document.getElementById("status-update-msg");
    const competitorList = document.getElementById("competitor-list");
    const viewLeaderboardLink = document.getElementById("view-leaderboard-link");
    const controlsDiv = viewLeaderboardLink ? viewLeaderboardLink.parentElement : null;

    // --- Functions ---

    function showAdminContent() {
        if (adminLoginSection) adminLoginSection.style.display = 'none';
        if (adminContent) adminContent.style.display = 'block';
        addLogoutButton();
        fetchCurrentStatus();
        fetchCompetitors();
    }

    function showLoginPrompt() {
        if (adminContent) adminContent.style.display = 'none';
        if (adminLoginSection) adminLoginSection.style.display = 'block';
        removeLogoutButton();
    }

    function addLogoutButton() {
        if (!controlsDiv || document.getElementById('logout-btn')) return;
        const logoutButton = document.createElement('button');
        logoutButton.id = 'logout-btn';
        logoutButton.textContent = getText('logout_btn');
        logoutButton.setAttribute('data-lang', 'logout_btn');
        logoutButton.addEventListener('click', handleLogout);
        controlsDiv.appendChild(logoutButton);
    }

    function removeLogoutButton() {
        const logoutButton = document.getElementById('logout-btn');
        if (logoutButton) {
            logoutButton.remove();
        }
    }

    async function handleLogin(event) {
        event.preventDefault();
        if (!auth || !emailInput || !passwordInput || !loginError) {
            console.error("Firebase Auth or form elements not initialized.");
            if (loginError) loginError.textContent = "Login form error.";
            return;
        }

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            loginError.textContent = "Logging in...";
            loginError.style.color = "orange";
            await auth.signInWithEmailAndPassword(email, password);
            console.log("Login successful, auth state change should trigger UI update.");
            loginError.textContent = "";
        } catch (error) {
            console.error("Login failed:", error);
            let errorMessage = getText("login_failed");
            if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
                errorMessage = getText("invalid_credentials");
            } else if (error.code === "auth/invalid-email") {
                errorMessage = getText("invalid_email_format");
            }
            loginError.textContent = `${errorMessage} (${error.code})`;
            loginError.style.color = "red";
        }
    }

    async function handleLogout() {
        if (!auth) return;
        try {
            await auth.signOut();
            console.log("Logout successful.");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

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
            if (statusUpdateMsg) {
                statusUpdateMsg.textContent = getText('status_update_failed');
                statusUpdateMsg.style.color = 'red';
            }
        }
    }

    async function updateStatus() {
        if (!db || !statusSelect || !updateStatusBtn) return;
        const newStatus = statusSelect.value;
        updateStatusBtn.disabled = true;
        if (statusUpdateMsg) {
            statusUpdateMsg.textContent = 'Updating...';
            statusUpdateMsg.style.color = 'orange';
        }

        try {
            const docRef = db.collection('competition').doc('status');
            await docRef.set({ currentStatus: newStatus }, { merge: true });
            if (statusUpdateMsg) {
                statusUpdateMsg.textContent = getText('status_updated');
                statusUpdateMsg.style.color = 'green';
            }
            console.log("Status updated to:", newStatus);
        } catch (error) {
            console.error("Error updating status:", error);
            if (statusUpdateMsg) {
                statusUpdateMsg.textContent = getText('status_update_failed');
                statusUpdateMsg.style.color = 'red';
            }
        }
        updateStatusBtn.disabled = false;
        setTimeout(() => {
            if (statusUpdateMsg) statusUpdateMsg.textContent = '';
        }, 3000);
    }

    async function fetchCompetitors() {
        if (!db || !competitorList) return;
        competitorList.innerHTML = `<li>${getText('fetching_data')}</li>`;
        try {
            const snapshot = await db.collection('competitors').orderBy('name').get();
            if (snapshot.empty) {
                competitorList.innerHTML = `<li>${getText('no_competitors')}</li>`;
                return;
            }
            competitorList.innerHTML = '';
            snapshot.forEach(doc => {
                const competitor = doc.data();
                const competitorId = doc.id;
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span><i class="fas fa-user"></i> ${competitor.name}</span>
                    <a href="add_results.html?competitorId=${competitorId}&name=${encodeURIComponent(competitor.name)}" class="button icon-button add-results-btn" data-lang="add_results_btn"><i class="fas fa-stopwatch"></i> ${getText("add_results_btn")}</a>
                    <button class="button icon-button delete-competitor-btn" data-competitor-id="${competitorId}" data-lang="delete_competitor_btn"><i class="fas fa-trash-alt"></i> ${getText("delete_competitor_btn")}</button>
                `;
                competitorList.appendChild(listItem);
            });

            addDeleteButtonListeners();

        } catch (error) {
            console.error("Error fetching competitors:", error);
            competitorList.innerHTML = `<li>Error loading competitors.</li>`;
        }
    }

    function addDeleteButtonListeners() {
        document.querySelectorAll('.delete-competitor-btn').forEach(button => {
            button.addEventListener('click', handleDeleteCompetitor);
        });
    }

    async function handleDeleteCompetitor(event) {
        const button = event.target.closest('button');
        const competitorId = button.getAttribute('data-competitor-id');
        if (!competitorId || !db) return;

        if (confirm(getText('confirm_delete'))) {
            button.disabled = true;
            button.textContent = 'Deleting...';
            try {
                await db.collection('competitors').doc(competitorId).delete();
                console.log("Competitor deleted:", competitorId);
                button.closest('li').remove();
                alert(getText('competitor_deleted'));
            } catch (error) {
                console.error("Error deleting competitor:", error);
                alert(getText('competitor_delete_failed'));
                button.disabled = false;
                button.textContent = getText('delete_competitor_btn');
            }
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', updateStatus);
    }

    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log("User is signed in:", user.uid);
                showAdminContent();
            } else {
                console.log("User is signed out.");
                showLoginPrompt();
            }
        });
    } else {
        console.error("Firebase Auth is not available. Cannot set up auth listener.");
        showLoginPrompt();
        if (loginError) loginError.textContent = 'Firebase Auth failed to initialize.';
    }

    setLanguage(currentLang);
});
