/**
 * Internationalization (i18n) module
 * Supports multiple languages with automatic storage of user preferences
 */

// Languages supported by the application
const supportedLanguages = ['en', 'ar'];

// Translation dictionaries
const translations = {
  // English translations (default)
  en: {
    // App titles and sections
    appTitle: 'Syria Speedcubing Open 2025 Leaderboard ',
    adminTitle: 'Admin Login',
    dashboardTitle: 'Admin Dashboard',
    podiumTitle: 'Podium',
    leaderboardTitle: 'Leaderboard',
    
    // Events
    event3x3: '3x3 Cube',
    event2x2: '2x2 Cube',
    eventPyraminx: 'Pyraminx',
    eventSelectLabel: 'Select Event',
    
    // Status
    statusLabel: 'Status:',
    statusNotStarted: 'Not Started',
    statusInProgress: 'In Progress',
    statusFinished: 'Finished',
    compStatusLabel: 'Competition Status',
    
    // Table headers
    rankHeader: 'Rank',
    nameHeader: 'Name',
    averageHeader: 'Average (Ao5)',
    solvesHeader: 'Solves',
    competitorIdHeader: 'ID',
    competitorNameHeader: 'Name',
    actionsHeader: 'Actions',
    
    // Empty states
    podiumEmpty: 'No results available yet',
    leaderboardEmpty: 'No results available yet',
    noCompetitorsMsg: 'No competitors added yet',
    
    // Admin tabs and controls
    competitorsTab: 'Competitors',
    resultsTab: 'Results',
    competitorsHeader: 'Competitors',
    addResultsHeader: 'Add Results',
    
    // Auth
    loginHeader: 'Admin Login',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButton: 'Login',
    logoutButton: 'Logout',
    
    // Competitors
    addCompetitorBtn: 'Add Competitor',
    addCompetitorTitle: 'Add New Competitor',
    competitorNameLabel: 'Competitor Name',
    competitorNamePlaceholder: 'Enter competitor name',
    
    // Results
    selectCompetitorLabel: 'Select Competitor',
    selectCompetitorPlaceholder: '-- Select Competitor --',
    solvesLabel: 'Solve Times',
    solvesHelpText: 'Enter times in seconds (e.g., 12.34) or DNF for Did Not Finish',
    solve1Label: 'Solve 1',
    solve2Label: 'Solve 2',
    solve3Label: 'Solve 3',
    solve4Label: 'Solve 4',
    solve5Label: 'Solve 5',
    calculatedAverageLabel: 'Calculated Average (Ao5):',
    averageInfoText: 'The average is calculated by removing the fastest and slowest times, then averaging the remaining 3 times.',
    
    // Buttons
    saveButton: 'Save',
    cancelButton: 'Cancel',
    resetButton: 'Reset',
    saveResultsButton: 'Save Results',
    deleteButton: 'Delete',
    
    // Navigation
    adminLink: 'Admin Login',
    backToLeaderboard: 'Back to Leaderboard',
    
    // Footer
    footerText: '© Syrian SpeedCubing Community',

    // Actions
    deleteConfirmation: 'Are you sure you want to delete this competitor? This action cannot be undone.',
    deleteCompetitor: 'Delete Competitor',
    editCompetitor: 'Edit',
    addResults: 'Add Results',
    
    // Notifications
    loginSuccess: 'Logged in successfully!',
    loginError: 'Invalid email or password. Please try again.',
    logoutSuccess: 'Logged out successfully!',
    competitorAdded: 'New competitor added successfully!',
    competitorDeleted: 'Competitor deleted successfully!',
    resultsAdded: 'Results saved successfully!',
    statusUpdated: 'Competition status updated!'
  },
  
  // Arabic translations
  ar: {
    // App titles and sections
    appTitle: 'سجل بطولة مكعبات روبيك',
    adminTitle: 'تسجيل دخول المشرف',
    dashboardTitle: 'لوحة تحكم المشرف',
    podiumTitle: 'منصة التتويج',
    leaderboardTitle: 'سجل النتائج',
    
    // Events
    event3x3: 'مكعب 3×3',
    event2x2: 'مكعب 2×2',
    eventPyraminx: 'هرم',
    eventSelectLabel: 'اختر الفئة',
    
    // Status
    statusLabel: 'الحالة:',
    statusNotStarted: 'لم تبدأ',
    statusInProgress: 'قيد التنفيذ',
    statusFinished: 'انتهت',
    compStatusLabel: 'حالة المسابقة',
    
    // Table headers
    rankHeader: 'المركز',
    nameHeader: 'الاسم',
    averageHeader: 'المعدل (Ao5)',
    solvesHeader: 'المحاولات',
    competitorIdHeader: 'الرقم',
    competitorNameHeader: 'الاسم',
    actionsHeader: 'إجراءات',
    
    // Empty states
    podiumEmpty: 'لا توجد نتائج متاحة بعد',
    leaderboardEmpty: 'لا توجد نتائج متاحة بعد',
    noCompetitorsMsg: 'لم يتم إضافة متسابقين بعد',
    
    // Admin tabs and controls
    competitorsTab: 'المتسابقون',
    resultsTab: 'النتائج',
    competitorsHeader: 'المتسابقون',
    addResultsHeader: 'إضافة نتائج',
    
    // Auth
    loginHeader: 'تسجيل دخول المشرف',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    loginButton: 'تسجيل الدخول',
    logoutButton: 'تسجيل الخروج',
    
    // Competitors
    addCompetitorBtn: 'إضافة متسابق',
    addCompetitorTitle: 'إضافة متسابق جديد',
    competitorNameLabel: 'اسم المتسابق',
    competitorNamePlaceholder: 'أدخل اسم المتسابق',
    
    // Results
    selectCompetitorLabel: 'اختر المتسابق',
    selectCompetitorPlaceholder: '-- اختر المتسابق --',
    solvesLabel: 'أوقات الحل',
    solvesHelpText: 'أدخل الأوقات بالثواني (مثال: 12.34) أو DNF للحل غير المكتمل',
    solve1Label: 'الحل 1',
    solve2Label: 'الحل 2',
    solve3Label: 'الحل 3',
    solve4Label: 'الحل 4',
    solve5Label: 'الحل 5',
    calculatedAverageLabel: 'المعدل المحسوب (Ao5):',
    averageInfoText: 'يتم حساب المعدل بإزالة أسرع وأبطأ وقت، ثم حساب متوسط الأوقات الثلاثة المتبقية.',
    
    // Buttons
    saveButton: 'حفظ',
    cancelButton: 'إلغاء',
    resetButton: 'إعادة تعيين',
    saveResultsButton: 'حفظ النتائج',
    deleteButton: 'حذف',
    
    // Navigation
    adminLink: 'دخول المشرف',
    backToLeaderboard: 'العودة إلى سجل النتائج',
    
    // Footer
    footerText: '© 2025 سجل بطولة مكعبات روبيك',

    // Actions
    deleteConfirmation: 'هل أنت متأكد من رغبتك في حذف هذا المتسابق؟ لا يمكن التراجع عن هذا الإجراء.',
    deleteCompetitor: 'حذف المتسابق',
    editCompetitor: 'تعديل',
    addResults: 'إضافة نتائج',
    
    // Notifications
    loginSuccess: 'تم تسجيل الدخول بنجاح!',
    loginError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
    logoutSuccess: 'تم تسجيل الخروج بنجاح!',
    competitorAdded: 'تمت إضافة متسابق جديد بنجاح!',
    competitorDeleted: 'تم حذف المتسابق بنجاح!',
    resultsAdded: 'تم حفظ النتائج بنجاح!',
    statusUpdated: 'تم تحديث حالة المسابقة!'
  }
};

