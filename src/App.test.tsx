import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Wallet modal behavior', () => {
  it('nie wywołuje portfela automatycznie po odświeżeniu', () => {
    render(<App />);
    // Sprawdzamy, że przycisk "Connect Stack/Btc Wallet" jest widoczny
    expect(screen.getByText(/connect stack\/btc wallet/i)).toBeInTheDocument();
    // Nie powinno być żadnego modala związanego z portfelem
    expect(screen.queryByText(/connect your wallet/i)).not.toBeInTheDocument();
  });

  it('wywołuje portfel dopiero po kliknięciu', async () => {
    render(<App />);
    const btn = screen.getByText(/connect stack\/btc wallet/i);
    await userEvent.click(btn);
    // Tutaj możesz sprawdzić, czy pojawił się modal (jeśli masz unikalny tekst lub element)
    // Np. expect(screen.getByText(/choose wallet/i)).toBeInTheDocument();
  });
});
