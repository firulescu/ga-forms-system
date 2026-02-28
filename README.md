# GA Forms System — Robert Quinn Ltd

Plant inspection and safety management system for construction sites.

**Tech:** Pure HTML/CSS/JS · No framework · No server · localStorage

---

## Files

```
ga-forms-system/
├── login.html          ← Login page (all users start here)
├── index.html          ← Dashboard + admin panel (managers/admin)
├── form.html           ← Inspection forms (operators)
├── ga1.html            ← Plant registration files (GA1)
├── lifting.html        ← Lifting equipment register
├── js/
│   ├── data.js         ← All data storage, seeds, form templates
│   ├── auth.js         ← Authentication, users, sites, sessions
│   ├── ui.js           ← Shared UI components (toast, modal)
│   └── qr.js           ← QR code generation + print labels
└── README.md
```

---

## First-Time Setup (Fresh Install)

1. **Upload all files** to your web host or GitHub Pages
2. Open the site URL — you will see the **First Time Setup** screen
3. Enter:
   - Site name (e.g. *Dublin Road Project*)
   - Site address (e.g. *Dublin, Ireland*)
   - Your full name
   - Your 4–6 digit PIN
4. Click **Create Site & Login →**
5. You are now logged in as **Admin**

---

## Adding More Sites & Users (Admin Panel)

1. Log in as Admin
2. Go to **⚙️ Admin Panel** in the left nav
3. **Sites section:**
   - Click **+ Add Site** to add another site
   - Click the **👷 button** on any site to set the **Operator PIN** for that site
4. **Users section:**
   - Click **+ Add User** to add named staff (managers, supervisors, safety officers)
   - Fill in name, role, site assignment and PIN
   - The PIN must be unique — the system will warn you if it's taken

---

## How Login Works

**Staff (managers, supervisors, safety officers):**
1. Select site
2. Click **Staff**
3. Pick your name from the list
4. Enter your personal PIN

**Operators (any worker on site):**
1. Select site
2. Click **Operator**
3. Type your name (no account needed)
4. Enter the site's shared **Operator PIN** (set by admin)

The last used site is remembered — returning users skip straight to step 2.

---

## User Roles

| Role | Access |
|------|--------|
| Admin | Everything — sites, users, all data |
| Project Manager | Everything except settings |
| Site Manager | Dashboard, plants, forms, compliance, defects |
| Safety Officer | Submissions, compliance, defects |
| Operator | Inspection forms only |

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
| GA3 | Weekly | Hazard assessment (all plant) |
| GA4 | Service | Scheduled maintenance (all plant) |
| GL1 | Pre-lift | Crane & lifting operations |

Each plant is assigned a `formType` — the system automatically shows only the relevant forms for that plant type.

---

## QR Codes

1. Go to **QR Codes** in the nav
2. Print a QR label for any plant
3. Stick it on the machine
4. Workers scan with phone → taken directly to the right inspection form
5. If not logged in, they're sent to login first, then redirected back

---

## Resetting / Clearing Data

**Settings → Hard Reset:**
- Clears ALL site data (plants, submissions, defects, notifications)
- Requires typing **RESET** to confirm
- Logs you out
- Form templates are preserved
- Use this to start fresh on a new site or for demo purposes

---

## Deploying to GitHub Pages

```bash
# 1. Create a new repo on github.com (e.g. ga-forms-system)
# 2. In your local folder:
git init
git add .
git commit -m "Initial commit — GA Forms System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ga-forms-system.git
git push -u origin main

# 3. On GitHub: Settings → Pages → Source: Deploy from branch → main → / (root) → Save
# 4. Wait ~60 seconds → your URL: https://YOUR-USERNAME.github.io/ga-forms-system/
```

**To update after changes:**
```bash
git add .
git commit -m "describe your change"
git push
```

---

## Data Storage

All data is stored in the browser's **localStorage** — no server, no database.

- Each site's data is prefixed with its site ID (e.g. `SITE-001:plants`)
- Session (who's logged in) is stored in `sessionStorage` — cleared when tab closes
- Form templates are shared across all sites (stored without prefix)

**Important:** Data is stored per-browser. If a worker uses a different device or browser, they will not see the same data. For shared data across devices, you would need a backend — contact your developer.

---

© 2026 Robert Quinn Ltd — All Rights Reserved
