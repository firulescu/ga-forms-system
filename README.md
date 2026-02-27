# 🛡️ GA Forms System

A complete, zero-backend plant inspection system deployable to GitHub Pages. Workers scan a QR code from the plant, fill their GA form on mobile, and all submissions are instantly visible on the dashboard.

## ✨ Features

- **📱 Mobile-first inspection forms** — GA2, GA3, GA4 with full checklists
- **📊 Manager dashboard** — real-time compliance overview, submission history, alerts
- **📱 QR code generation** — per-plant QR codes that open the form pre-loaded
- **🖨️ Print QR labels** — printable plant labels with QR code
- **⚠️ Compliance tracking** — automatic alerts for overdue inspections
- **🔔 Notifications** — automatic alerts when defects are found
- **📤 Data export/import** — JSON backup and restore
- **🏗️ Plant register** — full CRUD for managing plant equipment
- **📝 Form templates** — view all form checklists (GA2, GA3, GA4 included)

## 🚀 Deploy to GitHub Pages

1. **Fork or clone** this repository
2. Go to your repo **Settings → Pages**
3. Set source to **main branch, root folder**
4. Your site will be live at `https://yourusername.github.io/repo-name/`

That's it. No server, no database, no sign-up required.

## 📱 How It Works

1. **Admin sets up plants** on the dashboard (`index.html`)
2. **QR codes are generated** for each plant (`qr-codes` page)
3. **Print QR labels** and stick them on each piece of plant
4. **Workers scan QR** → form opens pre-loaded with that plant
5. **Worker fills their name, company, ticks the checklist** → submits
6. **Manager sees submissions** instantly on the dashboard
7. **Compliance alerts** fire if forms are overdue

## 📋 Forms Included

| Form | Name | Checkpoints |
|------|------|-------------|
| GA2 | Pre-Start Inspection | 19 items across 4 sections |
| GA3 | Hazard Assessment | 18 items across 4 sections |
| GA4 | Maintenance Checklist | 18 items across 4 sections |

## 🗄️ Data Storage

All data is stored in the browser's **localStorage**. This means:
- ✅ Works offline (after first load)
- ✅ No backend or server required
- ✅ Free to host on GitHub Pages
- ⚠️ Data is per-device/browser — use the Export feature to back up
- ⚠️ Clearing browser data will erase submissions

> **Tip:** Use the Export JSON feature regularly to back up your data. Import it to restore.

## 📁 File Structure

```
ga-forms-system/
├── index.html          # Manager dashboard
├── form.html           # Mobile inspection form (QR code target)
├── js/
│   ├── data.js         # All data operations (localStorage)
│   ├── ui.js           # Shared UI utilities
│   └── qr.js           # QR code generation
└── README.md
```

## ➕ Adding Real GA Forms Later

To add or edit form templates, open `js/data.js` and find the `seedForms()` function. Each form template follows this structure:

```javascript
{
  id: 'GA5',
  name: 'GA5 — Your Form Name',
  description: 'What this form is for',
  color: '#FF6B35',
  sections: [
    {
      title: 'Section Name',
      items: [
        'Checklist item 1',
        'Checklist item 2',
      ]
    }
  ]
}
```

After adding your template, clear localStorage (Settings → Reset) or clear the `formTemplates` key so it reseeds.

## ⚙️ Configuration

Go to **Settings** in the dashboard to set:
- Company name & site name
- Site manager & safety officer names
- Which form is required daily/weekly

## 🛠️ Tech Stack

- **Vanilla HTML/CSS/JS** — no build step, no npm, no frameworks
- **localStorage** — all data persistence
- **QRCode.js** — QR code generation (CDN)
- **Google Fonts** — Space Mono + Syne

## 📄 License

MIT — free to use and modify for any purpose.
