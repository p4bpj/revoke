# WalletConnect Setup

Currently WalletConnect is disabled to avoid console errors during development.

## To Enable WalletConnect:

1. **Get a Project ID**:
   - Visit [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
   - Create a free account
   - Create a new project
   - Copy your Project ID

2. **Add to Environment**:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
   ```

3. **Enable in Config**:
   In `src/lib/config.ts`, uncomment and update:
   ```typescript
   walletConnect({
     projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
   }),
   ```

4. **Restart Development Server**:
   ```bash
   npm run dev
   ```

## Current Working Connectors:
- ✅ **MetaMask** - Browser extension wallet
- ✅ **Injected** - Any browser wallet (Brave, etc.)
- ⏸️ **WalletConnect** - Mobile wallets (disabled until project ID added)

The app works perfectly without WalletConnect for now!