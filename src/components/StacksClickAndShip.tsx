import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, MessageSquare, CheckSquare, BookOpen, Home, Mail } from 'lucide-react';
import { UserSession } from '@stacks/connect';
import { openContractCall } from '@stacks/connect';
import { callReadOnlyFunction, cvToString, principalCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

interface StacksClickAndShipProps {
  isAuthenticated: boolean;
  connectWallet: () => void;
  userSession: UserSession;
}

export default function StacksClickAndShip({ 
  isAuthenticated, 
  connectWallet, 
  userSession 
}: StacksClickAndShipProps) {
  const location = useLocation();

  // Determine active tab from pathname
  const path = location.pathname;
  let activeTab: string = 'home';
  if (path.startsWith('/gm')) activeTab = 'gm';
  else if (path.startsWith('/message')) activeTab = 'message';
  else if (path.startsWith('/vote')) activeTab = 'vote';
  else if (path.startsWith('/getname')) activeTab = 'getname';
  else if (path === '/learn') activeTab = 'learn';

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, to: '/' },
    { id: 'gm', label: 'GM', icon: Sun, to: '/gm' },
    { id: 'message', label: 'Post', icon: MessageSquare, to: '/message' },
    { id: 'vote', label: 'Vote', icon: CheckSquare, to: '/vote' },
    { id: 'getname', label: 'Get Your Name', icon: Mail, to: '/getname' },
    { id: 'learn', label: 'Learn', icon: BookOpen, to: '/learn' }
  ];

  // Adres kontraktu gmUnlimited
  // Adres kontraktu do Post Message
  const POST_MESSAGE_CONTRACT_ADDRESS = 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86';
  const POST_MESSAGE_CONTRACT_NAME = 'postMessage-cl4';
  const GMOK_CONTRACT_ADDRESS = 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86';
  const GMOK_CONTRACT_NAME = 'gm-unlimited';
  
  // Adres i nazwa kontraktu get-name-v1
  const GET_NAME_CONTRACT_ADDRESS = 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86';
  const GET_NAME_CONTRACT_NAME = 'get-name-v1';

  // State for GM counts
  const [todayGm, setTodayGm] = React.useState<number | null>(null);
  const [totalGm, setTotalGm] = React.useState<number | null>(null);
  const [userGm, setUserGm] = React.useState<number | null>(null);
  const [userAddress, setUserAddress] = React.useState<string | null>(null);
  // Stan dla popupu z transakcją
  const [txPopup, setTxPopup] = React.useState<{show: boolean, txId: string} | null>(null);
  // Stany dla statystyk Post Message
  const [todayMessages, setTodayMessages] = React.useState<number | null>(null);
  const [totalMessages, setTotalMessages] = React.useState<number | null>(null);
  const [userMessages, setUserMessages] = React.useState<number | null>(null);
  const [recentMessages, setRecentMessages] = React.useState<any[]>([]);
  // Nowe stany do ostatniego GM i leaderboarda
  const [lastGm, setLastGm] = React.useState<{user: string, block: number} | null>(null);
  const [lastGmAgo, setLastGmAgo] = React.useState<string | null>(null);
  const [leaderboard, setLeaderboard] = React.useState<Array<{user: string, total: number}>>([]);
  // Stan dla wpisanej nazwy i wyniku sprawdzenia
  const [inputName, setInputName] = React.useState('');
  const [isAvailable, setIsAvailable] = React.useState<null | boolean>(null);
  // Pobierz ostatni GM i prosty leaderboard (z ostatnich 3 adresów)
  const fetchLastGmAndLeaderboard = React.useCallback(async () => {
    try {
      console.log('Fetching last GM and leaderboard...');
      // Pobierz ostatnie 3 GM
      const res = await callReadOnlyFunction({
        contractAddress: GMOK_CONTRACT_ADDRESS,
        contractName: GMOK_CONTRACT_NAME,
        functionName: 'get-last-three-gms',
        functionArgs: [],
        network: new StacksMainnet(),
        senderAddress: userAddress || 'SP000000000000000000002Q6VF78',
      });
      
      console.log('Raw response from get-last-three-gms:', res);
      console.log('Response value:', (res as any).value);
      console.log('Response value data:', (res as any).value?.data);
      
      const gms = (res as any).value?.data;
      console.log('GMs data:', gms);
      
      if (!gms) {
        console.log('No GMs data found');
        setLastGm(null);
        setLastGmAgo(null);
        setLeaderboard([]);
        return;
      }
      
      // Sprawdź strukturę first, second, third
      console.log('First GM:', gms.first);
      console.log('Second GM:', gms.second);
      console.log('Third GM:', gms.third);
      
      // gms.first, gms.second, gms.third - to są optional types w Clarity
      // type: 10 = some, type: 9 = none
      const gmList = [];
      
      if (gms.first && gms.first.type === 10) {
        gmList.push(gms.first.value);
      }
      if (gms.second && gms.second.type === 10) {
        gmList.push(gms.second.value);
      }
      if (gms.third && gms.third.type === 10) {
        gmList.push(gms.third.value);
      }

      console.log('Filtered GM list:', gmList);

      if (gmList.length > 0) {
        // Najnowszy GM
        const last: any = gmList[0];
        console.log('Last GM structure:', last);
        console.log('Last GM data:', last.data);
        
        // Konwertuj principal na string
        const userObj = last.data?.user || last.user;
        const userPrincipal = typeof userObj === 'string' ? userObj : cvToString(userObj);
        const blockHeightObj = last.data?.['block-height'] || last['block-height'];
        const blockHeight = typeof blockHeightObj === 'bigint' || typeof blockHeightObj === 'number' 
          ? blockHeightObj 
          : blockHeightObj?.value;
        
        console.log('Extracted user:', userPrincipal);
        console.log('Extracted block:', blockHeight);
        
        if (userPrincipal) {
          setLastGm({ user: userPrincipal, block: Number(blockHeight) });
          
          // Oblicz ile bloków temu (zakładamy 10 min/block)
          const currentBlock = await fetchCurrentBlock();
          const diff = currentBlock - Number(blockHeight);
          const minutes = diff * 10;
          setLastGmAgo(minutes < 60 ? `${minutes} min ago` : `${(minutes/60).toFixed(1)} h ago`);
          console.log('Last GM set:', userPrincipal, `${minutes} min ago`);
        }
      } else {
        console.log('No GMs in list');
        setLastGm(null);
        setLastGmAgo(null);
      }

      // Leaderboard: z tych 3 adresów pobierz total-gms
      const users = Array.from(new Set(gmList.map((g: any) => {
        const userObj = g.data?.user || g.user;
        return typeof userObj === 'string' ? userObj : cvToString(userObj);
      }).filter(Boolean)));
      console.log('Unique users for leaderboard:', users);
      
      const leaderboardData = await Promise.all(users.map(async (addr: string) => {
        const res: any = await callReadOnlyFunction({
          contractAddress: GMOK_CONTRACT_ADDRESS,
          contractName: GMOK_CONTRACT_NAME,
          functionName: 'get-user-total-gms',
          functionArgs: [principalCV(addr)],
          network: new StacksMainnet(),
          senderAddress: userAddress || 'SP000000000000000000002Q6VF78',
        });
        // Clarity uint
        let total = 0;
        if (res && (res as any).value && (res as any).value.value !== undefined) {
          const val = (res as any).value.value;
          total = typeof val === 'string' ? Number(val.replace(/n$/, '')) : Number(val);
        }
        return { user: addr, total };
      }));
      // Sortuj malejąco
      leaderboardData.sort((a, b) => b.total - a.total);
      setLeaderboard(leaderboardData);
      console.log('Leaderboard set:', leaderboardData);
    } catch (e) {
      console.error('Error fetching last GM and leaderboard:', e);
      setLastGm(null);
      setLastGmAgo(null);
      setLeaderboard([]);
    }
  }, [userAddress]);

  // Pomocnicza: pobierz aktualny block-height z Hiro API
  async function fetchCurrentBlock() {
    try {
      const res = await fetch('https://api.mainnet.hiro.so/v2/info');
      const data = await res.json();
      return data.burn_block_height;
    } catch {
      return 0;
    }
  }

  // Aktualizuj adres użytkownika gdy zmienia się autentykacja
  React.useEffect(() => {
    if (isAuthenticated && userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUserAddress(userData.profile.stxAddress.mainnet);
    } else {
      setUserAddress(null);
    }
  }, [isAuthenticated, userSession]);

  // Monitoruj zmiany adresu co sekundę (dla przypadku przełączenia portfela)
  React.useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        const currentAddress = userData.profile.stxAddress.mainnet;
        if (currentAddress !== userAddress) {
          setUserAddress(currentAddress);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, userAddress, userSession]);

  // Funkcja do pobierania statystyk GM
  const fetchGmCounts = React.useCallback(async () => {
    try {
      // Najpierw spróbuj backend API (szybszy cache)
      try {
        const backendUrl = 'https://gm-backend-seven.vercel.app/api/stats';
        const response = await fetch(backendUrl);
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Stats from backend:', data);
          setTodayGm(data.todayGm);
          setTotalGm(data.totalGm);
          
          // Pobierz tylko user stats z blockchain
          if (isAuthenticated && userAddress) {
            const { principalCV } = await import('@stacks/transactions');
            const senderAddress = userAddress || 'SP000000000000000000002Q6VF78';
            const userRes = await callReadOnlyFunction({
              contractAddress: GMOK_CONTRACT_ADDRESS,
              contractName: GMOK_CONTRACT_NAME,
              functionName: 'get-user-total-gms',
              functionArgs: [principalCV(userAddress)],
              network: new StacksMainnet(),
              senderAddress,
            });
            const parseClarityUint = (res: any): number | null => {
              if (res && res.value && res.value.value !== undefined) {
                const val = res.value.value;
                if (typeof val === 'string') return Number(val.replace(/n$/, ''));
                if (typeof val === 'bigint') return Number(val);
                return Number(val);
              }
              return null;
            };
            setUserGm(parseClarityUint(userRes));
          } else {
            setUserGm(null);
          }
          
          console.log('✅ Using backend stats (faster!)');
          return; // Sukces - nie pytaj blockchain
        }
      } catch (backendError) {
        console.log('⚠️ Backend failed, falling back to blockchain:', backendError);
      }
      
      // Fallback: pobierz z blockchain (wolniejsze)
      const senderAddress = userAddress || 'SP000000000000000000002Q6VF78';
      
      // Helper to parse Clarity response
      const parseClarityUint = (res: any): number | null => {
        if (res && res.value && res.value.value !== undefined) {
          const val = res.value.value;
          if (typeof val === 'string') {
            return Number(val.replace(/n$/, ''));
          }
          if (typeof val === 'bigint') {
            return Number(val);
          }
          return Number(val);
        }
        return null;
      };
      
      // Today's GM
      const todayRes = await callReadOnlyFunction({
        contractAddress: GMOK_CONTRACT_ADDRESS,
        contractName: GMOK_CONTRACT_NAME,
        functionName: 'get-daily-gm-count',
        functionArgs: [],
        network: new StacksMainnet(),
        senderAddress,
      });
      
      // Total GM
      const totalRes = await callReadOnlyFunction({
        contractAddress: GMOK_CONTRACT_ADDRESS,
        contractName: GMOK_CONTRACT_NAME,
        functionName: 'get-total-gms-alltime',
        functionArgs: [],
        network: new StacksMainnet(),
        senderAddress,
      });
      
      setTodayGm(parseClarityUint(todayRes));
      setTotalGm(parseClarityUint(totalRes));
      
      // User's GM (if authenticated)
      if (isAuthenticated && userAddress) {
        const { principalCV } = await import('@stacks/transactions');
        const userRes = await callReadOnlyFunction({
          contractAddress: GMOK_CONTRACT_ADDRESS,
          contractName: GMOK_CONTRACT_NAME,
          functionName: 'get-user-total-gms',
          functionArgs: [principalCV(userAddress)],
          network: new StacksMainnet(),
          senderAddress,
        });
        setUserGm(parseClarityUint(userRes));
      } else {
        setUserGm(null);
      }
      
      console.log('📡 Using blockchain stats (slower fallback)');
    } catch (e) {
      console.error('GM fetch error', e);
      setTodayGm(null);
      setTotalGm(null);
      setUserGm(null);
    }
  }, [userAddress, isAuthenticated]);

  // Funkcja do pobierania statystyk Post Message
  const fetchMessageCounts = React.useCallback(async () => {
    try {
      const senderAddress = userAddress || 'SP000000000000000000002Q6VF78';
      const parseClarityUint = (res: any): number | null => {
        if (res && res.value && res.value.value !== undefined) {
          const val = res.value.value;
          if (typeof val === 'string') {
            return Number(val.replace(/n$/, ''));
          }
          if (typeof val === 'bigint') {
            return Number(val);
          }
          return Number(val);
        }
        return null;
      };
      
      // Pobierz statystyki z get-stats
      const statsRes = await callReadOnlyFunction({
        contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
        contractName: POST_MESSAGE_CONTRACT_NAME,
        functionName: 'get-stats',
        functionArgs: [],
        network: new StacksMainnet(),
        senderAddress,
      });
      
      // Wyciągnij dane ze struktury
      const stats = (statsRes as any)?.value?.data;
      let totalMessagesCount = 0;
      if (stats) {
        const todayVal = stats['today-messages']?.value;
        const totalVal = stats['total-messages']?.value;
        totalMessagesCount = typeof totalVal === 'bigint' ? Number(totalVal) : (typeof totalVal === 'string' ? Number(totalVal.replace(/n$/, '')) : Number(totalVal));
        setTodayMessages(typeof todayVal === 'bigint' ? Number(todayVal) : (typeof todayVal === 'string' ? Number(todayVal.replace(/n$/, '')) : Number(todayVal)));
        setTotalMessages(totalMessagesCount);
      }
      
      // Pobierz liczbę wiadomości użytkownika
      if (isAuthenticated && userAddress) {
        const { principalCV } = await import('@stacks/transactions');
        const userRes = await callReadOnlyFunction({
          contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
          contractName: POST_MESSAGE_CONTRACT_NAME,
          functionName: 'get-user-message-count',
          functionArgs: [principalCV(userAddress)],
          network: new StacksMainnet(),
          senderAddress,
        });
        setUserMessages(parseClarityUint(userRes));
      } else {
        setUserMessages(null);
      }

      // Pobierz ostatnie wiadomości (max 20 dozwolone przez kontrakt)
      if (totalMessagesCount > 0) {
        const { uintCV } = await import('@stacks/transactions');
        const count = totalMessagesCount >= 20 ? 20 : totalMessagesCount;
        const latestRes = await callReadOnlyFunction({
          contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
          contractName: POST_MESSAGE_CONTRACT_NAME,
          functionName: 'get-latest-messages',
          functionArgs: [uintCV(count)],
          network: new StacksMainnet(),
          senderAddress,
        });
        
        console.log('Latest messages response:', latestRes);
        
        // Parsowanie wiadomości
        const data = (latestRes as any)?.value?.data;
        console.log('Latest messages data:', data);
        console.log('Messages object:', data?.messages);
        console.log('Messages list:', data?.messages?.list);
        
        if (data && data.messages && data.messages.list) {
          console.log('Messages array length:', data.messages.list.length);
          console.log('First message raw:', data.messages.list[0]);
          
          const msgs = data.messages.list
            .filter((m: any) => {
              console.log('Message type:', m?.type, 'Message:', m);
              return m && m.type === 10;
            })
            .map((m: any) => {
              console.log('Mapping message:', m);
              console.log('Message value data:', m.value.data);
              return m.value.data;
            });
          
          console.log('Parsed messages:', msgs);
          
          setRecentMessages(msgs);
        } else {
          console.log('No messages data found');
          setRecentMessages([]);
        }
      } else {
        setRecentMessages([]);
      }
    } catch (e) {
      console.error('Message fetch error', e);
      setTodayMessages(null);
      setTotalMessages(null);
      setUserMessages(null);
      setRecentMessages([]);
    }
  }, [userAddress, isAuthenticated]);

  React.useEffect(() => {
    fetchGmCounts();
    fetchLastGmAndLeaderboard();
    fetchMessageCounts();
  }, [fetchGmCounts, fetchLastGmAndLeaderboard, fetchMessageCounts]);

  async function handleSayGM() {
    if (!isAuthenticated) return;
    await openContractCall({
      network: new StacksMainnet(),
      anchorMode: 1,
      contractAddress: GMOK_CONTRACT_ADDRESS,
      contractName: GMOK_CONTRACT_NAME,
      functionName: 'say-gm',
      functionArgs: [],
      appDetails: {
        name: 'Stacks Click & Ship',
        icon: window.location.origin + '/vite.svg',
      },
      onFinish: (data) => {
        // Odśwież statystyki po 5 sekundach (dać czas na potwierdzenie transakcji)
        setTimeout(() => fetchGmCounts(), 5000);
        const txId = data?.txId;
        if (txId) {
          setTxPopup({ show: true, txId });
        }
      },
    });
  }

  const handleDisconnect = () => {
    userSession.signUserOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-amber-900">
      {/* Popup dla transakcji */}
      {txPopup?.show && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setTxPopup(null)}
        >
          <div 
            className="bg-gradient-to-br from-orange-900 via-purple-900 to-pink-900 rounded-2xl p-8 border-2 border-orange-400/50 shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-bold text-white mb-4 text-center">✅ Done!</h3>
            <p className="text-orange-200 text-center mb-6">Your message has been posted to the blockchain.</p>
            <a
              href={`https://explorer.hiro.so/txid/${txPopup.txId}?chain=mainnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl text-center"
            >
              🔗 Check your tx
            </a>
            <button
              onClick={() => setTxPopup(null)}
              className="mt-4 w-full bg-purple-800/50 hover:bg-purple-700/50 text-white py-2 px-6 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-orange-500/30">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl text-white mb-1">Stacks - Click and Ship</h1>
            <p className="text-base text-orange-300 italic">* GM, post, vote, learn...</p>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="text-orange-400 text-sm">
                Połączono:
                {userAddress && (
                  <a
                    href={`https://explorer.stacks.co/address/${userAddress}?chain=mainnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-orange-300 ml-1 font-mono"
                    title={userAddress}
                  >
                    {userAddress.length > 16 ? `${userAddress.slice(0, 8)}...${userAddress.slice(-6)}` : userAddress}
                  </a>
                )}
              </div>
              <button
                onClick={handleDisconnect}
                className="bg-orange-600/50 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="bg-orange-950/50 backdrop-blur-sm border-b border-orange-500/20">
        <div className="container mx-auto px-6">
          <div className="flex justify-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`flex items-center space-x-2 px-6 py-4 transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-orange-600 text-white border-b-4 border-amber-400'
                      : 'text-orange-300 hover:bg-orange-800/50 hover:text-white'
                  }`}
                  style={{ textDecoration: 'none' }}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {activeTab === 'home' && path === '/' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 shadow-2xl">
              <h2 className="text-2xl text-white mb-2">Welcome to Stacks - Click and Ship</h2>
              <p className="text-base text-orange-300 italic mb-6">* GM, post, vote, learn...</p>
              <p className="text-orange-200 text-lg mb-8">
                Your all-in-one toolkit for the Stacks blockchain. Say GM, send messages, create vote, and learn about Stacks basics - all in one place.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/gm" className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer" style={{ textDecoration: 'none' }}>
                  <Sun className="text-yellow-400 mb-3" size={32} />
                  <h3 className="text-xl text-white mb-2">Say GM!</h3>
                  <p className="text-orange-300">Say good morning on-chain and build your streak</p>
                </Link>

                <Link to="/message" className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer" style={{ textDecoration: 'none' }}>
                  <Mail className="text-amber-400 mb-3" size={32} />
                  <h3 className="text-xl text-white mb-2">Post Message</h3>
                  <p className="text-orange-300">Post immutable messages to the blockchain</p>
                </Link>

                <Link to="/vote" className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer" style={{ textDecoration: 'none' }}>
                  <CheckSquare className="text-yellow-400 mb-3" size={32} />
                  <h3 className="text-xl text-white mb-2">Vote</h3>
                  <p className="text-orange-300">Create and participate in on-chain polls</p>
                </Link>

                <Link to="/learn" className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer" style={{ textDecoration: 'none' }}>
                  <BookOpen className="text-amber-300 mb-3" size={32} />
                  <h3 className="text-xl text-white mb-2">Learn Stacks</h3>
                  <p className="text-orange-300">Read about stacks basics</p>
                </Link>
              </div>

              <div className="mt-8 text-center">
                {!isAuthenticated && (
                  <button 
                    onClick={connectWallet}
                    className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gm' && path.startsWith('/gm') && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                  <Sun className="text-yellow-400 inline align-middle" size={40} />
                  <span>Say GM to Stacks!</span>
                </h2>
                <div className="grid grid-cols-3 gap-4 mt-6 mb-4">
                  <div className="bg-orange-800/30 rounded-lg p-4">
                    <p className="text-orange-400 text-sm font-bold">Today's GM</p>
                    <p className="text-white text-3xl font-bold">{todayGm !== null ? todayGm : '...'}</p>
                  </div>
                  <div className="bg-orange-800/30 rounded-lg p-4">
                    <p className="text-orange-400 text-sm font-bold">Total GM</p>
                    <p className="text-white text-3xl font-bold">{totalGm !== null ? totalGm : '...'}</p>
                  </div>
                  <div className="bg-orange-800/30 rounded-lg p-4">
                    <p className="text-orange-400 text-sm font-bold">My GM</p>
                    <p className="text-white text-3xl font-bold">{userGm !== null ? userGm : (isAuthenticated ? '...' : '—')}</p>
                  </div>
                </div>
              </div>

              <button 
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
                disabled={!isAuthenticated}
                onClick={handleSayGM}
              >
                ☀️ Say GM
              </button>

              {/* Ostatni GM - po polsku, ładna karta */}
              {lastGm && (
                <div className="mt-6 flex flex-col items-center">
                  <div className="bg-orange-900/60 border border-orange-400/30 rounded-xl px-6 py-4 shadow-lg w-full max-w-2xl">
                    <div className="flex justify-center mb-2">
                      <span className="text-orange-400 text-sm font-semibold">Last GM sent by:</span>
                    </div>
                    <div className="text-orange-100 font-mono text-lg whitespace-nowrap overflow-x-auto text-center">
                      {(() => {
                        const addr = lastGm.user;
                        if (!addr) return '';
                        const short = addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;
                        return (
                          <a
                            href={`https://explorer.stacks.co/address/${addr}?chain=mainnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-orange-300"
                            title={addr}
                          >
                            {short}
                          </a>
                        );
                      })()}
                    </div>
                    <div className="text-orange-400 text-xs mt-1 text-center">{lastGmAgo}</div>
                  </div>
                </div>
              )}

              {/* Leaderboard - tabela po polsku */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📊</span> Leaderboard
                </h3>
                <div className="overflow-hidden rounded-lg border border-orange-500/30">
                  <div className="overflow-x-auto" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="min-w-full bg-orange-900/40">
                      <tbody>
                        {leaderboard.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-orange-300 px-4 py-3 text-center">No data.</td>
                          </tr>
                        )}
                        {leaderboard.map((user, idx) => (
                          <tr key={user.user} className={idx % 2 === 0 ? "bg-orange-900/60" : ""}>
                            <td className="px-4 py-2 text-orange-200 font-bold">{idx + 1}</td>
                            <td className="px-4 py-2 text-orange-100 break-all font-mono text-xs">
                              <a
                                href={`https://explorer.stacks.co/address/${user.user}?chain=mainnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-orange-300"
                                title={user.user}
                              >
                                {user.user.length > 16 ? `${user.user.slice(0, 8)}...${user.user.slice(-6)}` : user.user}
                              </a>
                            </td>
                            <td className="px-4 py-2 text-orange-400 font-bold text-right">{user.total} GM</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'message' && path.startsWith('/message') && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                <Mail className="inline text-amber-400 align-middle" size={32} />
                <span>Post Message On-Chain</span>
              </h2>
              

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-orange-800/30 rounded-lg p-4">
                  <p className="text-orange-400 text-sm font-bold">Today's Messages</p>
                  <p className="text-white text-3xl font-bold">{todayMessages !== null ? todayMessages : '...'}</p>
                </div>
                <div className="bg-orange-800/30 rounded-lg p-4">
                  <p className="text-orange-400 text-sm font-bold">Total Messages</p>
                  <p className="text-white text-3xl font-bold">{totalMessages !== null ? totalMessages : '...'}</p>
                </div>
                <div className="bg-orange-800/30 rounded-lg p-4">
                  <p className="text-orange-400 text-sm font-bold">My Messages</p>
                  <p className="text-white text-3xl font-bold">{userMessages !== null ? userMessages : (isAuthenticated ? '...' : '—')}</p>
                </div>
              </div>

              <textarea 
                id="postMessageInput"
                placeholder="What's on your mind?"
                className="w-full bg-purple-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 h-32 resize-none mb-4"
                maxLength={280}
                onInput={e => {
                  const el = e.target as HTMLTextAreaElement;
                  const counter = document.getElementById('postMessageCounter');
                  if (counter) counter.textContent = `${280 - el.value.length} characters left`;
                }}
              ></textarea>
              <div id="postMessageCounter" className="text-purple-400 text-sm mb-6">280 characters left</div>


              <button 
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
                disabled={!isAuthenticated}
                onClick={async () => {
                  if (!isAuthenticated) return;
                  const input = document.getElementById('postMessageInput') as HTMLTextAreaElement | null;
                  const value: string = input && 'value' in input ? (input.value as string) : '';
                  if (!value || value.length === 0) return;
                  await openContractCall({
                    network: new StacksMainnet(),
                    anchorMode: 1,
                    contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
                    contractName: POST_MESSAGE_CONTRACT_NAME,
                    functionName: 'post-message',
                    functionArgs: [
                      (await import('@stacks/transactions')).stringAsciiCV(value)
                    ],
                    appDetails: {
                      name: 'Stacks Click & Ship',
                      icon: window.location.origin + '/vite.svg',
                    },
                    onFinish: (data) => {
                      if (input) (input as HTMLTextAreaElement).value = '';
                      const counter = document.getElementById('postMessageCounter');
                      if (counter) counter.textContent = '280 characters left';
                      // Odśwież statystyki po 5 sekundach
                      setTimeout(() => fetchMessageCounts(), 5000);
                      // Wyświetl niestandardowy popup z linkiem
                      const txId = data?.txId;
                      if (txId) {
                        setTxPopup({ show: true, txId });
                      }
                    },
                  });
                }}
              >
                📤 Post Message
              </button>


              {/* Leaderboard - Top 3 users by message count (styled like GM leaderboard) */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📊</span> Leaderboard
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-orange-900/40 rounded-lg">
                    <tbody>
                      {(() => {
                        // Zlicz liczbę wiadomości dla każdego adresu
                        const counts: Record<string, number> = {};
                        recentMessages.forEach(msg => {
                          const addr = cvToString(msg.sender);
                          if (addr) counts[addr] = (counts[addr] || 0) + 1;
                        });
                        // Posortuj malejąco po liczbie wiadomości
                        const sorted: [string, number][] = Object.entries(counts)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))
                          .slice(0, 3) as [string, number][];
                        if (sorted.length === 0) {
                          return (
                            <tr>
                              <td colSpan={3} className="text-orange-300 px-4 py-3 text-center">No data.</td>
                            </tr>
                          );
                        }
                        return sorted.map(([addr, count], idx) => (
                          <tr key={addr} className={idx % 2 === 0 ? "bg-orange-900/60" : ""}>
                            <td className="px-4 py-2 text-orange-200 font-bold">{idx + 1}</td>
                            <td className="px-4 py-2 text-orange-100 break-all font-mono text-xs">
                              <a
                                href={`https://explorer.stacks.co/address/${addr}?chain=mainnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-orange-300"
                                title={addr}
                              >
                                {addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr}
                              </a>
                            </td>
                            <td className="px-4 py-2 text-orange-400 font-bold text-right">{count} MSG</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ostatnie wiadomości - przewijane */}
              {recentMessages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                    <span className="flex items-center">
                      <Mail className="mr-2 text-orange-300" size={22} /> Recent Messages
                    </span>
                    <span className="text-sm text-orange-300 font-normal">
                      {recentMessages.length} wiadomość{recentMessages.length !== 1 ? 'i' : ''}
                    </span>
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-orange-500/30">
                    <div className="overflow-x-auto" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table className="min-w-full bg-orange-900/40">
                        <thead className="sticky top-0 bg-orange-800/90 backdrop-blur-sm z-10">
                          <tr>
                            <th className="px-3 py-3 text-orange-200 text-left font-semibold">#</th>
                            <th className="px-4 py-3 text-orange-200 text-left font-semibold">Sender</th>
                            <th className="px-4 py-3 text-orange-200 text-left font-semibold">Content</th>
                            <th className="px-4 py-3 text-orange-200 text-left font-semibold">Sent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-500/20">
                          {[...recentMessages].reverse().map((msg, idx) => {
                            // Wyciągnij blockHeight
                            let blockHeight = null;
                            if (msg.block && (typeof msg.block.value === 'number' || typeof msg.block.value === 'bigint')) {
                              blockHeight = Number(msg.block.value);
                            } else if (typeof msg.block === 'number' || typeof msg.block === 'bigint') {
                              blockHeight = Number(msg.block);
                            }
                            // Załóż, że aktualny blok to  burn-block-height z ostatniej wiadomości lub max z listy
                            let currentBlock = null;
                            if (recentMessages.length > 0) {
                              const blocks = recentMessages.map(m => m.block && m.block.value ? Number(m.block.value) : (typeof m.block === 'number' ? m.block : 0));
                              currentBlock = Math.max(...blocks);
                            }
                            let ago = '';
                            if (blockHeight && currentBlock) {
                              const diff = currentBlock - blockHeight;
                              const minutes = diff * 10;
                              ago = minutes < 60 ? `${minutes} min ago` : `${(minutes/60).toFixed(1)} h ago`;
                            }
                            return (
                              <tr key={idx} className="bg-orange-900/20 hover:bg-orange-800/40 transition-colors">
                                <td className="px-3 py-3 text-orange-400 font-bold">
                                  {recentMessages.length - idx}
                                </td>
                                <td className="px-4 py-3 text-orange-200 font-mono text-xs break-all">
                                  {(() => {
                                    const addr = cvToString(msg.sender);
                                    if (!addr) return '';
                                    const short = addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;
                                    return (
                                      <a
                                        href={`https://explorer.stacks.co/address/${addr}?chain=mainnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline text-orange-300"
                                        title={addr}
                                      >
                                        {short}
                                      </a>
                                    );
                                  })()}
                                </td>
                                <td className="px-4 py-3 text-white break-words text-xs lowercase">
                                  {(() => {
                                    let text = '';
                                    if (msg.content) {
                                      if (msg.content.value) text = msg.content.value;
                                      else if (typeof cvToString === 'function') text = cvToString(msg.content).replace(/^"|"$/g, '');
                                    }
                                    // Usuń 'u"' na początku, jeśli występuje
                                    if (text.startsWith('u"')) text = text.slice(2);
                                    return text;
                                  })()}
                                </td>
                                <td className="px-4 py-3 text-orange-300 text-xs text-right">
                                  {ago}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-xs text-orange-400/70 mt-2 text-center italic">
                    ↓ Scroll down to see more messages ↓
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vote' && path.startsWith('/vote') && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">Vote</h2>
              <p className="text-orange-300 mb-6">Create and participate in on-chain polls.</p>
              {/* Tu pojawi się kreator głosowania */}
            </div>
          </div>
        )}

        {activeTab === 'getname' && path.startsWith('/getname') && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">Get Your Name</h2>
              <div className="flex flex-col mb-6">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={inputName}
                    onChange={e => setInputName(e.target.value)}
                    placeholder="Enter your name..."
                    className="flex-1 rounded-l-lg px-4 py-2 bg-purple-900/50 border border-purple-500/30 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 text-base h-12"
                    style={{ minWidth: 0 }}
                  />
                  <span className="bg-transparent border-none text-orange-400 px-3 h-12 flex items-center font-mono text-base font-bold select-none">.stacks</span>
                </div>
                <div style={{ height: '1rem' }} />
                <div className="flex flex-col items-center gap-3">
                  <button
                    className="rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-6 h-12 font-bold text-base transition-all shadow-lg hover:shadow-xl"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={async () => {
                      setIsAvailable(null);
                      if (!inputName) return;
                      try {
                        const { stringAsciiCV } = await import('@stacks/transactions');
                        const res = await callReadOnlyFunction({
                          contractAddress: GET_NAME_CONTRACT_ADDRESS,
                          contractName: GET_NAME_CONTRACT_NAME,
                          functionName: 'is-username-available',
                          functionArgs: [stringAsciiCV(inputName)],
                          network: new StacksMainnet(),
                          senderAddress: userAddress || 'SP000000000000000000002Q6VF78',
                        });
                        setIsAvailable((res as any).value?.type === 3);
                      } catch (e) {
                        console.error('Error checking availability:', e);
                        setIsAvailable(null);
                      }
                    }}
                  >
                    Check
                  </button>
                  {isAvailable !== null && (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="text-center text-lg font-semibold" style={{ color: isAvailable ? '#f59e42' : '#e53e3e' }}>
                        {isAvailable ? '✓ Nazwa dostępna!' : '✗ Nazwa zajęta.'}
                      </div>
                      {isAvailable && isAuthenticated && (
                        <button
                          className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 h-12 font-bold text-base transition-all shadow-lg hover:shadow-xl"
                          onClick={async () => {
                            try {
                              const { stringAsciiCV } = await import('@stacks/transactions');
                              await openContractCall({
                                contractAddress: GET_NAME_CONTRACT_ADDRESS,
                                contractName: GET_NAME_CONTRACT_NAME,
                                functionName: 'register-username',
                                functionArgs: [stringAsciiCV(inputName)],
                                network: new StacksMainnet(),
                                onFinish: (data: any) => {
                                  console.log('Transaction submitted:', data);
                                  setTxPopup({ show: true, txId: data.txId });
                                  setIsAvailable(null);
                                  setInputName('');
                                },
                                onCancel: () => {
                                  console.log('Transaction cancelled');
                                },
                              });
                            } catch (e) {
                              console.error('Error registering username:', e);
                            }
                          }}
                        >
                          Register {inputName}.stacks
                        </button>
                      )}
                      {isAvailable && !isAuthenticated && (
                        <div className="text-orange-400 text-sm">Połącz portfel, aby zarejestrować nazwę</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'learn' && path.startsWith('/learn') && !/^\/learn\/[\w-]+$/.test(path) && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6">📚 Learn Stacks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'What is Stacks?', slug: 'what-is-stacks' },
                  { title: 'Proof of Transfer (PoX)', slug: 'pox' },
                  { title: 'Bitcoin Layer 2 Explained', slug: 'bitcoin-layer2' },
                  { title: 'Stacking - Earn Bitcoin', slug: 'stacking' },
                  { title: 'Clarity vs Solidity', slug: 'clarity-vs-solidity' },
                  { title: 'Build Your First dApp', slug: 'build-dapp' }
                ].map((tutorial, idx) => (
                  <Link
                    key={idx}
                    to={`/learn/${tutorial.slug}`}
                    className="bg-purple-900/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer block"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-white">{tutorial.title}</h3>
                      <BookOpen className="text-pink-400" size={24} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
