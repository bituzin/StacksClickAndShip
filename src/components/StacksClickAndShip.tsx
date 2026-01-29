

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, MessageSquare, CheckSquare, BookOpen, Home, Mail, X, User, Plus } from 'lucide-react';
import { openContractCall } from '@stacks/connect';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import SayGMCard from './SayGMCard';
import GetNameCard from './GetNameCard';
import VoteCard from './VoteCard';
import PostMessageCard from './PostMessageCard';
import LearnCard from './LearnCard';




import { useState, useRef, useCallback } from 'react';
import { POST_MESSAGE_CONTRACT_ADDRESS, POST_MESSAGE_CONTRACT_NAME, GMOK_CONTRACT_ADDRESS, GMOK_CONTRACT_NAME, GET_NAME_CONTRACT_ADDRESS, GET_NAME_CONTRACT_NAME } from '../constants/contracts';
import { useGMStats } from '../hooks/useGMStats';
import { usePolls } from '../hooks/usePolls';
import { useUserVotingStats } from '../hooks/useUserVotingStats';
import { useMessageStats } from '../hooks/useMessageStats';

const APPKIT_STORAGE_KEY = 'stacks_appkit_address';

function StacksClickAndShip(props: { isAuthenticated?: boolean; connectWallet?: () => void; userSession?: any }) {
  const { isAuthenticated: propIsAuthenticated, connectWallet: propConnectWallet, userSession: propUserSession } = props || {};
  // Routing
  const location = useLocation();
  const path = location.pathname;

  // Zakładki
  const [activeTab, setActiveTab] = useState('home');

  // Popupy i modale
  const [txPopup, setTxPopup] = useState<any>(null);
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showTakenPopup, setShowTakenPopup] = useState(false);
  const [showAvailablePopup, setShowAvailablePopup] = useState(false);

  // Głosowania
  const [voteTitle, setVoteTitle] = useState('');
  const [voteDescription, setVoteDescription] = useState('');
  const [voteOptions, setVoteOptions] = useState(['', '']);
  const [voteDuration, setVoteDuration] = useState(100);
  const [votesPerUser, setVotesPerUser] = useState(1);
  const [requiresSTX, setRequiresSTX] = useState(false);
  const [minSTXAmount, setMinSTXAmount] = useState(0);
  const [selectedPoll, setSelectedPoll] = useState<any>(null);

  // Username
  const [inputName, setInputName] = useState('');
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isConfirmingUsername, setIsConfirmingUsername] = useState(false);

  // AppKit/Wallet
  const [appKitAddress, setAppKitAddress] = useState<string | null>(null);
  const [persistedAppKitAddress, setPersistedAppKitAddress] = useState<string | null>(null);
  const [isWalletConnectedViaHiro, setIsWalletConnectedViaHiro] = useState(false);
  const [isWalletConnectedViaAppKit, setIsWalletConnectedViaAppKit] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Refy
  const usernamePollTimeoutRef = useRef<any>(null);

  // Custom hooki
  const { todayGm, totalGm, userGm, lastGm, lastGmAgo, leaderboard, fetchGmCounts, fetchLastGmAndLeaderboard } = useGMStats(userAddress);
  const { todayMessages, totalMessages, userMessages, messageLeaderboard, fetchMessageCounts } = useMessageStats(userAddress, isAuthenticated);
  const { activePolls, closedPolls, isLoadingPolls, fetchPolls } = usePolls(userAddress);
  const { userPollsCreated, userPollsVoted, userTotalVotesCast, fetchUserVotingStats } = useUserVotingStats(userAddress);

  // Dummy funkcje do podłączenia portfela, formatowania adresu itd.
  const connectWallet = propConnectWallet || (() => {
    console.warn('⚠️ connectWallet called but propConnectWallet is undefined!');
  });
  
  // Debug: Log when propConnectWallet is received
  React.useEffect(() => {
    console.log('🔍 StacksClickAndShip received props:', {
      propConnectWallet: !!propConnectWallet,
      propIsAuthenticated,
      propUserSession: !!propUserSession
    });
  }, [propConnectWallet, propIsAuthenticated, propUserSession]);
  
  const open = async () => {
    try {
      const module = await import('../config/appkit');
      await module.modal.open();
    } catch (e) {
      console.error('Error opening AppKit modal:', e);
    }
  };
  const close = () => {};
  const formatAddress = (addr: string | null) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '';
  const effectiveAppKitAddress = appKitAddress || persistedAppKitAddress;

  // Pozostałe funkcje i logika z pliku...
  // ...

  // Safe placeholder for checking username. Restores missing function to avoid runtime errors.
  const checkUserName = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsCheckingUsername(true);
    try {
      const addr = userAddress || persistedAppKitAddress;
      if (!addr) {
        setCurrentUsername(null);
        return;
      }

      // TODO: implement actual read-only call to GET_NAME contract here.
      // For now, assume no username and avoid throwing errors.
      setCurrentUsername(null);
    } catch (e) {
      console.error('checkUserName error:', e);
      setCurrentUsername(null);
    } finally {
      if (!opts?.silent) setIsCheckingUsername(false);
    }
  }, [userAddress, persistedAppKitAddress]);


  // Synchronizuj stan logowania z propsów
  React.useEffect(() => {
    if (propIsAuthenticated !== undefined) {
      setIsAuthenticated(propIsAuthenticated);
      console.log('🔄 Updated isAuthenticated:', propIsAuthenticated);
    }
  }, [propIsAuthenticated]);

  // Pobierz adres użytkownika z userSession
  React.useEffect(() => {
    if (propUserSession && propUserSession.isUserSignedIn()) {
      try {
        const userData = propUserSession.loadUserData();
        const address = userData?.profile?.stxAddress?.mainnet || null;
        console.log('👤 User data loaded:', { address, userData });
        if (address) {
          setUserAddress(address);
          setIsWalletConnectedViaHiro(true);
          setIsWalletConnectedViaAppKit(false);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    } else {
      if (!effectiveAppKitAddress) {
        setUserAddress(null);
        setIsWalletConnectedViaHiro(false);
        if (propIsAuthenticated === false) {
          setIsAuthenticated(false);
        }
      }
    }
  }, [propUserSession, propIsAuthenticated, effectiveAppKitAddress]);

  // Sprawdź nazwę przy zmianie adresu
  React.useEffect(() => {
    checkUserName();
  }, [checkUserName]);

  // Menu items (moved from legacy root file)
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, to: '/' },
    { id: 'gm', label: 'GM', icon: Sun, to: '/gm' },
    { id: 'vote', label: 'Vote', icon: CheckSquare, to: '/vote' },
    { id: 'message', label: 'Send Message', icon: MessageSquare, to: '/message' },
    { id: 'learn', label: 'Learn', icon: BookOpen, to: '/learn' },
    { id: 'getname', label: 'Get Your Name', icon: User, to: '/getname' },
    { id: 'deploy', label: 'Deploy', icon: Plus, to: '/deploy' }
  ];

  // Synchronizuj activeTab z aktualną ścieżką
  React.useEffect(() => {
    if (path === '/') {
      setActiveTab('home');
    } else if (path.startsWith('/gm')) {
      setActiveTab('gm');
    } else if (path.startsWith('/vote')) {
      setActiveTab('vote');
    } else if (path.startsWith('/message')) {
      setActiveTab('message');
    } else if (path.startsWith('/learn')) {
      setActiveTab('learn');
    } else if (path.startsWith('/getname')) {
      setActiveTab('getname');
    } else if (path.startsWith('/deploy')) {
      setActiveTab('deploy');
    }
          {/* Deploy Panel */}
          {activeTab === 'deploy' && path.startsWith('/deploy') && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <Plus className="text-yellow-400 inline align-middle" size={40} />
                    <span>Deploy</span>
                  </h2>
                  <p className="text-orange-300">Panel for contract deployment and management (coming soon).</p>
                </div>
              </div>
            </div>
          )}
  }, [path]);

  // Sprawdź nazwę przy wejściu na zakładkę getname
  React.useEffect(() => {
    if (activeTab === 'getname') {
      console.log('Entering getname tab, checking username...');
      checkUserName();
    }
  }, [activeTab, checkUserName]);

  // Helper function to extract string from Clarity value
  const extractString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      if ('value' in value) return String(value.value);
      if ('data' in value) return String(value.data);
    }
    return '';
  };

  // Poll helpers - normalize options returned by hooks/usePolls
  const getPollOptions = (poll: any): Array<any> => {
    if (!poll) return [];
    if (Array.isArray(poll.optionsList) && poll.optionsList.length > 0) return poll.optionsList;
    if (Array.isArray(poll.parsedOptions) && poll.parsedOptions.length > 0) return poll.parsedOptions;
    // Fallback: try to extract options from tuple shape
    try {
      const tuple = poll.options?.data || poll.options?.value?.data;
      if (!tuple) return [];
      const items: any[] = [];
      for (let i = 0; i < 10; i++) {
        const opt = tuple[`option-${i}`];
        if (!opt || !opt.value?.data) continue;
        const text = extractString(opt.value.data.text || opt.value.data);
        const votes = (opt.value.data.votes && (typeof opt.value.data.votes === 'bigint' ? Number(opt.value.data.votes) : Number(opt.value.data.votes))) || 0;
        if (text) items.push({ text, votes, index: i });
      }
      return items;
    } catch (e) {
      return [];
    }
  };

  const resolveOptionIndex = (option: any, fallbackIndex: number) => {
    if (option == null) return fallbackIndex;
    if (typeof option.index === 'number') return option.index;
    return fallbackIndex;
  };

  const resolveOptionText = (option: any, fallback: string) => {
    if (option == null) return fallback;
    if (typeof option === 'string') return option;
    return option.text ?? fallback;
  };

  const resolveOptionVotes = (option: any, poll: any, optionIndex: number) => {
    if (option && typeof option.votes === 'number') return option.votes;
    const list = getPollOptions(poll);
    const found = list.find((o: any) => o.index === optionIndex || o.index == optionIndex);
    if (found) return found.votes || 0;
    return 0;
  };

  // Start polling for username after registration/release
  const startUsernamePolling = React.useCallback((shouldClear: boolean) => {
    if (usernamePollTimeoutRef.current) {
      clearTimeout(usernamePollTimeoutRef.current);
    }
    
    const poll = () => {
      checkUserName({ silent: true });
      usernamePollTimeoutRef.current = setTimeout(poll, 5000); // Poll every 5 seconds
    };
    
    if (shouldClear) {
      // Start polling after a short delay to allow the transaction to be processed
      usernamePollTimeoutRef.current = setTimeout(poll, 10000);
    } else {
      // For username release, just wait and check once
      usernamePollTimeoutRef.current = setTimeout(() => {
        checkUserName({ silent: true });
      }, 10000);
    }
  }, [checkUserName]);

  React.useEffect(() => {
    close();
    if (typeof window === 'undefined') return;
    const savedAddress = window.localStorage.getItem(APPKIT_STORAGE_KEY);
    if (savedAddress) {
      setPersistedAppKitAddress(savedAddress);
    }
  }, [close]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (appKitAddress) {
      window.localStorage.setItem(APPKIT_STORAGE_KEY, appKitAddress);
      setPersistedAppKitAddress(appKitAddress);
    } else {
      const storedAddress = window.localStorage.getItem(APPKIT_STORAGE_KEY);
      if (!storedAddress) {
        setPersistedAppKitAddress(null);
      }
    }
  }, [appKitAddress]);

  React.useEffect(() => {
    fetchGmCounts();
    fetchLastGmAndLeaderboard();
    fetchMessageCounts();
    fetchPolls();
    fetchUserVotingStats();
    const interval = setInterval(() => {
      fetchPolls();
      fetchUserVotingStats();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchGmCounts, fetchLastGmAndLeaderboard, fetchMessageCounts, fetchPolls, fetchUserVotingStats]);

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
    if (propUserSession && typeof propUserSession.signUserOut === 'function') {
      propUserSession.signUserOut();
    }
    window.location.reload();
  };

  const handleAppKitDisconnect = React.useCallback(async () => {
    try {
      const module = await import('../config/appkit');
      await module.modal.disconnect('bip122');
    } catch (error) {
      console.error('Error disconnecting AppKit wallet:', error);
    } finally {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(APPKIT_STORAGE_KEY);
      }
      setPersistedAppKitAddress(null);
      if (!isAuthenticated) {
        setUserAddress(null);
      }
      close();
    }
  }, [close, isAuthenticated]);

  const addVoteOption = () => {
    if (voteOptions.length < 10) {
      setVoteOptions([...voteOptions, '']);
    }
  };

  const removeVoteOption = (index: number) => {
    if (voteOptions.length > 2) {
      const newOptions = voteOptions.filter((_, i) => i !== index);
      setVoteOptions(newOptions);
    }
  };

  const updateVoteOption = (index: number, value: string) => {
    const newOptions = [...voteOptions];
    newOptions[index] = value;
    setVoteOptions(newOptions);
  };

  const resetVoteForm = () => {
    setVoteTitle('');
    setVoteDescription('');
    setVoteOptions(['', '']);
    setVoteDuration(100); // 100 minut domyślnie (min 10 bloków)
    setVotesPerUser(1);
    setRequiresSTX(false);
    setMinSTXAmount(0);
    setShowCreateVoteModal(false);
  };

  const handleCreateVote = async () => {
    if (!voteTitle.trim()) {
      alert('Podaj tytuł głosowania');
      return;
    }

    const filledOptions = voteOptions.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      alert('Podaj co najmniej 2 opcje');
      return;
    }

    try {
      const { stringUtf8CV, uintCV, someCV, noneCV, boolCV } = await import('@stacks/transactions');

      // option-0: wymagany string, option-1..9: optional
      const optionArgs = [
        stringUtf8CV(filledOptions[0] || ''),
        ...Array.from({length: 9}, (_, i) =>
          filledOptions[i+1] ? someCV(stringUtf8CV(filledOptions[i+1])) : noneCV()
        )
      ];

      // Konwertuj minuty na bloki (1 blok Stacks = ~10 minut)
      const durationInBlocks = Math.ceil(voteDuration / 10);
      console.log(`⏱️ Creating poll:`);
      console.log(`  - Duration: ${voteDuration} minutes = ${durationInBlocks} blocks`);
      console.log(`  - Title: "${voteTitle}"`);
      console.log(`  - Options: ${filledOptions.length}`, filledOptions);
      console.log(`  - Votes per user: ${votesPerUser}`);
      console.log(`  - Requires STX: ${requiresSTX}`);
      console.log(`  - Min STX: ${minSTXAmount}`);
      
      if (durationInBlocks < 10) {
        alert(`Duration too short! Minimum is 10 blocks (100 minutes). You have ${durationInBlocks} blocks.`);
        return;
      }
      
      const functionArgs = [
        stringUtf8CV(voteTitle),
        stringUtf8CV(voteDescription),
        ...optionArgs,
        uintCV(durationInBlocks),
        uintCV(votesPerUser),
        boolCV(requiresSTX),
        uintCV(minSTXAmount * 1000000)
      ];
      
      console.log('📤 Sending to contract:', functionArgs);

      await openContractCall({
        contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
        contractName: 'votingv1',
        functionName: 'create-poll',
        functionArgs,
        network: new StacksMainnet(),
        onFinish: (data) => {
          console.log('Vote created:', data);
          setTxPopup({ show: true, txId: data.txId });
          resetVoteForm();
          // Odśwież listę głosowań po 5 sekundach
          setTimeout(() => fetchPolls(), 5000);
        },
        onCancel: () => {
          console.log('Vote creation cancelled');
        },
      });
    } catch (e) {
      console.error('Błąd przy tworzeniu głosowania:', e);
      alert('Błąd przy tworzeniu głosowania: ' + (e instanceof Error ? e.message : String(e)));
    }
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
            <p className="text-orange-200 text-center mb-6">Your transaction has been sent to the blockchain.</p>
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
          {isWalletConnectedViaHiro ? (
            <div className="flex items-center gap-3">
              <span className="text-orange-300 text-sm font-semibold">Connected</span>
              <button
                type="button"
                onClick={() => {
                  if (userAddress) {
                    window.open(`https://explorer.stacks.co/address/${userAddress}?chain=mainnet`, '_blank');
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-mono text-sm transition-colors"
              >
                {formatAddress(userAddress)}
              </button>
              <button
                onClick={handleDisconnect}
                className="bg-orange-600/50 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : isWalletConnectedViaAppKit ? (
            <div className="flex items-center gap-3">
              <span className="text-orange-300 text-sm font-semibold">Connected</span>
              <button
                type="button"
                onClick={() => open()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-mono text-sm transition-colors"
              >
                {formatAddress(effectiveAppKitAddress)}
              </button>
              <button
                onClick={handleAppKitDisconnect}
                className="bg-blue-600/50 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('🔘 Orange button clicked! Calling connectWallet...');
                  connectWallet();
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Connect Stack/Btc Wallet
              </button>
              <button
                onClick={() => open()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Connect Btc Wallet
              </button>
            </div>
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
                <SayGMCard />

                <Link to="/message" className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer" style={{ textDecoration: 'none' }}>
                  <Mail className="text-yellow-400 mb-3" size={32} />
                  <h3 className="text-xl text-white mb-2">Post Message</h3>
                  <p className="text-orange-300">Post immutable messages to the blockchain</p>
                </Link>

                <Link to="/vote" className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer" style={{ textDecoration: 'none' }}>
                  <CheckSquare className="text-yellow-400 mb-3" size={32} />
                  <h3 className="text-xl text-white mb-2">Vote</h3>
                  <p className="text-orange-300">Create and participate in on-chain polls</p>
                </Link>

                <GetNameCard />

                <Link to="/learn" className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer" style={{ textDecoration: 'none' }}>
                  <BookOpen className="text-yellow-400 mb-3" size={32} />
                  <h3 className="text-xl text-white mb-2">Learn Stacks</h3>
                  <p className="text-orange-300">Read about stacks basics</p>
                </Link>

                <Link to="/deploy" className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer" style={{ textDecoration: 'none' }}>
                  <Plus className="text-yellow-400 mb-3" size={32} />
                  <h3 className="text-xl text-white mb-2">Deploy</h3>
                  <p className="text-orange-300">Deploy and manage smart contracts</p>
                </Link>
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
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

              <div className="mb-4">
                <label className="block text-purple-300 text-sm mb-2">
                  ⚠️ Note: Message must contain only ASCII characters (no emoji or special characters)
                </label>
                <textarea 
                  id="postMessageInput"
                  placeholder="What's on your mind? (ASCII characters only)"
                  className="w-full bg-purple-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 h-32 resize-none"
                  maxLength={280}
                  onInput={e => {
                    const el = e.target as HTMLTextAreaElement;
                    const counter = document.getElementById('postMessageCounter');
                    if (counter) counter.textContent = `${280 - el.value.length} characters left`;
                  }}
                ></textarea>
              </div>
              <div id="postMessageCounter" className="text-purple-400 text-sm mb-6">280 characters left</div>


              <button 
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isAuthenticated}
                onClick={async () => {
                  if (!isAuthenticated) {
                    alert('Please connect your wallet first!');
                    return;
                  }
                  
                  const input = document.getElementById('postMessageInput') as HTMLTextAreaElement | null;
                  const value: string = input && 'value' in input ? (input.value as string) : '';
                  
                  if (!value || value.length === 0) {
                    alert('Please enter a message!');
                    return;
                  }
                  
                  // Check if message contains only ASCII characters
                  const isAscii = /^[\x00-\x7F]*$/.test(value);
                  if (!isAscii) {
                    alert('Message can only contain ASCII characters (no emoji or special characters). Please remove non-ASCII characters.');
                    return;
                  }
                  
                  try {
                    const { stringAsciiCV } = await import('@stacks/transactions');
                    
                    await openContractCall({
                      network: new StacksMainnet(),
                      anchorMode: 1,
                      contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
                      contractName: POST_MESSAGE_CONTRACT_NAME,
                      functionName: 'post-message',
                      functionArgs: [stringAsciiCV(value)],
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
                      onCancel: () => {
                        console.log('Transaction cancelled by user');
                      }
                    });
                  } catch (error) {
                    console.error('Error posting message:', error);
                    alert('Error posting message: ' + (error instanceof Error ? error.message : 'Unknown error'));
                  }
                }}
              >
                📤 Post Message
              </button>


              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📊</span> Leaderboard
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-orange-900/40 rounded-lg">
                    <tbody>
                      {messageLeaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-orange-300 px-4 py-3 text-center">No data.</td>
                        </tr>
                      ) : (
                        messageLeaderboard.map((entry, idx) => (
                          <tr key={entry.user} className={idx % 2 === 0 ? "bg-orange-900/60" : ""}>
                            <td className="px-4 py-2 text-orange-200 font-bold">{idx + 1}</td>
                            <td className="px-4 py-2 text-orange-100 break-all font-mono text-xs">
                              <a
                                href={`https://explorer.stacks.co/address/${entry.user}?chain=mainnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-orange-300"
                                title={entry.user}
                              >
                                {entry.user.length > 16 ? `${entry.user.slice(0, 8)}...${entry.user.slice(-6)}` : entry.user}
                              </a>
                            </td>
                            <td className="px-4 py-2 text-orange-400 font-bold text-right">{entry.count} MSG</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'vote' && path.startsWith('/vote') && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 shadow-2xl">
              {/* Header z przyciskiem */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Vote</h2>
                  <p className="text-orange-300">Create and participate in on-chain polls.</p>
                </div>
                <button
                  className="rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 h-12 font-bold text-base transition-all shadow-lg hover:shadow-xl"
                  onClick={() => setShowCreateVoteModal(true)}
                >
                  Create New Vote
                </button>
              </div>

              {/* User Statistics Panel */}
              {isAuthenticated && userAddress && (
                <div className="mb-8 bg-gradient-to-br from-orange-900/40 to-purple-900/40 rounded-xl p-6 border border-orange-500/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <User className="mr-2 text-orange-400" size={24} />
                    Your Voting Activity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-500/20">
                      <div className="text-orange-300 text-sm mb-1">Polls Created</div>
                      <div className="text-3xl font-bold text-white">
                        {userPollsCreated}
                      </div>
                    </div>
                    <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-500/20">
                      <div className="text-orange-300 text-sm mb-1">Polls Voted</div>
                      <div className="text-3xl font-bold text-white">
                        {userPollsVoted}
                      </div>
                    </div>
                    <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-500/20">
                      <div className="text-orange-300 text-sm mb-1">Total Votes Cast</div>
                      <div className="text-3xl font-bold text-white">
                        {userTotalVotesCast}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loader podczas ładowania głosowań */}
              {isLoadingPolls && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
                  <div className="text-orange-400 text-lg">Loading polls...</div>
                </div>
              )}

              {/* Grid layout - 2 kolumny: Aktywne i Zakończone */}
              {!isLoadingPolls && (activePolls.length > 0 || closedPolls.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  
                  {/* PANEL 1: Aktywne głosowania */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <CheckSquare className="mr-2 text-green-400" size={24} />
                      Active Polls ({activePolls.length})
                    </h3>
                    
                    {activePolls.length === 0 ? (
                      <div className="text-center py-12 bg-orange-900/20 rounded-lg border border-orange-500/20">
                        <CheckSquare className="mx-auto mb-3 text-orange-400/50" size={48} />
                        <p className="text-orange-300">No active polls</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activePolls.map((poll) => {
                      const pollIdRaw = poll['poll-id']?.value;
                      const pollId = typeof pollIdRaw === 'bigint' ? Number(pollIdRaw) : pollIdRaw;
                      const title = extractString(poll.title) || 'No title';
                      const description = extractString(poll.description) || '';
                      const totalVotesRaw = poll['total-votes']?.value || 0;
                      const totalVotes = typeof totalVotesRaw === 'bigint' ? Number(totalVotesRaw) : totalVotesRaw;
                      const totalVotersRaw = poll['total-voters']?.value || 0;
                      const totalVoters = typeof totalVotersRaw === 'bigint' ? Number(totalVotersRaw) : totalVotersRaw;
                      const blocksRemainingRaw = poll['blocks-remaining']?.value || 0;
                      const blocksRemaining = typeof blocksRemainingRaw === 'bigint' ? Number(blocksRemainingRaw) : blocksRemainingRaw;
                      const minutesRemaining = blocksRemaining * 10; // 1 blok = 10 minut
                      const hoursRemaining = Math.floor(minutesRemaining / 60);
                      
                      return (
                        <div key={pollId} className="bg-orange-900/40 rounded-lg p-6 border border-orange-500/30 hover:border-orange-500/50 transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
                              {description && (
                                <p className="text-orange-200 text-sm mb-3">{description}</p>
                              )}
                            </div>
                            <span className="ml-4 px-3 py-1 rounded-full bg-green-600/30 text-green-300 text-xs font-bold border border-green-500/50">
                              ACTIVE
                            </span>
                          </div>
                          
                          <div className="flex gap-6 text-sm text-orange-300">
                            <div>
                              <span className="font-bold">{totalVotes}</span> votes
                            </div>
                            <div>
                              <span className="font-bold">{totalVoters}</span> voters
                            </div>
                            <div>
                              Ends in <span className="font-bold">{hoursRemaining}h</span> ({blocksRemaining} blocks)
                            </div>
                          </div>
                          
                          <button
                            className="mt-4 w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all"
                            onClick={() => {
                              setSelectedPoll(poll);
                              setShowVoteModal(true);
                            }}
                          >
                            View details & vote
                          </button>
                        </div>
                      );
                    })}
                    </div>
                  )}
                  </div>
                  
                  {/* PANEL 2: Zakończone głosowania */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <X className="mr-2 text-red-400" size={24} />
                      Ended Polls ({closedPolls.length})
                    </h3>
                    
                    {closedPolls.length === 0 ? (
                      <div className="text-center py-12 bg-gray-800/20 rounded-lg border border-gray-600/20">
                        <X className="mx-auto mb-3 text-gray-400/50" size={48} />
                        <p className="text-gray-400">No ended polls</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                    {closedPolls.map((poll) => {
                      const pollIdRaw = poll['poll-id']?.value;
                      const pollId = typeof pollIdRaw === 'bigint' ? Number(pollIdRaw) : pollIdRaw;
                      const title = extractString(poll.title) || 'No title';
                      const description = extractString(poll.description) || '';
                      const totalVotesRaw = poll['total-votes']?.value || 0;
                      const totalVotes = typeof totalVotesRaw === 'bigint' ? Number(totalVotesRaw) : totalVotesRaw;
                      const totalVotersRaw = poll['total-voters']?.value || 0;
                      const totalVoters = typeof totalVotersRaw === 'bigint' ? Number(totalVotersRaw) : totalVotersRaw;
                      
                      return (
                        <div key={pollId} className="bg-gray-800/40 rounded-lg p-6 border border-gray-600/30 hover:border-gray-600/50 transition-all opacity-75">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-300 mb-2">{title}</h4>
                              {description && (
                                <p className="text-gray-400 text-sm mb-3">{description}</p>
                              )}
                            </div>
                            <span className="ml-4 px-3 py-1 rounded-full bg-red-600/30 text-red-300 text-xs font-bold border border-red-500/50">
                              ENDED
                            </span>
                          </div>
                          
                          <div className="flex gap-6 text-sm text-gray-400">
                            <div>
                              <span className="font-bold">{totalVotes}</span> votes
                            </div>
                            <div>
                              <span className="font-bold">{totalVoters}</span> voters
                            </div>
                          </div>
                          
                          <button
                            className="mt-4 w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-all"
                            onClick={() => {
                              setSelectedPoll(poll);
                              setShowVoteModal(true);
                            }}
                          >
                            View results
                          </button>
                        </div>
                      );
                    })}
                    </div>
                  )}
                  </div>
                  
                </div>
              )}

              {/* Brak głosowań - pokazuj tylko gdy nie ma żadnych */}
              {!isLoadingPolls && activePolls.length === 0 && closedPolls.length === 0 && (
                <div className="mt-8 text-center py-12">
                  <CheckSquare className="mx-auto mb-4 text-orange-400/50" size={64} />
                  <p className="text-orange-300 text-lg">No polls yet.</p>
                  <p className="text-orange-400/70 text-sm mt-2">Click "Create New Vote" to create the first poll!</p>
                </div>
              )}

              {showCreateVoteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-br from-orange-900/95 to-purple-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-orange-500/30 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-white">Create New Vote</h3>
                      <button
                        onClick={() => setShowCreateVoteModal(false)}
                        className="text-orange-300 hover:text-white transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-orange-200 mb-2 font-semibold">Title (max 100 chars)</label>
                        <input
                          type="text"
                          maxLength={100}
                          value={voteTitle}
                          onChange={(e) => setVoteTitle(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-orange-900/50 border border-orange-500/30 text-white placeholder-orange-400 focus:outline-none focus:border-orange-400"
                          placeholder="Enter vote title..."
                        />
                        <div className="text-xs text-orange-300/70 mt-1">{voteTitle.length}/100</div>
                      </div>

                      <div>
                        <label className="block text-orange-200 mb-2 font-semibold">Description (max 500 chars)</label>
                        <textarea
                          maxLength={500}
                          value={voteDescription}
                          onChange={(e) => setVoteDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg bg-orange-900/50 border border-orange-500/30 text-white placeholder-orange-400 focus:outline-none focus:border-orange-400"
                          placeholder="Enter vote description..."
                        />
                        <div className="text-xs text-orange-300/70 mt-1">{voteDescription.length}/500</div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-orange-200 font-semibold">Options (2-10)</label>
                          <button
                            onClick={addVoteOption}
                            disabled={voteOptions.length >= 10}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm transition-colors"
                          >
                            <Plus size={16} /> Add Option
                          </button>
                        </div>
                        <div className="space-y-2">
                          {voteOptions.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateVoteOption(index, e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg bg-orange-900/50 border border-orange-500/30 text-white placeholder-orange-400 focus:outline-none focus:border-orange-400"
                                placeholder={`Option ${index + 1}...`}
                              />
                              {voteOptions.length > 2 && (
                                <button
                                  onClick={() => removeVoteOption(index)}
                                  className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                                >
                                  <X size={20} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-orange-200 mb-2 font-semibold">Duration (minutes)</label>
                          <input
                            type="range"
                            min={100}
                            max={10080}
                            step={10}
                            value={voteDuration}
                            onChange={(e) => setVoteDuration(Number(e.target.value))}
                            className="w-full h-2 bg-orange-900/50 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #f97316 0%, #f97316 ${((voteDuration - 100) / (10080 - 100)) * 100}%, rgba(255, 255, 255, 0.1) ${((voteDuration - 100) / (10080 - 100)) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs text-orange-300/70 mt-2">
                            <span>{voteDuration} min ({Math.ceil(voteDuration / 10)} blocks)</span>
                            <span>{(voteDuration / 60).toFixed(1)}h</span>
                            <span>{(voteDuration / 1440).toFixed(1)} days</span>
                          </div>
                          <div className="text-xs text-orange-400/60 mt-1">Minimum: 100 minutes (10 blocks)</div>
                        </div>

                        <div>
                          <label className="block text-orange-200 mb-2 font-semibold">Votes per user</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={votesPerUser}
                            onChange={(e) => setVotesPerUser(Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg bg-orange-900/50 border border-orange-500/30 text-white placeholder-orange-400 focus:outline-none focus:border-orange-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-orange-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requiresSTX}
                            onChange={(e) => setRequiresSTX(e.target.checked)}
                            className="w-5 h-5 rounded border-orange-500/30 bg-orange-900/50 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="font-semibold">Require minimum STX to vote</span>
                        </label>
                        {requiresSTX && (
                          <input
                            type="number"
                            min={0}
                            step={0.1}
                            value={minSTXAmount}
                            onChange={(e) => setMinSTXAmount(Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg bg-orange-900/50 border border-orange-500/30 text-white placeholder-orange-400 focus:outline-none focus:border-orange-400 mt-2"
                            placeholder="Minimum STX amount..."
                          />
                        )}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleCreateVote}
                          disabled={!voteTitle.trim() || voteOptions.filter(o => o.trim()).length < 2}
                          className="flex-1 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold transition-all shadow-lg"
                        >
                          Create Vote
                        </button>
                        <button
                          onClick={resetVoteForm}
                          className="px-6 py-3 rounded-lg bg-orange-700/50 hover:bg-orange-700 text-white font-bold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal do głosowania */}
              {showVoteModal && selectedPoll && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-br from-orange-900/95 to-purple-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-orange-500/30 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-white">
                        {selectedPoll.title?.value || selectedPoll.title?.data || 'Poll Details'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowVoteModal(false);
                          setSelectedPoll(null);
                        }}
                        className="text-orange-300 hover:text-white transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {/* Description */}
                    {(selectedPoll.description?.value || selectedPoll.description?.data) && (
                      <p className="text-orange-200 mb-6">
                        {selectedPoll.description?.value || selectedPoll.description?.data}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-500/20">
                        <div className="text-orange-300 text-sm mb-1">Total Votes</div>
                        <div className="text-2xl font-bold text-white">
                          {typeof selectedPoll['total-votes']?.value === 'bigint' 
                            ? Number(selectedPoll['total-votes'].value) 
                            : selectedPoll['total-votes']?.value || 0}
                        </div>
                      </div>
                      <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-500/20">
                        <div className="text-orange-300 text-sm mb-1">Total Voters</div>
                        <div className="text-2xl font-bold text-white">
                          {typeof selectedPoll['total-voters']?.value === 'bigint' 
                            ? Number(selectedPoll['total-voters'].value) 
                            : selectedPoll['total-voters']?.value || 0}
                        </div>
                      </div>
                      <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-500/20">
                        <div className="text-orange-300 text-sm mb-1">Status</div>
                        <div className="text-lg font-bold">
                          {selectedPoll['is-active-calculated']?.value ? (
                            <span className="text-green-400">ACTIVE</span>
                          ) : (
                            <span className="text-red-400">ENDED</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Time remaining */}
                    {selectedPoll['is-active-calculated']?.value && (
                      <div className="mb-6 text-orange-300">
                        ⏱️ Ends in <span className="font-bold text-white">
                          {Math.floor(((selectedPoll['blocks-remaining']?.value || 0) * 10) / 60)}h {((selectedPoll['blocks-remaining']?.value || 0) * 10) % 60}min
                        </span> ({selectedPoll['blocks-remaining']?.value || 0} blocks)
                      </div>
                    )}

                    {/* Helper to get poll options in any format */}


                    {selectedPoll['is-active-calculated']?.value ? (
                      <div className="space-y-3 mb-6">
                        <h4 className="text-lg font-bold text-white mb-3">Cast your vote:</h4>
                        {(() => {
                          const options = getPollOptions(selectedPoll);
                          return options.map((option: any, index: number) => {
                            const optionIndex = resolveOptionIndex(option, index);
                            const optionText = resolveOptionText(option, `Option ${optionIndex + 1}`);
                            const optionVotesNum = resolveOptionVotes(option, selectedPoll, optionIndex);
                            const totalVotes = typeof selectedPoll['total-votes']?.value === 'bigint' 
                              ? Number(selectedPoll['total-votes'].value) 
                              : selectedPoll['total-votes']?.value || 0;
                            const percentage = totalVotes > 0 ? ((optionVotesNum / totalVotes) * 100).toFixed(1) : '0.0';
                            return (
                              <button
                                key={`${optionText}-${optionIndex}`}
                                onClick={async () => {
                                  try {
                                    const { uintCV } = await import('@stacks/transactions');
                                    const pollId = typeof selectedPoll['poll-id']?.value === 'bigint' 
                                      ? Number(selectedPoll['poll-id'].value) 
                                      : selectedPoll['poll-id']?.value;
                                    
                                    await openContractCall({
                                      contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
                                      contractName: 'votingv1',
                                      functionName: 'vote',
                                      functionArgs: [uintCV(pollId), uintCV(optionIndex)],
                                      network: new StacksMainnet(),
                                      onFinish: (data: any) => {
                                        console.log('Vote submitted:', data);
                                        setTxPopup({ show: true, txId: data.txId });
                                        setShowVoteModal(false);
                                        setSelectedPoll(null);
                                        setTimeout(() => fetchPolls(), 5000);
                                      },
                                      onCancel: () => {
                                        console.log('Vote cancelled');
                                      },
                                    });
                                  } catch (e) {
                                    console.error('Vote error:', e);
                                    alert('Error casting vote: ' + (e instanceof Error ? e.message : String(e)));
                                  }
                                }}
                                className="w-full text-left p-4 rounded-lg bg-orange-900/50 hover:bg-orange-800/70 border border-orange-500/30 hover:border-orange-500/50 transition-all"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-white font-medium">{optionText}</span>
                                  <span className="text-orange-300 font-bold">{optionVotesNum} votes ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-orange-900/30 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <div className="space-y-3 mb-6">
                        <h4 className="text-lg font-bold text-white mb-3">
                          {selectedPoll['is-active-calculated']?.value ? 'Current Results:' : 'Final Results:'}
                        </h4>
                        {getPollOptions(selectedPoll).map((option: any, index: number) => {
                          const optionIndex = resolveOptionIndex(option, index);
                          const optionText = resolveOptionText(option, `Option ${optionIndex + 1}`);
                          const optionVotesNum = resolveOptionVotes(option, selectedPoll, optionIndex);
                          const totalVotes = typeof selectedPoll['total-votes']?.value === 'bigint' 
                            ? Number(selectedPoll['total-votes'].value) 
                            : selectedPoll['total-votes']?.value || 0;
                          const percentage = totalVotes > 0 ? ((optionVotesNum / totalVotes) * 100).toFixed(1) : '0.0';
                          return (
                            <div key={`${optionText}-${optionIndex}`} className="p-4 rounded-lg bg-gray-800/50 border border-gray-600/30">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-white font-medium">{optionText}</span>
                                <span className="text-orange-300 font-bold">{optionVotesNum} votes ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-gray-900/30 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!isAuthenticated && selectedPoll['is-active-calculated']?.value && (
                      <div className="text-center text-orange-300 py-4">
                        Connect your wallet to vote
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setShowVoteModal(false);
                        setSelectedPoll(null);
                      }}
                      className="w-full py-3 rounded-lg bg-orange-700/50 hover:bg-orange-700 text-white font-bold transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'getname' && path.startsWith('/getname') && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">Get Your Name</h2>
              {isConfirmingUsername && (
                <div className="text-orange-300 text-sm text-center mb-4">Waiting for blockchain confirmation...</div>
              )}
              
              {/* Loader podczas sprawdzania */}
              {isCheckingUsername && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
                  <div className="text-orange-400 text-lg">Checking your name...</div>
                </div>
              )}

              {/* Jeśli użytkownik ma już nazwę */}
              {!isCheckingUsername && currentUsername !== null && (
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center text-xl font-semibold text-orange-400">
                    You already have a name: <span className="text-white">{currentUsername}.stacks</span>
                  </div>
                  <button
                    className="rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 h-12 font-bold text-base transition-all shadow-lg hover:shadow-xl"
                    onClick={async () => {
                      try {
                        const { stringAsciiCV } = await import('@stacks/transactions');
                        // Usuń podwójne cudzysłowy z początku i końca, jeśli są
                        const cleanUsername = currentUsername.replace(/^"+|"+$/g, '');
                        await openContractCall({
                          contractAddress: GET_NAME_CONTRACT_ADDRESS,
                          contractName: GET_NAME_CONTRACT_NAME,
                          functionName: 'release-username',
                          functionArgs: [stringAsciiCV(cleanUsername)],
                          network: new StacksMainnet(),
                          onFinish: (data: any) => {
                            console.log('Transaction submitted:', data);
                            setTxPopup({ show: true, txId: data.txId });
                            startUsernamePolling(false);
                          },
                          onCancel: () => {
                            console.log('Transaction cancelled');
                          },
                        });
                      } catch (e) {
                        console.error('Error releasing username:', e);
                      }
                    }}
                  >
                    Release Name
                  </button>
                </div>
              )}

              {/* Jeśli użytkownik nie ma nazwy */}
              {!isCheckingUsername && currentUsername === null && (
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
                          console.log('Response from is-username-available:', res);
                          console.log('Response type:', (res as any).type);
                          // Odpowiedź jest bezpośrednio w res, a nie res.value
                          // type 3 = true (dostępna), type 4 = false (zajęta)
                          const available = (res as any).type === 3;
                          console.log('Is available:', available);
                          
                          // Pokaż odpowiedni popup
                          if (available) {
                            setShowAvailablePopup(true);
                          } else {
                            setShowTakenPopup(true);
                          }
                        } catch (e) {
                          console.error('Error checking availability:', e);
                        }
                      }}
                    >
                      Check
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'learn' && path.startsWith('/learn') && !/^\/learn\/[\w-]+$/.test(path) && (
          <LearnCard />
        )}
      </main>

      {/* Popup - Name is taken */}
      {showTakenPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTakenPopup(false)}>
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-orange-400" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg mb-4">
                <span className="text-4xl">❌</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Oops!</h3>
              <p className="text-white text-lg mb-6">This name is already taken.</p>
              <button
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-3 font-bold text-lg transition-all shadow-lg hover:shadow-xl mb-3"
                onClick={() => setShowTakenPopup(false)}
              >
                Try Another Name
              </button>
              <button
                className="text-white text-base hover:text-gray-200 transition-all"
                onClick={() => setShowTakenPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup - Name is available */}
      {showAvailablePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAvailablePopup(false)}>
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-orange-400" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg mb-4">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-10 w-10 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Great!</h3>
              <p className="text-white text-lg mb-6">This name is available for you.</p>
              {isAuthenticated ? (
                <>
                  <button
                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-3 font-bold text-lg transition-all shadow-lg hover:shadow-xl mb-3"
                    onClick={async () => {
                      setShowAvailablePopup(false);
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
                            setInputName('');
                            startUsernamePolling(true);
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
                    Register Now
                  </button>
                  <button
                    className="text-white text-base hover:text-gray-200 transition-all"
                    onClick={() => setShowAvailablePopup(false)}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <div className="text-white text-base mb-4">Connect your wallet to register this name</div>
                  <button
                    className="text-white text-base hover:text-gray-200 transition-all"
                    onClick={() => setShowAvailablePopup(false)}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  export default StacksClickAndShip;
