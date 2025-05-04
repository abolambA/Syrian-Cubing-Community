/**
 * Admin functionality for managing the speedcubing competition
 */

// DOM element references
const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const statusButtons = document.querySelectorAll('.status-btn');
const adminEventSelect = document.getElementById('admin-event-select');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const competitorsList = document.getElementById('competitors-list');
const competitorsEmpty = document.getElementById('competitors-empty');
const addCompetitorBtn = document.getElementById('add-competitor-btn');
const addCompetitorModal = document.getElementById('add-competitor-form');
const competitorForm = document.getElementById('competitor-form');
const resultsForm = document.getElementById('results-form');
const resultsCompetitorSelect = document.getElementById('results-competitor');
const solveInputs = document.querySelectorAll('.solve-input');
const calculatedAverage = document.getElementById('calculated-average');

// Current state
let currentUser = null;
let currentCompetitors = [];
let currentEvent = '3x3';

// Initialize the admin page
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication state
  firebase.auth().onAuthStateChanged(handleAuthStateChanged);
  
  // Add event listeners
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  
  // Status buttons
  statusButtons.forEach(button => {
    button.addEventListener('click', () => updateCompetitionStatus(button.dataset.status));
  });
  
  // Event selector
  adminEventSelect.addEventListener('change', handleEventChange);
  
  // Tab navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
  
  // Competitor management
  addCompetitorBtn.addEventListener('click', showAddCompetitorModal);
  competitorForm.addEventListener('submit', handleAddCompetitor);
  document.querySelectorAll('.close-modal, .cancel-modal').forEach(el => {
    el.addEventListener('click', hideAddCompetitorModal);
  });
  
  // Results management
  resultsForm.addEventListener('submit', handleSaveResults);
  solveInputs.forEach(input => {
    input.addEventListener('input', updateCalculatedAverage);
  });
  resultsForm.addEventListener('reset', () => {
    setTimeout(() => {
      calculatedAverage.textContent = '-';
    }, 0);
  });
});

