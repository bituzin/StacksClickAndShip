# 🪙 AppKit z Bitcoin - Instrukcja Użycia

## ✅ Co zostało naprawione:

### 1. **Poprawna konfiguracja sieci Bitcoin**
Wcześniej używałeś ręcznie zdefiniowanych sieci, które nie były kompatybilne z AppKit.

**Przed (❌ nie działało):**
```typescript
const networks = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    currency: 'BTC',
    explorerUrl: 'https://blockstream.info',
    rpcUrl: 'https://blockstream.info/api'
  }
];
```

**Teraz (✅ działa):**
```typescript
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks';

const networks = [bitcoin, bitcoinTestnet];
```

### 2. **Poprawna inicjalizacja BitcoinAdapter**
Adapter teraz otrzymuje prawidłową konfigurację sieci.

```typescript
const bitcoinAdapter = new BitcoinAdapter({
  networks  // Przekazujemy oficjalne definicje sieci
});
```

### 3. **Prawidłowe metadane**
AppKit teraz poprawnie wyświetla informacje o aplikacji w modalu.

## 🚀 Jak używać:

### 1. Połączenie z portfelem Bitcoin

W komponencie używasz hooka `useAppKit`:

```typescript
import { useAppKit } from '@reown/appkit/react';

const { open } = useAppKit();

// Otwórz modal AppKit
<button onClick={() => open()}>
  🪙 Connect Bitcoin Wallet
</button>
```

### 2. Wspierane portfele Bitcoin:

- **Xverse Wallet** ⭐ (najpopularniejszy dla Bitcoin + Stacks)
- **Leather Wallet** (dawniej Hiro Wallet)
- **Unisat**
- **OKX Wallet**
- I wiele innych przez WalletConnect

### 3. Połączenie przez QR Code (Mobile):

1. Kliknij przycisk "Connect Bitcoin Wallet"
2. Pojawi się modal AppKit z kodem QR
3. Zeskanuj kod w aplikacji portfela (np. Xverse)
4. Potwierdź połączenie w aplikacji
5. Gotowe! 🎉

### 4. Połączenie przez przeglądarkę (Desktop):

1. Kliknij przycisk "Connect Bitcoin Wallet"
2. Wybierz portfel z listy (jeśli masz zainstalowany)
3. Potwierdź połączenie w rozszerzeniu przeglądarki

## 🔧 Konfiguracja (już zrobione):

```typescript
// src/config/appkit.ts
import { createAppKit } from '@reown/appkit/react';
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin';
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks';

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

const networks = [bitcoin, bitcoinTestnet];

const bitcoinAdapter = new BitcoinAdapter({
  networks
});

export const modal = createAppKit({
  adapters: [bitcoinAdapter],
  networks: networks as any,
  projectId,
  metadata: {
    name: 'Stacks Click & Ship',
    description: 'Your Stacks blockchain toolkit',
    url: window.location.origin,
    icons: [window.location.origin + '/vite.svg']
  },
  features: {
    analytics: true,
    email: false,
    socials: [],
    swaps: false,
    onramp: false
  }
});
```

## ⚠️ Ważne:

### Project ID
Upewnij się, że masz ustawiony `VITE_REOWN_PROJECT_ID` w pliku `.env`:

```bash
VITE_REOWN_PROJECT_ID=twój_project_id_z_cloud.reown.com
```

Jeśli nie masz Project ID:
1. Idź na: https://cloud.reown.com
2. Zarejestruj się / zaloguj
3. Utwórz nowy projekt
4. Skopiuj Project ID
5. Wklej do `.env`
6. **Zrestartuj serwer deweloperski** (`npm run dev`)

## 🎯 Różnice między Bitcoin a Stacks:

| Funkcja | Bitcoin (AppKit) | Stacks (@stacks/connect) |
|---------|------------------|--------------------------|
| Połączenie | ✅ AppKit Modal | ✅ @stacks/connect |
| QR Code Mobile | ✅ Tak | ✅ Tak |
| Desktop Extension | ✅ Tak | ✅ Tak |
| Smart Contracts | ❌ Nie | ✅ Tak (Clarity) |
| Transakcje | ✅ BTC transfer | ✅ STX + kontrakty |
| Wspierane portfele | Więcej | Xverse, Leather |

## 💡 Dlaczego wcześniej nie działało:

1. **Brak oficjalnych definicji sieci** - używałeś ręcznie zdefiniowanych obiektów
2. **Nieprawidłowy format caipNetworkId** - Bitcoin wymaga specyficznego formatu
3. **Brak przekazania networks do adaptera** - adapter nie wiedział jakie sieci obsługiwać

Teraz wszystko jest poprawnie skonfigurowane i powinno działać! 🚀

## 🔍 Testowanie:

```bash
# Uruchom serwer deweloperski
npm run dev

# Otwórz w przeglądarce
http://localhost:5173

# Kliknij przycisk "🌐 AppKit (Multi-Chain)"
# Powinieneś zobaczyć modal z opcjami połączenia Bitcoin
```

## 📚 Dokumentacja:

- AppKit + Bitcoin: https://docs.reown.com/appkit/react/core/multichain
- BitcoinAdapter API: https://docs.reown.com/appkit/features/multichain
- WalletConnect Bitcoin: https://walletconnect.com/

---

**Pytania?** Sprawdź console w przeglądarce (F12) - AppKit loguje wszystkie akcje.
