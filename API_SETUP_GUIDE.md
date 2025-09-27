# 🚀 Quick Setup Guide - API Keys Required

Your Time Capsule app needs two API keys to work properly. Here's how to get them:

## 1. 🌐 Lighthouse IPFS API Key

### Step 1: Go to Lighthouse
- Visit: https://lighthouse.storage
- Click "Get Started" or "Sign Up"

### Step 2: Create Account
- Sign up with your email
- Verify your email address
- Log into your dashboard

### Step 3: Get API Key
- Go to your dashboard
- Look for "API Keys" section
- Click "Create New API Key" 
- Copy the generated API key

### Step 4: Add to Environment
- Open `web/.env.local` file
- Replace the empty `NEXT_PUBLIC_LIGHTHOUSE_API_KEY=` with:
- `NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_actual_api_key_here`

## 2. 🔗 WalletConnect Project ID

### Step 1: Go to WalletConnect
- Visit: https://cloud.walletconnect.com
- Click "Get Started"

### Step 2: Create Account
- Sign up with your email or GitHub
- Verify your account

### Step 3: Create Project
- Click "Create Project"
- Give it a name like "Future Protocol Time Capsules"
- Select "App" as project type

### Step 4: Get Project ID
- After creating, you'll see your Project ID
- Copy the Project ID (looks like: 2f05a7cde11b9f9225a9b4c7f1d3e8f6)

### Step 5: Add to Environment
- Open `web/.env.local` file
- Replace the empty `NEXT_PUBLIC_WC_PROJECT_ID=` with:
- `NEXT_PUBLIC_WC_PROJECT_ID=your_actual_project_id_here`

## 3. ✅ Final Steps

### Restart Development Server
After adding the API keys:
```bash
cd web
npm run dev
```

### Test the Application
1. Connect your wallet (make sure it's on Filecoin Calibration)
2. Try creating a time capsule
3. The error should be gone!

## 📝 Example .env.local File

```bash
# Your file should look like this (with real values):
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
NEXT_PUBLIC_WC_PROJECT_ID=2f05a7cde11b9f9225a9b4c7f1d3e8f6

# These are already set correctly:
NEXT_PUBLIC_CONTRACT_ADDRESS=0xf939f81b62a57157C6fA441bEb64B2E684382991
NEXT_PUBLIC_NETWORK_NAME=Filecoin Calibration
NEXT_PUBLIC_CHAIN_ID=314159
```

## 🆘 Need Help?

### Common Issues:
1. **Still getting API key error**: Make sure you restart the dev server after adding keys
2. **Invalid API key**: Double-check you copied the full key from Lighthouse
3. **WalletConnect issues**: Verify your Project ID is correct

### Free Alternatives:
- **Lighthouse**: Free tier includes 100MB storage
- **WalletConnect**: Completely free for most use cases

Both services are free to use for development and small projects!