// Handle authentication state changes
function handleAuthStateChanged(user) {
  currentUser = user;
  
  if (user) {
    // User is signed in
    showAdminDashboard();
    loadCompetitionStatus();
    loadCompetitors();
  } else {
    // User is signed out
    showLoginForm();
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // Clear previous errors
  loginError.textContent = '';
  
  try {
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    
    // Create loading spinner
    const spinner = utils.createLoadingSpinner();
    submitBtn.textContent = '';
    submitBtn.appendChild(spinner);
    
    // Attempt login
    await firebase.auth().signInWithEmailAndPassword(email, password);
    
    // Success - the auth state change will trigger UI update
    utils.showNotification(i18n.translate('loginSuccess'), 'success');
    
  } catch (error) {
    console.error('Login error:', error);
    loginError.textContent = i18n.translate('loginError');
    
    // Reset button
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.textContent = i18n.translate('loginButton');
    submitBtn.disabled = false;
  }
}

// Handle logout button click
async function handleLogout() {
  try {
    await firebase.auth().signOut();
    utils.showNotification(i18n.translate('logoutSuccess'), 'success');
  } catch (error) {
    console.error('Logout error:', error);
    utils.showNotification('Error signing out', 'error');
  }
}

// Show login form
function showLoginForm() {
  loginSection.classList.remove('hidden');
  adminDashboard.classList.add('hidden');
  
  // Reset the login form
  loginForm.reset();
  loginError.textContent = '';
}

// Show admin dashboard
function showAdminDashboard() {
  loginSection.classList.add('hidden');
  adminDashboard.classList.remove('hidden');
}

// Switch between tabs
function switchTab(tabId) {
  // Update tab buttons
  tabButtons.forEach(button => {
    if (button.dataset.tab === tabId) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Update tab panes
  tabPanes.forEach(pane => {
    if (pane.id === `${tabId}-tab`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
}

// Load competition status
async function loadCompetitionStatus() {
  try {
    const statusDoc = await statusRef.doc('current').get();
    
    if (statusDoc.exists) {
      const statusData = statusDoc.data();
      
      // Update status buttons
      updateStatusButtons(statusData.status);
      
      // Update event selector
      if (statusData.currentEvent) {
        currentEvent = statusData.currentEvent;
        adminEventSelect.value = currentEvent;
      }
    }
  } catch (error) {
    console.error('Error loading competition status:', error);
    utils.showNotification('Error loading competition status', 'error');
  }
}

// Update competition status
async function updateCompetitionStatus(status) {
  if (!currentUser) return;
  
  try {
    await statusRef.doc('current').update({
      status: status,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update UI
    updateStatusButtons(status);
    
    utils.showNotification(i18n.translate('statusUpdated'), 'success');
  } catch (error) {
    console.error('Error updating competition status:', error);
    utils.showNotification('Error updating status', 'error');
  }
}

// Update status button states
function updateStatusButtons(status) {
  statusButtons.forEach(button => {
    if (button.dataset.status === status) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

// Handle event change
async function handleEventChange() {
  if (!currentUser) return;
  
  const newEvent = adminEventSelect.value;
  currentEvent = newEvent;
  
  try {
    // Update the current event in the status document
    await statusRef.doc('current').update({
      currentEvent: newEvent,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update competitors dropdown in results form
    populateCompetitorDropdown();
    
  } catch (error) {
    console.error('Error updating current event:', error);
    utils.showNotification('Error updating event', 'error');
  }
}

// Load competitors
async function loadCompetitors() {
  try {
    // Show loading state
    competitorsList.innerHTML = '';
    const loadingRow = document.createElement('tr');
    loadingRow.innerHTML = `
      <td colspan="3" class="loading-text">
        <div class="loading-spinner"></div>
        <span>${i18n.translate('loading') || 'Loading...'}</span>
      </td>
    `;
    competitorsList.appendChild(loadingRow);
    competitorsEmpty.classList.add('hidden');
    
    // Get competitors from Firestore
    const snapshot = await competitorsRef.get();
    
    // Remove loading state
    competitorsList.innerHTML = '';
    
    if (snapshot.empty) {
      competitorsEmpty.classList.remove('hidden');
    } else {
      competitorsEmpty.classList.add('hidden');
      
      // Create the competitors array
      currentCompetitors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by name
      currentCompetitors.sort((a, b) => a.name.localeCompare(b.name));
      
      // Create rows for each competitor
      currentCompetitors.forEach(competitor => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${competitor.id.substring(0, 8)}</td>
          <td>${competitor.name}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-outline btn-icon delete-competitor" data-id="${competitor.id}" title="${i18n.translate('deleteButton')}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        
        // Add to the list
        competitorsList.appendChild(row);
      });
      
      // Add event listeners to delete buttons
      document.querySelectorAll('.delete-competitor').forEach(button => {
        button.addEventListener('click', () => confirmDeleteCompetitor(button.dataset.id));
      });
      
      // Update the competitors dropdown in the results form
      populateCompetitorDropdown();
    }
  } catch (error) {
    console.error('Error loading competitors:', error);
    utils.showNotification('Error loading competitors', 'error');
    competitorsList.innerHTML = '';
    competitorsEmpty.classList.remove('hidden');
    competitorsEmpty.textContent = 'Error loading competitors';
  }
}

// Show the add competitor modal
function showAddCompetitorModal() {
  addCompetitorModal.classList.remove('hidden');
  addCompetitorModal.classList.add('show');
  
  // Focus the name input
  setTimeout(() => {
    document.getElementById('competitor-name').focus();
  }, 300);
  
  // Reset the form
  competitorForm.reset();
}

// Hide the add competitor modal
function hideAddCompetitorModal() {
  addCompetitorModal.classList.remove('show');
  setTimeout(() => {
    addCompetitorModal.classList.add('hidden');
  }, 300);
}

// Handle adding a new competitor
async function handleAddCompetitor(e) {
  e.preventDefault();
  
  if (!currentUser) return;
  
  const competitorName = document.getElementById('competitor-name').value.trim();
  
  if (!competitorName) return;
  
  try {
    // Show loading state
    const submitBtn = competitorForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    
    // Create loading spinner
    const spinner = utils.createLoadingSpinner();
    submitBtn.textContent = '';
    submitBtn.appendChild(spinner);
    
    // Add to Firestore
    await competitorsRef.add({
      name: competitorName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Success
    utils.showNotification(i18n.translate('competitorAdded'), 'success');
    
    // Hide modal and refresh list
    hideAddCompetitorModal();
    loadCompetitors();
    
    // Reset form and button
    competitorForm.reset();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    
  } catch (error) {
    console.error('Error adding competitor:', error);
    utils.showNotification('Error adding competitor', 'error');
    
    // Reset button
    const submitBtn = competitorForm.querySelector('button[type="submit"]');
    submitBtn.textContent = i18n.translate('saveButton');
    submitBtn.disabled = false;
  }
}

// Confirm before deleting a competitor
function confirmDeleteCompetitor(competitorId) {
  const competitor = currentCompetitors.find(c => c.id === competitorId);
  if (!competitor) return;
  
  const message = i18n.translate('deleteConfirmation');
  
  utils.showConfirmDialog(message, () => {
    deleteCompetitor(competitorId);
  });
}

// Delete a competitor
async function deleteCompetitor(competitorId) {
  if (!currentUser) return;
  
  try {
    // Delete the competitor
    await competitorsRef.doc(competitorId).delete();
    
    // Also delete their results
    const resultsSnapshot = await resultsRef.where('competitorId', '==', competitorId).get();
    
    // Batch delete all results
    const batch = db.batch();
    resultsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    // Success
    utils.showNotification(i18n.translate('competitorDeleted'), 'success');
    
    // Refresh the list
    loadCompetitors();
    
  } catch (error) {
    console.error('Error deleting competitor:', error);
    utils.showNotification('Error deleting competitor', 'error');
  }
}

// Populate the competitor dropdown in the results form
function populateCompetitorDropdown() {
  // Clear existing options except the placeholder
  const placeholderOption = resultsCompetitorSelect.querySelector('option[value=""]');
  resultsCompetitorSelect.innerHTML = '';
  
  if (placeholderOption) {
    resultsCompetitorSelect.appendChild(placeholderOption);
  }
  
  // Add competitors to dropdown
  if (currentCompetitors.length > 0) {
    currentCompetitors.forEach(competitor => {
      const option = document.createElement('option');
      option.value = competitor.id;
      option.textContent = competitor.name;
      resultsCompetitorSelect.appendChild(option);
    });
  }
}

// Update calculated average based on current solve inputs
function updateCalculatedAverage() {
  const solves = [];
  
  // Get values from all solve inputs
  solveInputs.forEach(input => {
    const value = input.value.trim();
    if (value) {
      if (value.toUpperCase() === 'DNF') {
        solves.push('DNF');
      } else if (utils.isValidTime(value)) {
        solves.push(value);
      }
    }
  });
  
  // Calculate average if we have 5 solves
  if (solves.length === 5) {
    const average = utils.calculateAverageOf5(solves);
    calculatedAverage.textContent = average === 'DNF' ? 'DNF' : utils.formatTime(average);
  } else {
    calculatedAverage.textContent = '-';
  }
}

// Handle saving results
async function handleSaveResults(e) {
  e.preventDefault();
  
  if (!currentUser) return;
  
  const competitorId = resultsCompetitorSelect.value;
  if (!competitorId) {
    utils.showNotification('Please select a competitor', 'warning');
    return;
  }
  
  // Get solve times
  const solves = [];
  let isValid = true;
  
  solveInputs.forEach(input => {
    const value = input.value.trim();
    
    if (!value) {
      isValid = false;
      input.classList.add('error');
      return;
    }
    
    if (value.toUpperCase() === 'DNF') {
      solves.push('DNF');
    } else if (utils.isValidTime(value)) {
      solves.push(value);
    } else {
      isValid = false;
      input.classList.add('error');
    }
  });
  
  if (!isValid || solves.length !== 5) {
    utils.showNotification('Please enter valid times for all solves', 'warning');
    return;
  }
  
  // Calculate average
  const average = utils.calculateAverageOf5(solves);
  
  try {
    // Show loading state
    const submitBtn = resultsForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    
    // Create loading spinner
    const spinner = utils.createLoadingSpinner();
    submitBtn.textContent = '';
    submitBtn.appendChild(spinner);
    
    // Check if results already exist for this competitor and event
    const existingResultsQuery = await resultsRef
      .where('competitorId', '==', competitorId)
      .where('event', '==', currentEvent)
      .get();
    
    if (!existingResultsQuery.empty) {
      // Update existing result
      const existingResultDoc = existingResultsQuery.docs[0];
      await existingResultDoc.ref.update({
        solves: solves,
        average: average,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Add new result
      await resultsRef.add({
        competitorId: competitorId,
        event: currentEvent,
        solves: solves,
        average: average,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Success
    utils.showNotification(i18n.translate('resultsAdded'), 'success');
    
    // Reset form
    resultsForm.reset();
    calculatedAverage.textContent = '-';
    
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    
  } catch (error) {
    console.error('Error saving results:', error);
    utils.showNotification('Error saving results', 'error');
    
    // Reset button
    const submitBtn = resultsForm.querySelector('button[type="submit"]');
    submitBtn.textContent = i18n.translate('saveResultsButton');
    submitBtn.disabled = false;
  }
}