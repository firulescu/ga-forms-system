# GA Forms System

Plant inspection and safety management system for construction sites.

**Tech:** Pure HTML/CSS/JS · No framework · Node.js/SQLite backend on Hetzner · GitHub Pages frontend

---

## Architecture

```
Frontend (GitHub Pages):          Backend (Hetzner VPS - 46.225.83.168):
firulescu.github.io/ga-forms-system/    /opt/ga-forms-api/
├── login.html      ← Login page          ├── index.js        ← Express API server
├── index.html      ← Manager dashboard   ├── ga-forms.db     ← SQLite database
├── form.html       ← Operator forms      └── (pm2: ga-forms-api)
├── ga1.html        ← Plant registration
├── lifting.html    ← Lifting register
├── sw.js           ← Service worker
└── js/
    ├── data.js         ← Data layer, localStorage + API sync
    ├── auth.js         ← Auth, users, sites, sessions
    ├── ui.js           ← Shared UI components
    ├── qr.js           ← QR code generation + print labels
    ├── firebase.js     ← API sync layer (Hetzner server)
    ├── firebase-config.js ← API URL config
    ├── api-config.js   ← API base URL
    └── offline.js      ← Offline queue for failed submissions
```

---

## Server API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sites` | List all sites |
| POST | `/api/sites` | Create/update site |
| GET | `/api/plants?site_id=` | List plants (filtered by site) |
| POST | `/api/plants` | Create/update plant |
| DELETE | `/api/plants/:id` | Delete plant |
| GET | `/api/submissions?site_id=` | List submissions |
| POST | `/api/submissions` | Save submission |
| GET | `/api/defects?site_id=` | List defects |
| POST | `/api/defects` | Save defect |
| GET | `/api/notifications?site_id=` | List notifications |
| POST | `/api/notifications` | Save notification |
| GET | `/api/users` | List users |

---

## How Login Works

**Staff (managers, supervisors, safety officers):**
1. Select site
2. Click **Staff**
3. Pick your name from the list
4. Enter your personal PIN

**Operators (any worker on site):**
1. Scan QR code on equipment → lands on form.html
2. Enter your name
3. Enter the site's shared **Operator PIN** (set by admin)
4. Fill the inspection form

---

## User Roles

| Role | Access |
|------|--------|
| Admin | Everything — sites, users, all data |
| Project Manager | Everything except settings |
| Site Manager | Dashboard, plants, forms, compliance, defects |
| Safety Officer | Submissions, compliance, defects |
| Operator | Inspection forms only (via QR scan) |

---

## Forms Available

| Form | Type | Used For |
|------|------|----------|
| GA2-MEWP | Daily | Scissor lifts, boom lifts, cherry pickers |
| GA2-EXC | Daily | Excavators |
| GA2-DMP | Daily | Dumpers |
| GA2-CRANE | Daily | Mobile cranes |
| GA2-GEN | Daily | Generators |
| GA2-COMP | Daily | Compressors |
| GA2-FWORK | Pre-pour | Formwork & falsework |
| GA2-TELEH | Daily | Telehandlers |
| GA2-PODIUM | Daily | Podium ladders |
| GA3 | Weekly | Hazard assessment (all plant) |
| GA4 | Service | Scheduled maintenance (all plant) |
| GL1 | Pre-lift | Crane & lifting operations |

---

## QR Code Workflow

1. Admin goes to **QR Codes** page → prints label for a plant
2. QR is stuck on the machine
3. Operator scans with phone → `form.html?plant=PLT-001&site=SITE-001&tok=...`
4. Login modal appears → operator enters name + site PIN
5. Correct form loads automatically based on plant type
6. Submission syncs to server in real-time

---

## Server Management

```bash
# SSH into server
ssh root@46.225.83.168

# Check server status
pm2 status

# Restart server
pm2 restart ga-forms-api

# View logs
pm2 logs ga-forms-api --lines 50

# Check database
cd /opt/ga-forms-api && node -e "
const db = require('better-sqlite3')('./ga-forms.db');
console.log(db.prepare('SELECT id, name, site_id FROM plants').all());
"
```

## Deploying Frontend Changes

```bash
cd ~/Downloads/ga-forms-system
git add .
git commit -m "describe your change"
git push origin main
# Wait ~60 seconds for GitHub Pages to update
```

---

## Data Storage

- **Server (SQLite):** plants, sites, submissions, defects, notifications, users
- **localStorage:** cached copy of server data, scoped per site (`SITE-001:plants`)
- **sessionStorage:** who's logged in — cleared when tab closes

Data syncs from server to browser on every page load. Offline submissions are queued and synced when connection restores.
