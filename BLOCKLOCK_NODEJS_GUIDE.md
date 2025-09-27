# Blocklock Node.js Implementation Guide

This guide shows you how to properly integrate Blocklock time-locked encryption into your Node.js applications using the official `blocklock-js` library.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install blocklock-js ethers hardhat
```

### 2. Import Required Modules

```typescript
import { ethers } from "hardhat";
import { getBytes, Signer } from "ethers";
import { Blocklock, encodeCiphertextToSolidity, encodeCondition, encodeParams } from "blocklock-js";
import { MyBlocklockReceiver } from "../typechain-types";
```

### 3. Initialize Signer

```typescript
const [signer] = await ethers.getSigners();
```

### 4. Connect to Your Contract

```typescript
const contractAddress = '0xYourContractAddress';
const ContractFactory = await ethers.getContractFactory("MyBlocklockReceiver");
const contract = ContractFactory.connect(signer).attach(contractAddress) as MyBlocklockReceiver;
```

## 📋 Complete Implementation Example

Here's the complete Node.js implementation pattern that follows the official Blocklock.js library structure:

```typescript
import { ethers } from "hardhat";
import { getBytes, Signer } from "ethers";
import { Blocklock, encodeCiphertextToSolidity, encodeCondition, encodeParams } from "blocklock-js";
import { MyBlocklockReceiver } from "../typechain-types";

async function main() {
    // Get the signer from hardhat config
    const [signer] = await ethers.getSigners();

    // 1. Connect to the deployed myBlocklockReceiver contract
    const contractAddress = '0xMyBlocklockReceiverContractAddress';
    const ContractFactory = await ethers.getContractFactory("MyBlocklockReceiver");
    const contract = ContractFactory.connect(signer).attach(contractAddress) as MyBlocklockReceiver;

    // 2. Create blocklock request payload
    // Set block height for blocklock decryption (current block + 10)
    const blockHeight = BigInt(await ethers.provider.getBlockNumber() + 10);
    const conditionBytes = encodeCondition(blockHeight);

    // Set the message to encrypt
    const msg = ethers.parseEther("8"); // Example: BigInt for blocklock ETH transfer
    const msgBytes = encodeParams(["uint256"], [msg]);
    const encodedMessage = getBytes(msgBytes);

    // Encrypt the encoded message using Blocklock.js library
    const blocklockjs = Blocklock.createBaseSepolia(signer as unknown as Signer);
    const cipherMessage = blocklockjs.encrypt(encodedMessage, blockHeight);

    // Set the callback gas limit and price
    // Best practice is to estimate the callback gas limit e.g., by extracting gas reports from Solidity tests
    const callbackGasLimit = 700_000n;
    // Based on the callbackGasLimit, we can estimate the request price by calling BlocklockSender
    // Note: Add a buffer to the estimated request price to cover for fluctuating gas prices between blocks
    const [requestCallBackPrice] = await blocklockjs.calculateRequestPriceNative(callbackGasLimit);

    console.log("Target block for unlock:", blockHeight);
    console.log("Callback gas limit:", callbackGasLimit);
    console.log("Request CallBack price:", ethers.formatEther(requestCallBackPrice), "ETH");
    
    // Ensure wallet has enough token to cover the callback fee
    const balance = await ethers.provider.getBalance(signer.address);
    console.log("Wallet balance:", ethers.formatEther(balance), "ETH");
    if (balance < requestCallBackPrice) {
        throw new Error(`Insufficient balance. Need ${ethers.formatEther(requestCallBackPrice)} ETH but have ${ethers.formatEther(balance)} ETH`);
    }

    // 3. Invoke myBlocklockReceiver contract to request blocklock encryption with direct funding.
    console.log("Sending transaction...");
    const tx = await contract.createTimelockRequestWithDirectFunding(
        callbackGasLimit,
        conditionBytes,
        encodeCiphertextToSolidity(cipherMessage),
        { value: requestCallBackPrice }
    );
    
    console.log("Transaction sent, waiting for confirmation...");
    const receipt = await tx.wait(1);
    if (!receipt) {
        throw new Error("Transaction failed");
    }
    console.log("BlockLock requested in tx:", receipt.hash);
}

