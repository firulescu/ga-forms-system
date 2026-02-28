// ============================================================
// GA FORMS SYSTEM - Auth Layer v4
// Multi-site, personal PIN + shared operator PIN
// Robert Quinn Ltd © 2026
// ============================================================

const AUTH = {

  ROLES: {
    admin:           { label: 'Admin',           color: '#C9A84C', icon: '👑', level: 5,
                       desc: 'Full system access, manages sites & all users' },
    project_manager: { label: 'Project Manager', color: '#FF6B35', icon: '📋', level: 4,
                       desc: 'Manages assigned sites, adds/removes users' },
    site_manager:    { label: 'Site Manager',    color: '#2E7D52', icon: '🏗️', level: 3,
                       desc: 'Day-to-day operations on assigned site' },
    safety_officer:  { label: 'Safety Officer',  color: '#3a9e68', icon: '🛡️', level: 2,
                       desc: 'Compliance, defects, lifting register' },
    operator:        { label: 'Operator',        color: '#6B7A99', icon: '👷', level: 1,
                       desc: 'Fill inspection forms — name entered at login, no account needed' },
  },

  PERMISSIONS: {
    admin:           ['dashboard','plants','qr-codes','submissions','form-templates','compliance','defects','notifications','settings','admin-panel'],
    project_manager: ['dashboard','plants','qr-codes','submissions','form-templates','compliance','defects','notifications','settings','admin-panel'],
    site_manager:    ['dashboard','plants','qr-codes','submissions','form-templates','compliance','defects','notifications'],
    safety_officer:  ['dashboard','submissions','compliance','defects','notifications'],
    operator:        ['form'],
  },

  // ── SITES ────────────────────────────────────────────────────
  getSites() {
    const s = DB.get('sites');
    return (s && s.length) ? s : [];
  },
  getSite(id) { return this.getSites().find(s => s.id === id) || null; },
  saveSite(site) {
    const sites = this.getSites();
    const i = sites.findIndex(s => s.id === site.id);
    if (i >= 0) {
      sites[i] = { ...sites[i], ...site };
    } else {
      // Generate unique ID
      const maxNum = sites.reduce((max, s) => {
        const n = parseInt((s.id||'').replace('SITE-','')) || 0;
        return n > max ? n : max;
      }, 0);
      site.id = 'SITE-' + String(maxNum + 1).padStart(3,'0');
      site.createdAt = new Date().toISOString();
      site.active = true;
      sites.push(site);
    }
    DB.set('sites', sites);
    return site;
  },
  deleteSite(id) {
    if (this.getSites().length <= 1) return { ok: false, error: 'Cannot delete the only site' };
    DB.set('sites', this.getSites().filter(s => s.id !== id));
    // Remove site from users
    const users = this.getUsers().map(u => ({
      ...u, siteIds: (u.siteIds||[]).filter(sid => sid !== id)
    }));
    DB.set('users', users);
    return { ok: true };
  },

  // ── OPERATOR PIN (shared per site, no account needed) ────────
  // Stored on the site object itself: site.operatorPin
  getOperatorPin(siteId) {
    return this.getSite(siteId)?.operatorPin || null;
  },
  setOperatorPin(siteId, pin) {
    const site = this.getSite(siteId);
    if (!site) return { ok: false, error: 'Site not found' };
    site.operatorPin = pin || null;
    this.saveSite(site);
    return { ok: true };
  },

  // ── USERS ────────────────────────────────────────────────────
  getUsers() {
    const u = DB.get('users');
    return (u && u.length) ? u : [];
  },
  getUser(id) { return this.getUsers().find(u => u.id === id) || null; },
  getUsersForSite(siteId) {
    return this.getUsers().filter(u =>
      u.role === 'admin' || (u.siteIds||[]).includes(siteId)
    );
  },
  // Named users (non-operator staff) for a site
  getStaffForSite(siteId) {
    return this.getUsersForSite(siteId).filter(u => u.role !== 'operator' || u.id);
  },
  // Find named user by PIN on a site
  findUserByPin(pin, siteId) {
    return this.getUsers().find(u =>
      u.pin === pin &&
      u.active !== false &&
      u.role !== 'operator' &&  // operators use shared PIN + name
      (u.role === 'admin' || (u.siteIds||[]).includes(siteId))
    ) || null;
  },
  // Check if PIN matches the site's operator PIN
  isOperatorPin(pin, siteId) {
    const opPin = this.getOperatorPin(siteId);
    return opPin && opPin === pin;
  },
  isPinTaken(pin, excludeId) {
    // Only check named (non-operator) users
    return this.getUsers().some(u =>
      u.pin === pin && u.id !== excludeId && u.active !== false && u.role !== 'operator'
    );
  },
  saveUser(user) {
    const users = this.getUsers();
    const i = users.findIndex(u => u.id === user.id);
    if (i >= 0) {
      if (this.isPinTaken(user.pin, user.id)) {
        const conflict = users.find(u => u.pin === user.pin && u.id !== user.id);
        return { ok: false, error: `PIN ${user.pin} already used by ${conflict.name}` };
      }
      users[i] = { ...users[i], ...user };
    } else {
      if (this.isPinTaken(user.pin, null)) {
        const conflict = users.find(u => u.pin === user.pin);
        return { ok: false, error: `PIN ${user.pin} already used by ${conflict.name}` };
      }
      user.id = 'USR-' + Date.now();
      user.createdAt = new Date().toISOString();
      user.active = true;
      users.push(user);
    }
    DB.set('users', users);
    return { ok: true, user };
  },
  deleteUser(id) {
    const me = this.getSession();
    if (me?.userId === id) return { ok: false, error: 'Cannot delete your own account' };
    DB.set('users', this.getUsers().filter(u => u.id !== id));
    return { ok: true };
  },
  toggleUserActive(id) {
    const me = this.getSession();
    if (me?.userId === id) return { ok: false, error: 'Cannot deactivate yourself' };
    const users = this.getUsers();
    const i = users.findIndex(u => u.id === id);
    if (i < 0) return { ok: false, error: 'User not found' };
    users[i].active = !users[i].active;
    DB.set('users', users);
    return { ok: true, active: users[i].active };
  },

  // ── SESSION ──────────────────────────────────────────────────
  getSession() {
    try { const s = sessionStorage.getItem('ga_session'); return s ? JSON.parse(s) : null; }
    catch { return null; }
  },
  // Named user session
  setSession(user, siteId) {
    const s = { userId:user.id, name:user.name, role:user.role,
                siteId, loginAt:new Date().toISOString() };
    try { sessionStorage.setItem('ga_session', JSON.stringify(s)); } catch {}
    // Remember last site
    try { localStorage.setItem('ga_last_site', siteId); } catch {}
    return s;
  },
  // Anonymous operator session (name typed at login, no user account)
  setOperatorSession(name, siteId) {
    const s = { userId: null, name, role: 'operator',
                siteId, loginAt: new Date().toISOString(), anonymous: true };
    try { sessionStorage.setItem('ga_session', JSON.stringify(s)); } catch {}
    try { localStorage.setItem('ga_last_site', siteId); } catch {}
    return s;
  },
  clearSession() {
    try { sessionStorage.removeItem('ga_session'); } catch {}
  },
  getLastSiteId() {
    try { return localStorage.getItem('ga_last_site'); } catch { return null; }
  },
  isLoggedIn()  { return !!this.getSession(); },
  getRole()     { return this.getSession()?.role || null; },
  getSiteId()   { return this.getSession()?.siteId || null; },
  getRoleInfo() { const r = this.getRole(); return r ? this.ROLES[r] : null; },
  can(page) {
    const role = this.getRole();
    return role ? (this.PERMISSIONS[role]||[]).includes(page) : false;
  },
  canManageSite(siteId) {
    const s = this.getSession();
    if (!s) return false;
    if (s.role === 'admin') return true;
    if (s.role === 'project_manager') {
      return (this.getUser(s.userId)?.siteIds||[]).includes(siteId);
    }
    return false;
  },
};
