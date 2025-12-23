# Konfiguracja WalletConnect dla Stacks

## 🚀 Szybki start

### 1. Uzyskaj WalletConnect Project ID

1. Przejdź do https://cloud.walletconnect.com
2. Zarejestruj się lub zaloguj
3. Utwórz nowy projekt
4. Skopiuj **Project ID**

### 2. Skonfiguruj zmienne środowiskowe

Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```

Następnie edytuj `.env` i wstaw swój Project ID:
```
VITE_WALLETCONNECT_PROJECT_ID=twoj-project-id-tutaj
```

### 3. Uruchom aplikację

```bash
npm run dev
```

## 📱 Testowanie

### Metoda 1: Xverse Wallet (Mobile) - REKOMENDOWANA
1. Zainstaluj [Xverse Wallet](https://www.xverse.app/) na telefonie (iOS/Android)
2. W aplikacji webowej kliknij przycisk **"WalletConnect"**
3. Zeskanuj kod QR telefonem z Xverse Wallet
4. Zatwierdź połączenie w aplikacji
5. Gotowe! Możesz teraz używać wszystkich funkcji dApp przez WalletConnect

### Metoda 2: Xverse Desktop Extension
1. Zainstaluj rozszerzenie Xverse do przeglądarki
2. Kliknij "WalletConnect" i skopiuj URI
3. W Xverse Desktop użyj opcji "Połącz przez WalletConnect"
4. Wklej URI

## 🎯 Implementacja w komponencie

### Podstawowy przykład

```typescript
import { useWalletConnect } from '../hooks';

function MyComponent() {
  const {
    isConnected,
    connect,
    disconnect,
    callContract
  } = useWalletConnect();

  const handleGM = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    const result = await callContract({
      contract: 'SP...gm-contract',
      functionName: 'say-gm',
      functionArgs: []
    });
    
    console.log('GM sent!', result.txid);
  };

  return (
    <button onClick={handleGM}>
      {isConnected ? 'Say GM' : 'Connect'}
    </button>
  );
}
```

### Zaawansowany przykład z obsługą błędów

```typescript
import { useWalletConnect } from '../hooks';

function AdvancedComponent() {
  const {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    transferStx
  } = useWalletConnect();
  
  const [error, setError] = React.useState<string | null>(null);

  const handleTransfer = async () => {
    try {
      setError(null);
      
      if (!isConnected) {
        await connect();
        return;
      }

      const result = await transferStx({
        sender: 'SP...',
        recipient: 'SP...',
        amount: '1000000', // 1 STX
        memo: 'Payment',
        network: 'mainnet'
      });
      
      console.log('Transfer successful:', result.txid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleTransfer} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : isConnected ? 'Send STX' : 'Connect'}
      </button>
      {isConnected && (
        <button onClick={disconnect}>Disconnect</button>
      )}
    </div>
  );
}
```

## 📚 Dostępne metody Stacks JSON-RPC

### `stx_getAddresses`
Pobiera adresy konta:
```typescript
const addresses = await getAddresses();
console.log(addresses); 
// [{ symbol: 'STX', address: 'SP...' }]
```

### `stx_transferStx`
Transferuje STX:
```typescript
const result = await transferStx({
  sender: 'SP...',
  recipient: 'SP...',
  amount: '1000000', // 1 STX w micro-STX (1 STX = 1,000,000 uSTX)
  memo: 'Hello!',
  network: 'mainnet'
});
console.log('Transaction ID:', result.txid);
```

### `stx_signTransaction`
Podpisuje transakcję:
```typescript
const result = await signTransaction({
  transaction: '0x...', // hex-encoded transaction
  broadcast: true, // czy wysłać od razu do sieci
  network: 'mainnet'
});
console.log('Signature:', result.signature);
if (result.txid) {
  console.log('Transaction ID:', result.txid);
}
```

### `stx_signMessage`
Podpisuje wiadomość:
```typescript
const result = await signMessage({
  address: 'SP...',
  message: 'Hello World',
  messageType: 'utf8', // 'utf8' | 'structured'
  network: 'mainnet',
  domain: 'example.com' // opcjonalne, dla SIP-018
});
console.log('Signature:', result.signature);
```

### `stx_signStructuredMessage`
Podpisuje strukturalną wiadomość (SIP-018):
```typescript
const result = await signStructuredMessage({
  message: {
    // struktura wiadomości
  },
  domain: {
    name: 'My dApp',
    version: '1.0.0',
    chainId: 1
  }
});
console.log('Signature:', result.signature);
console.log('Public Key:', result.publicKey); // opcjonalne
```

### `stx_callContract`
Wywołuje smart contract:
```typescript
const result = await callContract({
  contract: 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86.gm-unlimited-cl4',
  functionName: 'say-gm',
  functionArgs: [] // argumenty jako stringi
});
console.log('Transaction ID:', result.txid);
console.log('Raw transaction:', result.transaction);
```

## 🧪 Komponent demonstracyjny

Został utworzony komponent `WalletConnectDemo.tsx` w `src/components/`, który demonstruje wszystkie funkcjonalności WalletConnect:

```bash
# Dodaj route w swojej aplikacji, np.:
import { WalletConnectDemo } from './components/WalletConnectDemo';

