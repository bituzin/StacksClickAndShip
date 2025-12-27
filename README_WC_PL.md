# WalletConnect dla Stacks - Szybki Przewodnik 🇵🇱

## ✅ Co zostało zaimplementowane

Pełna integracja WalletConnect z metodami Stacks JSON-RPC zgodnie z dokumentacją:

### 🔧 Zaimplementowane komponenty:

1. **Hook `useWalletConnect`** (`src/hooks/useWalletConnect.ts`)
   - Automatyczna inicjalizacja klienta WalletConnect
   - Zarządzanie sesjami
   - Wszystkie 6 metod JSON-RPC dla Stacks

2. **Komponent `WalletConnectModal`** (`src/components/WalletConnectModal.tsx`)
   - Modal z kodem QR do skanowania
   - Możliwość skopiowania URI
   - Responsywny design

3. **Integracja w `StacksClickAndShip`** 
   - Przycisk "WalletConnect" obok "Connect Wallet"
   - Obsługa połączenia/rozłączenia
   - Automatyczna aktualizacja adresu użytkownika

4. **Komponent demonstracyjny** (`src/components/WalletConnectDemo.tsx`)
   - Przykłady użycia wszystkich metod
   - Gotowe do testowania funkcje

### 📋 Zaimplementowane metody JSON-RPC:

✅ `stx_getAddresses` - pobieranie adresów  
✅ `stx_transferStx` - transfer STX  
✅ `stx_signTransaction` - podpisywanie transakcji  
✅ `stx_signMessage` - podpisywanie wiadomości  
✅ `stx_signStructuredMessage` - podpisywanie strukturalnych wiadomości (SIP-018)  
✅ `stx_callContract` - wywoływanie smart contractów  

## 🚀 Jak uruchomić
```

### 2. Uzyskaj Project ID z WalletConnect Cloud
1. Zarejestruj się na https://cloud.walletconnect.com
2. Utwórz nowy projekt
3. Skopiuj Project ID

### 3. Skonfiguruj zmienne środowiskowe
Utwórz plik `.env` (skopiuj z `.env.example`):
```bash
cp .env.example .env
```

Edytuj `.env` i wstaw swój Project ID:
```
VITE_WALLETCONNECT_PROJECT_ID=twoj-project-id-tutaj
```

### 4. Uruchom aplikację
```bash
npm run dev
```

### 5. Testuj z Xverse Wallet
1. Zainstaluj Xverse Wallet na telefonie (https://www.xverse.app/)
2. Otwórz aplikację webową
3. Kliknij przycisk **"WalletConnect"** (niebieski, obok "Connect Wallet")
4. Zeskanuj kod QR w aplikacji Xverse
5. Zatwierdź połączenie
6. Gotowe! Możesz używać wszystkich funkcji dApp

## 📱 Jak to działa

### Połączenie portfela
1. Kliknij "WalletConnect"
2. Pojawi się modal z QR code
3. Zeskanuj w Xverse Wallet
4. Potwierdź w aplikacji
5. Modal się zamknie, przycisk pokaże "✓ WalletConnect"

### Korzystanie z funkcji
Po połączeniu wszystkie funkcje dApp (GM, Post Message, Vote) będą działać przez WalletConnect:
- Każda akcja wymaga potwierdzenia w portfelu
- Transakcje są automatycznie wysyłane do sieci
- Rezultaty są pokazywane w aplikacji

### Rozłączenie
Kliknij "Disconnect WC" w prawym górnym rogu

## 📖 Dokumentacja

Pełna dokumentacja znajduje się w pliku:
- **WALLETCONNECT_SETUP.md** - szczegółowe instrukcje, API, przykłady kodu

## 🎯 Przykład użycia w kodzie

```typescript
import { useWalletConnect } from '../hooks';

function MojKomponent() {
  const {
    isConnected,
    connect,
    callContract
  } = useWalletConnect();

  const handleGM = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    const result = await callContract({
      contract: 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86.gm-unlimited-cl4',
      functionName: 'say-gm',
      functionArgs: []
    });
    
    console.log('GM wysłane!', result.txid);
  };

  return (
    <button onClick={handleGM}>
      {isConnected ? 'Wyślij GM' : 'Połącz WalletConnect'}
    </button>
  );
}
```

## ⚠️ Ważne uwagi

1. **Project ID jest wymagany** - bez niego WalletConnect nie będzie działać
2. **Tylko Xverse Wallet** - Hiro Wallet nie wspiera WalletConnect
3. **Mainnet domyślnie** - jeśli chcesz testnet, zmień `STACKS_CHAIN_ID` w hooku
4. **Sesje są zapisywane** - przy odświeżeniu strony sesja zostanie przywrócona

## 🐛 Problemy?

### "SignClient not initialized"
→ Sprawdź czy masz Project ID w `.env`

### Kod QR się nie pokazuje
→ Sprawdź czy biblioteka `qrcode.react` jest zainstalowana

### Portfel się nie łączy
→ Upewnij się że Xverse jest zaktualizowany i masz internet

## 📦 Pliki projektu

```
src/
├── hooks/
│   ├── useWalletConnect.ts       # Hook WalletConnect
│   └── index.ts                   # Export hooka
├── components/
│   ├── WalletConnectModal.tsx    # Modal z QR code
│   ├── WalletConnectDemo.tsx     # Komponent demo
│   └── StacksClickAndShip.tsx    # Główny komponent (zaktualizowany)
.env.example                       # Przykładowa konfiguracja
WALLETCONNECT_SETUP.md             # Pełna dokumentacja (EN)
README_WC_PL.md                    # Ten plik
``