// Current language
let currentLanguage = 'en';

// Function to set the page language
function setLanguage(lang) {
  // Ensure the language is supported
  if (!supportedLanguages.includes(lang)) {
    console.warn(`Language "${lang}" is not supported. Using default language "en" instead.`);
    lang = 'en';
  }
  
  // Save the selected language to localStorage
  localStorage.setItem('preferredLanguage', lang);
  
  // Update current language
  currentLanguage = lang;
  
  // Set the document direction for RTL languages
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  // Update the language button states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.id === `lang-${lang}`) {
      btn.classList.add('active');
    }
  });
  
  // Translate all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });
  
  // Translate placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      element.placeholder = translations[lang][key];
    }
  });
}

// Function to get translation for a key
function translate(key) {
  if (translations[currentLanguage] && translations[currentLanguage][key]) {
    return translations[currentLanguage][key];
  }
  
  // Fallback to English
  if (translations.en && translations.en[key]) {
    return translations.en[key];
  }
  
  // Return the key as is if no translation is found
  return key;
}

// Initialize language from localStorage or browser preference
function initializeLanguage() {
  // Check for saved preference
  const savedLanguage = localStorage.getItem('preferredLanguage');
  
  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    currentLanguage = savedLanguage;
  } else {
    // Fallback to browser language if available
    const browserLang = navigator.language.split('-')[0];
    
    if (supportedLanguages.includes(browserLang)) {
      currentLanguage = browserLang;
    }
  }
  
  // Apply the selected language
  setLanguage(currentLanguage);
}

// Set up language switcher event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize language
  initializeLanguage();
  
  // Add event listeners to language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.id.replace('lang-', '');
      setLanguage(lang);
    });
  });
});

// Export language functions
window.i18n = {
  setLanguage,
  translate,
  currentLanguage: () => currentLanguage
};