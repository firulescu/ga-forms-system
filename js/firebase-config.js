// ============================================================
// GA FORMS SYSTEM - Firebase Configuration
// ============================================================
const FIREBASE_URL = (() => {
  try {
    return localStorage.getItem('ga_firebase_url') || 'https://ga-forms-rql-default-rtdb.europe-west1.firebasedatabase.app';
  } catch { return 'https://ga-forms-rql-default-rtdb.europe-west1.firebasedatabase.app'; }
})();
