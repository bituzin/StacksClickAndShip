# 🔧 INSTRUKCJA NAPRAWY - WalletConnect

## ✅ Co zostało naprawione:

### 1. **Błąd "Unauthorized: invalid key"**
- Dodano walidację Project ID
- Hook pokazuje czytelny alert jeśli Project ID nie jest ustawiony
- Dodano singleton pattern aby zapobiec wielokrotnej inicjalizacji

### 2. **"WalletConnect Core is already initialized"**
- Zaimplementowano singleton pattern dla SignClient
- Hook inicjalizuje się tylko raz
- Ponowne użycie hooka używa tej samej instancji

### 3. **"requiredNamespaces are deprecated"**
- Zmieniono `requiredNamespaces` na `optionalNamespaces`
- To zgodne z najnowszą wersją WalletConnect

### 4. **Modal nie pokazywał się**
- Dodano automatyczne otwieranie modalu gdy URI jest wygenerowany
- Modal zamyka się automatycznie po połączeniu
- Przycisk blokuje się podczas połączenia

## 🚀 NASTĘPNE KROKI - CO MUSISZ ZROBIĆ:

### KROK 1: Uzyskaj WalletConnect Project ID

1. Idź na: https://cloud.walletconnect.com
2. Zarejestruj się / zaloguj
3. Kliknij **"Create"** lub **"New Project"**
4. Wpisz nazwę projektu (np. "Stacks Click Ship")
5. **SKOPIUJ PROJECT ID** (długi string, np: "a1b2c3d4e5f6...")

### KROK 2: Zaktualizuj plik .env

Plik `.env` został utworzony automatycznie. Teraz edytuj go:

```bash
# Otwórz plik .env w edytorze
notepad .env

# LUB w VS Code
code .env
```

Zamień tę linię:
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Na (wklej swój Project ID):
```
VITE_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6...twoj-prawdziwy-id
```

**Zapisz plik!**

### KROK 3: Zrestartuj serwer deweloperski

**WAŻNE:** Musisz zrestartować Vite, aby załadować nowe zmienne środowiskowe!

```bash
# Zatrzymaj obecny serwer (Ctrl+C w terminalu)
# Następnie uruchom ponownie:
npm run dev
```

### KROK 4: Testuj WalletConnect

1. Odśwież stronę w przeglądarce
2. Kliknij przycisk **"WalletConnect"** (niebieski)
3. Powinien pojawić się modal z kodem QR
4. Zeskanuj kod QR w aplikacji Xverse Wallet (na telefonie)
5. Zatwierdź połączenie w Xverse
6. Modal powinien się zamknąć, a przycisk zmienić na "✓ WalletConnect"

## 🔍 Sprawdzanie czy działa:

### W przeglądarce (Console F12):
- Nie powinno być błędu "Unauthorized: invalid key"
- Powinno pokazać: `WalletConnect URI generated: wc:...`
- Po zeskanowaniu: `WalletConnect session approved: {...}`

### Jeśli wciąż nie działa:

1. **Sprawdź czy zrestartowałeś serwer** - to najczęstszy błąd!
2. **Sprawdź czy Project ID jest poprawny** - bez spacji, bez cudzysłowów
3. **Sprawdź Console** w przeglądarce (F12) - pokaże dokładny błąd
4. **Sprawdź plik .env** - czy zmiany zostały zapisane

## 📱 Wymagania:

- **Xverse Wallet** zainstalowany na telefonie (iOS/Android)
- **Internet** na telefonie i komputerze
- **Project ID** z WalletConnect Cloud (za darmo)

## ⚡ Quick Test:

```bash
# 1. Zatrzymaj serwer (Ctrl+C)
# 2. Sprawdź .env:
cat .env

# Powinno pokazać:
# VITE_WALLETCONNECT_PROJECT_ID=a1b2c3d4... (twój prawdziwy ID)

# 3. Uruchom ponownie:
npm run dev

# 4. Otwórz http://localhost:5173
# 5. Kliknij "WalletConnect"
# 6. Zeskanuj QR code w Xverse
```

## 🎯 Najważniejsze:

1. ✅ **Uzyskaj Project ID z cloud.walletconnect.com**
2. ✅ **Wklej do pliku .env**
3. ✅ **ZRESTARTUJ SERWER** (`npm run dev`)
4. ✅ **Odśwież przeglądarkę**
5. ✅ **Kliknij WalletConnect i zeskanuj QR**

---

**Jeśli nadal nie działa, pokaż mi:**
1. Zawartość pliku `.env` (bez pokazywania pełnego Project ID - tylko pierwsze/ostatnie 4 znaki)
2. Błędy z Console przeglądarki (F12)
3. Terminal output po uruchomieniu `npm run dev`
