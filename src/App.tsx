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
  
  // Synchronizuj stan po odświeżeniu strony
  useEffect(() => {
    const checkAuth = () => {
      const isSignedIn = userSession.isUserSignedIn();
      if (isSignedIn !== isAuthenticated) {
        console.log('🔄 Synchronizing auth state after refresh:', isSignedIn);
        setIsAuthenticated(isSignedIn);
      }
    };
    
    // Sprawdź przy montowaniu
    checkAuth();
    
    // Sprawdzaj co sekundę (na wypadek zmian w localStorage)
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'StacksClickAndShip',
        icon: window.location.origin + '/vite.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        // Nie odświeżaj strony - tylko zaktualizuj stan
        setIsAuthenticated(true);
      },
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
            />
          }
        />
        <Route 
          path="/getname"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
            />
          }
        />
        <Route path="/learn/:slug" element={<ArticlePage />} />
      </Routes>
    </div>
  );
}

export default App;
