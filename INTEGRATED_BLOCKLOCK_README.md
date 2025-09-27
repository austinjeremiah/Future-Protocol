# 🔐 Integrated Blocklock TimeCapsule System

A complete time-locked, encrypted, decentralized storage solution combining Blocklock encryption with IPFS storage and smart contract automation.

## 🌟 Key Features

### 🔒 **Complete Security Workflow**
1. **File Creation** → 2. **Blocklock Encryption** → 3. **IPFS Storage** → 4. **Smart Contract** → 5. **Automatic Unlock**

### 🎯 **Core Benefits**
- **Time-Locked Encryption**: Files encrypted with Blocklock before IPFS storage
- **Decentralized Storage**: Encrypted content stored on IPFS for censorship resistance  
- **Automatic Unlock**: Blockchain-enforced time locks with automatic key release
- **Zero Trust**: No manual intervention required for decryption
- **Production Ready**: Complete workflow from creation to access

## 🚀 Quick Start

### 1. **Demo the Complete Workflow**
```bash
npm run demo:integrated
```
*Shows the complete end-to-end integration*

### 2. **Interactive CLI Manager**
```bash
npm run timecapsule:integrated
```
*Full-featured CLI for creating and managing TimeCapsules*

### 3. **Individual Components**
```bash
npm run demo:blocklock          # Blocklock integration demo
npm run timecapsule:blocklock   # Blocklock-specific manager
```

## 🔧 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User File     │ -> │ Blocklock        │ -> │   IPFS Storage  │
│   Creation      │    │ Encryption       │    │   (Encrypted)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                |
                                v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Automatic     │ <- │ Smart Contract   │ <- │   Blocklock     │
│   File Access   │    │ Management       │    │   Request       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Security Flow**:
1. **Original file** is encrypted with Blocklock time-lock
2. **Encrypted file** is stored on IPFS (no plain text ever stored)
3. **Smart contract** manages the TimeCapsule metadata and unlock process
4. **Blocklock network** automatically releases decryption key at unlock time
5. **User accesses** decrypted content only after time lock expires

## 📁 File Structure

```
scripts/
├── integratedBlocklockTimeCapsule.ts    # Complete workflow demo
├── integratedTimeCapsuleManager.ts      # Interactive CLI manager
├── blocklockDemo.ts                     # Blocklock-specific demo
├── blocklockNodejsDemo.ts               # Node.js Blocklock pattern
├── blocklockPatternDemo.ts              # Implementation pattern guide
└── LighthouseService.ts                 # IPFS storage service

contracts/
└── TimeCapsuleBlocklockSimple.sol       # Enhanced smart contract

docs/
├── BLOCKLOCK_NODEJS_GUIDE.md           # Implementation guide
└── blocklock_nodejs_example.ts         # Reference implementation
```

## 🛠 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Integrated Demo** | `npm run demo:integrated` | Complete end-to-end workflow |
| **Integrated CLI** | `npm run timecapsule:integrated` | Interactive manager |
| **Blocklock Demo** | `npm run demo:blocklock` | Blocklock integration demo |
| **Blocklock CLI** | `npm run timecapsule:blocklock` | Blocklock-specific manager |
| **Pattern Demo** | `npx hardhat run scripts/blocklockPatternDemo.ts --network calibration` | Implementation patterns |
| **Deploy Contract** | `npm run deploy:blocklock` | Deploy smart contract |

## 🔐 Blocklock Integration Details

### **Production Implementation**
```typescript
import { Blocklock, encodeCiphertextToSolidity, encodeCondition, encodeParams } from "blocklock-js";

// Initialize for Base Sepolia (production)
const blocklockjs = Blocklock.createBaseSepolia(signer as unknown as Signer);

// Create time condition
const blockHeight = BigInt(await ethers.provider.getBlockNumber() + 10);
const conditionBytes = encodeCondition(blockHeight);

// Encrypt file content
const msgBytes = encodeParams(["bytes"], [fileContent]);
const encodedMessage = getBytes(msgBytes);
const cipherMessage = blocklockjs.encrypt(encodedMessage, blockHeight);

// Prepare for smart contract
const solidityCiphertext = encodeCiphertextToSolidity(cipherMessage);
```

### **Key Features**:
- ✅ **Real Blocklock.js integration** with proper library usage
- ✅ **Gas estimation** and callback pricing
- ✅ **Direct funding model** with msg.value
- ✅ **Error handling** for network issues
- ✅ **Production patterns** following official documentation

## 📋 TimeCapsule Workflow

