# Environment Variables Setup

## Security Alert - API Keys Fixed ✅

The exposed Firebase API key has been removed from the published code.

## How to Set Up Your Local Environment

### 1. Create `.env.local` File

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 2. Add Your Firebase Credentials

Edit `.env.local` and replace the placeholder values with your actual Firebase configuration:

```
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Important Security Notes

- ❌ **DO NOT** commit `.env` or `.env.local` files
- ✅ **DO** commit `.env.example` as a template
- ✅ `.env.local` is already listed in `.gitignore`
- ✅ The app now loads secrets from environment variables instead of hardcoded values

### 4. Files Modified

- **portal.html** - Removed hardcoded Firebase config, now uses environment variables
- **auth-global.js** - Already using environment variables (no changes needed)

### 5. For GitHub Actions / CI/CD

If deploying via GitHub Actions, add your Firebase credentials as secrets:

1. Go to **Settings > Secrets and variables > Actions**
2. Add each `VITE_FIREBASE_*` variable
3. Reference them in your workflow file

## Verification

The security alert for exposed API keys should now be resolved. Check your repository's Security tab to confirm.
