# TimeCapsule IPFS Integration

A decentralized time-locked file storage system that combines Filecoin blockchain smart contracts with Lighthouse IPFS storage. This system allows users to store files on IPFS through Lighthouse and lock them with smart contracts until a specified time.

## System Architecture

```
File → Lighthouse IPFS → CID → Smart Contract → Time-Locked Storage
                                      ↓
                              Blockchain Storage (Filecoin)
```

## Features

- Upload files to decentralized IPFS storage via Lighthouse
- Store IPFS CIDs in Filecoin smart contracts
- Time-based access control for file unlocking
- Comprehensive logging of all operations
- Terminal-based interface (no frontend required)
- Support for encrypted file storage
- Automatic metadata tracking (file size, type, creation time, etc.)

## Cloning the Repo

Open up your terminal (or command prompt) and navigate to a directory you would like to store this code on. Once there type in the following command:


```
git clone --recurse-submodules https://github.com/filecoin-project/fevm-hardhat-kit.git
cd fevm-hardhat-kit
yarn install
```


This will clone the hardhat kit onto your computer, switch directories into the newly installed kit, and install the dependencies the kit needs to work.


## Setup Environment Variables

1. **Get a private key** from a wallet provider [such as Metamask](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/).

2. **Create your environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Replace your private key** in the `.env` file:
   ```bash
   PRIVATE_KEY=your_private_key_here
   ```

**Security Warning:** Never commit `.env` files containing private keys to version control. The `.env` file is already gitignored by default - do not remove it from `.gitignore`.


## Quick Start

### 1. Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env and add:
# LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
# PRIVATE_KEY=your_wallet_private_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Deploy Contract
```bash
npm run compile
npm run deploy
```

### 4. Create Your First Time Capsule
```bash
# Create a test file
echo "Hello from the past!" > message.txt

# Create time capsule (unlock in 1 hour)
npm run timecapsule create ./message.txt "My First Capsule" user@example.com "2025-09-27 22:00"
```

## Deployed Contract

**TimeCapsuleStorage Contract**
- Address: `0x29CbBF02aFa6B223109cd7256cf0D0C741f399d0`
- Network: Filecoin Calibration Testnet
- Explorer: [View on FilFox](https://calibration.filfox.info/en/address/0x29CbBF02aFa6B223109cd7256cf0D0C741f399d0)

## Available Commands

### Create Time Capsule
```bash
npm run timecapsule create <file_path> <title> <recipient_email> <unlock_date>

# Example
npm run timecapsule create ./secret.txt "Birthday Surprise" friend@email.com "2024-12-25 09:00"
```

### Unlock Time Capsule
```bash
npm run timecapsule unlock <capsule_id> [download_path]

# Example  
npm run timecapsule unlock 1 ./unlocked_file.txt
```

### View Capsule Details
```bash
npm run timecapsule details <capsule_id>

# Example
npm run timecapsule details 1
```

### Run Integration Test
```bash
npm run demo
```

## Filecoin APIs

The primary advantage of the FEVM over other EVM based chains is the ability to access and program around Filecoin storage deals. This can be done in the FEVM via the [Filecoin.sol library maintained by Zondax](https://github.com/Zondax/filecoin-solidity). **Note this library is currently in BETA**. It is unaudited, and the APIs will likely be changing with time. This repo will be updated as soon as possible when a breaking change occurs.

The library is included in this kit as an NPM package and will automatically be downloaded when you perform the `yarn` command (don't confuse these with the included mocks)!

Currently you will find a getter contract that calls the getter methods on the MarketAPI to get storage deal data and store that data. To do this you will need *dealIDs* which you can [find here on FilFox](https://calibration.filfox.info/en/deal).

As an example to store most of the data available for a deal run the store-all command with a specified dealID. Below is an example of using this command below with a deal on Calibrationnet testnet with a dealID of 707.

```
yarn hardhat store-all --contract "DEPLOYED FILECOIN_MARKET_CONSUMER CONTRACT ADDRESS HERE" --dealid "707"
```

### Preparing Data for Storage

Before storing a file with a storage provider, it needs to be prepared by turning it into a .car file and the metadata must be recorded. To do this, the hardhat kit has a [tool submodule](https://github.com/filecoin-project/fevm-hardhat-kit/tree/main/tools), written in the language Go, which can do this for you. You can also use the [FVM Data Depot website](https://data.lighthouse.storage/) will automatically convert files to the .car format, output all the necessary metadata, and act as an HTTP retrieval point for the storage providers.

### Client Contract - Making Storage Deals in Solidity

Under contracts, within the `basic-deal-client` sub-directory, you will find a file called `DealClient.sol`. This is an example contract that uses the Filecoin.sol API's to create storage deals via Solidity smart contracts on Filecoin. This works by emitting a Solidity event that [Boost storage providers](https://boost.filecoin.io/) can listen to. To learn more about this contract feel free to [checkout the app kit repo](https://github.com/filecoin-project/fvm-starter-kit-deal-making) which includes a detailed readme and a frontend.

### Bounty Contract

Under contracts, within the `filecoin-api-examples` sub-directory, you will find a file called `deal-rewarder.sol`. This is a basic example contract that uses the Filecoin.sol API's to create bounties for specific data to be stored on the Filecoin blockchain. This is intended to be an example to illustrate how you can use the Filecoin APIs to do some cool functionality. To learn more about this contract feel free to [checkout the original Foundry project](https://github.com/lotus-web3/deal-bounty-contract) which includes a detailed readme.
