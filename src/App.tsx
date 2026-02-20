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
  
  // Sprawdź stan sesji tylko przy pierwszym załadowaniu
  useEffect(() => {
    setIsAuthenticated(userSession.isUserSignedIn());
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'StacksClickAndShip',
        icon: window.location.origin + '/vite.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        console.log('✅ Wallet connected - checking auth state...');
        // Sprawdź czy użytkownik jest rzeczywiście zalogowany
        setTimeout(() => {
          const isSignedIn = userSession.isUserSignedIn();
          console.log('🔍 User signed in:', isSignedIn);
          if (isSignedIn) {
            setIsAuthenticated(true);
            const userData = userSession.loadUserData();
            console.log('👤 User data after connect:', userData);
          }
        }, 100);
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
        <Route path="/getname"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
            />
          }
        />
        <Route path="/deploy"
          element={
            <StacksClickAndShip 
              isAuthenticated={isAuthenticated}
              connectWallet={connectWallet}
              userSession={userSession}
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
              activeTabOverride="mystats"
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
