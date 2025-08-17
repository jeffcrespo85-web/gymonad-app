# Gymonad Deployment Guide

## Overview
This guide covers deploying the Gymonad Web3 fitness app to production environments, including smart contracts, database setup, and mobile app distribution.

## Prerequisites
- Node.js 18+ installed
- Supabase account and project
- Monad testnet/mainnet access
- Vercel account (for web deployment)
- Private key for contract deployment

## Environment Setup

### 1. Environment Variables
Copy `.env.production.example` to `.env.production` and fill in your production values:

\`\`\`bash
cp .env.production.example .env.production
\`\`\`

### 2. Database Setup
Run the database migration scripts:

\`\`\`bash
npm run db:migrate
\`\`\`

### 3. Smart Contract Deployment
Deploy contracts to Monad network:

\`\`\`bash
npm run deploy:contracts
\`\`\`

## Deployment Options

### Option 1: Vercel Deployment (Recommended)

1. **Install Vercel CLI:**
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Deploy to production:**
   \`\`\`bash
   npm run deploy:vercel
   \`\`\`

3. **Set environment variables in Vercel dashboard**

### Option 2: Manual Build & Deploy

1. **Build the application:**
   \`\`\`bash
   npm run build:production
   \`\`\`

2. **Start production server:**
   \`\`\`bash
   npm run start:production
   \`\`\`

### Option 3: Static Export (for CDN)

1. **Generate static export:**
   \`\`\`bash
   npm run export
   \`\`\`

2. **Deploy the `out` folder to your CDN**

## Mobile App Distribution

### PWA Installation
The app is configured as a Progressive Web App (PWA) and can be installed directly from browsers on mobile devices.

### App Store Distribution (Optional)
For native app store distribution, consider using:
- **Capacitor** for iOS/Android native apps
- **Tauri** for desktop applications

## Post-Deployment Checklist

- [ ] Verify smart contracts are deployed and verified
- [ ] Test wallet connection on production
- [ ] Verify database migrations completed
- [ ] Test workout recording and token rewards
- [ ] Verify NFT minting functionality
- [ ] Test PWA installation on mobile devices
- [ ] Check all environment variables are set
- [ ] Verify SSL certificate is active
- [ ] Test social media links and external integrations

## Monitoring & Analytics

### Performance Monitoring
- Set up Sentry for error tracking
- Configure Google Analytics for user insights
- Monitor Core Web Vitals

### Blockchain Monitoring
- Monitor smart contract interactions
- Track token distribution and rewards
- Monitor gas usage and optimization

## Troubleshooting

### Common Issues

1. **Contract deployment fails:**
   - Check private key and network configuration
   - Ensure sufficient funds for gas fees

2. **Database connection issues:**
   - Verify Supabase credentials
   - Check RLS policies are correctly set

3. **PWA not installing:**
   - Verify manifest.json is accessible
   - Check service worker registration

## Security Considerations

- Never commit private keys to version control
- Use environment variables for all sensitive data
- Regularly update dependencies
- Monitor for security vulnerabilities
- Implement rate limiting for API endpoints

## Support

For deployment issues, contact the Gymonad team or check our documentation at:
- Website: https://gymonad-app.nad
- Twitter: https://x.com/Gymonad
