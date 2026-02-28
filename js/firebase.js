// ============================================================
// GA FORMS SYSTEM - Firebase Sync Layer
// Syncs submissions, defects and notifications across devices
// Robert Quinn Ltd © 2026
// ============================================================

const FBSYNC = {
  _base: null,
  _siteId: null,
  _listeners: [],

  // Call this once on page load with your Firebase config
  init(firebaseUrl, siteId) {
    if (!firebaseUrl) return;
    this._base = firebaseUrl.replace(/\/$/, '');
    this._siteId = siteId;
  },

  _url(path) {
    return `${this._base}/${this._siteId}/${path}.json`;
  },

  isReady() {
    return !!(this._base && this._siteId);
  },

  // ── WRITE ─────────────────────────────────────────────────
  async push(collection, item) {
    if (!this.isReady()) return null;
    try {
      const res = await fetch(this._url(collection), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      return data?.name || null; // Firebase push key
    } catch(e) {
      console.warn('Firebase push failed:', e);
      return null;
    }
  },

  async set(collection, key, item) {
    if (!this.isReady()) return false;
    try {
      await fetch(`${this._base}/${this._siteId}/${collection}/${key}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      return true;
    } catch(e) {
      console.warn('Firebase set failed:', e);
      return false;
    }
  },

  async delete(collection, key) {
    if (!this.isReady()) return false;
    try {
      await fetch(`${this._base}/${this._siteId}/${collection}/${key}.json`, {
        method: 'DELETE'
      });
      return true;
    } catch(e) {
      console.warn('Firebase delete failed:', e);
      return false;
    }
  },

  // ── READ ──────────────────────────────────────────────────
  async getAll(collection) {
    if (!this.isReady()) return [];
    try {
      const res = await fetch(this._url(collection));
      const data = await res.json();
      if (!data) return [];
      // Firebase returns object with push keys — convert to array
      return Object.entries(data).map(([fbKey, val]) => ({ ...val, _fbKey: fbKey }));
    } catch(e) {
      console.warn('Firebase read failed:', e);
      return [];
    }
  },

  // ── SYNC SUBMISSIONS ──────────────────────────────────────
  async syncSubmissions() {
    const items = await this.getAll('submissions');
    if (!items.length) return;
    // Merge into localStorage — add any Firebase submissions not already local
    const key = this._siteId + ':submissions';
    const local = (() => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } })();
    const localIds = new Set(local.map(s => s.id));
    let added = 0;
    items.forEach(item => {
      if (!localIds.has(item.id)) {
        local.unshift(item);
        added++;
      }
    });
    if (added > 0) {
      local.sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      localStorage.setItem(key, JSON.stringify(local));
    }
    return added;
  },

  // ── SYNC DEFECTS ──────────────────────────────────────────
  async syncDefects() {
    const items = await this.getAll('defects');
    if (!items.length) return;
    const key = this._siteId + ':defects';
    const local = (() => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } })();
    const localIds = new Set(local.map(d => d.id));
    let added = 0;
    items.forEach(item => {
      if (!localIds.has(item.id)) {
        local.unshift(item);
        added++;
      } else {
        // Update existing (e.g. resolved status changed)
        const i = local.findIndex(d => d.id === item.id);
        if (i >= 0) local[i] = { ...local[i], ...item };
      }
    });
    if (added > 0 || items.some(i => local.find(l => l.id === i.id && l.status !== i.status))) {
      localStorage.setItem(key, JSON.stringify(local));
    }
    return added;
  },

  // ── SYNC NOTIFICATIONS ────────────────────────────────────
  async syncNotifications() {
    const items = await this.getAll('notifications');
    if (!items.length) return;
    const key = this._siteId + ':notifications';
    const local = (() => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } })();
    const localIds = new Set(local.map(n => n.id));
    let added = 0;
    items.forEach(item => {
      if (!localIds.has(item.id)) {
        local.unshift(item);
        added++;
      }
    });
    if (added > 0) {
      local.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (local.length > 100) local.length = 100;
      localStorage.setItem(key, JSON.stringify(local));
    }
    return added;
  },

  // ── PULL ALL (call on admin dashboard load) ───────────────
  async pullAll() {
    if (!this.isReady()) return { ok: false, reason: 'not configured' };
    try {
      const [subs, defs, notifs] = await Promise.all([
        this.syncSubmissions(),
        this.syncDefects(),
        this.syncNotifications()
      ]);
      return { ok: true, submissions: subs, defects: defs, notifications: notifs };
    } catch(e) {
      return { ok: false, reason: e.message };
    }
  },

  // ── WRITE SUBMISSION (call from form.html on submit) ──────
  async writeSubmission(sub) {
    return await this.push('submissions', sub);
  },

  async writeDefect(defect) {
    return await this.push('defects', defect);
  },

  async writeNotification(notif) {
    return await this.push('notifications', notif);
  },

  // Update defect status (resolve)
  async updateDefectStatus(defectId, status, resolvedBy, resolveNotes) {
    const items = await this.getAll('defects');
    const match = items.find(d => d.id === defectId);
    if (match?._fbKey) {
      await this.set('defects', match._fbKey, {
        ...match, status, resolvedBy, resolveNotes,
        resolvedAt: new Date().toISOString(), _fbKey: undefined
      });
    }
  }
};
