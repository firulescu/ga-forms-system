// ============================================================
// GA FORMS SYSTEM - Auth Layer
// PIN-based role authentication
// Copyright (c) 2026 firulescum@gmail.com — All Rights Reserved
// ============================================================

const AUTH = {
  ROLES: {
    admin:           { label: 'Admin',            color: '#C9A84C', icon: '👑', level: 5 },
    project_manager: { label: 'Project Manager', color: '#FF6B35', icon: '📋', level: 4 },
    site_manager:    { label: 'Site Manager',    color: '#2E7D52', icon: '🏗️', level: 3 },
    safety_officer:  { label: 'Safety Officer',  color: '#3a9e68', icon: '🛡️', level: 2 },
    operator:        { label: 'Operator',        color: '#6B7A99', icon: '👷', level: 1 },
  },

  // What each role can access
  PERMISSIONS: {
    admin:           ['dashboard','plants','qr-codes','submissions','form-templates','compliance','defects','notifications','settings','pin-management'],
    project_manager: ['dashboard','plants','qr-codes','submissions','form-templates','compliance','defects','notifications','settings','pin-management'],
    site_manager:    ['dashboard','plants','qr-codes','submissions','form-templates','compliance','defects','notifications'],
    safety_officer:  ['dashboard','submissions','compliance','defects','notifications'],
    safety_officer: ['dashboard','submissions','compliance','notifications'],
    operator:       ['form'], // form.html only
  },

  // Default PINs — admin should change on first login
  DEFAULT_PINS: {
    admin:           '0000',
    project_manager: '4444',
    site_manager:    '1111',
    safety_officer:  '2222',
    operator:        '3333',
  },

  getPins() {
    return DB.get('auth_pins') || this.DEFAULT_PINS;
  },

  savePins(pins) {
    DB.set('auth_pins', pins);
  },

  // Current session (in-memory only, cleared on page refresh)
  _session: null,

  getSession() {
    // Try sessionStorage first (persists within tab session)
    try {
      const s = sessionStorage.getItem('ga_session');
      if (s) return JSON.parse(s);
    } catch {}
    return null;
  },

  setSession(role, name) {
    const session = { role, name, loginAt: new Date().toISOString() };
    try { sessionStorage.setItem('ga_session', JSON.stringify(session)); } catch {}
    return session;
  },

  clearSession() {
    try { sessionStorage.removeItem('ga_session'); } catch {}
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  getRole() {
    const s = this.getSession();
    return s ? s.role : null;
  },

  getRoleInfo() {
    const role = this.getRole();
    return role ? this.ROLES[role] : null;
  },

  can(page) {
    const role = this.getRole();
    if (!role) return false;
    return (this.PERMISSIONS[role] || []).includes(page);
  },

  verifyPin(role, pin) {
    const pins = this.getPins();
    return pins[role] === pin;
  },

  changePin(role, oldPin, newPin) {
    if (!this.verifyPin(role, oldPin)) return { ok: false, error: 'Current PIN incorrect' };
    if (newPin.length < 4) return { ok: false, error: 'PIN must be at least 4 digits' };
    if (!/^\d+$/.test(newPin)) return { ok: false, error: 'PIN must be numbers only' };
    const pins = this.getPins();
    pins[role] = newPin;
    this.savePins(pins);
    return { ok: true };
  },

  // Admin can force-change any PIN
  adminChangePin(targetRole, newPin) {
    if (!['admin','project_manager'].includes(this.getRole())) return { ok: false, error: 'Admin/Project Manager only' };
    if (newPin.length < 4) return { ok: false, error: 'PIN must be at least 4 digits' };
    if (!/^\d+$/.test(newPin)) return { ok: false, error: 'PIN must be numbers only' };
    const pins = this.getPins();
    pins[targetRole] = newPin;
    this.savePins(pins);
    return { ok: true };
  },

  requireAuth(allowedRoles) {
    const session = this.getSession();
    if (!session) return false;
    if (allowedRoles && !allowedRoles.includes(session.role)) return false;
    return true;
  }
};