### **Creating a TimeCapsule**:
1. 📝 **Create Content**: User provides title, message, unlock time
2. 🔐 **Blocklock Encrypt**: File encrypted before any storage
3. 📤 **IPFS Upload**: Only encrypted content uploaded to IPFS
4. 📋 **Smart Contract**: Register TimeCapsule with metadata
5. ⏰ **Time Lock**: Blocklock enforces unlock timing
6. 🔓 **Auto Unlock**: Key automatically released at unlock time

### **Accessing a TimeCapsule**:
1. 🔍 **Check Status**: Query if TimeCapsule can be unlocked
2. 🔓 **Unlock**: Smart contract unlock (if time passed)
3. 📥 **Download**: Retrieve encrypted file from IPFS
4. 🔑 **Decrypt**: Use released key to decrypt content
5. 📖 **Access**: Read original content

## 🌐 Network Configuration

### **Current Setup** (Demo):
- **Network**: Filecoin Calibration Testnet
- **Contract**: `0xf939f81b62a57157C6fA441bEb64B2E684382991`
- **IPFS**: Lighthouse Storage
- **Blocklock**: Simulated (for testing)

### **Production Setup**:
- **Network**: Base Sepolia / Base Mainnet
- **Blocklock**: Real Blocklock.js integration
- **IPFS**: Lighthouse Production
- **Security**: Full encryption workflow

## 🎮 Usage Examples

### **Interactive CLI**:
```bash
npm run timecapsule:integrated

🔐 INTEGRATED BLOCKLOCK TIMECAPSULE MANAGER
==========================================================
1. Create new Blocklock TimeCapsule
2. List my TimeCapsules
3. View TimeCapsule details
4. Try to unlock TimeCapsule
5. Upload and encrypt existing file
6. Download and decrypt file
7. Check system status
8. Exit
```

### **Programmatic Usage**:
```typescript
import { IntegratedBlocklockTimeCapsule } from './scripts/integratedBlocklockTimeCapsule';

const system = new IntegratedBlocklockTimeCapsule();
await system.runIntegratedDemo();
```

## 🔍 System Status

To check the current system status:
```bash
npm run timecapsule:integrated
# Choose option 7: Check system status
```

This shows:
- 💰 Wallet Balance
- 🔗 Current Block Number  
- 📦 Total TimeCapsules Created
- 📄 Contract Address
- 🌐 Network Information
- 🔐 Blocklock Integration Status
- 📡 IPFS Storage Status

## 🚧 Production Deployment

### **Prerequisites**:
1. **Base Sepolia Setup**: Configure network for production Blocklock
2. **Lighthouse API**: Production IPFS storage credentials
3. **Smart Contract**: Deploy enhanced contract to production network
4. **Blocklock Account**: Set up production Blocklock integration

### **Configuration**:
1. Update `.env` with production credentials
2. Configure `hardhat.config.ts` for target network
3. Deploy contract: `npm run deploy:blocklock`
4. Test with small amounts first

### **Security Checklist**:
- [ ] **Private Keys**: Secure key management
- [ ] **Gas Limits**: Appropriate limits for callbacks
- [ ] **Balance Monitoring**: Sufficient funds for Blocklock fees
- [ ] **Network Verification**: Correct network configuration
- [ ] **Error Handling**: Comprehensive error management
- [ ] **Testing**: Thorough testing before production use

## 📚 Additional Resources

- **Implementation Guide**: `BLOCKLOCK_NODEJS_GUIDE.md`
- **Reference Code**: `blocklock_nodejs_example.ts`
- **Smart Contract**: `contracts/TimeCapsuleBlocklockSimple.sol`
- **Blocklock Docs**: [docs.blocklock.network](https://docs.blocklock.network)
- **Lighthouse Docs**: [lighthouse.storage](https://lighthouse.storage)

## 🎯 Key Benefits

### **For Users**:
- 🔒 **True Time-Locked Storage**: Files impossible to access before unlock time
- 🌐 **Decentralized**: No single point of failure
- 🤖 **Automatic**: No manual intervention required
- 🔐 **Secure**: Military-grade encryption with blockchain enforcement

### **For Developers**:
- 📦 **Complete Solution**: End-to-end implementation
- 🔧 **Production Ready**: Real-world deployment patterns
- 📖 **Well Documented**: Comprehensive guides and examples
- 🧪 **Testable**: Full demo and testing capabilities

---

This integrated system represents the future of secure, time-locked, decentralized storage - combining the power of Blocklock encryption, IPFS storage, and smart contract automation for a seamless user experience! 🚀🔐