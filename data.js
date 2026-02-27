// ============================================================
// GA FORMS SYSTEM - Data Layer
// Robert Quinn Ltd © 2026 — All Rights Reserved
// ============================================================

const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },

  // ============================================================
  // PLANTS
  // ============================================================
  getPlants() { return this.get('plants') || this.seedPlants(); },
  seedPlants() {
    const plants = [
      { id:'PLT-001', name:'Diesel Generator A',  location:'Building 1 - Basement', type:'Generator',       lastInspected:null, photo:'⚡' },
      { id:'PLT-002', name:'Air Compressor Unit',  location:'Workshop Bay 2',        type:'Compressor',      lastInspected:null, photo:'💨' },
      { id:'PLT-003', name:'Overhead Crane #1',    location:'Main Hall',             type:'Lifting',         lastInspected:null, photo:'🏗️' },
      { id:'PLT-004', name:'Forklift FL-07',       location:'Warehouse',             type:'Mobile Plant',    lastInspected:null, photo:'🚛' },
      { id:'PLT-005', name:'Pressure Vessel V3',   location:'Plant Room',            type:'Pressure Vessel', lastInspected:null, photo:'🔵' },
      { id:'PLT-006', name:'Scissor Lift SL-02',   location:'Yard',                  type:'Elevated Work',   lastInspected:null, photo:'🔼' },
    ];
    this.set('plants', plants);
    return plants;
  },
  getPlant(id) { return this.getPlants().find(p => p.id === id); },
  addPlant(plant) {
    const plants = this.getPlants();
    plant.id = 'PLT-' + String(plants.length + 1).padStart(3,'0');
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
  deletePlant(id) { this.set('plants', this.getPlants().filter(p => p.id !== id)); },

  // ============================================================
  // GA1 — Plant Registration / Static Safety File
  // One record per plant, edited by authorised roles only
  // ============================================================
  getGA1Records() { return this.get('ga1_records') || []; },
  getGA1(plantId) { return this.getGA1Records().find(r => r.plantId === plantId) || null; },
  saveGA1(record) {
    const records = this.getGA1Records();
    const i = records.findIndex(r => r.plantId === record.plantId);
    record.updatedAt = new Date().toISOString();
    if (i >= 0) { records[i] = { ...records[i], ...record }; }
    else { record.createdAt = new Date().toISOString(); records.push(record); }
    this.set('ga1_records', records);
    return record;
  },
  deleteGA1(plantId) { this.set('ga1_records', this.getGA1Records().filter(r => r.plantId !== plantId)); },

  getGA1DueAlerts() {
    const today = new Date();
    return this.getGA1Records().filter(r => r.nextInspectionDue).map(r => {
      const due = new Date(r.nextInspectionDue);
      const days = Math.ceil((due - today) / 86400000);
      if (days < 0)   return { plantId:r.plantId, plantName:r.plantName, days, status:'overdue',  severity:'danger',  message:`Inspection overdue by ${Math.abs(days)} day(s)` };
      if (days <= 14) return { plantId:r.plantId, plantName:r.plantName, days, status:'due-soon', severity:'warning', message:`Inspection due in ${days} day(s)` };
      return null;
    }).filter(Boolean);
  },

  // ============================================================
  // LIFTING EQUIPMENT REGISTER
  // ============================================================
  getLiftingItems() { return this.get('lifting_items') || this.seedLifting(); },
  seedLifting() {
    const items = [
      { id:'LFT-001', category:'Crane / Hoist',   description:'Overhead Crane 5T',           make:'Demag',   model:'EKKE',         serialNo:'DM-2019-001', swl:'5000', swlUnit:'kg', yearOfManufacture:'2019', lastThoroughExam:'2025-08-01', nextThoroughExam:'2026-02-01', colourCode:'green',  status:'active', location:'Main Hall',     certRef:'CE-2025-001', notes:'' },
      { id:'LFT-002', category:'Chain Sling',      description:'2-Leg Chain Sling',           make:'Pewag',   model:'8mm Grade 80', serialNo:'PW-8MM-042',  swl:'2000', swlUnit:'kg', yearOfManufacture:'2022', lastThoroughExam:'2025-09-15', nextThoroughExam:'2026-03-15', colourCode:'green',  status:'active', location:'Rigging Store', certRef:'CE-2025-002', notes:'' },
      { id:'LFT-003', category:'Shackle',          description:'Bow Shackle 3.25T',           make:'Crosby',  model:'G-209',        serialNo:'CS-3T-018',   swl:'3250', swlUnit:'kg', yearOfManufacture:'2021', lastThoroughExam:'2025-07-01', nextThoroughExam:'2026-01-01', colourCode:'yellow', status:'active', location:'Rigging Store', certRef:'CE-2025-003', notes:'Due for colour change Q1' },
      { id:'LFT-004', category:'Webbing Sling',    description:'Single Leg Webbing Sling 2Tx3m', make:'Spanset', model:'EWG',       serialNo:'SP-2T3M-007', swl:'2000', swlUnit:'kg', yearOfManufacture:'2023', lastThoroughExam:'2025-10-01', nextThoroughExam:'2026-04-01', colourCode:'green',  status:'active', location:'Rigging Store', certRef:'CE-2025-004', notes:'' },
      { id:'LFT-005', category:'Hook',             description:'Safety Hook 5T',              make:'Gunnebo', model:'SHK-5',        serialNo:'GB-5T-033',   swl:'5000', swlUnit:'kg', yearOfManufacture:'2020', lastThoroughExam:'2025-08-01', nextThoroughExam:'2026-02-01', colourCode:'green',  status:'active', location:'Main Hall',     certRef:'CE-2025-005', notes:'' },
    ];
    this.set('lifting_items', items);
    return items;
  },
  getLiftingItem(id) { return this.getLiftingItems().find(i => i.id === id); },
  addLiftingItem(item) {
    const items = this.getLiftingItems();
    item.id = 'LFT-' + String(items.length + 1).padStart(3,'0');
    item.createdAt = new Date().toISOString();
    items.push(item);
    this.set('lifting_items', items);
    return item;
  },
  updateLiftingItem(id, data) {
    const items = this.getLiftingItems();
    const i = items.findIndex(it => it.id === id);
    if (i >= 0) { items[i] = { ...items[i], ...data, updatedAt:new Date().toISOString() }; this.set('lifting_items', items); }
  },
  deleteLiftingItem(id) { this.set('lifting_items', this.getLiftingItems().filter(i => i.id !== id)); },

  getCurrentColourCode() {
    const m = new Date().getMonth();
    if (m <= 2)  return { colour:'green',  label:'Q1 — Jan / Feb / Mar', hex:'#2E7D52' };
    if (m <= 5)  return { colour:'yellow', label:'Q2 — Apr / May / Jun', hex:'#C9A84C' };
    if (m <= 8)  return { colour:'red',    label:'Q3 — Jul / Aug / Sep', hex:'#CC3333' };
    return           { colour:'blue',   label:'Q4 — Oct / Nov / Dec', hex:'#2255AA' };
  },

  getLiftingDueAlerts() {
    const today = new Date();
    return this.getLiftingItems().filter(it => it.nextThoroughExam).map(it => {
      const due = new Date(it.nextThoroughExam);
      const days = Math.ceil((due - today) / 86400000);
      if (days < 0)   return { id:it.id, description:it.description, days, status:'overdue',  severity:'danger',  message:`Thorough exam overdue by ${Math.abs(days)} day(s)` };
      if (days <= 30) return { id:it.id, description:it.description, days, status:'due-soon', severity:'warning', message:`Thorough exam due in ${days} day(s)` };
      return null;
    }).filter(Boolean);
  },

  getLiftingColourIssues() {
    const current = this.getCurrentColourCode();
    return this.getLiftingItems().filter(it => it.status === 'active' && it.colourCode !== current.colour);
  },

  // ============================================================
  // FORM TEMPLATES
  // ============================================================
  getFormTemplates() { return this.get('formTemplates') || this.seedForms(); },
  seedForms() {
    const forms = [
      {
        id:'GA2', name:'GA2 — Plant Pre-Start Inspection',
        description:'Daily pre-start safety inspection for plant and equipment',
        color:'#2E7D52',
        sections:[
          { title:'Visual Inspection', items:['No visible damage, cracks or deformations on structure','All guards and safety covers are in place and secure','No oil, fuel or fluid leaks visible','Tyres / tracks in good condition (if applicable)','Lights and warning devices operational'] },
          { title:'Fluid Levels', items:['Engine oil level checked and within range','Coolant level checked and within range','Hydraulic fluid level checked and within range','Fuel level adequate for planned work','Battery water level checked (if applicable)'] },
          { title:'Controls & Safety Devices', items:['All controls operate correctly and return to neutral','Emergency stop / kill switch functional','Seat belt / operator restraint present and functional','Horn / audible warning device operational','Backup alarm operational (if applicable)','Fire extinguisher present, charged and accessible'] },
          { title:'Documentation', items:['Plant registration / certificate of inspection current','Operator holds current licence/ticket (if required)','Previous defects have been cleared or reported'] },
        ]
      },
      {
        id:'GA3', name:'GA3 — Plant Hazard Assessment',
        description:'Weekly hazard identification and risk assessment for plant',
        color:'#C9A84C',
        sections:[
          { title:'Hazard Identification', items:['Struck by / caught between hazards identified','Overhead hazards (powerlines, structures) assessed','Ground conditions assessed (slopes, soft ground, holes)','Traffic management plan in place if required','Exclusion zones established and marked'] },
          { title:'Environmental Conditions', items:['Wind speed assessed and within operational limits','Visibility adequate for safe operation','Ground stability confirmed adequate for plant weight','Weather conditions acceptable for planned work'] },
          { title:'Risk Controls', items:['Spotter / dogman requirements assessed','Communication method established (radio, hand signals)','Load charts / capacity plates visible and consulted','Lift plan completed for critical lifts (if applicable)','Exclusion zone barriers / flagging in place','Emergency response plan discussed with crew'] },
          { title:'Sign-Off', items:['All crew members have been briefed on hazards and controls','Supervisor has reviewed and approved commencement of work','Any residual risks recorded and accepted by all parties'] },
        ]
      },
      {
        id:'GA4', name:'GA4 — Plant Maintenance Checklist',
        description:'Scheduled maintenance inspection record',
        color:'#7B61FF',
        sections:[
          { title:'Engine & Drive System', items:['Air filter inspected / replaced as required','Fuel filter inspected / replaced as required','Oil filter replaced (if on maintenance schedule)','Drive belts and hoses inspected for wear','Engine mounts and fasteners checked for tightness'] },
          { title:'Hydraulic System', items:['Hydraulic hoses and fittings inspected for leaks/damage','Hydraulic filter replaced (if on schedule)','Cylinder seals checked for leaks','Hydraulic fluid condition checked'] },
          { title:'Structural & Mechanical', items:['All grease points lubricated','Pins and bushes inspected for wear','Bucket / attachment teeth and cutting edges inspected','Tracks / undercarriage inspected and tension correct','Structural welds inspected for cracks'] },
          { title:'Electrical', items:['Battery terminals clean and tight','Wiring harness inspected for damage or chafing','All lights operational','Hour meter / instruments operational'] },
        ]
      },
      {
        id:'GL1', name:'GL1 — Pre-Lift Safety Checklist',
        description:'Pre-lift inspection and risk assessment for all lifting operations',
        color:'#CC3333',
        sections:[
          { title:'Lifting Equipment Inspection', items:['All lifting equipment has current thorough examination certificate','Lifting equipment colour tag is correct for current quarter','SWL/WLL markings are clearly visible on all equipment','Slings, chains and accessories inspected — no damage, kinks or corrosion','Shackle pins are correctly seated and moused / secured','Hooks inspected — no deformation, throat opening within limits','Load cell or dynamometer fitted if required by lift plan'] },
          { title:'Crane / Hoist Pre-Check', items:['Crane pre-start inspection (GA2) completed for this shift','Load charts consulted and lift is within rated capacity at required radius','Anti-two-block device tested and operational','Limit switches tested and operational','Brakes tested under no-load condition','Outrigger pads deployed and crane level (if applicable)'] },
          { title:'Lift Zone & Exclusion', items:['Lift area inspected — no overhead obstructions or power lines within safe distance','Ground bearing capacity assessed and adequate for crane / support loads','Exclusion zone established and barriers / signage in place','All non-essential personnel cleared from lift zone','Escape routes identified in case of emergency or load failure'] },
          { title:'Communication & Team', items:['Appointed Person / Lift Supervisor identified and on site','Rigger / Slinger holds current ticket if required by legislation','Communication method agreed by all parties (hand signals / radio)','All crew briefed on lift plan, signals and emergency procedures','Weather conditions assessed — wind speed within operational limits'] },
          { title:'Load & Rigging', items:['Load weight confirmed and within crane capacity at required radius','Centre of gravity identified and rigging attachment point confirmed','Rigging configuration matches approved lift plan','Test lift performed to check balance before full height lift','Load secured for travel and travel route is clear and communicated'] },
        ]
      },
    ];
    this.set('formTemplates', forms);
    return forms;
  },
  getFormTemplate(id) { return this.getFormTemplates().find(f => f.id === id); },

  // ============================================================
  // SUBMISSIONS
  // ============================================================
  getSubmissions() { return this.get('submissions') || []; },
  addSubmission(sub) {
    const subs = this.getSubmissions();
    sub.id = 'SUB-' + Date.now();
    sub.submittedAt = new Date().toISOString();
    subs.unshift(sub);
    this.set('submissions', subs);
    this.updatePlant(sub.plantId, { lastInspected: sub.submittedAt });
    return sub;
  },
  getSubmissionsForPlant(plantId) { return this.getSubmissions().filter(s => s.plantId === plantId); },
  getSubmissionsThisWeek() {
    const w = new Date(); w.setDate(w.getDate() - 7);
    return this.getSubmissions().filter(s => new Date(s.submittedAt) > w);
  },

  // ============================================================
  // SETTINGS
  // ============================================================
  getSettings() {
    return this.get('settings') || {
      companyName: 'Robert Quinn Ltd',
      siteName: 'Main Construction Site',
      siteManager: 'Site Manager',
      safetyOfficer: 'Safety Officer',
      notifyEmail: 'firulescum@gmail.com',
      weeklyFormRequired: 'GA3',
      dailyFormRequired: 'GA2',
    };
  },
  saveSettings(s) { this.set('settings', s); },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  getNotifications() { return this.get('notifications') || []; },
  addNotification(n) {
    const list = this.getNotifications();
    n.id = 'N-' + Date.now();
    n.createdAt = new Date().toISOString();
    n.read = false;
    list.unshift(n);
    if (list.length > 100) list.pop();
    this.set('notifications', list);
  },
  markAllRead() { this.set('notifications', this.getNotifications().map(n => ({...n, read:true}))); },
  getUnreadCount() { return this.getNotifications().filter(n => !n.read).length; },

  // ============================================================
  // COMPLIANCE — all checks combined
  // ============================================================
  checkCompliance() {
    const plants = this.getPlants();
    const weekSubs = this.getSubmissionsThisWeek();
    const today = new Date().toDateString();
    const issues = [];

    plants.forEach(plant => {
      const weeklyDone = weekSubs.some(s => s.plantId === plant.id && s.formId === 'GA3');
      const dailyDone  = weekSubs.some(s => s.plantId === plant.id && s.formId === 'GA2' && new Date(s.submittedAt).toDateString() === today);
      if (!weeklyDone) issues.push({ plantId:plant.id, plantName:plant.name, issue:'GA3 not completed this week', severity:'warning' });
      if (!dailyDone)  issues.push({ plantId:plant.id, plantName:plant.name, issue:'GA2 not completed today',    severity:'info' });
    });

    this.getGA1DueAlerts().forEach(a => {
      issues.push({ plantId:a.plantId, plantName:a.plantName, issue:`GA1: ${a.message}`, severity:a.severity });
    });

    this.getLiftingDueAlerts().forEach(a => {
      issues.push({ plantId:a.id, plantName:a.description, issue:`Lifting: ${a.message}`, severity:a.severity });
    });

    this.getLiftingColourIssues().forEach(it => {
      const current = this.getCurrentColourCode();
      issues.push({ plantId:it.id, plantName:it.description, issue:`Wrong colour tag — should be ${current.colour.toUpperCase()} (${current.label})`, severity:'warning' });
    });

    return issues;
  }
};

if (typeof module !== 'undefined') module.exports = DB;
