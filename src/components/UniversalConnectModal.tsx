import React, { useState, useEffect } from 'react';
import { X, Smartphone, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface UniversalConnectModalProps {
  onClose: () => void;
  onConnectHiro: () => void;
  onConnectXverseExtension: () => void;
  onConnectWalletConnect: () => Promise<void>;
  wcUri: string;
  wcIsConnecting: boolean;
}

export const UniversalConnectModal: React.FC<UniversalConnectModalProps> = ({
  onClose,
  onConnectHiro,
  onConnectXverseExtension,
  onConnectWalletConnect,
  wcUri,
  wcIsConnecting
}) => {
  const [hasHiro, setHasHiro] = useState(false);
  const [hasXverse, setHasXverse] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Detect installed wallets
  useEffect(() => {
    // Check for Hiro Wallet (Stacks wallet)
    if (typeof window !== 'undefined' && (window as any).StacksProvider) {
      setHasHiro(true);
    }

    // Check for Xverse extension
    if (typeof window !== 'undefined' && (window as any).XverseProviders) {
      setHasXverse(true);
    }
  }, []);

  // Auto-close modal when WalletConnect stops connecting (connection completed or failed)
  useEffect(() => {
    if (showQR && !wcIsConnecting && wcUri === '') {
      // Connection completed - close modal after brief delay
      const timer = setTimeout(() => {
        onClose();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showQR, wcIsConnecting, wcUri, onClose]);

  const handleWalletConnect = async () => {
    setShowQR(true);
    await onConnectWalletConnect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showQR ? (
            <div className="space-y-3">
              <p className="text-gray-600 text-center mb-4">
                Choose your preferred connection method
              </p>

              {/* Desktop Wallets Section */}
              {(hasHiro || hasXverse) && (
                <>
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Desktop Wallets
                  </div>

                  {hasHiro && (
                    <button
                      onClick={() => {
                        onConnectHiro();
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                    >
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Wallet size={20} className="text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-gray-800">Hiro Wallet</div>
                        <div className="text-sm text-gray-500">Browser Extension</div>
                      </div>
                    </button>
                  )}

                  {hasXverse && (
                    <button
                      onClick={() => {
                        onConnectXverseExtension();
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Wallet size={20} className="text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-gray-800">Xverse Wallet</div>
                        <div className="text-sm text-gray-500">Browser Extension</div>
                      </div>
                    </button>
                  )}

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                </>
              )}

              {/* Mobile Wallets Section */}
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Mobile Wallets
              </div>

              <button
                onClick={handleWalletConnect}
                disabled={wcIsConnecting}
                className="w-full flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Smartphone size={20} className="text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-800">
                    {wcIsConnecting ? 'Connecting...' : 'WalletConnect'}
                  </div>
                  <div className="text-sm text-gray-500">Scan with mobile app</div>
                </div>
              </button>

              {/* Info */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>New to Stacks?</strong><br />
                  Install <a href="https://wallet.hiro.so" target="_blank" rel="noopener noreferrer" className="underline">Hiro Wallet</a> or <a href="https://www.xverse.app" target="_blank" rel="noopener noreferrer" className="underline">Xverse</a>
                </p>
              </div>
            </div>
          ) : (
            // QR Code View
            <div className="space-y-4">
              <button
                onClick={() => setShowQR(false)}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                ← Back to wallet selection
              </button>

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Scan this QR code with Xverse mobile app
                </p>
                
                {wcUri ? (
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="border-4 border-gray-200 rounded-lg p-4 bg-white">
                        <QRCodeSVG 
                          value={wcUri} 
                          size={280}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-600 break-all font-mono">
                        {wcUri}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(wcUri);
                        alert('URI copied to clipboard!');
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      Copy URI
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}

                <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Don't have Xverse?</strong><br />
                    Download from <a href="https://www.xverse.app" target="_blank" rel="noopener noreferrer" className="underline">xverse.app</a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
