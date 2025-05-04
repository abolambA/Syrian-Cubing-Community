/**
 * Utility functions for the speedcubing leaderboard application
 */

// Format a time value for display
function formatTime(time) {
  if (time === "DNF" || time === null) {
    return "DNF";
  }
  
  // Parse the time as a float
  const timeValue = parseFloat(time);
  
  // Format with 2 decimal places
  return timeValue.toFixed(2);
}

// Calculate the average of 5 according to WCA rules
function calculateAverageOf5(solves) {
  // Check if we have 5 solves
  if (!solves || solves.length !== 5) {
    return null;
  }
  
  // Convert solve times to numbers, keeping track of DNFs
  const numericSolves = solves.map(solve => {
    if (solve === "DNF" || solve === null) {
      return { value: Infinity, isDNF: true };
    } else {
      return { value: parseFloat(solve), isDNF: false };
    }
  });
  
  // Count DNFs
  const dnfCount = numericSolves.filter(solve => solve.isDNF).length;
  
  // If more than one DNF, the average is DNF
  if (dnfCount > 1) {
    return "DNF";
  }
  
  // Sort solves to find fastest and slowest
  numericSolves.sort((a, b) => a.value - b.value);
  
  // Remove fastest and slowest solves
  const countingSolves = numericSolves.slice(1, 4);
  
  // Calculate average of the middle 3 solves
  const sum = countingSolves.reduce((acc, solve) => acc + solve.value, 0);
  const average = sum / 3;
  
  return average;
}

// Display a notification message
function showNotification(message, type = 'info') {
  // Check if notification container exists, create if not
  let notificationContainer = document.querySelector('.notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    // Add styles to the container
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '9999';
    notificationContainer.style.display = 'flex';
    notificationContainer.style.flexDirection = 'column';
    notificationContainer.style.gap = '10px';
    
    // Adjust for RTL
    if (document.documentElement.dir === 'rtl') {
      notificationContainer.style.right = 'auto';
      notificationContainer.style.left = '20px';
    }
  }
  
  // Create the notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Style the notification
  notification.style.padding = '12px 16px';
  notification.style.borderRadius = '8px';
  notification.style.backgroundColor = type === 'error' ? '#ff3b30' : 
                                       type === 'success' ? '#34c759' : 
                                       type === 'warning' ? '#ffc107' : '#3366cc';
  notification.style.color = 'white';
  notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  notification.style.marginBottom = '10px';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(-10px)';
  notification.style.transition = 'opacity 300ms, transform 300ms';
  notification.style.minWidth = '250px';
  
  // Add the notification to the container
  notificationContainer.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove the notification after a delay
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Validate time input
function isValidTime(time) {
  if (time === 'DNF') {
    return true;
  }
  
  // Check if it's a valid number
  const timePattern = /^[0-9]*\.?[0-9]+$/;
  return timePattern.test(time);
}

// Create loading spinner element
function createLoadingSpinner() {
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  return spinner;
}

// Show a loading text with spinner
function showLoadingText(container, message) {
  const loadingElement = document.createElement('div');
  loadingElement.className = 'loading-text';
  
  const spinner = createLoadingSpinner();
  loadingElement.appendChild(spinner);
  
  const textElement = document.createElement('span');
  textElement.textContent = message;
  loadingElement.appendChild(textElement);
  
  container.innerHTML = '';
  container.appendChild(loadingElement);
  
  return loadingElement;
}

// Function to detect support for emoji display
function hasEmojiSupport() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const testEmoji = '🏆';
  
  ctx.fillText(testEmoji, -10, -10);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0);
}

// Show confirmation dialog
function showConfirmDialog(message, onConfirm, onCancel) {
  // Create modal elements
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const title = document.createElement('h3');
  title.textContent = window.i18n.translate('deleteCompetitor');
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-modal';
  closeBtn.innerHTML = '&times;';
  
  modalHeader.appendChild(title);
  modalHeader.appendChild(closeBtn);
  
  const modalBody = document.createElement('div');
  modalBody.style.padding = '16px';
  modalBody.textContent = message;
  
  const modalFooter = document.createElement('div');
  modalFooter.style.padding = '16px';
  modalFooter.style.display = 'flex';
  modalFooter.style.justifyContent = 'flex-end';
  modalFooter.style.gap = '8px';
  modalFooter.style.borderTop = '1px solid var(--color-gray-200)';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-outline';
  cancelBtn.textContent = window.i18n.translate('cancelButton');
  
  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-danger';
  confirmBtn.textContent = window.i18n.translate('deleteButton');
  
  modalFooter.appendChild(cancelBtn);
  modalFooter.appendChild(confirmBtn);
  
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalFooter);
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Show the modal
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Event handlers
  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  };
  
  closeBtn.addEventListener('click', () => {
    closeModal();
    if (onCancel) onCancel();
  });
  
  cancelBtn.addEventListener('click', () => {
    closeModal();
    if (onCancel) onCancel();
  });
  
  confirmBtn.addEventListener('click', () => {
    closeModal();
    if (onConfirm) onConfirm();
  });
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
      if (onCancel) onCancel();
    }
  });
}

// Export utility functions to global scope
window.utils = {
  formatTime,
  calculateAverageOf5,
  showNotification,
  isValidTime,
  createLoadingSpinner,
  showLoadingText,
  hasEmojiSupport,
  showConfirmDialog
};