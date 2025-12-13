import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, MessageSquare, CheckSquare, BookOpen, Home } from 'lucide-react';
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
  else if (path === '/learn') activeTab = 'learn';

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, to: '/' },
    { id: 'gm', label: 'GM', icon: Sun, to: '/gm' },
    { id: 'message', label: 'Post', icon: MessageSquare, to: '/message' },
    { id: 'vote', label: 'Vote', icon: CheckSquare, to: '/vote' },
    { id: 'learn', label: 'Learn', icon: BookOpen, to: '/learn' }
  ];

  // Adres kontraktu gmUnlimited
  const GMOK_CONTRACT_ADDRESS = 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86';
  const GMOK_CONTRACT_NAME = 'gmUmlimited';

  // State for GM counts
  const [todayGm, setTodayGm] = React.useState<number | null>(null);
  const [totalGm, setTotalGm] = React.useState<number | null>(null);
  const [userGm, setUserGm] = React.useState<number | null>(null);
  const [userAddress, setUserAddress] = React.useState<string | null>(null);
  // Nowe stany do ostatniego GM i leaderboarda
  const [lastGm, setLastGm] = React.useState<{user: string, block: number} | null>(null);
  const [lastGmAgo, setLastGmAgo] = React.useState<string | null>(null);
  const [leaderboard, setLeaderboard] = React.useState<Array<{user: string, total: number}>>([]);
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
    } catch (e) {
      console.error('GM fetch error', e);
      setTodayGm(null);
      setTotalGm(null);
      setUserGm(null);
    }
  }, [userAddress, isAuthenticated]);

  React.useEffect(() => {
    fetchGmCounts();
    fetchLastGmAndLeaderboard();
  }, [fetchGmCounts, fetchLastGmAndLeaderboard]);

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
      onFinish: () => {
        // Odśwież statystyki po 5 sekundach (dać czas na potwierdzenie transakcji)
        setTimeout(() => fetchGmCounts(), 5000);
      },
    });
  }

  const handleDisconnect = () => {
    userSession.signUserOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-amber-900">
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
                Connected: {userAddress}
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
                  <MessageSquare className="text-amber-400 mb-3" size={32} />
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
                <Sun className="text-yellow-400 mx-auto mb-4" size={64} />
                <h2 className="text-4xl font-bold text-white mb-2">Say GM to Stacks!</h2>
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
                    <div className="text-white font-mono text-lg whitespace-nowrap overflow-x-auto text-center">{lastGm.user}</div>
                    <div className="text-orange-400 text-xs mt-1 text-center">{lastGmAgo}</div>
                  </div>
                </div>
              )}

              {/* Leaderboard - tabela po polsku */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📊</span> Leaderboard
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-purple-900/40 rounded-lg">
                    <tbody>
                      {leaderboard.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-orange-300 px-4 py-3 text-center">No data.</td>
                        </tr>
                      )}
                      {leaderboard.map((user, idx) => (
                        <tr key={user.user} className={idx % 2 === 0 ? "bg-purple-900/60" : ""}>
                          <td className="px-4 py-2 text-purple-200 font-bold">{idx + 1}</td>
                          <td className="px-4 py-2 text-purple-100 break-all">{user.user}</td>
                          <td className="px-4 py-2 text-orange-400 font-bold text-right">{user.total} GM</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'message' && path.startsWith('/message') && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6">✍️ Post Message On-Chain</h2>
              
              <textarea 
                placeholder="What's on your mind?"
                className="w-full bg-purple-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 h-32 resize-none mb-4"
              ></textarea>
              <div className="text-purple-400 text-sm mb-6">0/280 characters</div>

              <button 
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
                disabled={!isAuthenticated}
              >
                📤 Post Message
              </button>

              {!isAuthenticated && (
                <p className="text-center text-purple-400 mb-4 text-sm">
                  Connect your wallet to post messages!
                </p>
              )}

              <h3 className="text-xl font-bold text-white mb-4">📜 Recent Messages</h3>
              <div className="space-y-4">
                {[
                  { author: 'alice.stx', time: '2 blocks ago', msg: 'gm everyone! ☀️', likes: 5, comments: 2 },
                  { author: 'bob.btc', time: '5 blocks ago', msg: 'STX to the moon 🚀', likes: 12, comments: 8 }
                ].map((post, idx) => (
                  <div key={idx} className="bg-purple-900/40 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex justify-between mb-2">
                      <span className="text-purple-300 font-medium">{post.author}</span>
                      <span className="text-purple-500 text-sm">{post.time}</span>
                    </div>
                    <p className="text-white mb-3">{post.msg}</p>
                    <div className="flex space-x-4 text-purple-400">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
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
