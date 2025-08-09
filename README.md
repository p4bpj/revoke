# Kasplex Revoke

A token allowance manager for Kasplex (EVM-compatible) blockchain, inspired by [revoke.cash](https://revoke.cash). This application allows users to view and revoke their ERC-20 token allowances and NFT approvals in a single, secure interface.

## Features

- 🔐 **Secure Wallet Connection** - Connect with MetaMask, WalletConnect, and other Web3 wallets
- 📊 **Comprehensive Scanning** - Detect all active ERC-20 allowances and NFT approvals
- ⚠️ **Security Alerts** - Identify potentially dangerous or blacklisted spenders
- 🔄 **Individual & Bulk Revoke** - Revoke permissions one-by-one or all at once
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Clean, intuitive interface built with Tailwind CSS
- ⚡ **Optimized Performance** - Efficient blockchain scanning with batch processing

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Access to a Kasplex RPC endpoint

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/kasplex-revoke.git
cd kasplex-revoke
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_RPC_URL=https://your-kasplex-rpc-url.com
NEXT_PUBLIC_CHAIN_ID=your-chain-id
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_RPC_URL` | Kasplex RPC endpoint URL | `http://127.0.0.1:8545` |
| `NEXT_PUBLIC_CHAIN_ID` | Chain ID for the network | `1337` |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment (development/production) | `development` |

## Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set the following environment variables in Railway:
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_CHAIN_ID`
3. Deploy automatically triggers on push to main branch

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t kasplex-revoke .
```

2. Run the container:
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_RPC_URL=your-rpc-url \
  -e NEXT_PUBLIC_CHAIN_ID=your-chain-id \
  kasplex-revoke
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Security Features

### Blacklist Protection
The application includes a blacklist of known malicious addresses that are highlighted in red when detected.

### Known Protocol Recognition
Common DeFi protocols and routers are recognized and labeled for user awareness.

### Transaction Safety
- All transactions require explicit user confirmation
- Clear indication of what each approval allows
- Bulk operations include additional confirmation prompts

## Architecture

```
src/
├── app/                 # Next.js 13+ app directory
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Main application page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── AllowanceTable.tsx
│   ├── Header.tsx
│   ├── LoadingSpinner.tsx
│   ├── StatsCard.tsx
│   └── WalletConnector.tsx
├── hooks/              # Custom React hooks
│   ├── useApprovals.ts
│   └── useWallet.ts
└── utils/              # Utility functions
    ├── abis.ts
    ├── constants.ts
    ├── fetchERC20Approvals.ts
    └── fetchNFTApprovals.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Security Considerations

- Always verify contract addresses before interacting
- Be cautious when approving tokens to unknown contracts
- Regularly audit your approvals using this tool
- Keep your wallet software updated
- Never share your private keys or seed phrases

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Revoke.cash](https://revoke.cash)
- Built with [Next.js](https://nextjs.org/)
- Powered by [ethers.js](https://ethers.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/your-username/kasplex-revoke/issues) on GitHub.