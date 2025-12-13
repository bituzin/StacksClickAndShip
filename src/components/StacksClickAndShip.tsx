import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, MessageSquare, CheckSquare, BookOpen, Home } from 'lucide-react';
import { UserSession } from '@stacks/connect';
import { openContractCall } from '@stacks/connect';
import { callReadOnlyFunction } from '@stacks/transactions';
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
  const [copied, setCopied] = React.useState(false);

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

  const getUserAddress = () => {
    if (isAuthenticated && userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      return userData.profile.stxAddress.testnet;
    }
    return null;
  };

  // Adres kontraktu gmUnlimited
  const GMOK_CONTRACT_ADDRESS = 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86';
  const GMOK_CONTRACT_NAME = 'gmUmlimited';

  // State for GM counts
  const [todayGm, setTodayGm] = React.useState<number | null>(null);
  const [totalGm, setTotalGm] = React.useState<number | null>(null);
  const [userGm, setUserGm] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function fetchGmCounts() {
      try {
        const senderAddress = getUserAddress() || 'SP000000000000000000002Q6VF78';
        
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
        if (isAuthenticated && getUserAddress()) {
          const { principalCV } = await import('@stacks/transactions');
          const userRes = await callReadOnlyFunction({
            contractAddress: GMOK_CONTRACT_ADDRESS,
            contractName: GMOK_CONTRACT_NAME,
            functionName: 'get-user-total-gms',
            functionArgs: [principalCV(getUserAddress()!)],
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
    }
    fetchGmCounts();
  }, [isAuthenticated]);


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
        // Możesz dodać powiadomienie lub reload
        window.location.reload();
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-amber-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-orange-500/30">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl text-white mb-1">Stacks - Click and Ship</h1>
            <p className="text-base text-orange-300 italic">* GM, post, vote, learn...</p>
          </div>
          {isAuthenticated && (
            <button
              className="text-orange-400 text-sm ml-4 whitespace-nowrap hover:underline focus:outline-none"
              title="Kliknij, aby skopiować pełny adres"
              onClick={() => {
                const addr = getUserAddress();
                if (addr) {
                  navigator.clipboard.writeText(addr);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }
              }}
            >
              Connected: {getUserAddress()?.substring(0, 8)}... {copied && <span className="ml-2">Copied!</span>}
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
  
        React.useEffect(() => {
          async function fetchGmCounts() {
            try {
              const senderAddress = getUserAddress() || 'SP000000000000000000002Q6VF78';
        
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
              if (isAuthenticated && getUserAddress()) {
                const { principalCV } = await import('@stacks/transactions');
                const userRes = await callReadOnlyFunction({
                  contractAddress: GMOK_CONTRACT_ADDRESS,
                  contractName: GMOK_CONTRACT_NAME,
                  functionName: 'get-user-total-gms',
                  functionArgs: [principalCV(getUserAddress()!)],
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
          }
          fetchGmCounts();
        }, [isAuthenticated]);
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
                  <p className="text-orange-400 text-sm">Today's GM</p>
                  <p className="text-white text-3xl font-bold">{todayGm !== null ? todayGm : '...'}</p>
                </div>
                <div className="bg-orange-800/30 rounded-lg p-4">
                  <p className="text-orange-400 text-sm">Total GM</p>
                  <p className="text-white text-3xl font-bold">{totalGm !== null ? totalGm : '...'}</p>
                </div>
                <div className="bg-orange-800/30 rounded-lg p-4">
                  <p className="text-orange-400 text-sm">My GM</p>
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

              {!isAuthenticated && (
                <p className="text-center text-orange-400 mt-4 text-sm">
                  Connect your wallet to say GM!
                </p>
              )}

              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">📊 Leaderboard</h3>
                <div className="space-y-3">
                  {[
                    { name: 'alice.stx', days: 365, badge: '👑' },
                    { name: 'bob.btc', days: 180, badge: '🥈' },
                    { name: 'you.stx', days: 12, badge: '🔥' }
                  ].map((user, idx) => (
                    <div key={idx} className="bg-purple-900/40 rounded-lg p-4 flex justify-between items-center">
                      <span className="text-purple-200">
                        {idx + 1}. {user.name} {user.badge}
                      </span>
                      <span className="text-orange-400 font-bold">{user.days} days</span>
                    </div>
                  ))}
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
