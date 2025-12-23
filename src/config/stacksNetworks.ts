import type { CaipNetwork } from '@reown/appkit-common';

// Stacks Mainnet
export const stacksMainnet: CaipNetwork = {
  id: 1,
  chainNamespace: 'stacks',
  name: 'Stacks',
  rpcUrls: {
    default: {
      http: ['https://api.mainnet.hiro.so']
    }
  },
  caipNetworkId: 'stacks:1',
  nativeCurrency: {
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
  },
  blockExplorers: {
    default: {
      name: 'Hiro Explorer',
      url: 'https://explorer.hiro.so',
    },
  },
  contracts: {},
  sourceId: 1,
};

// Stacks Testnet
export const stacksTestnet: CaipNetwork = {
  id: 2147483648, // 0x80000000 in decimal
  chainNamespace: 'stacks',
  name: 'Stacks Testnet',
  rpcUrls: {
    default: {
      http: ['https://api.testnet.hiro.so']
    }
  },
  caipNetworkId: 'stacks:2147483648',
  nativeCurrency: {
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
  },
  blockExplorers: {
    default: {
      name: 'Hiro Explorer',
      url: 'https://explorer.hiro.so/?chain=testnet',
    },
  },
  contracts: {},
  sourceId: 2147483648,
};

export const stacksNetworks = [stacksMainnet, stacksTestnet];
