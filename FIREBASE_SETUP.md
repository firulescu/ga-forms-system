# Firebase Setup — Cross-Device Sync
## Step 1: Create Firebase Project (5 minutes, free)

1. Go to https://console.firebase.google.com
2. Click **Add project** → Name it `ga-forms-rql` → Continue → Continue
3. Left sidebar → **Build** → **Realtime Database**
4. Click **Create Database**
5. Choose region: **Europe West** (closest to Ireland)
6. Start in **Test mode** → Enable
7. Copy the database URL — looks like:
   `https://ga-forms-rql-default-rtdb.europe-west1.firebasedatabase.app`

## Step 2: Set Rules (allow read/write without login)

In Firebase Console → Realtime Database → Rules tab, paste this:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Click **Publish**

## Step 3: Enter URL in GA Forms System

1. Log in to GA Forms System as Admin
2. Go to **Settings**
3. Paste the Firebase URL into **FIREBASE DATABASE URL** field
4. Click **💾 Save Settings**

## Done!
- Operators submit forms on their phones → data goes to Firebase
- Admin/Manager clicks **🔄 Sync** on any page to pull latest submissions
- Works across all devices, no server needed
