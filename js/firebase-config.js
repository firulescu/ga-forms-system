// ============================================================
// GA FORMS SYSTEM - Firebase Configuration
// The URL below is the default. Admin can override it in Settings.
// Get your URL from: Firebase Console → Realtime Database
// ============================================================

// Default URL — replace with your Firebase project URL after setup
const FIREBASE_URL = (() => {
  try {
    return localStorage.getItem('ga_firebase_url') || '';
  } catch { return ''; }
})();
