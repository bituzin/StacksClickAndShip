# StacksClickAndShip 🚀

Kompletna aplikacja na blockchain Stacks z funkcjami: GM broadcaster, message board, contract deployer i edukacja.

## 🎯 Funkcje

- **GM Broadcaster** - Wysyłaj powitania on-chain i buduj swoją passę
- **Message Board** - Publikuj niezmienne wiadomości na blockchainie
- **Contract Deployer** - Wdrażaj smart contracty w Clarity
- **Learn Section** - Interaktywne tutoriale i dokumentacja

## 🛠️ Technologie

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Stacks.js (@stacks/connect, @stacks/transactions)
- Lucide React (ikony)

## 📦 Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

2. Skopiuj plik środowiskowy:
```bash
copy .env.example .env
```

3. Uruchom aplikację deweloperską:
```bash
npm run dev
```

Aplikacja uruchomi się na `http://localhost:3000`

## 🔧 Dostępne Komendy

- `npm run dev` - Uruchomienie serwera deweloperskiego
- `npm run build` - Budowanie aplikacji produkcyjnej
- `npm run preview` - Podgląd zbudowanej aplikacji
- `npm run lint` - Sprawdzanie kodu

## 🌐 Konfiguracja Sieci

Domyślnie aplikacja jest skonfigurowana dla **Stacks Testnet**. 

Możesz zmienić to w pliku `.env`:
- `VITE_STACKS_NETWORK` - testnet lub mainnet
- `VITE_STACKS_API_URL` - URL API Stacks

## 📝 Jak używać

1. **Połącz portfel** - Kliknij "Connect Wallet" aby połączyć portfel Stacks (Hiro Wallet, Xverse)
2. **Say GM** - Wyślij powitanie on-chain i buduj swoją passę
3. **Post Messages** - Publikuj wiadomości na blockchainie
4. **Deploy Contracts** - Wdróż smart contract w języku Clarity
5. **Learn** - Ucz się o Stacks i Bitcoin Layer 2

## 🔗 Przydatne Linki

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language](https://docs.stacks.co/clarity/)
- [Stacks Explorer](https://explorer.stacks.co/)
- [Hiro Wallet](https://wallet.hiro.so/)

## 📄 Licencja

MIT

## 🤝 Wsparcie

Masz pytania? Otwórz issue na GitHubie!

---

Built with ❤️ for Stacks ecosystem
