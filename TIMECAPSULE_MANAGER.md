# 🚀 Enhanced TimeCapsule Manager

The Enhanced TimeCapsule Manager combines all functionality from `finalWorkingDemo.ts` into `timeCapsuleManager.ts`, creating a comprehensive interactive CLI tool for managing TimeCapsules with complete workflow support.

## ✨ Features Integrated

### 🔐 Complete Workflow Features
✅ **zkTLS Proof Generation** - Groth16 protocol with bn128 curve
✅ **NTP Time Validation** - Multi-source time verification (pool.ntp.org, time.google.com, etc.)
✅ **Self Protocol Identity Verification** - Real-time QR code server with mobile app integration
✅ **Blocklock Encryption** - Time-based decryption with blockchain conditions
✅ **IPFS Storage** - Distributed storage via Lighthouse
✅ **Smart Contract Integration** - Filecoin Calibration network deployment
✅ **Comprehensive Reporting** - JSON workflow reports with all verification data
✅ **Interactive QR Server** - Built-in Express server for Self Protocol verification
✅ **Real-time Monitoring** - Automatic polling for blockchain verification events
✅ **Production Ready** - Works in both development and production environments

### 📋 Interactive Menu Options
1. **🔐 Create TimeCapsule (Standard)** - Original functionality
2. **🎯 Create TimeCapsule (Complete Workflow)** - Full feature integration
3. **📋 List My TimeCapsules** - View your created TimeCapsules
4. **👁️ View TimeCapsule Details** - Detailed information display
5. **🔓 Unlock TimeCapsule** - Time-based unlocking with content retrieval
6. **🔬 Complete Demo Workflow** - Demonstration of all features
7. **🚪 Exit** - Clean shutdown with QR server cleanup

## 🛠 How to Run

### For Development (npm run start)
```bash
npm run start
```
This runs: `npx hardhat run scripts/timeCapsuleManager.ts --network calibration`

### For Production
```bash
npm run manager
```
This also runs: `npx hardhat run scripts/timeCapsuleManager.ts --network calibration`

### Alternative Commands
```bash
# Original finalWorkingDemo
npm run timecapsule

# UI Development
npm run dev
npm run ui:dev

# UI Production
npm run start:ui
```

## 🔧 Required Environment Variables

Create `.env` file in the project root:
```bash
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://api.calibration.node.glif.io/rpc/v1

# IPFS Storage
LIGHTHOUSE_API_KEY=your_lighthouse_api_key

# Self Protocol (optional - for enhanced verification)
IDENTITY_VERIFICATION_HUB_ADDRESS=0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
NEXT_PUBLIC_SELF_SCOPE=test-scope
NEXT_PUBLIC_SELF_ENDPOINT=0xe355eb8ddc5ae5a1fb8265b5394c5b4e47604d2e
NEXT_PUBLIC_SELF_APP_NAME=Future Protocol
```

## 🎯 Complete Workflow Process

When you select "Create TimeCapsule (Complete Workflow)", the system will:

1. **📊 Generate zkTLS Proof** - Creates cryptographic proof using Groth16 protocol
2. **⏰ Validate NTP Sources** - Checks multiple time servers for accuracy
3. **🔐 Self Protocol Verification** - Launches QR server at http://localhost:3000
   - Displays QR code for Self Protocol mobile app
   - Monitors blockchain for verification completion
   - Supports manual verification completion
4. **📝 Collect TimeCapsule Data** - Interactive prompts for title, message, recipient
5. **🌐 Upload to IPFS** - Stores content on distributed network via Lighthouse
6. **🔐 Setup Blocklock Encryption** - Configures time-based unlocking
7. **🏗️ Create Smart Contract** - Deploys TimeCapsule to Filecoin blockchain
8. **📊 Generate Report** - Creates comprehensive JSON report with all workflow data

## 🌐 Self Protocol QR Code Server

The enhanced manager includes a built-in Express server for Self Protocol verification:

- **Main Page**: http://localhost:3000 (Beautiful QR display)
- **QR Image**: http://localhost:3000/qr-code (Direct PNG)
- **Manual Completion**: Button to mark verification complete
- **Real-time Monitoring**: Polls for blockchain verification events

## 📄 Generated Reports

Complete workflow creates detailed JSON reports including:
- Execution metadata (timing, phases, status)
- TimeCapsule details (ID, creator, recipient, unlock time)
- zkTLS proof data (protocol, curve, hash)
- Self Protocol verification (address, hash, universal link)
- Storage information (IPFS CID, content length)
- Blockchain data (network, contract address, current block)
- Content analysis (encryption details, preview)

## 🔗 Integration Benefits

- **Unified Interface**: Single command runs complete workflow
- **Production Ready**: Works in both development and production
- **Comprehensive**: All finalWorkingDemo features accessible interactively
- **Extensible**: Easy to add new workflow steps
- **Maintainable**: Single source of truth for TimeCapsule functionality

## 🚀 Quick Start

1. Ensure environment variables are configured
2. Run `npm run start`
3. Select option 2 for complete workflow demonstration
4. Follow interactive prompts
5. Scan QR code with Self Protocol mobile app
6. Complete workflow creates TimeCapsule with full verification

The Enhanced TimeCapsule Manager is now the primary interface for all TimeCapsule operations, combining the best of both interactive management and complete workflow demonstration.