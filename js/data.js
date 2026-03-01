// ============================================================
// GA FORMS SYSTEM - Data Layer  v2.1
// Robert Quinn Ltd © 2026 — All Rights Reserved
// ============================================================

const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  // Site-scoped helpers — prefix all site data with siteId
  _sk(k)   { const sid = (typeof AUTH!=='undefined') ? AUTH.getSiteId() : null; return sid ? sid + ':' + k : k; },
  sget(k)  { return this.get(this._sk(k)); },
  sset(k,v){ this.set(this._sk(k), v); },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  // Force-seed: runs seed if key missing OR array is empty
  getOrSeed(key, seedFn) {
    const val = this.sget(key);
    if (!val || (Array.isArray(val) && val.length === 0)) return seedFn.call(this);
    return val;
  },

  // ============================================================
  // PLANTS
  // ============================================================
  getPlants()   { return this.getOrSeed('plants', this.seedPlants); },
  _savePlants(p){ this.sset('plants', p); },
  seedPlants() {
    const plants = [
      { id:'PLT-001', name:'Diesel Generator A',  location:'Building 1 - Basement', type:'Generator',       formType:'GA2-GEN',   lastInspected:null, photo:'⚡' },
      { id:'PLT-002', name:'Air Compressor Unit',  location:'Workshop Bay 2',        type:'Compressor',      formType:'GA2-COMP',  lastInspected:null, photo:'💨' },
      { id:'PLT-003', name:'Overhead Crane #1',    location:'Main Hall',             type:'Crane',           formType:'GA2-CRANE', lastInspected:null, photo:'🏗️' },
      { id:'PLT-004', name:'Telehandler TH-07',    location:'Yard',                  type:'Telehandler',     formType:'GA2-TELEH', lastInspected:null, photo:'🚛' },
      { id:'PLT-005', name:'Excavator EX-05',      location:'South Compound',        type:'Excavator',       formType:'GA2-EXC',   lastInspected:null, photo:'🔵' },
      { id:'PLT-006', name:'Scissor Lift SL-02',   location:'Yard',                  type:'MEWP',            formType:'GA2-MEWP',  lastInspected:null, photo:'🔼' },
    ];
    this.sset('plants', plants);
    return plants;
  },
  getPlant(id) { return this.getPlants().find(p => p.id === id); },
  _apiBase: 'https://46.225.83.168.nip.io',

  _syncPlant(plant) {
    try { fetch(this._apiBase+'/api/plants', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(plant) }).catch(()=>{}); } catch(e) {}
  },
  _syncAllPlants() {
    try { fetch(this._apiBase+'/api/plants/sync', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(this.getPlants()) }).catch(()=>{}); } catch(e) {}
  },
  _deletePlantRemote(id) {
    try { fetch(this._apiBase+'/api/plants/'+id, { method:'DELETE' }).catch(()=>{}); } catch(e) {}
  },

  addPlant(plant) {
    const plants = this.getPlants();
    const maxNum = plants.reduce((max, p) => {
      const n = parseInt((p.id||'').replace('PLT-','')) || 0;
      return n > max ? n : max;
    }, 0);
    plant.id = 'PLT-' + String(maxNum + 1).padStart(3,'0');
    plant.lastInspected = null;
    plants.push(plant);
    this._savePlants(plants);
    this._syncPlant(plant);
    return plant;
  },
  updatePlant(id, data) {
    const plants = this.getPlants();
    const i = plants.findIndex(p => p.id === id);
    if (i >= 0) { plants[i] = { ...plants[i], ...data }; this._savePlants(plants); this._syncPlant(plants[i]); }
  },
  deletePlant(id) {
    this._savePlants(this.getPlants().filter(p => p.id !== id));
    this._deletePlantRemote(id);
  },

  // ============================================================
  // GA1 — Plant Registration / Static Safety File
  // ============================================================
  getGA1Records() { return this.getOrSeed('ga1_records', this.seedGA1Records); },
  seedGA1Records() {
    const today = new Date();
    const fmt = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };
    const records = [
      { plantId:'PLT-001', plantName:'Diesel Generator A', make:'Caterpillar', model:'C3.3B', serialNo:'CAT-C33B-00421', yearOfManufacture:'2018', lastInspectionDate:fmt(-180), nextInspectionDue:fmt(14), inspectorName:'John Murphy — Quinn Safety Services', insuranceExpiry:fmt(120), certExpiry:fmt(90), certRef:'CERT-PLT001-2025', riskAssessmentRef:'RA-GEN-001', licenceRequired:'Competent Operator', notes:'Annual service due alongside next inspection.', savedBy:'Marian Firulescu', createdAt:fmt(-180), updatedAt:fmt(-5) },
      { plantId:'PLT-002', plantName:'Air Compressor Unit', make:'Atlas Copco', model:'GA11', serialNo:'AC-GA11-8812', yearOfManufacture:'2020', lastInspectionDate:fmt(-90), nextInspectionDue:fmt(90), inspectorName:'Pat O\'Brien — Safe Plant Ireland', insuranceExpiry:fmt(240), certExpiry:fmt(180), certRef:'CERT-PLT002-2025', riskAssessmentRef:'RA-COMP-002', licenceRequired:'None', notes:'Pressure relief valve tested OK.', savedBy:'Marian Firulescu', createdAt:fmt(-90), updatedAt:fmt(-10) },
      { plantId:'PLT-003', plantName:'Overhead Crane #1', make:'Demag', model:'EKKE 5000', serialNo:'DM-EKKE-2019-007', yearOfManufacture:'2019', lastInspectionDate:fmt(-200), nextInspectionDue:fmt(-5), inspectorName:'Eamonn Kelly — LOLER Inspections Ltd', insuranceExpiry:fmt(60), certExpiry:fmt(-5), certRef:'CERT-PLT003-2024', riskAssessmentRef:'RA-CRANE-003', licenceRequired:'Crane Operator', notes:'⚠️ CERT EXPIRED — renewal inspection booked.', savedBy:'Marian Firulescu', createdAt:fmt(-200), updatedAt:fmt(-2) },
    ];
    this.set('ga1_records', records);
    return records;
  },
  getGA1(plantId) { return this.getGA1Records().find(r => r.plantId === plantId) || null; },
  saveGA1(record) {
    const records = this.getGA1Records();
    const i = records.findIndex(r => r.plantId === record.plantId);
    record.updatedAt = new Date().toISOString();
    if (i >= 0) { records[i] = { ...records[i], ...record }; }
    else { record.createdAt = new Date().toISOString(); records.push(record); }
    this._saveGA1(records);
    return record;
  },
  _saveGA1(r) { this.set('ga1_records', r); },
  deleteGA1(plantId) { this._saveGA1(this.getGA1Records().filter(r => r.plantId !== plantId)); },
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
  getLiftingItems()  { return this.getOrSeed('lifting_items', this.seedLifting); },
  _saveLifting(l)    { this.sset('lifting_items', l); },
  seedLifting() {
    const today = new Date();
    const fmt = (offsetDays) => { const d = new Date(today); d.setDate(d.getDate() + offsetDays); return d.toISOString().split('T')[0]; };
    const qc = this.getCurrentColourCode();
    const prevColour = { green:'blue', yellow:'green', red:'yellow', blue:'red' }[qc.colour];
    const items = [
      { id:'LFT-001', category:'Crane / Hoist',  description:'Overhead Crane 5T',         make:'Demag',    model:'EKKE 5T',      serialNo:'DM-2019-001',  swl:'5000', swlUnit:'kg', yearOfManufacture:'2019', lastThoroughExam:fmt(-30),  nextThoroughExam:fmt(155), colourCode:qc.colour,    status:'active', location:'Main Hall',     certRef:'CE-2026-001', notes:'' },
      { id:'LFT-002', category:'Chain Sling',     description:'2-Leg Chain Sling 2T',      make:'Pewag',    model:'8mm Grade 80', serialNo:'PW-8MM-042',   swl:'2000', swlUnit:'kg', yearOfManufacture:'2022', lastThoroughExam:fmt(-15),  nextThoroughExam:fmt(170), colourCode:qc.colour,    status:'active', location:'Rigging Store', certRef:'CE-2026-002', notes:'' },
      { id:'LFT-003', category:'Shackle',         description:'Bow Shackle 3.25T',         make:'Crosby',   model:'G-209',        serialNo:'CS-3T-018',    swl:'3250', swlUnit:'kg', yearOfManufacture:'2021', lastThoroughExam:fmt(-185), nextThoroughExam:fmt(-5),  colourCode:prevColour,   status:'active', location:'Rigging Store', certRef:'CE-2025-003', notes:'EXAM OVERDUE' },
      { id:'LFT-004', category:'Webbing Sling',   description:'Single Leg Webbing 2T×3m',  make:'Spanset',  model:'EWG',          serialNo:'SP-2T3M-007',  swl:'2000', swlUnit:'kg', yearOfManufacture:'2023', lastThoroughExam:fmt(-30),  nextThoroughExam:fmt(155), colourCode:qc.colour,    status:'active', location:'Rigging Store', certRef:'CE-2026-004', notes:'' },
      { id:'LFT-005', category:'Hook',            description:'Safety Hook 5T',            make:'Gunnebo',  model:'SHK-5',        serialNo:'GB-5T-033',    swl:'5000', swlUnit:'kg', yearOfManufacture:'2020', lastThoroughExam:fmt(-30),  nextThoroughExam:fmt(155), colourCode:qc.colour,    status:'active', location:'Main Hall',     certRef:'CE-2026-005', notes:'' },
      { id:'LFT-006', category:'Chain Block',     description:'Chain Block 1T',            make:'Kito',     model:'CB010',        serialNo:'KT-1T-CB-019', swl:'1000', swlUnit:'kg', yearOfManufacture:'2020', lastThoroughExam:fmt(-20),  nextThoroughExam:fmt(25),  colourCode:qc.colour,    status:'active', location:'Workshop',      certRef:'CE-2026-007', notes:'Due soon' },
    ];
    this.sset('lifting_items', items);
    return items;
  },
  getLiftingItem(id) { return this.getLiftingItems().find(i => i.id === id); },
  addLiftingItem(item) {
    const items = this.getLiftingItems();
    // Find next available ID
    const maxNum = items.reduce((max, it) => {
      const n = parseInt(it.id.replace('LFT-',''));
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    item.id = 'LFT-' + String(maxNum + 1).padStart(3,'0');
    item.createdAt = new Date().toISOString();
    items.push(item);
    this._saveLifting(items);
    return item;
  },
  updateLiftingItem(id, data) {
    const items = this.getLiftingItems();
    const i = items.findIndex(it => it.id === id);
    if (i >= 0) { items[i] = { ...items[i], ...data, updatedAt:new Date().toISOString() }; this.set('lifting_items', items); }
  },
  deleteLiftingItem(id) { this._saveLifting(this.getLiftingItems().filter(i => i.id !== id)); },

  getCurrentColourCode() {
    const m = new Date().getMonth(); // 0-11
    if (m <= 2)  return { colour:'green',  label:'Q1 — Jan / Feb / Mar', hex:'#2E7D52', rgb:'46,125,82' };
    if (m <= 5)  return { colour:'yellow', label:'Q2 — Apr / May / Jun', hex:'#C9A84C', rgb:'201,168,76' };
    if (m <= 8)  return { colour:'red',    label:'Q3 — Jul / Aug / Sep', hex:'#CC3333', rgb:'204,51,51' };
    return             { colour:'blue',   label:'Q4 — Oct / Nov / Dec', hex:'#2255AA', rgb:'34,85,170' };
  },

  colourHex(c) {
    return { green:'#2E7D52', yellow:'#C9A84C', red:'#CC3333', blue:'#2255AA' }[c] || '#6B7A99';
  },
  colourRgb(c) {
    return { green:'46,125,82', yellow:'201,168,76', red:'204,51,51', blue:'34,85,170' }[c] || '107,122,153';
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
  getFormTemplates() { return this.getOrSeed('formTemplates', this.seedForms); },
  seedForms() {
    const forms = [

      // ── GA2 SERIES: Plant-Specific Daily Pre-Start ─────────────

      {
        id:'GA2-MEWP', name:'GA2 — MEWP / Scissor Lift Pre-Start',
        description:'Daily pre-start inspection for Mobile Elevated Work Platforms (scissor lifts, boom lifts, cherry pickers)',
        color:'#2E7D52',
        sections:[
          { title:'Pre-Start Visual Check', items:[
            'Platform, guardrails and toe boards — no damage or missing components',
            'Entry gate / chain securely closes and latches correctly',
            'Scissor arm / boom structure — no cracks, bent pins or visible damage',
            'All tyres in good condition, inflated, no cuts or bulges',
            'No hydraulic fluid leaks visible under machine or on cylinder rods',
            'Battery charge indicator shows adequate charge for planned work',
            'Emergency stop mushroom button accessible and not damaged',
          ]},
          { title:'Ground Controls Check', items:[
            'Ground control panel — all functions operate correctly',
            'Emergency lowering function tested and operational',
            'Ground E-stop cuts all platform power when activated',
            'Battery isolator accessible and clearly marked',
          ]},
          { title:'Platform Controls Check', items:[
            'Platform control panel — all drive and lift functions operate correctly',
            'Controls return to neutral / off when released',
            'Platform up/down operates smoothly — no jerking or unusual noise',
            'Drive speed reduces correctly when platform is raised',
            'Horn operational',
            'Fall arrest anchor point present, secure and load-rated',
          ]},
          { title:'Safety Systems', items:[
            'Tilt / gradient alarm tested — activates on slope beyond rated angle',
            'Overload indicator / sensor tested (where fitted)',
            'Pothole protection / outriggers deploy correctly (if applicable)',
            'Load capacity placard clearly visible on platform',
          ]},
          { title:'Documentation & Housekeeping', items:[
            'Operator holds valid IPAF / MEWP licence for this category',
            'Plant registration and inspection certificate current',
            'Previous defects have been cleared or formally reported to supervisor',
            'Platform free of loose tools, materials or trip hazards',
          ]},
        ]
      },

      {
        id:'GA2-EXC', name:'GA2 — Excavator Pre-Start',
        description:'Daily pre-start inspection for tracked and wheeled excavators',
        color:'#2E7D52',
        sections:[
          { title:'Walk-Around Visual', items:[
            'Undercarriage — track tension correct, no missing shoes, rollers in good condition',
            'Slew ring — no unusual movement, grease visible, securing bolts tight',
            'Boom, dipper and bucket — no cracks in welds, pins secure, no bent teeth',
            'Bucket teeth / cutting edge — wear acceptable, locking pins in place',
            'Cab glass clean and undamaged — no cracks obstructing operator view',
            'No hydraulic leaks under machine or on cylinder rods',
            'Engine bay covers secure, no debris accumulation near exhaust',
          ]},
          { title:'Fluid Levels (engine off, on flat ground)', items:[
            'Engine oil — dipstick reads within operating range',
            'Coolant level — at correct mark in expansion bottle',
            'Hydraulic oil level — within correct range on sight glass',
            'Diesel fuel — sufficient for planned shift',
            'Windscreen washer fluid topped up',
          ]},
          { title:'Cab & Controls', items:[
            'Seat adjusts and locks correctly, seat belt present and latches securely',
            'All joystick and pedal controls move freely and return to neutral',
            'Throttle / engine speed control operates correctly',
            'Quick-hitch / coupler lock engaged and indicator shows locked',
            'All mirrors correctly positioned and undamaged',
            'Working lights operational (if working in low light)',
          ]},
          { title:'Safety Devices', items:[
            'Horn operational',
            'Backup / slew alarm operational',
            'Fire extinguisher present, charged, accessible and in date',
            'First aid kit present in cab',
            'Emergency exit — secondary exit from cab accessible',
            'Proximity / overhead line warning device fitted and operational (if required)',
          ]},
          { title:'Documentation', items:[
            'Operator holds current competency for this class of excavator',
            'Plant registration and inspection certificate current',
            'Any outstanding defects from previous shift reported to supervisor',
          ]},
        ]
      },

      {
        id:'GA2-DMP', name:'GA2 — Dumper Pre-Start',
        description:'Daily pre-start inspection for site dumpers (forward tip and swivel skip)',
        color:'#2E7D52',
        sections:[
          { title:'Walk-Around Visual', items:[
            'Skip / body — no cracks, damaged hinges or loose retaining pins',
            'Skip tip mechanism — latches fully engage, no bent or worn components',
            'All four tyres in good condition, inflated correctly, no cuts or sidewall damage',
            'Axles and wheel nuts — no visible looseness, no recent impact damage',
            'No fuel or hydraulic fluid leaks under machine',
            'Steps, grab handles and ROPS frame — all intact and undamaged',
          ]},
          { title:'Fluid Levels', items:[
            'Engine oil within operating range',
            'Coolant at correct level',
            'Hydraulic oil at correct level',
            'Fuel sufficient for planned work',
          ]},
          { title:'Controls & Safety', items:[
            'Seat belt fitted, retracts freely and buckle latches correctly',
            'Foot brake holds machine on test slope — no creep or fade',
            'Handbrake holds machine stationary on test slope',
            'Skip tip control operates smoothly, no unexpected movement',
            'Horn operational',
            'Backup alarm operational',
            'Rotating beacon / amber light operational',
          ]},
          { title:'Documentation', items:[
            'Operator is competent and authorised for this dumper',
            'Plant registration and inspection certificate current',
            'Previous defects cleared or reported',
          ]},
        ]
      },

      {
        id:'GA2-CRANE', name:'GA2 — Mobile Crane Pre-Start',
        description:'Daily pre-start inspection for mobile cranes (truck mounted, all-terrain, crawler)',
        color:'#2E7D52',
        sections:[
          { title:'Carrier / Undercarriage', items:[
            'All tyres — correct inflation, no damage, tread acceptable (truck / AT crane)',
            'Track tension and condition correct, no missing shoes (crawler)',
            'Outrigger beams extend and lock correctly on all four corners',
            'Outrigger pad storage — pads present, undamaged, correct rated capacity',
            'All access ladders, steps and handrails secure',
            'No fuel, oil or hydraulic leaks under carrier',
          ]},
          { title:'Superstructure & Boom', items:[
            'Slew bearing — no abnormal play, slew lock released for operation',
            'Boom sections — no cracks in chord members or lacings, all pins retained',
            'Boom extension / fly sections — correctly stowed or assembled per manual',
            'Load line / wire rope — no kinks, broken wires, bird-caging or corrosion',
            'Hook block — swivel free, safety latch closes and holds, no deformation',
            'Anti-two-block device fitted, not bypassed, activates before contact',
          ]},
          { title:'Fluids & Engine', items:[
            'Engine oil within operating range',
            'Coolant at correct level',
            'Hydraulic oil at correct level in sight glass',
            'Fuel sufficient for planned lifts',
          ]},
          { title:'Controls & Safety Devices', items:[
            'All crane functions tested under no-load — smooth, no abnormal noise',
            'Rated Capacity Limiter (RCL) / load moment indicator operational, not bypassed',
            'Hoist brakes tested — drum holds load when control released',
            'Slew brake tested and holds when applied',
            'Boom angle and length indicator correct and readable',
            'Anemometer / wind speed indicator fitted and reading (if required)',
            'Emergency stop tested and operational',
          ]},
          { title:'Documentation', items:[
            'Operator holds valid certification for this class of crane',
            'Current thorough examination certificate on machine',
            'Current load chart for this boom / jib configuration visible in cab',
            'Lift plan reviewed and approved for first lift of shift',
            'Previous defects reported and cleared',
          ]},
        ]
      },

      {
        id:'GA2-GEN', name:'GA2 — Generator Pre-Start',
        description:'Daily pre-start inspection for diesel generators and power packs',
        color:'#2E7D52',
        sections:[
          { title:'Visual Inspection', items:[
            'Frame and canopy — no significant damage, all panels secure',
            'No fuel, oil or coolant leaks under generator or on floor around it',
            'Exhaust — pipe secure, no blockage, directed away from personnel and buildings',
            'Fuel tank cap secure, vent clear',
            'Generator output terminals — covers in place, no exposed conductors',
          ]},
          { title:'Fluid Levels', items:[
            'Engine oil — dipstick within range',
            'Coolant level correct',
            'Fuel level adequate for planned run time',
            'Battery electrolyte level correct (if wet cell)',
          ]},
          { title:'Electrical & Controls', items:[
            'Main circuit breaker / isolator accessible and labelled',
            'RCD protection fitted on output circuits',
            'Earth spike / bonding lead connected before start',
            'Volt meter and frequency meter reading correctly after warm-up',
            'Auto-start / ATS control panel showing healthy status (if fitted)',
          ]},
          { title:'Documentation', items:[
            'Inspection certificate current',
            'Previous defects cleared or reported',
            'Designated competent person has verified generator is safe to energise',
          ]},
        ]
      },

      {
        id:'GA2-COMP', name:'GA2 — Compressor Pre-Start',
        description:'Daily pre-start inspection for diesel air compressors and hydraulic power packs',
        color:'#2E7D52',
        sections:[
          { title:'Visual Inspection', items:[
            'Frame and canopy — no significant damage, tow hitch and lights functional if road-towed',
            'No oil or fuel leaks under machine',
            'Air receiver / pressure vessel — no dents, cracks or significant corrosion',
            'Safety relief valve — not wired shut, test pull smooth and valve re-seats',
            'All compressed air hoses — no cuts, abrasions or damaged ferrules',
            'Hose couplings — whip checks fitted on all hose connections above 7 bar',
          ]},
          { title:'Fluid Levels', items:[
            'Engine oil within operating range',
            'Compressor oil (screw / reciprocating) at correct level',
            'Coolant level correct',
            'Fuel level adequate for planned use',
          ]},
          { title:'Controls & Safety', items:[
            'Pressure gauge reads zero before start, climbs to rated pressure within expected time',
            'Automatic unloader / regulator cycles correctly',
            'Low oil pressure shutdown tested (isolate fuel, confirm trip activates)',
            'High temperature shutdown functional',
            'Service valve operates correctly and holds pressure when closed',
          ]},
          { title:'Documentation', items:[
            'Pressure vessel inspection certificate current and on machine',
            'Previous defects cleared or reported',
          ]},
        ]
      },

      {
        id:'GA2-FWORK', name:'GA2 — Formwork & Falsework Pre-Pour Check',
        description:'Pre-concrete-pour inspection for formwork and falsework structures',
        color:'#2E7D52',
        sections:[
          { title:'Structure & Support', items:[
            'All vertical props at correct centres as per design drawing',
            'Prop extensions — maximum extension not exceeded, locking pins in place',
            'Sole plates and base plates present under all props, bearing on firm ground',
            'Headplates and forkheads correctly seated on primary bearers',
            'All bracing and ties installed as per design or falsework scheme',
            'No props missing, damaged, significantly bent or wrong size',
          ]},
          { title:'Formwork Panels & Joints', items:[
            'Panel faces undamaged — no significant holes, splits or warping',
            'All panel-to-panel joints tight — no gaps exceeding 3mm',
            'Kickers and stopends correctly fixed, sufficient strength for concrete pressure',
            'Release agent applied evenly to all shutter faces',
            'Waterstops installed where specified on drawing',
          ]},
          { title:'Ties, Anchors & Fixings', items:[
            'Formwork ties installed at correct spacing and fully tightened',
            'Cone spacers fully seated on tie ends',
            'No ties showing signs of previous over-stress or necking',
            'Anchor bolts / wall ties to permanent structure installed if required',
          ]},
          { title:'Pre-Pour Sign-Off', items:[
            'Formwork engineer / supervisor has inspected and signed off structure',
            'Reinforcement inspection signed off before closing formwork',
            'Concrete pour rate and pour sequence agreed with foreman and pump operator',
            'Escape routes from pour area clear for all personnel',
            'Contact number for formwork designer available on site',
          ]},
        ]
      },

      {
        id:'GA2-TELEH', name:'GA2 — Telehandler Pre-Start',
        description:'Daily pre-start inspection for telescopic handlers (telehandlers)',
        color:'#2E7D52',
        sections:[
          { title:'Walk-Around Visual', items:[
            'All four tyres — correct inflation, no cuts, tread acceptable',
            'Boom — no cracks in welds, pivot pins retained, no hydraulic leaks on cylinders',
            'Carriage and forks — no cracks at heel, tips within 3% of equal height, no bending',
            'Fork locking pins or tines fully seated and locked on carriage',
            'Attachment — correctly pinned to carriage, locking mechanism engaged',
            'Stabilisers / outriggers extend and lock correctly (if fitted)',
            'Cab glass clean and undamaged, no cracks affecting operator sightlines',
          ]},
          { title:'Fluid Levels', items:[
            'Engine oil within operating range',
            'Coolant at correct level',
            'Hydraulic oil within operating range',
            'Fuel sufficient for planned shift',
          ]},
          { title:'Controls & Safety', items:[
            'Seat belt buckles correctly, retracts freely',
            'All joystick functions — lift, tilt, extend, retract — smooth and return to neutral',
            'Stability / tipping load indicator operational and calibrated for fitted attachment',
            'Forward / reverse drive controls responsive, no unexpected creep',
            'Service brakes hold on test slope, handbrake holds stationary',
            'Horn operational',
            'Backup alarm operational',
            'Rotating beacon operational',
          ]},
          { title:'Documentation', items:[
            'Operator holds valid RTITB / NPORS / CPCS card for telehandler',
            'Load chart for fitted attachment visible in cab',
            'Plant certificate of inspection current',
            'Previous defects cleared or reported',
          ]},
        ]
      },

      // ── GA2-LADD: Ladder Inspection (HSA S.I. 299/2007 compliant) ──────
      {
        id:'GA2-LADD', name:'GA2 — Ladder Pre-Use Inspection',
        description:'Pre-use inspection for all ladders (step, extension, roof) — required under S.I. 299 of 2007 and HSA guidance. Records must be kept on site for 5 years.',
        color:'#E67E22',
        sections:[
          { title:'Ladder Identification & Suitability', items:[
            'Ladder is correct type and class (EN131 / BS2037) for the task — load rating visible and adequate',
            'Ladder length is suitable — top 3 rungs not used as standing position on leaning ladder',
            'Ladder is not painted — paint can conceal cracks and defects',
            'Manufacturer label / inspection tag present and in date',
            'Ladder has not been previously involved in a fall, impact or overload incident',
          ]},
          { title:'Stiles & Structure', items:[
            'Both stiles straight and undamaged — no bends, dents, cracks or corrosion',
            'No repairs with tape, wire or unauthorised fixings',
            'Stile feet (rubber / non-slip) present, secure and not worn smooth',
            'For extension ladders — guide brackets and stops in good condition, ropes intact',
          ]},
          { title:'Rungs / Steps / Treads', items:[
            'All rungs / steps present — none missing, bent, cracked or loose',
            'Rungs free of slippery substances (oil, mud, paint)',
            'Anti-slip surface on rungs intact — not worn smooth',
            'For stepladders — all steps level and secure, no creak or movement underfoot',
          ]},
          { title:'Locking & Stability Mechanisms', items:[
            'Spreader bar / locking stay opens fully and locks positively on stepladder',
            'Locking dogs / pawls on extension ladder engage correctly on both sides',
            'No loose or missing rivets, bolts or fixings on any joint or hinge',
            'Platform top (if fitted) undamaged, secure and clean',
          ]},
          { title:'Erection & Safe Use Check', items:[
            'Ladder erected on firm, level, stable surface — sole board used where ground is soft',
            'Leaning ladder at correct angle — 1:4 (75°) — one out for every four up',
            'Top of ladder secured or tied — extends 1m above landing point or handhold provided',
            'Ladder footed by second person where tying is not possible',
            'Operator competent and fit — no condition affecting balance or grip',
          ]},
        ]
      },

      // ── GA2-TOWER: Aluminium Access Tower (PASMA / S.I. 299/2007) ────────
      {
        id:'GA2-TOWER', name:'GA2 — Aluminium Access Tower Inspection',
        description:'Post-erection and weekly inspection for mobile aluminium access towers — PASMA guidelines and S.I. 299 of 2007. Re-inspect at minimum every 7 days while on site.',
        color:'#8E44AD',
        sections:[
          { title:'Erection & Documentation', items:[
            'Tower erected by PASMA-trained operative — training card available if requested',
            'Manufacturer instruction manual present on site during erection',
            'Tower erected to correct height for intended task — maximum height per manufacturer not exceeded',
            'Wind speed checked — work halted if wind exceeds 17mph (Beaufort 5)',
          ]},
          { title:'Base & Ground Conditions', items:[
            'Ground is firm, level and capable of supporting tower loads',
            'All four castors in full contact with ground — none raised or suspended',
            'All castor wheel brakes locked and cannot be released accidentally',
            'Adjustable legs set correctly — NOT used to gain additional working height',
            'Outriggers / stabilisers fitted and extended as per manufacturer instructions (if required by height/width ratio)',
          ]},
          { title:'Tower Structure', items:[
            'Tower is plumb and level — checked with spirit level',
            'All frames correct size and type, in correct position, locking devices fully engaged',
            'All horizontal and diagonal braces positioned and secured as per instruction manual',
            'No damaged, bent, cracked or missing components — all tubes straight',
            'All locking pins / spring buttons fully engaged and visible',
          ]},
          { title:'Working Platform', items:[
            'Platform boards correctly positioned — no gaps, all trapdoor openings over built-in access',
            'Wind locks (platform to frame) all engaged',
            'Platform free of loose materials, tools and trip hazards',
            'Platform surface undamaged — no cracked, split or missing sections',
          ]},
          { title:'Guardrails & Toe Boards', items:[
            'Full-height guardrails (950mm min) fitted on all open sides',
            'Intermediate guardrails fitted — no gap greater than 470mm',
            'Toe boards (minimum 150mm) fitted on all open sides',
            'All guardrail couplings tight — no movement when pushed',
          ]},
          { title:'Access', items:[
            'Access hatch closes correctly after use — not left open during work',
            'Internal ladder or stairway access provided — climbing up outside of tower frame prohibited',
            'Access to platform is safe — no overreaching required to enter',
          ]},
        ]
      },

      // ── GA2-PODIUM: Podium Ladder Inspection ─────────────────────────────
      {
        id:'GA2-PODIUM', name:'GA2 — Podium Ladder / Steps Inspection',
        description:'Pre-use inspection for podium ladders, podium steps and low-level platforms — S.I. 299 of 2007. Pre-use check required every day before use.',
        color:'#16A085',
        sections:[
          { title:'Frame & Structure', items:[
            'Frame undamaged — no bent, cracked or corroded components',
            'All welds and joints intact — no visible cracks',
            'No unauthorised repairs, patches or tape',
            'Manufacturer label and maximum load rating clearly visible',
          ]},
          { title:'Steps & Platform', items:[
            'All steps present, level and secure — no movement underfoot',
            'Step surfaces clean and non-slip surface intact — no wear or contamination',
            'Platform deck undamaged — no cracks, holes or deformation',
            'Platform deck surface non-slip and free of contamination',
          ]},
          { title:'Guardrails & Gate', items:[
            'Full perimeter guardrail fitted and secure — no loose connections',
            'Entry gate / chain closes and latches correctly — cannot be accidentally released during use',
            'Gate opens inward only (to prevent opening over edge)',
            'Toe boards or upstand around platform base intact',
          ]},
          { title:'Wheels & Locking', items:[
            'All castor wheels present, undamaged and rotate freely',
            'All wheel brakes / locks functional — lock positively and hold unit stationary',
            'Unit does not move when brake is applied and weight applied to platform',
            'Adjustable feet (if fitted) extend and lock correctly',
          ]},
          { title:'Safe Use Check', items:[
            'Podium positioned on firm, level surface',
            'All wheels locked before anyone ascends',
            'Unit is not moved while anyone is on the platform',
            'Maximum working load (persons + tools) not exceeded',
            'Used only indoors or in sheltered conditions — not used in high winds',
          ]},
        ]
      },

      // ── GA3: Hazard Assessment — generic (applies to any plant) ──
      {
        id:'GA3', name:'GA3 — Plant Hazard Assessment',
        description:'Weekly or task-specific hazard identification and risk assessment before commencing work with plant',
        color:'#C9A84C',
        sections:[
          { title:'Site & Ground Conditions', items:[
            'Ground bearing capacity assessed — no voids, recent excavations or buried services nearby',
            'Slopes assessed — machine rated for gradient, no risk of sliding or tipping',
            'Ground surface — firm, no soft spots or waterlogging that could cause instability',
            'Overhead hazards identified — powerlines, structures, pipework, lighting rigs',
            'Underground services marked — gas, water, electricity, telecoms located before dig',
          ]},
          { title:'People & Traffic', items:[
            'Exclusion zone established and marked with barriers / bunting / cones',
            'Traffic management plan in place if plant operates near site roads or public areas',
            'Pedestrian routes separated from plant movement routes',
            'Spotter / banksman in place where plant reversing or slewing near personnel',
            'All workers in exclusion zone briefed on signals and emergency procedure',
          ]},
          { title:'Environmental & Weather', items:[
            'Wind speed assessed — within operational limits for this plant and task',
            'Visibility adequate for safe operation — fog, rain, glare assessed',
            'Lighting adequate if work continues into low-light conditions',
            'Weather forecast checked — no sudden deterioration expected during planned work',
          ]},
          { title:'Equipment & Task', items:[
            'Correct plant selected for the task — not improvised or undersized',
            'Load charts / rated capacity confirmed adequate for planned loads',
            'Lift plan completed and approved for any critical or complex lift',
            'Emergency lowering / recovery procedure known to operator and crew',
            'Communication method agreed — radio channel, hand signals or banksman',
          ]},
          { title:'Crew Briefing & Sign-Off', items:[
            'All crew members briefed on identified hazards and controls',
            'Roles and responsibilities assigned — operator, banksman, lift supervisor',
            'Supervisor has reviewed conditions and approved commencement of work',
            'Any residual risks acknowledged and accepted in writing where required',
          ]},
        ]
      },

      // ── GA4: Scheduled Maintenance ─────────────────────────────
      {
        id:'GA4', name:'GA4 — Plant Maintenance Checklist',
        description:'Scheduled maintenance inspection — complete at manufacturer service intervals',
        color:'#7B61FF',
        sections:[
          { title:'Engine & Drive System', items:[
            'Engine oil changed — correct grade and quantity per spec',
            'Oil filter replaced — date and hour meter reading recorded',
            'Air filter inspected — cleaned or replaced as required',
            'Fuel filter replaced if on schedule',
            'Drive belts inspected for cracking, glazing or wear — replaced if within limits',
            'Engine mounts and fasteners checked for tightness',
            'Cooling system hoses inspected for swelling, leaks or deterioration',
            'Coolant antifreeze concentration checked',
          ]},
          { title:'Hydraulic System', items:[
            'Hydraulic oil changed if on service schedule — used oil disposed correctly',
            'Hydraulic return filter replaced',
            'All hydraulic hoses inspected — no abrasion, chafing or joint weeping',
            'Cylinder rod seals checked — no weeping or blowout',
            'Hydraulic tank breather cleaned or replaced',
          ]},
          { title:'Structural & Mechanical', items:[
            'All grease nipples lubricated — correct grease grade, no clogged nipples',
            'Pins and bushes checked for wear — replace if beyond manufacturer tolerance',
            'All structural fasteners torque-checked at critical points',
            'Tracks / undercarriage — tension adjusted to spec, worn pads replaced',
            'Structural welds inspected for cracks — especially at stress risers',
          ]},
          { title:'Electrical & Instruments', items:[
            'Battery terminals cleaned, coated and tight',
            'Wiring harness inspected for chafing against chassis or hot surfaces',
            'All lights and alarms tested operational',
            'Hour meter, fuel gauge and warning lights functioning correctly',
            'Earthing / bonding cables intact',
          ]},
          { title:'Completion', items:[
            'Service record updated — date, hour meter, work done, parts replaced',
            'Any defects found during service logged and notified to plant manager',
            'Machine test-run after service — no warning lights, no unusual noise',
            'Next service due date / hour meter reading recorded and posted on machine',
          ]},
        ]
      },

      // ── GL1: Pre-Lift (unchanged — already specific) ───────────
      {
        id:'GL1', name:'GL1 — Pre-Lift Safety Checklist',
        description:'Pre-lift inspection and risk assessment for all crane and lifting operations',
        color:'#CC3333',
        sections:[
          { title:'Lifting Equipment Condition', items:[
            'All lifting equipment has current thorough examination certificate',
            'Colour tag on lifting equipment matches current quarter colour',
            'SWL / WLL markings clearly visible on all equipment — not defaced or obscured',
            'Slings — no cuts, pulls, heat damage, chemical damage or excessive wear',
            'Chains — no stretched, cracked or deformed links, no corrosion pitting',
            'Shackles — pin fully threaded, moused with wire or split pin, no deformation',
            'Hooks — no deformation, throat opening within 5% of original, safety latch closes',
          ]},
          { title:'Crane Pre-Check', items:[
            'Crane GA2 pre-start completed for this shift before first lift',
            'Current load chart for this boom / jib configuration in cab',
            'Planned lift is within rated capacity at required radius — confirmed on chart',
            'Anti-two-block device operational and not bypassed',
            'Hoist and derricking brakes tested under no-load',
            'Outrigger pads deployed, crane levelled — spirit level reading within limits',
          ]},
          { title:'Lift Zone & Exclusion Area', items:[
            'Lift area walked — no overhead powerlines within required safe clearance',
            'Ground bearing capacity adequate for crane + load + dynamic factor',
            'Exclusion zone established: minimum 1.5× load height radius from lift point',
            'Barriers / signs / bunting in place — exclusion zone clearly visible',
            'All non-essential personnel cleared from exclusion zone before lift',
            'Escape routes identified in case of emergency or load shift',
          ]},
          { title:'Team & Communication', items:[
            'Appointed Person / Lift Supervisor named and on site for this lift',
            'Rigger / Slinger holds current ticket where required by legislation',
            'Communication method agreed by all parties — radio channel or hand signal code',
            'All crew briefed on lift plan, signals and emergency procedures',
            'Weather conditions assessed — wind speed within operational limits for load',
          ]},
          { title:'Load & Rigging Configuration', items:[
            'Load weight confirmed by weighbridge ticket, drawing or calculation',
            'Centre of gravity assessed — rigging attachment point above CoG',
            'Rigging configuration matches approved lift plan or standard rigging study',
            'Test lift performed to check balance and load stability before full height',
            'Load travel route checked — clear of obstructions, set-down area prepared',
          ]},
        ]
      },

    ];
    this.set('formTemplates', forms);
    return forms;
  },
  getFormTemplate(id) { return this.getFormTemplates().find(f => f.id === id); },
  // Map plant formType → which forms are available for that plant
  PLANT_FORM_MAP: {
    'GA2-MEWP':  ['GA2-MEWP', 'GA3', 'GA4'],
    'GA2-EXC':   ['GA2-EXC',  'GA3', 'GA4'],
    'GA2-DMP':   ['GA2-DMP',  'GA3', 'GA4'],
    'GA2-CRANE': ['GA2-CRANE','GA3', 'GA4', 'GL1'],
    'GA2-GEN':   ['GA2-GEN',  'GA3', 'GA4'],
    'GA2-COMP':  ['GA2-COMP', 'GA3', 'GA4'],
    'GA2-FWORK': ['GA2-FWORK','GA3'],
    'GA2-TELEH': ['GA2-TELEH','GA3', 'GA4', 'GL1'],
    'default':   ['GA3', 'GA4'],
  },
  getFormsForPlant(plant) {
    const ids = this.PLANT_FORM_MAP[plant?.formType] || this.PLANT_FORM_MAP['default'];
    return this.getFormTemplates().filter(f => ids.includes(f.id));
  },



  // ============================================================
  // SUBMISSIONS
  // ============================================================
  getSubmissions() { return this.sget('submissions') || []; },
  addSubmission(sub) {
    const subs = this.getSubmissions();
    sub.id = 'SUB-' + Date.now();
    sub.submittedAt = new Date().toISOString();
    subs.unshift(sub);
    this.sset('submissions', subs);
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
    const saved = this.sget('settings');
    if (saved) return saved;
    // Default: use the actual current site name instead of hardcoded fallback
    const site = (typeof AUTH !== 'undefined') ? AUTH.getSite(AUTH.getSiteId()) : null;
    return {
      companyName: 'Robert Quinn Ltd',
      siteName: site?.name || 'Site Name',
      siteManager: 'Site Manager',
      safetyOfficer: 'Safety Officer',
      notifyEmail: 'firulescum@gmail.com',
      weeklyFormRequired: 'GA3',
      dailyFormRequired: 'GA2',
    };
  },
  saveSettings(s) { this.sset('settings', s); },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  getNotifications() { return this.sget('notifications') || []; },
  addNotification(n) {
    const list = this.getNotifications();
    n.id = 'N-' + Date.now();
    n.createdAt = new Date().toISOString();
    n.read = false;
    list.unshift(n);
    if (list.length > 100) list.pop();
    this.sset('notifications', list);
  },
  markAllRead() { this.sset('notifications', this.getNotifications().map(n => ({...n, read:true}))); },
  getUnreadCount() { return this.getNotifications().filter(n => !n.read).length; },

  // ============================================================
  // DEFECT TRACKER
  // ============================================================
  getDefects() { return this.sget('defects') || []; },
  addDefect(defect) {
    const defects = this.getDefects();
    defect.id = 'DEF-' + Date.now();
    defect.reportedAt = new Date().toISOString();
    defect.status = 'open';
    defects.unshift(defect);
    this.sset('defects', defects);
    return defect;
  },
  resolveDefect(id, resolvedBy, notes) {
    const defects = this.getDefects();
    const i = defects.findIndex(d => d.id === id);
    if (i >= 0) {
      defects[i].status = 'resolved';
      defects[i].resolvedAt = new Date().toISOString();
      defects[i].resolvedBy = resolvedBy;
      defects[i].resolveNotes = notes || '';
      this.sset('defects', defects);
    }
  },
  getOpenDefects()     { return this.getDefects().filter(d => d.status === 'open'); },
  getDefectsForPlant(plantId) { return this.getDefects().filter(d => d.plantId === plantId); },

  // ============================================================
  // PLANT OUT OF SERVICE
  // ============================================================
  setOutOfService(plantId, oos, reason, byUser) {
    this.updatePlant(plantId, {
      outOfService: oos,
      oosReason: oos ? reason : '',
      oosSetBy: oos ? byUser : '',
      oosSetAt: oos ? new Date().toISOString() : null,
    });
    this.addNotification({
      title: oos ? `🚫 Plant Out of Service — ${this.getPlant(plantId)?.name}` : `✅ Plant Returned to Service — ${this.getPlant(plantId)?.name}`,
      message: oos ? `Marked out of service by ${byUser}. Reason: ${reason}` : `Returned to service by ${byUser}`,
      type: oos ? 'error' : 'success',
    });
  },

  // ============================================================
  // COMPLIANCE — all checks combined
  // ============================================================
  checkCompliance() {
    const plants = this.getPlants();
    const weekSubs = this.getSubmissionsThisWeek();
    const today = new Date().toDateString();
    const issues = [];
    plants.forEach(plant => {
      const dailyFormId  = plant.formType || 'GA2';
      const weeklyDone = weekSubs.some(s => s.plantId === plant.id && s.formId === 'GA3');
      const dailyDone  = weekSubs.some(s => s.plantId === plant.id && s.formId === dailyFormId && new Date(s.submittedAt).toDateString() === today);
      if (!weeklyDone) issues.push({ plantId:plant.id, plantName:plant.name, issue:'GA3 hazard assessment not completed this week', severity:'warning' });
      if (!dailyDone)  issues.push({ plantId:plant.id, plantName:plant.name, issue: dailyFormId + ' pre-start not completed today', severity:'info' });
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
  },

  // ============================================================
  // HARD RESET — clears all site data and form templates
  // ============================================================
  hardReset() {
    const sid = (typeof AUTH !== 'undefined') ? AUTH.getSiteId() : null;
    const prefix = sid ? sid + ':' : '';
    ['plants','ga1_records','lifting_items','submissions','notifications','settings','defects'].forEach(k => localStorage.removeItem(prefix + k));
    ['formTemplates','sites','users'].forEach(k => localStorage.removeItem(k));
    this.getPlants(); this.getGA1Records(); this.getLiftingItems(); this.getFormTemplates();
    return 'Reset complete. Reload the page.';
  }
};

