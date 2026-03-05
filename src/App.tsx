import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import StacksClickAndShip from './components/StacksClickAndShip';
import ArticlePage from './components/ArticlePage';
import './config/appkit'; // Initialize AppKit

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(userSession.isUserSignedIn());
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  
  // Sprawdź stan sesji tylko przy pierwszym załadowaniu
  useEffect(() => {
    const signedIn = userSession.isUserSignedIn();
    setIsAuthenticated(signedIn);
    if (signedIn) {
      try {
        const userData = userSession.loadUserData();
        const addr = userData?.profile?.stxAddress?.mainnet || userData?.identityAddress || null;
        setConnectedAddress(addr);
      } catch (_e) {}
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'StacksClickAndShip',
        icon: window.location.origin + '/vite.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        // @stacks/connect calls handlePendingSignIn before onFinish,
        // so loadUserData() here returns the freshly selected account
        const data = userSession.loadUserData();
        const addr = data?.profile?.stxAddress?.mainnet || data?.identityAddress || null;
        setConnectedAddress(addr);
        setIsAuthenticated(true);
      },
      onCancel: () => {},
      userSession,
    });
  };

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
              connectedAddress={connectedAddress}
            />
          }
        />
        <Route 
          path="/gm"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
              connectedAddress={connectedAddress}
            />
          }
        />
        <Route 
          path="/message"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
              connectedAddress={connectedAddress}
            />
          }
        />
        <Route 
          path="/vote"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
              connectedAddress={connectedAddress}
            />
          }
        />
        <Route 
          path="/learn"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
              connectedAddress={connectedAddress}
            />
          }
        />
        <Route path="/getname"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
              connectedAddress={connectedAddress}
            />
          }
        />
        <Route path="/deploy"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
              connectedAddress={connectedAddress}
            />
          }
        />
        <Route path="/learn/:slug" element={<ArticlePage />} />
        <Route path="/mystats"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
              connectedAddress={connectedAddress}
              activeTabOverride="mystats"
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
