# Gymonad Smart Contract Deployment Guide

## Prerequisites
1. Node.js and npm/yarn installed
2. Monad testnet MON tokens for deployment
3. Private key of deployment wallet

## Setup
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Add your private key to `.env`:
   \`\`\`
   PRIVATE_KEY=your_private_key_here
   \`\`\`

## Deployment Steps

### 1. Compile Contracts
\`\`\`bash
npx hardhat compile
\`\`\`

### 2. Deploy to Monad Testnet
\`\`\`bash
npx hardhat run scripts/deploy.js --network monadTestnet
\`\`\`

### 3. Update Frontend Configuration
After deployment, update the contract addresses in your frontend:
- Copy addresses from `deployment.json`
- Update `lib/gym-token-abi.ts` with new contract address
- Update environment variables

### 4. Verify Contracts (Optional)
\`\`\`bash
npx hardhat verify --network monadTestnet <CONTRACT_ADDRESS>
\`\`\`

## Contract Addresses
After deployment, contracts will be available at:
- GYM Token: `<address from deployment.json>`
- Gymonad NFT: `<address from deployment.json>`

## Features
- **GYM Token**: ERC-20 token with workout rewards system
- **Gymonad NFT**: ERC-721 membership pass NFTs mintable with GYM tokens
- **Workout Tracking**: On-chain workout recording with streak bonuses
- **Reward System**: Automatic token rewards for fitness activities
