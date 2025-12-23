import React from 'react';
import { useWalletConnect } from '../hooks/useWalletConnect';

/**
 * Przykładowy komponent demonstracyjny pokazujący jak używać WalletConnect
 * w aplikacji Stacks do wywoływania różnych metod JSON-RPC
 */
export function WalletConnectDemo() {
  const {
    isConnected,
    isConnecting,
    accounts,
    connect,
    disconnect,
    getAddresses,
    transferStx,
    signMessage,
    callContract
  } = useWalletConnect();

  const [status, setStatus] = React.useState<string>('');
  const [result, setResult] = React.useState<any>(null);

  // Przykład 1: Połączenie portfela
  const handleConnect = async () => {
    try {
      setStatus('Łączenie z WalletConnect...');
      await connect();
      setStatus('Połączono!');
    } catch (error) {
      setStatus(`Błąd: ${error}`);
    }
  };

  // Przykład 2: Pobranie adresów
  const handleGetAddresses = async () => {
    try {
      setStatus('Pobieranie adresów...');
      const addresses = await getAddresses();
      setResult(addresses);
      setStatus('Adresy pobrane!');
    } catch (error) {
      setStatus(`Błąd: ${error}`);
    }
  };

  // Przykład 3: Transfer STX
  const handleTransfer = async () => {
    if (!accounts[0]) return;
    
    const address = accounts[0].split(':').pop() || '';
    
    try {
      setStatus('Wysyłanie transakcji...');
      const result = await transferStx({
        sender: address,
        recipient: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR', // przykładowy adres
        amount: '100000', // 0.1 STX
        memo: 'Test transfer via WalletConnect',
        network: 'mainnet'
      });
      setResult(result);
      setStatus('Transfer wysłany!');
    } catch (error) {
      setStatus(`Błąd: ${error}`);
    }
  };

  // Przykład 4: Podpisanie wiadomości
  const handleSignMessage = async () => {
    if (!accounts[0]) return;
    
    const address = accounts[0].split(':').pop() || '';
    
    try {
      setStatus('Podpisywanie wiadomości...');
      const result = await signMessage({
        address,
        message: 'Hello from WalletConnect!',
        messageType: 'utf8',
        network: 'mainnet'
      });
      setResult(result);
      setStatus('Wiadomość podpisana!');
    } catch (error) {
      setStatus(`Błąd: ${error}`);
    }
  };

  // Przykład 5: Wywołanie smart contract (GM)
  const handleCallGMContract = async () => {
    try {
      setStatus('Wywoływanie kontraktu GM...');
      const result = await callContract({
        contract: 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86.gm-unlimited-cl4',
        functionName: 'say-gm',
        functionArgs: []
      });
      setResult(result);
      setStatus('GM wysłane!');
    } catch (error) {
      setStatus(`Błąd: ${error}`);
    }
  };

  // Przykład 6: Wywołanie kontraktu z argumentami (Post Message)
  const handlePostMessage = async () => {
    try {
      setStatus('Wysyłanie wiadomości...');
      const result = await callContract({
        contract: 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86.postMessage-cl4',
        functionName: 'post-message',
        functionArgs: ['Hello from WalletConnect!'] // argument jako string
      });
      setResult(result);
      setStatus('Wiadomość wysłana!');
    } catch (error) {
      setStatus(`Błąd: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">WalletConnect Demo - Stacks JSON-RPC</h1>
        
        {/* Status połączenia */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status połączenia</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Status:</span>{' '}
              {isConnecting ? (
                <span className="text-yellow-600">Łączenie...</span>
              ) : isConnected ? (
                <span className="text-green-600">Połączono ✓</span>
              ) : (
                <span className="text-gray-600">Rozłączono</span>
              )}
            </p>
            {accounts.length > 0 && (
              <p>
                <span className="font-medium">Konta:</span>{' '}
                {accounts.map((acc, i) => (
                  <code key={i} className="block text-sm bg-gray-100 p-2 rounded mt-1">
                    {acc}
                  </code>
                ))}
              </p>
            )}
          </div>
          
          <div className="mt-4 flex gap-2">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
              >
                {isConnecting ? 'Łączenie...' : 'Połącz WalletConnect'}
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Rozłącz
              </button>
            )}
          </div>
        </div>

        {/* Przyciski akcji */}
        {isConnected && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Dostępne akcje</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGetAddresses}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                1. Pobierz adresy
              </button>
              <button
                onClick={handleTransfer}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
              >
                2. Transfer STX
              </button>
              <button
                onClick={handleSignMessage}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                3. Podpisz wiadomość
              </button>
              <button
                onClick={handleCallGMContract}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
              >
                4. Wywołaj kontrakt GM
              </button>
              <button
                onClick={handlePostMessage}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg col-span-2"
              >
                5. Wyślij wiadomość (Post Message)
              </button>
            </div>
          </div>
        )}

        {/* Status i rezultat */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Status i rezultat</h2>
          
          {status && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">{status}</p>
            </div>
          )}
          
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Instrukcje */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-2">📝 Instrukcje</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Kliknij "Połącz WalletConnect" i zeskanuj kod QR w Xverse Wallet</li>
            <li>Po połączeniu możesz testować różne metody JSON-RPC</li>
            <li>Każda akcja wymaga potwierdzenia w portfelu</li>
            <li>Rezultaty pojawią się w sekcji "Status i rezultat"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
