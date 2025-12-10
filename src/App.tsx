import { useState } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import StacksClickAndShip from './components/StacksClickAndShip';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(userSession.isUserSignedIn());

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'StacksClickAndShip',
        icon: window.location.origin + '/vite.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        setIsAuthenticated(true);
        window.location.reload();
      },
      userSession,
    });
  };

  return (
    <div className="App">
      <StacksClickAndShip 
        isAuthenticated={isAuthenticated}
        connectWallet={connectWallet}
        userSession={userSession}
      />
    </div>
  );
}

export default App;
