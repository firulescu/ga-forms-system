// ============================================================
// GA FORMS SYSTEM - Offline Queue Manager
// Saves submissions locally first, syncs to Firebase when online
// Robert Quinn Ltd © 2026
// ============================================================

const OFFLINE = {
  QUEUE_KEY: 'ga_pending_sync',

  // Add a submission to pending sync queue
  enqueue(sub, defects, notif) {
    const queue = this.getQueue();
    queue.push({
      id: sub.id,
      sub,
      defects: defects || [],
      notif,
      queuedAt: new Date().toISOString(),
      attempts: 0
    });
    this._save(queue);
    this._updateBadge();
  },

  getQueue() {
    try { return JSON.parse(localStorage.getItem(this.QUEUE_KEY)) || []; }
    catch { return []; }
  },

  _save(queue) {
    try { localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue)); } catch {}
  },

  _updateBadge() {
    const count = this.getQueue().length;
    // Broadcast to any open dashboard
    try {
      localStorage.setItem('ga_pending_count', count);
      window.dispatchEvent(new StorageEvent('storage', { key: 'ga_pending_count' }));
    } catch {}
  },

  getPendingCount() {
    return this.getQueue().length;
  },

  // Attempt to sync all queued items to Firebase
  async syncAll(fbUrl, siteId) {
    if (!fbUrl || !siteId) return { synced: 0, failed: 0 };
    if (!navigator.onLine) return { synced: 0, failed: 0, offline: true };

    const queue = this.getQueue();
    if (!queue.length) return { synced: 0, failed: 0 };

    FBSYNC.init(fbUrl, siteId);
    let synced = 0, failed = 0;
    const remaining = [];

    for (const item of queue) {
      try {
        await Promise.all([
          FBSYNC.writeSubmission(item.sub),
          item.notif ? FBSYNC.writeNotification(item.notif) : Promise.resolve(),
          ...item.defects.map(d => FBSYNC.writeDefect(d))
        ]);
        synced++;
        console.log('Synced queued submission:', item.id);
      } catch(e) {
        item.attempts = (item.attempts || 0) + 1;
        // Drop after 10 failed attempts
        if (item.attempts < 10) remaining.push(item);
        failed++;
        console.warn('Failed to sync submission:', item.id, e);
      }
    }

    this._save(remaining);
    this._updateBadge();
    return { synced, failed };
  }
};

// Auto-sync when coming back online
window.addEventListener('online', () => {
  const fbUrl = typeof FIREBASE_URL !== 'undefined' ? FIREBASE_URL : '';
  const siteId = typeof AUTH !== 'undefined' ? AUTH.getSiteId() : null;
  if (fbUrl && siteId && OFFLINE.getPendingCount() > 0) {
    OFFLINE.syncAll(fbUrl, siteId).then(r => {
      if (r.synced > 0) {
        console.log(`Auto-synced ${r.synced} offline submission(s)`);
        if (typeof UI !== 'undefined') UI.toast(`☁️ ${r.synced} offline submission${r.synced>1?'s':''} synced`, 'success');
      }
    });
  }
});
