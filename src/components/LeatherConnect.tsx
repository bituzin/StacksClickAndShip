import React from 'react';

export async function leatherConnect() {
  if (typeof window === 'undefined' || !(window as any).LeatherProvider) {
    alert('Leather Wallet extension is not installed or not detected.');
    return;
  }
  try {
    const provider = (window as any).LeatherProvider;
    const addresses = await provider.request('getAddresses');
    // You can use addresses.stx or addresses.btc
    return addresses;
  } catch (e) {
    alert('Failed to connect to Leather Wallet.');
    console.error(e);
    return null;
  }
}

export default function LeatherConnectButton({ onConnect }: { onConnect: (addresses: any) => void }) {
  return (
    <button
      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full mb-2"
      onClick={async () => {
        const addresses = await leatherConnect();
        if (addresses) onConnect(addresses);
      }}
    >
      Connect with Leather
    </button>
  );
}