main().catch((err) => {
    console.error("Invocation failed:", err);
    process.exitCode = 1;
});
```

## 🔧 Smart Contract Requirements

Your smart contract must implement the `createTimelockRequestWithDirectFunding` method:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract MyBlocklockReceiver {
    /**
     * @dev Create timelock request with direct funding
     * @param callbackGasLimit Gas limit for the callback function
     * @param conditionBytes Encoded condition bytes from encodeCondition()
     * @param ciphertext Encoded ciphertext from encodeCiphertextToSolidity()
     */
    function createTimelockRequestWithDirectFunding(
        uint256 callbackGasLimit,
        bytes memory conditionBytes,
        bytes memory ciphertext
    ) external payable returns (uint256) {
        // Your contract implementation here
        // This method should:
        // 1. Forward msg.value to Blocklock network
        // 2. Store the request details
        // 3. Return a request ID
        // 4. Set up callback handling for decryption key
        
        return block.timestamp; // Placeholder return
    }
}
```

## 🔑 Key Implementation Steps

### Step 1: Initialize Blocklock Instance
```typescript
const blocklockjs = Blocklock.createBaseSepolia(signer as unknown as Signer);
```

### Step 2: Create Time-Lock Condition
```typescript
const blockHeight = BigInt(await ethers.provider.getBlockNumber() + 10);
const conditionBytes = encodeCondition(blockHeight);
```

### Step 3: Encode Your Message
```typescript
const msg = ethers.parseEther("8"); // Your data to encrypt
const msgBytes = encodeParams(["uint256"], [msg]);
const encodedMessage = getBytes(msgBytes);
```

### Step 4: Encrypt the Message
```typescript
const cipherMessage = blocklockjs.encrypt(encodedMessage, blockHeight);
```

### Step 5: Prepare for Smart Contract
```typescript
const solidityCiphertext = encodeCiphertextToSolidity(cipherMessage);
```

### Step 6: Calculate Callback Pricing
```typescript
const callbackGasLimit = 700_000n;
const [requestCallBackPrice] = await blocklockjs.calculateRequestPriceNative(callbackGasLimit);
```

### Step 7: Submit to Contract
```typescript
const tx = await contract.createTimelockRequestWithDirectFunding(
    callbackGasLimit,
    conditionBytes,
    solidityCiphertext,
    { value: requestCallBackPrice }
);
```

## 🌐 Network Configuration

### Base Sepolia (Recommended for Production)
```typescript
const blocklockjs = Blocklock.createBaseSepolia(signer as unknown as Signer);
```

### Base Mainnet
```typescript
const blocklockjs = Blocklock.createBase(signer as unknown as Signer);
```

## ⚡ Best Practices

1. **Gas Estimation**: Always estimate callback gas limits from your Solidity tests
2. **Price Buffer**: Add a buffer to the estimated request price for gas price fluctuations
3. **Balance Checks**: Verify sufficient balance before submitting requests
4. **Error Handling**: Implement proper error handling for network issues
5. **Transaction Confirmation**: Always wait for transaction confirmation

## 🔍 Debugging Tips

### Common Issues:
- **Network Mismatch**: Ensure you're using the correct network (Base Sepolia)
- **Insufficient Balance**: Check wallet has enough ETH for callback fees
- **Gas Limits**: Verify callback gas limits are appropriate for your use case
- **Contract Methods**: Ensure your contract implements the required methods

### Error Handling:
```typescript
try {
    const tx = await contract.createTimelockRequestWithDirectFunding(...);
    const receipt = await tx.wait(1);
    console.log("Success:", receipt.hash);
} catch (error) {
    if (error.message.includes("insufficient funds")) {
        console.error("Insufficient balance for transaction");
    } else if (error.message.includes("revert")) {
        console.error("Contract execution failed");
    } else {
        console.error("Network error:", error.message);
    }
}
```

## 📚 Additional Resources

- [Blocklock.js Documentation](https://docs.blocklock.network)
- [Base Network Documentation](https://docs.base.org)
- [Ethers.js Documentation](https://docs.ethers.org)

## 🎯 Production Checklist

- [ ] Install `blocklock-js` library
- [ ] Configure Base Sepolia network
- [ ] Implement proper error handling  
- [ ] Test gas estimation
- [ ] Verify balance checking
- [ ] Implement transaction confirmation
- [ ] Test callback functionality
- [ ] Deploy to testnet first
- [ ] Monitor gas prices
- [ ] Set up proper logging

## 🔐 Security Considerations

1. **Private Keys**: Never expose private keys in code
2. **Gas Limits**: Set reasonable gas limits to prevent excessive costs
3. **Balance Monitoring**: Monitor wallet balances for callback fees
4. **Network Verification**: Always verify you're on the intended network
5. **Contract Verification**: Verify contract addresses before deployment

---

This implementation follows the official Blocklock.js library patterns and ensures proper integration with the Blocklock network for production applications.