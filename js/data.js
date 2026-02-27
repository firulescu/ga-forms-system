// ============================================================
// GA FORMS SYSTEM - Data Layer
// All data stored in localStorage for GitHub Pages deployment
// ============================================================

const DB = {
  // ---------- STORAGE HELPERS ----------
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  // ---------- PLANTS ----------
  getPlants() {
    return this.get('plants') || this.seedPlants();
  },
  seedPlants() {
    const plants = [
      { id: 'PLT-001', name: 'Diesel Generator A', location: 'Building 1 - Basement', type: 'Generator', lastInspected: null, photo: '⚡' },
      { id: 'PLT-002', name: 'Air Compressor Unit', location: 'Workshop Bay 2', type: 'Compressor', lastInspected: null, photo: '💨' },
      { id: 'PLT-003', name: 'Overhead Crane #1', location: 'Main Hall', type: 'Lifting', lastInspected: null, photo: '🏗️' },
      { id: 'PLT-004', name: 'Forklift FL-07', location: 'Warehouse', type: 'Mobile Plant', lastInspected: null, photo: '🚛' },
      { id: 'PLT-005', name: 'Pressure Vessel V3', location: 'Plant Room', type: 'Pressure Vessel', lastInspected: null, photo: '🔵' },
      { id: 'PLT-006', name: 'Scissor Lift SL-02', location: 'Yard', type: 'Elevated Work', lastInspected: null, photo: '🔼' },
    ];
    this.set('plants', plants);
    return plants;
  },
  getPlant(id) {
    return this.getPlants().find(p => p.id === id);
  },
  addPlant(plant) {
    const plants = this.getPlants();
    plant.id = 'PLT-' + String(plants.length + 1).padStart(3, '0');
    plant.lastInspected = null;
    plants.push(plant);
    this.set('plants', plants);
    return plant;
  },
  updatePlant(id, data) {
    const plants = this.getPlants();
    const i = plants.findIndex(p => p.id === id);
    if (i >= 0) { plants[i] = { ...plants[i], ...data }; this.set('plants', plants); }
  },
  deletePlant(id) {
    const plants = this.getPlants().filter(p => p.id !== id);
    this.set('plants', plants);
  },

  // ---------- FORM TEMPLATES ----------
  getFormTemplates() {
    return this.get('formTemplates') || this.seedForms();
  },
  seedForms() {
    const forms = [
      {
        id: 'GA2',
        name: 'GA2 - Plant Pre-Start Inspection',
        description: 'Daily pre-start safety inspection for plant and equipment',
        color: '#00C896',
        sections: [
          {
            title: 'Visual Inspection',
            items: [
              'No visible damage, cracks or deformations on structure',
              'All guards and safety covers are in place and secure',
              'No oil, fuel or fluid leaks visible',
              'Tyres / tracks in good condition (if applicable)',
              'Lights and warning devices operational',
            ]
          },
          {
            title: 'Fluid Levels',
            items: [
              'Engine oil level checked and within range',
              'Coolant level checked and within range',
              'Hydraulic fluid level checked and within range',
              'Fuel level adequate for planned work',
              'Battery water level checked (if applicable)',
            ]
          },
          {
            title: 'Controls & Safety Devices',
            items: [
              'All controls operate correctly and return to neutral',
              'Emergency stop / kill switch functional',
              'Seat belt / operator restraint present and functional',
              'Horn / audible warning device operational',
              'Backup alarm operational (if applicable)',
              'Fire extinguisher present, charged and accessible',
            ]
          },
          {
            title: 'Documentation',
            items: [
              'Plant registration / certificate of inspection current',
              'Operator holds current licence/ticket (if required)',
              'Previous defects have been cleared or reported',
            ]
          }
        ]
      },
      {
        id: 'GA3',
        name: 'GA3 - Plant Hazard Assessment',
        description: 'Weekly hazard identification and risk assessment for plant',
        color: '#FF6B35',
        sections: [
          {
            title: 'Hazard Identification',
            items: [
              'Struck by / caught between hazards identified',
              'Overhead hazards (powerlines, structures) assessed',
              'Ground conditions assessed (slopes, soft ground, holes)',
              'Traffic management plan in place if required',
              'Exclusion zones established and marked',
            ]
          },
          {
            title: 'Environmental Conditions',
            items: [
              'Wind speed assessed and within operational limits',
              'Visibility adequate for safe operation',
              'Ground stability confirmed adequate for plant weight',
              'Weather conditions acceptable for planned work',
            ]
          },
          {
            title: 'Risk Controls',
            items: [
              'Spotter / dogman requirements assessed',
              'Communication method established (radio, hand signals)',
              'Load charts / capacity plates visible and consulted',
              'Lift plan completed for critical lifts (if applicable)',
              'Exclusion zone barriers / flagging in place',
              'Emergency response plan discussed with crew',
            ]
          },
          {
            title: 'Sign-Off',
            items: [
              'All crew members have been briefed on hazards and controls',
              'Supervisor has reviewed and approved commencement of work',
              'Any residual risks recorded and accepted by all parties',
            ]
          }
        ]
      },
      {
        id: 'GA4',
        name: 'GA4 - Plant Maintenance Checklist',
        description: 'Scheduled maintenance inspection record',
        color: '#7B61FF',
        sections: [
          {
            title: 'Engine & Drive System',
            items: [
              'Air filter inspected / replaced as required',
              'Fuel filter inspected / replaced as required',
              'Oil filter replaced (if on maintenance schedule)',
              'Drive belts and hoses inspected for wear',
              'Engine mounts and fasteners checked for tightness',
            ]
          },
          {
            title: 'Hydraulic System',
            items: [
              'Hydraulic hoses and fittings inspected for leaks/damage',
              'Hydraulic filter replaced (if on schedule)',
              'Cylinder seals checked for leaks',
              'Hydraulic fluid condition checked',
            ]
          },
          {
            title: 'Structural & Mechanical',
            items: [
              'All grease points lubricated',
              'Pins and bushes inspected for wear',
              'Bucket / attachment teeth and cutting edges inspected',
              'Tracks / undercarriage inspected and tension correct',
              'Structural welds inspected for cracks',
            ]
          },
          {
            title: 'Electrical',
            items: [
              'Battery terminals clean and tight',
              'Wiring harness inspected for damage or chafing',
              'All lights operational',
              'Hour meter / instruments operational',
            ]
          }
        ]
      }
    ];
    this.set('formTemplates', forms);
    return forms;
  },
  getFormTemplate(id) {
    return this.getFormTemplates().find(f => f.id === id);
  },

  // ---------- SUBMISSIONS ----------
  getSubmissions() {
    return this.get('submissions') || [];
  },
  addSubmission(sub) {
    const subs = this.getSubmissions();
    sub.id = 'SUB-' + Date.now();
    sub.submittedAt = new Date().toISOString();
    subs.unshift(sub);
    this.set('submissions', subs);
    // Update plant lastInspected
    this.updatePlant(sub.plantId, { lastInspected: sub.submittedAt });
    return sub;
  },
  getSubmissionsForPlant(plantId) {
    return this.getSubmissions().filter(s => s.plantId === plantId);
  },
  getSubmissionsThisWeek() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.getSubmissions().filter(s => new Date(s.submittedAt) > weekAgo);
  },

  // ---------- USERS / SETTINGS ----------
  getSettings() {
    return this.get('settings') || {
      companyName: 'Acme Construction Ltd',
      siteName: 'Main Construction Site',
      siteManager: 'John Smith',
      safetyOfficer: 'Sarah Jones',
      notifyEmail: 'safety@acme.com',
      weeklyFormRequired: 'GA3',
      dailyFormRequired: 'GA2',
    };
  },
  saveSettings(s) { this.set('settings', s); },

  // ---------- NOTIFICATIONS ----------
  getNotifications() {
    return this.get('notifications') || [];
  },
  addNotification(n) {
    const list = this.getNotifications();
    n.id = 'N-' + Date.now();
    n.createdAt = new Date().toISOString();
    n.read = false;
    list.unshift(n);
    if (list.length > 100) list.pop();
    this.set('notifications', list);
  },
  markAllRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    this.set('notifications', list);
  },
  getUnreadCount() {
    return this.getNotifications().filter(n => !n.read).length;
  },

  // ---------- COMPLIANCE CHECKS ----------
  checkCompliance() {
    const plants = this.getPlants();
    const weekSubs = this.getSubmissionsThisWeek();
    const today = new Date().toDateString();
    const issues = [];
    plants.forEach(plant => {
      const weeklyDone = weekSubs.some(s => s.plantId === plant.id && s.formId === 'GA3');
      const dailyDone = weekSubs.some(s => s.plantId === plant.id && s.formId === 'GA2' && new Date(s.submittedAt).toDateString() === today);
      if (!weeklyDone) issues.push({ plantId: plant.id, plantName: plant.name, issue: 'GA3 not completed this week', severity: 'warning' });
      if (!dailyDone) issues.push({ plantId: plant.id, plantName: plant.name, issue: 'GA2 not completed today', severity: 'info' });
    });
    return issues;
  }
};

// Export for modules or global
if (typeof module !== 'undefined') module.exports = DB;
