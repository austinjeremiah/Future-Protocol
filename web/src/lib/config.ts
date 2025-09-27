// lib/config.ts - Configuration constants
export const CONTRACT_CONFIG = {
  address: "0xf939f81b62a57157C6fA441bEb64B2E684382991",
  // Basic ABI for the TimeCapsuleBlocklockSimple contract
  abi: [
    {
      "inputs": [
        {"internalType": "string", "name": "_ipfsCid", "type": "string"},
        {"internalType": "string", "name": "_encryptionKey", "type": "string"},
        {"internalType": "uint256", "name": "_unlockTime", "type": "uint256"},
        {"internalType": "string", "name": "_recipientEmail", "type": "string"},
        {"internalType": "string", "name": "_title", "type": "string"},
        {"internalType": "uint256", "name": "_fileSize", "type": "uint256"},
        {"internalType": "string", "name": "_fileType", "type": "string"}
      ],
      "name": "createSimpleTimeCapsule",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_capsuleId", "type": "uint256"}],
      "name": "getTimeCapsule",
      "outputs": [
        {"internalType": "string", "name": "", "type": "string"},
        {"internalType": "uint256", "name": "", "type": "uint256"},
        {"internalType": "uint256", "name": "", "type": "uint256"},
        {"internalType": "address", "name": "", "type": "address"},
        {"internalType": "address", "name": "", "type": "address"},
        {"internalType": "uint256", "name": "", "type": "uint256"},
        {"internalType": "string", "name": "", "type": "string"},
        {"internalType": "bool", "name": "", "type": "bool"},
        {"internalType": "bytes32", "name": "", "type": "bytes32"},
        {"internalType": "uint256", "name": "", "type": "uint256"},
        {"internalType": "bytes32", "name": "", "type": "bytes32"},
        {"internalType": "bool", "name": "", "type": "bool"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_capsuleId", "type": "uint256"}],
      "name": "canUnlock",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_capsuleId", "type": "uint256"}],
      "name": "unlockTimeCapsule",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextCapsuleId",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_capsuleId", "type": "uint256"}],
      "name": "getTimeUntilUnlock",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

export const LIGHTHOUSE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || "",
  gateway: "https://gateway.lighthouse.storage/ipfs/"
};

export const NETWORK_CONFIG = {
  name: "Filecoin Calibration",
  chainId: 314159,
  rpcUrl: "https://api.calibration.node.glif.io/rpc/v1"
};