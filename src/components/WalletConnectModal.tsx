import React from 'react';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface WalletConnectModalProps {
  uri: string;
  onClose: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ uri, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Scan this QR code with your Xverse Wallet app
          </p>
          
          <div className="flex justify-center mb-4">
            <div className="border-4 border-gray-200 rounded-lg p-4 bg-white">
              <QRCodeSVG 
                value={uri} 
                size={300}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600 break-all font-mono">
              {uri}
            </p>
          </div>
          
          <p className="text-sm text-gray-500">
            Or copy the URI and paste it in your wallet
          </p>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(uri);
              alert('URI copied to clipboard!');
            }}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};
