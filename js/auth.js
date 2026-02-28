// ============================================================
// GA FORMS SYSTEM - Auth Layer v3
// Personal PIN auth, multi-site, user management
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
                       desc: 'Fill inspection forms only' },
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
    return (s && s.length) ? s : this._seedSites();
  },
  _seedSites() {
    const sites = [{
      id: 'SITE-001', name: 'Dublin — Main Construction Site',
      address: 'Dublin, Ireland', active: true,
      createdAt: new Date().toISOString(),
    }];
    DB.set('sites', sites);
    return sites;
  },
  getSite(id) { return this.getSites().find(s => s.id === id) || null; },
  saveSite(site) {
    const sites = this.getSites();
    const i = sites.findIndex(s => s.id === site.id);
    if (i >= 0) { sites[i] = { ...sites[i], ...site }; }
    else {
      site.id = 'SITE-' + String(sites.length + 1).padStart(3,'0');
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
    const users = this.getUsers().map(u => ({
      ...u, siteIds: (u.siteIds||[]).filter(sid => sid !== id)
    }));
    DB.set('users', users);
    return { ok: true };
  },

  // ── USERS ────────────────────────────────────────────────────
  getUsers() {
    const u = DB.get('users');
    return (u && u.length) ? u : this._seedUsers();
  },
  _seedUsers() {
    const now = new Date().toISOString();
    const users = [
      { id:'USR-001', name:'Marian Firulescu',  role:'admin',           pin:'0000', siteIds:['SITE-001'], active:true, createdAt:now },
      { id:'USR-002', name:'Robert Quinn',       role:'project_manager', pin:'4444', siteIds:['SITE-001'], active:true, createdAt:now },
      { id:'USR-003', name:'John Murphy',        role:'site_manager',    pin:'1111', siteIds:['SITE-001'], active:true, createdAt:now },
      { id:'USR-004', name:'Sean Doyle',         role:'safety_officer',  pin:'2222', siteIds:['SITE-001'], active:true, createdAt:now },
      { id:'USR-005', name:'Pat O\'Brien',       role:'operator',        pin:'3333', siteIds:['SITE-001'], active:true, createdAt:now },
      { id:'USR-006', name:'Tom Walsh',          role:'operator',        pin:'5678', siteIds:['SITE-001'], active:true, createdAt:now },
    ];
    DB.set('users', users);
    return users;
  },
  getUser(id) { return this.getUsers().find(u => u.id === id) || null; },
  getUsersForSite(siteId) {
    return this.getUsers().filter(u =>
      u.role === 'admin' || (u.siteIds||[]).includes(siteId)
    );
  },
  findUserByPin(pin, siteId) {
    return this.getUsers().find(u =>
      u.pin === pin &&
      u.active !== false &&
      (u.role === 'admin' || (u.siteIds||[]).includes(siteId))
    ) || null;
  },
  isPinTaken(pin, excludeId) {
    return this.getUsers().some(u => u.pin === pin && u.id !== excludeId && u.active !== false);
  },
  saveUser(user) {
    const users = this.getUsers();
    const i = users.findIndex(u => u.id === user.id);
    if (i >= 0) {
      // Editing existing — check PIN not taken by someone else
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
  setSession(user, siteId) {
    const s = { userId:user.id, name:user.name, role:user.role,
                siteId, loginAt:new Date().toISOString() };
    try { sessionStorage.setItem('ga_session', JSON.stringify(s)); } catch {}
    return s;
  },
  clearSession() {
    try { sessionStorage.removeItem('ga_session'); } catch {}
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
