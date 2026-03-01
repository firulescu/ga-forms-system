// GA Forms API Sync Layer - Hetzner Server
const FBSYNC = {
  _base: "https://46.225.83.168.nip.io",
  _siteId: "",

  init(url, siteId) { this._siteId = siteId; },

  async writeSubmission(sub) {
    try {
      await fetch(this._base + "/api/submissions", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify(sub)
      });
    } catch(e) { console.warn("API submission failed:", e); }
  },

  async writeNotification(n) {
    try {
      await fetch(this._base + "/api/notifications", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify(n)
      });
    } catch(e) { console.warn("API notification failed:", e); }
  },

  async writeDefect(d) {
    try {
      await fetch(this._base + "/api/defects", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify(d)
      });
    } catch(e) { console.warn("API defect failed:", e); }
  },

  async pullAll(siteId) {
    const sid = siteId || this._siteId || "";
    try {
      const [subs, notifs, defects] = await Promise.all([
        fetch(this._base + "/api/submissions?site_id=" + sid).then(r=>r.json()),
        fetch(this._base + "/api/notifications?site_id=" + sid).then(r=>r.json()),
        fetch(this._base + "/api/defects?site_id=" + sid).then(r=>r.json())
      ]);
      if (Array.isArray(subs)) {
        DB.sset("submissions", subs);
        subs.forEach(sub => {
          if (sub.plantId && sub.submittedAt) {
            const plants = DB.sget('plants') || [];
            const i = plants.findIndex(p => p.id === sub.plantId);
            if (i >= 0) {
              const existing = plants[i].lastInspected;
              if (!existing || sub.submittedAt > existing) {
                plants[i].lastInspected = sub.submittedAt;
              }
              DB.sset('plants', plants);
            }
          }
        });
      }
      if (Array.isArray(notifs)) DB.sset("notifications", notifs);
      if (Array.isArray(defects)) DB.sset("defects", defects);
      return { subs, notifs, defects };
    } catch(e) { console.warn("API pull failed:", e); return {}; }
  },

  async pushSite(site) {
    try {
      await fetch(this._base + "/api/sites", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify(site)
      });
    } catch(e) { console.warn("API site push failed:", e); }
  },

  async pushPlant(plant) {
    try {
      await fetch(this._base + "/api/plants", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify(plant)
      });
    } catch(e) { console.warn("API plant push failed:", e); }
  },

  async pullSites() {
    try {
      const sites = await fetch(this._base + "/api/sites").then(r=>r.json());
      if (Array.isArray(sites) && sites.length > 0) DB.set("sites", sites);
      return sites;
    } catch(e) { return []; }
  },

  async pullPlants(siteId) {
    try {
      const plants = await fetch(this._base + "/api/plants?site_id=" + (siteId||"")).then(r=>r.json());
      if (Array.isArray(plants) && plants.length > 0) DB.set("plants", plants);
      return plants;
    } catch(e) { return []; }
  }
};
