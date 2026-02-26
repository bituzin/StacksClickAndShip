import { createAppKit } from '@reown/appkit/react';
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin';
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks';

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'c12e4a814a2dd9dcb0dd714c65a86c62';

// Debug: Log the project ID being used
console.log('🔍 Reown Project ID:', projectId);
console.log('📊 Environment VITE_REOWN_PROJECT_ID:', import.meta.env.VITE_REOWN_PROJECT_ID);

// 2. Set up Bitcoin networks - AppKit provides official network definitions
const networks = [bitcoin, bitcoinTestnet];

// 3. Set up Bitcoin Adapter with proper configuration
const bitcoinAdapter = new BitcoinAdapter({
  networks
});

// 4. Create the modal metadata
const metadata = {
  name: 'Stacks Click & Ship',
  description: 'GM, post, vote, learn - Your all-in-one toolkit for the Stacks blockchain',
  url: window.location.origin,
  icons: [window.location.origin + '/vite.svg']
};

// 5. Create AppKit with Bitcoin support
export const modal = createAppKit({
  adapters: [bitcoinAdapter],
  networks: networks as any,
  projectId,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: [],
    swaps: false,
    onramp: false
  },
  enableAutoConnect: false,
  enableWalletConnect: true,
  enableInjected: false,
  enableCoinbase: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-z-index': 9999
  },
  allWallets: 'SHOW'
});
