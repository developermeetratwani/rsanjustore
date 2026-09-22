# 🔑 How to Get Your Firebase Configuration

## Quick Steps

### 1. Open Firebase Console
Go to: https://console.firebase.google.com/project/r-sanju/settings/general

### 2. Scroll Down to "Your apps"
You'll see a section called "Your apps"

### 3. If No Web App Exists:
- Click the **</>** icon (Web platform)
- Enter nickname: **R Sanju Store Web**
- Click **Register app**

### 4. Copy the Config
You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "r-sanju.firebaseapp.com",
  projectId: "r-sanju",
  storageBucket: "r-sanju.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 5. Update Your Code
Open `src/firebase.js` and replace the config with your actual values.

---

## ⚠️ IMPORTANT: Keep Your Config Safe

Your Firebase config contains your API key. While it's safe to include in your code (it's meant to be public), you should still:

1. ✅ Use Firestore security rules to protect data
2. ✅ Keep your admin passwords secure
3. ✅ Don't share your Firebase Console access

---

## 🎯 After You Update the Config

Run these commands:

```bash
cd r-sanju-store
npm run build
firebase deploy
```

Your app will now sync in real-time across all devices!

