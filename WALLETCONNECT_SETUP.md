# WalletConnect (Web3Modal) Setup

## Current Status
✅ **Web3Modal is working** with a fallback project ID  
⚠️ **"Invalid App Configuration" warning** appears but wallets still work  
🎯 **For production**, you should get your own project ID  

## To Get Your Own Project ID (Optional but Recommended):

### Step 1: Create Account
1. Visit [https://cloud.reown.com/](https://cloud.reown.com/)
2. Sign up for a free account
3. Create a new project

### Step 2: Get Project ID
1. Copy your Project ID from the dashboard
2. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Step 3: Set Environment Variable
Add to your `.env.local` file:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
```

### Step 4: Deploy to Railway
Add the environment variable in Railway dashboard:
- **Key:** `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **Value:** Your project ID

## What Works Without Setup:
- ✅ MetaMask connection
- ✅ Injected wallets (Brave, etc.)
- ✅ Basic wallet functionality
- ✅ All revoke features

## What Improves With Setup:
- ✅ No "Invalid App Configuration" warning
- ✅ Better WalletConnect mobile support
- ✅ Analytics and monitoring (if desired)
- ✅ Production-ready configuration

## Current Fallback Configuration:
The app uses a demo project ID that provides basic functionality but shows the warning. **This is fine for development and testing.**

## For Production:
**You should get your own project ID** to:
- Remove the configuration warning
- Have proper analytics
- Ensure long-term reliability
- Get official support

The app works perfectly without it, but the warning will persist until you set your own project ID.