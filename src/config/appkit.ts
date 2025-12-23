import { createAppKit } from '@reown/appkit/react';
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin';

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'c12e4a814a2dd9dcb0dd714c65a86c62';

// 2. Set up Bitcoin Adapter
const bitcoinAdapter = new BitcoinAdapter();

// 3. Define networks manually for Bitcoin
const networks = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    currency: 'BTC',
    explorerUrl: 'https://blockstream.info',
    rpcUrl: 'https://blockstream.info/api'
  }
];

// 4. Create the modal
const metadata = {
  name: 'Stacks Click & Ship',
  description: 'GM, post, vote, learn - Your all-in-one toolkit for the Stacks blockchain',
  url: window.location.origin,
  icons: [window.location.origin + '/vite.svg']
};

export const modal = createAppKit({
  adapters: [bitcoinAdapter],
  networks: networks as any,
  projectId,
  metadata,
  features: {
    analytics: true,
    email: false, // Disable email login for now
    socials: [],
    swaps: false,
    onramp: false
  }
});