// W routes:
<Route path="/wc-demo" element={<WalletConnectDemo />} />
```

## ⚙️ Konfiguracja

### Testnet vs Mainnet

Edytuj `src/hooks/useWalletConnect.ts`:

```typescript
// Mainnet
const STACKS_CHAIN_ID = 'stacks:1';

// Testnet
const STACKS_CHAIN_ID = 'stacks:2147483648';
```

### Dodatkowe opcje

Hook `useWalletConnect` zwraca:

| Właściwość | Typ | Opis |
|-----------|------|------|
| `isConnected` | `boolean` | Czy portfel jest połączony |
| `isConnecting` | `boolean` | Czy trwa proces łączenia |
| `uri` | `string` | URI do QR code (podczas łączenia) |
| `accounts` | `string[]` | Lista połączonych kont |
| `session` | `SessionTypes.Struct \| null` | Aktywna sesja WalletConnect |
| `connect()` | `() => Promise<void>` | Inicjuje połączenie |
| `disconnect()` | `() => Promise<void>` | Rozłącza portfel |
| `getAddresses()` | `() => Promise<StxAddress[]>` | Pobiera adresy |
| `transferStx()` | `(params) => Promise<{txid, transaction}>` | Transferuje STX |
| `signTransaction()` | `(params) => Promise<{signature, transaction, txid?}>` | Podpisuje transakcję |
| `signMessage()` | `(params) => Promise<{signature}>` | Podpisuje wiadomość |
| `signStructuredMessage()` | `(params) => Promise<{signature, publicKey?}>` | Podpisuje strukturalną wiadomość |
| `callContract()` | `(params) => Promise<{txid, transaction}>` | Wywołuje kontrakt |

## ⚠️ Uwagi i ograniczenia

1. **Kompatybilność portfeli**: 
   - ✅ Xverse Wallet (Mobile & Desktop) - pełne wsparcie
   - ❌ Hiro Wallet - nie wspiera WalletConnect natywnie
   - ❌ Leather Wallet - obecnie brak wsparcia

2. **Bezpieczeństwo**: 
   - Nigdy nie commituj `.env` do repo
   - Używaj tylko zaufanych Project ID z WalletConnect Cloud
   - Zawsze weryfikuj adresy przed transferami

3. **Session Management**:
   - Sesje są automatycznie zapisywane w localStorage
   - Hook automatycznie przywraca ostatnią sesję przy odświeżeniu strony
   - Użyj `disconnect()` aby wyczyścić sesję

4. **Rate Limiting**:
   - WalletConnect Cloud ma limity requestów
   - W aplikacjach produkcyjnych rozważ plan płatny

5. **Network Support**:
   - Mainnet: `stacks:1`
   - Testnet: `stacks:2147483648`
   - Devnet: obecnie nieobsługiwany przez WalletConnect

## 🐛 Troubleshooting

### Błąd: "SignClient not initialized"
**Rozwiązanie**: Upewnij się, że masz poprawny Project ID w `.env`

### Błąd: "No active session"
**Rozwiązanie**: Wywołaj `connect()` przed użyciem metod JSON-RPC

### QR Code nie pojawia się
**Rozwiązanie**: 
1. Sprawdź czy biblioteka `qrcode.react` jest zainstalowana
2. Sprawdź console na błędy
3. Upewnij się że modal jest renderowany

### Transakcje nie są broadcastowane
**Rozwiązanie**: W metodzie `signTransaction` ustaw `broadcast: true`

### Portfel się nie łączy
**Rozwiązanie**:
1. Sprawdź czy Xverse Wallet jest zaktualizowany
2. Spróbuj ponownie zeskanować QR code
3. Sprawdź połączenie internetowe
4. Zrestartuj aplikację Xverse

## 📦 Zależności

Projekt używa następujących pakietów WalletConnect:

```json
{
  "@walletconnect/sign-client": "^2.x.x",
  "@walletconnect/types": "^2.x.x",
  "@walletconnect/utils": "^2.x.x",
  "qrcode.react": "^3.x.x"
}
```

## 📖 Dodatkowe zasoby

- [WalletConnect Docs](https://docs.walletconnect.com/)
- [Stacks Docs](https://docs.stacks.co/)
- [Xverse Wallet](https://www.xverse.app/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Stacks JSON-RPC Methods](https://docs.walletconnect.com/web3wallet/verify)

## Uwagi

1. **Testnet vs Mainnet**: Zmień `STACKS_CHAIN_ID` w `useWalletConnect.ts`:
   - Mainnet: `'stacks:1'`
   - Testnet: `'stacks:2147483648'`

2. **Kompatybilność**: WalletConnect dla Stacks działa głównie z Xverse Wallet. Hiro Wallet nie wspiera natywnie WalletConnect.

3. **Bezpieczeństwo**: Nigdy nie commituj Project ID do repozytorium publicznego. Używaj zmiennych środowiskowych:
   ```typescript
   const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
   ```

4. **Session Properties**: Hook automatycznie zapisuje adresy w session properties zgodnie z dokumentacją WalletConnect.
