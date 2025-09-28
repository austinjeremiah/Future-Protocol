# Future Protocol UI

A complete web interface for the Future Protocol TimeCapsule system, featuring Self Protocol identity verification, Blocklock time-based encryption, and IPFS storage via Lighthouse.

## Features

### 🔐 Complete Workflow Integration
- **Self Protocol Verification** - Real identity verification with QR code generation
- **Blocklock Encryption** - Time-based encryption that unlocks at target block heights
- **IPFS Storage** - Decentralized content storage via Lighthouse
- **zkTLS Proofs** - Cryptographic verification with Groth16 protocol
- **TimeCapsule Management** - Create, manage, and unlock encrypted time capsules

### 🌟 Key Technologies
- **MetaMask Integration** - Primary wallet connection
- **TFIL Token Support** - Filecoin Calibration network support
- **React/Next.js** - Modern frontend framework
- **Wagmi + RainbowKit** - Web3 wallet connection
- **Real-time Progress** - Live workflow progress tracking

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A wallet with tFIL tokens on Filecoin Calibration network
- Self Protocol mobile app for identity verification

### Installation

1. Navigate to the UI directory:
```bash
cd ui
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect project ID
- `NEXT_PUBLIC_LIGHTHOUSE_API_KEY`: Your Lighthouse API key for IPFS uploads

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a TimeCapsule

1. **Connect Wallet**: Click "Connect Wallet" and select your Web3 wallet
2. **Identity Verification**: Complete Self Protocol verification (Age 18+, Non-US)
3. **Create Content**: Add your message or upload a file
4. **Set Unlock Time**: Choose when the TimeCapsule should be unlocked
5. **Add Recipient**: Optionally specify a recipient wallet address
6. **Encrypt & Deploy**: The content is encrypted with Blocklock and stored on IPFS

### Managing TimeCapsules

- **View Capsules**: See all created and received TimeCapsules
- **Track Status**: Monitor unlock countdown and verification status  
- **Download Content**: Access unlocked TimeCapsule contents
- **Verify Proofs**: Validate zkTLS proofs and NTP timestamps

### Self Protocol Verification

1. Navigate to the "Verify Identity" tab
2. Click "Generate Verification QR Code"
3. Scan the QR code with the Self Protocol mobile app
4. Complete identity verification (requires age 18+, non-US residents)
5. Return to the web app - verification will be automatically detected

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Web3**: Wagmi, RainbowKit, Viem, Ethers.js
- **Identity**: Self Protocol SDK
- **Storage**: Lighthouse IPFS SDK
- **Encryption**: Blocklock time-based encryption
- **Proofs**: zkTLS with Groth16 protocol

## Contract Integration

The UI integrates with the TimeCapsule smart contract deployed on Filecoin Calibration:
- Contract Address: `0xf939f81b62a57157C6fA441bEb64B2E684382991`
- Network: Filecoin Calibration (Chain ID: 314159)
- Token: tFIL for transaction fees

## File Structure

```
ui/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main dashboard
│   │   └── providers.tsx    # Web3 providers
│   ├── components/          # React components
│   │   ├── TimeCapsuleCreator.tsx
│   │   ├── TimeCapsuleList.tsx
│   │   ├── SelfProtocolVerification.tsx
│   │   ├── BlocklockManager.tsx
│   │   ├── LighthouseUploader.tsx
│   │   └── ZKTLSProofGenerator.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── useTimeCapsule.ts
│   └── lib/                 # Utilities and integrations
│       ├── utils.ts
│       └── contracts.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Adding New Features

1. Create components in `src/components/`
2. Add hooks in `src/hooks/` for state management
3. Update contract integrations in `src/lib/contracts.ts`
4. Style with Tailwind CSS classes

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

Ensure all environment variables are properly configured for production:
- Update contract addresses for mainnet deployment
- Configure production RPC endpoints
- Set up production Lighthouse and WalletConnect credentials

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**
   - Ensure you're on the Filecoin Calibration network
   - Check that your wallet has tFIL tokens for gas fees

2. **Self Protocol Verification**
   - Verify you meet requirements (Age 18+, Non-US resident)
   - Ensure the Self Protocol mobile app is installed and updated
   - Check that the QR code is scannable and not corrupted

3. **TimeCapsule Creation Fails**
   - Confirm wallet has sufficient tFIL balance
   - Verify unlock time is in the future
   - Check file size limits (100MB max)

4. **IPFS Upload Issues**
   - Verify Lighthouse API key is configured correctly
   - Check network connectivity
   - Ensure file size is within limits

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the main project README for contract details
- Ensure all dependencies are properly installed

## License

This project is part of the Future Protocol suite and follows the same licensing terms.