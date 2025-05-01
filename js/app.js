// Main application logic for the landing page (index.html)

document.addEventListener('DOMContentLoaded', () => {
    console.log("Landing page JS loaded.");

    // --- DOM Elements ---
    const eventSelect = document.getElementById('event-select');
    const liveStatusBar = document.getElementById('live-status-bar');
    const podium1Name = document.getElementById('podium-1-name');
    const podium1Avg = document.getElementById('podium-1-avg');
    // const podium1Img = document.getElementById('podium-1-img'); // Removed
    // ... (get elements for 2nd and 3rd place podium) ...
    const podium2Name = document.getElementById('podium-2-name');
    const podium2Avg = document.getElementById('podium-2-avg');
    // const podium2Img = document.getElementById('podium-2-img'); // Removed
    const podium3Name = document.getElementById('podium-3-name');
    const podium3Avg = document.getElementById('podium-3-avg');
    // const podium3Img = document.getElementById('podium-3-img'); // Removed
    const leaderboardBody = document.getElementById('leaderboard-body');

    // --- State ---
    let currentEventId = '3x3'; // Default event
    let events = []; // To be fetched from Firebase
    let leaderboardData = []; // To be fetched from Firebase
    let roundStatus = 'loading'; // To be fetched from Firebase

    // --- Functions ---

    /**
     * Fetches available events from Firebase/backend.
     * Placeholder function.
     */
    async function fetchEvents() {
        console.log("Fetching events...");
        // TODO: Implement Firebase call to get events
        // Example data:
        events = [
            { id: '3x3', name: { en: '3x3 Cube', ar: 'مكعب 3x3' } },
            { id: '2x2', name: { en: '2x2 Cube', ar: 'مكعب 2x2' } },
            { id: 'pyra', name: { en: 'Pyraminx', ar: 'هرمينكس' } },
        ];
        populateEventSelector();
    }

    /**
     * Populates the event dropdown selector.
     */
    function populateEventSelector() {
        if (!eventSelect) return;
        eventSelect.innerHTML = ''; // Clear existing options
        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            // Use the current language for the display text
            option.textContent = event.name[currentLang] || event.name['en'];
            // Add data-lang attribute if needed for dynamic language switching of options
            option.setAttribute('data-lang', `event_${event.id}`); 
            eventSelect.appendChild(option);
        });
        // Set the selected value based on currentEventId
        eventSelect.value = currentEventId;
    }

    /**
     * Fetches the current round status from Firebase/backend.
     * Placeholder function.
     */
    async function fetchRoundStatus() {
        console.log("Fetching round status...");
        // TODO: Implement Firebase call to get round status
        // Example data:
        roundStatus = 'in_progress'; // Example status
        updateStatusBar();
    }

    /**
     * Updates the live status bar text based on the current status and language.
     */
    function updateStatusBar() {
        if (!liveStatusBar) return;
        let statusKey = 'status_loading';
        switch (roundStatus) {
            case 'not_started': statusKey = 'status_not_started'; break;
            case 'in_progress': statusKey = 'status_in_progress'; break;
            case 'finished': statusKey = 'status_finished'; break;
        }
        // Use the lang.js getText function for translation
        liveStatusBar.textContent = `${getText('current_status_label')} ${getText(statusKey)}`;
        liveStatusBar.setAttribute('data-lang', statusKey); // Keep data-lang for potential re-translation
    }

    /**
     * Fetches leaderboard data for the selected event from Firebase/backend.
     * Placeholder function.
     */
    async function fetchLeaderboardData(eventId) {
        console.log(`Fetching leaderboard data for event: ${eventId}...`);
        leaderboardBody.innerHTML = `<tr><td colspan="4">${getText('fetching_data')}</td></tr>`; // Show loading message
        // TODO: Implement Firebase call to get leaderboard data for the eventId
        // Data should be pre-sorted by average time (ascending)
        // Example data structure:
        leaderboardData = [
            {
                rank: 1,
                competitorId: 'comp1',
                name: 'Alice', 
                // photoURL: 'img/default_avatar.png', // Removed
                average: 9.87,
                solves: ['DNF', 9.50, 10.12, 9.99, 8.50]
            },
            {
                rank: 2,
                competitorId: 'comp2',
                name: 'Bob',
                // photoURL: 'img/default_avatar.png', // Removed
                average: 10.55,
                solves: [10.20, 10.80, 11.00, 10.50, 10.75]
            },
             {
                rank: 3,
                competitorId: 'comp3',
                name: 'Charlie',
                // photoURL: 'img/default_avatar.png', // Removed
                average: 11.21,
                solves: [11.00, 11.50, 10.90, 11.23, 12.00]
            },
            // ... more competitors
        ];
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500)); 

        displayLeaderboard();
        displayPodium();
    }

    /**
     * Displays the leaderboard data in the table.
     */
    function displayLeaderboard() {
        if (!leaderboardBody) return;
        leaderboardBody.innerHTML = ''; // Clear previous data or loading message

        if (leaderboardData.length === 0) {
            leaderboardBody.innerHTML = `<tr><td colspan="4">${getText('no_results')}</td></tr>`;
            return;
        }

        leaderboardData.forEach((result, index) => {
            const rank = index + 1; // Recalculate rank based on sorted array position
            const row = document.createElement('tr');

            const avgDisplay = result.average === 'DNF' ? 'DNF' : formatTime(result.average);
            const solvesDisplay = result.solves.map(s => formatTime(parseTime(s))).join(', ');

            row.innerHTML = `
                <td data-label="${getText("rank")}">${rank}</td>
                <td data-label="${getText("name")}">
                    <!-- <img src="${result.photoURL || "img/default_avatar.png"}" alt="${result.name}" class="competitor-photo"> -->
                    <span>${result.name}</span>
                </td>
                <td data-label="${getText("average")}">${avgDisplay}</td>
                <td data-label="${getText("solves")}">${solvesDisplay}</td>
            `;
            leaderboardBody.appendChild(row);
        });
        // Ensure responsive headers are updated after adding rows
        updateResponsiveTableHeaders(currentLang);
    }

    /**
     * Displays the top 3 competitors on the podium.
     */
    function displayPodium() {
        const top3 = leaderboardData.slice(0, 3);

        // Clear podium initially
        [podium1Name, podium1Avg, podium2Name, podium2Avg, podium3Name, podium3Avg].forEach(el => el.textContent = '-');
        // [podium1Img, podium2Img, podium3Img].forEach(el => el.src = 'img/default_avatar.png'); // Removed

        // Place 1st
        if (top3.length > 0) {
            podium1Name.textContent = top3[0].name;
            podium1Avg.textContent = top3[0].average === 'DNF' ? 'DNF' : formatTime(top3[0].average);
            // podium1Img.src = top3[0].photoURL || 'img/default_avatar.png'; // Removed
            // podium1Img.alt = top3[0].name; // Removed
        }
        // Place 2nd
        if (top3.length > 1) {
            podium2Name.textContent = top3[1].name;
            podium2Avg.textContent = top3[1].average === 'DNF' ? 'DNF' : formatTime(top3[1].average);
            // podium2Img.src = top3[1].photoURL || 'img/default_avatar.png'; // Removed
            // podium2Img.alt = top3[1].name; // Removed
        }
        // Place 3rd
        if (top3.length > 2) {
            podium3Name.textContent = top3[2].name;
            podium3Avg.textContent = top3[2].average === 'DNF' ? 'DNF' : formatTime(top3[2].average);
            // podium3Img.src = top3[2].photoURL || 'img/default_avatar.png'; // Removed
            // podium3Img.alt = top3[2].name; // Removed
        }
    }

    // --- Event Listeners ---
    if (eventSelect) {
        eventSelect.addEventListener('change', (e) => {
            currentEventId = e.target.value;
            console.log(`Event changed to: ${currentEventId}`);
            fetchLeaderboardData(currentEventId);
        });
    }

    // Override language setting function to also update dynamic content
    const originalSetLanguage = window.setLanguage;
    window.setLanguage = (lang) => {
        originalSetLanguage(lang); // Call the original function from lang.js
        // Re-populate dynamic elements that depend on language
        populateEventSelector(); 
        updateStatusBar();
        displayLeaderboard(); // Re-render leaderboard with translated headers/labels
        // Podium text is static labels + data, labels handled by originalSetLanguage
    };

    // --- Initial Load ---
    async function initializeApp() {
        await fetchEvents(); // Fetch events first to populate dropdown
        await fetchRoundStatus();
        await fetchLeaderboardData(currentEventId); // Fetch data for the default event
        setLanguage(currentLang); // Apply initial language settings
    }

    initializeApp();

});

