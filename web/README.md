# Future Protocol - Web Frontend Integration

This is the web frontend for the Future Protocol Time Capsule system, integrated with the backend smart contracts and services.

## 🚀 Features

- **Web3 Wallet Integration**: Connect with MetaMask, WalletConnect, and other popular wallets
- **Time Capsule Creation**: Create time capsules with files, messages, and custom unlock times
- **Smart Contract Integration**: Interact with TimeCapsuleBlocklockSimple contract on Filecoin Calibration
- **IPFS Storage**: Files and content stored on IPFS via Lighthouse service
- **Time Capsule Management**: View, unlock, and manage your time capsules
- **Real-time Status**: Live updates on capsule unlock status and timing

## 🛠️ Backend Services Integration

The frontend integrates with the following backend services:

### 1. Smart Contract Service (`contract.ts`)
- Connects to TimeCapsuleBlocklockSimple contract
- Handles time capsule creation, unlocking, and querying
- Uses Wagmi for Web3 interactions

### 2. Lighthouse IPFS Service (`lighthouse.ts`)
- Uploads files and content to IPFS via Lighthouse
- Retrieves content from IPFS when unlocking capsules
- Handles text and binary file uploads

### 3. Time Capsule Service (`timecapsule.ts`)
- Main orchestrator service combining contract and IPFS operations
- Formats time capsule content with metadata
- Handles the complete creation and unlock workflow

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Lighthouse API Key** - Get from [lighthouse.storage](https://lighthouse.storage)
3. **WalletConnect Project ID** - Get from [WalletConnect Cloud](https://cloud.walletconnect.com)
4. **Web3 Wallet** - MetaMask, WalletConnect compatible wallet
5. **Filecoin Calibration Testnet** - Add network to your wallet

## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Environment Configuration
```bash
# Copy environment example
cp .env.example .env.local

# Edit .env.local with your API keys
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

### 3. Network Setup
Add Filecoin Calibration testnet to your wallet:
- **Network Name**: Filecoin Calibration
- **RPC URL**: https://api.calibration.node.glif.io/rpc/v1
- **Chain ID**: 314159
- **Currency**: tFIL
- **Explorer**: https://calibration.filfox.info/en

### 4. Get Test Tokens
Get free tFIL from the [Filecoin Calibration Faucet](https://faucet.calibration.fildev.network/)

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage Guide

### Creating a Time Capsule

1. **Connect Wallet**: Click "Connect Wallet" on the landing page
2. **Navigate to Home**: Go to the home page via sidebar navigation
3. **Fill Form**:
   - Enter recipient wallet address
   - Set unlock date and time (must be in the future)
   - Add a message (optional)
   - Upload a file (optional)
4. **Create**: Click "Create Time Capsule"
5. **Confirm**: Approve the blockchain transaction in your wallet
6. **Success**: Note the Capsule ID for future reference

### Unlocking a Time Capsule

1. **Navigate to Unlock**: Use sidebar navigation
2. **Enter Capsule ID**: Input the capsule ID number
3. **Unlock**: Click "Unlock Time Capsule"
4. **View Content**: If successful, the content will be displayed

### Managing Time Capsules

1. **Dashboard**: View all your time capsules
2. **Stats**: See created, received, and sealed capsules
3. **Status**: Check unlock status and remaining time
4. **Actions**: Quick access to unlock ready capsules

## 🔧 Technical Architecture

### Frontend Stack
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Wagmi**: Web3 React hooks
- **RainbowKit**: Wallet connection UI

### Web3 Integration
- **Viem**: Low-level Web3 library
- **Contract ABI**: TimeCapsuleBlocklockSimple interface
- **Network**: Filecoin Calibration testnet
- **Gas**: Automatic gas estimation and handling

### File Storage
- **IPFS**: Decentralized file storage
- **Lighthouse**: IPFS pinning service
- **Gateway**: Content retrieval via HTTP

## 🔒 Security Features

- **Client-side Processing**: Private keys never leave your browser
- **Smart Contract Security**: Time-locked access control
- **IPFS Integrity**: Content addressing ensures file integrity
- **Wallet Security**: Non-custodial wallet integration

## 🐛 Troubleshooting

### Common Issues

1. **"No wallet connected"**
   - Ensure MetaMask or compatible wallet is installed
   - Connect to Filecoin Calibration network
   - Refresh the page and try again

2. **"Insufficient funds"**
   - Get tFIL from the calibration faucet
   - Ensure you have enough for gas fees

3. **"Time capsule cannot be unlocked yet"**
   - Check the unlock time in the dashboard
   - Wait until the specified unlock time

4. **"Failed to upload to IPFS"**
   - Check your Lighthouse API key
   - Ensure file size is under limits
   - Check internet connection

### Getting Help

- Check browser console for detailed error messages
- Verify network configuration matches the setup guide
- Ensure all environment variables are properly set

## 🚦 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📁 Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page with LetterGlitch
│   │   ├── home/              # Time capsule creation
│   │   ├── unlock/            # Time capsule unlocking
│   │   ├── Dashboard/         # Capsule management
│   │   └── layout.tsx         # Root layout with Web3Provider
│   ├── components/            # Reusable UI components
│   │   └── LetterGlitch.tsx   # Matrix-style animation
│   ├── lib/
│   │   ├── services/          # Backend integration services
│   │   │   ├── contract.ts    # Smart contract interactions
│   │   │   ├── lighthouse.ts  # IPFS file storage
│   │   │   └── timecapsule.ts # Main orchestrator service
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── config.ts          # Configuration constants
│   │   ├── utils.ts           # Utility functions
│   │   └── wagmi.ts           # Web3 configuration
│   └── ui/                    # UI component library
│       └── sidebar.tsx        # Navigation sidebar
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🎨 UI Components

The application uses a custom design system with:

- **Sidebar Navigation**: Consistent navigation across all pages
- **Matrix Animation**: LetterGlitch component for visual appeal
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Smooth transitions and progress indicators
- **Error Handling**: User-friendly error messages and recovery

## 🌐 Network Configuration

The application is configured for Filecoin Calibration testnet by default:

- **Contract Address**: `0xf939f81b62a57157C6fA441bEb64B2E684382991`
- **Network**: Filecoin Calibration
- **Chain ID**: 314159
- **Explorer**: https://calibration.filfox.info/en

To deploy on mainnet, update the contract address and network configuration in `/lib/config.ts`.

## 📈 Future Enhancements

- [ ] Email notifications for unlock events
- [ ] Enhanced file type support
- [ ] Time capsule sharing features  
- [ ] Batch operations for multiple capsules
- [ ] Advanced filtering and search
- [ ] Mobile app development
- [ ] Integration with other storage providers

## 📝 License

This project is part of the Future Protocol system. See the main project LICENSE for details.

---

**Built with ❤️ using Next.js, Web3, and IPFS technologies**
