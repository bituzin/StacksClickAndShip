import React, { useState } from 'react';
import { Sun, MessageSquare, CheckSquare, BookOpen, Home } from 'lucide-react';
import { UserSession } from '@stacks/connect';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { stringUtf8CV } from '@stacks/transactions';
import LessonModal from './modals/LessonModal';

interface StacksClickAndShipProps {
  isAuthenticated: boolean;
  connectWallet: () => void;
  userSession: UserSession;
}

interface Lesson {
  title: string;
  level: string;
  duration: string;
  isAvailable: boolean; // Nowe pole
}

export default function StacksClickAndShip({ 
  isAuthenticated, 
  connectWallet, 
  userSession 
}: StacksClickAndShipProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [copied, setCopied] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gm', label: 'GM', icon: Sun },
    { id: 'message', label: 'Post', icon: MessageSquare },
    { id: 'vote', label: 'Vote', icon: CheckSquare },
    { id: 'learn', label: 'Learn', icon: BookOpen }
  ];

  // Tylko "What is Stacks?" jest dostępna, reszta wkrótce
  const lessons: Lesson[] = [
    { title: 'What is Stacks?', level: 'Beginner', duration: '5 min', isAvailable: true },
    { title: 'Proof of Transfer (PoX)', level: 'Intermediate', duration: '10 min', isAvailable: false },
    { title: 'Bitcoin Layer 2 Explained', level: 'Beginner', duration: '7 min', isAvailable: false },
    { title: 'Stacking - Earn Bitcoin', level: 'Intermediate', duration: '12 min', isAvailable: false },
    { title: 'Clarity vs Solidity', level: 'Advanced', duration: '15 min', isAvailable: false },
    { title: 'Build Your First dApp', level: 'Intermediate', duration: '30 min', isAvailable: false }
  ];

  const getUserAddress = () => {
    if (isAuthenticated && userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      return userData.profile.stxAddress.testnet;
    }
    return null;
  };

  const GMOK_CONTRACT_ADDRESS = 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86';
  const GMOK_CONTRACT_NAME = 'gm02';

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
        window.location.reload();
      },
    });
  }

  const handleLessonClick = (lesson: Lesson) => {
    if (!lesson.isAvailable) return; // Nie klikalne jeśli niedostępne
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-amber-900">
        <header className="bg-black/30 backdrop-blur-sm border-b border-orange-500/30">
          <div className="container mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex flex-col items-start">
              <h1 className="text-2xl text-white mb-1">Stacks - Click and Ship</h1>
              <p className="text-base text-orange-300 italic">* GM, post, vote, learn...</p>
            </div>
            {isAuthenticated && (
              <button
                className="text-orange-400 text-sm ml-4 whitespace-nowrap hover:underline focus:outline-none"
                title="Click to copy full address"
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

        <nav className="bg-orange-950/50 backdrop-blur-sm border-b border-orange-500/20">
          <div className="container mx-auto px-6">
            <div className="flex justify-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-6 py-4 transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-orange-600 text-white border-b-4 border-amber-400'
                        : 'text-orange-300 hover:bg-orange-800/50 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-12">
          {activeTab === 'home' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 shadow-2xl">
                <h2 className="text-2xl text-white mb-2">Welcome to Stacks - Click and Ship</h2>
                <p className="text-base text-orange-300 italic mb-6">* GM, post, vote, learn...</p>
                <p className="text-orange-200 text-lg mb-8">
                  Your all-in-one toolkit for the Stacks blockchain. Say GM, send messages, create vote, and learn about Stacks basics - all in one place.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div onClick={() => setActiveTab('gm')} className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer">
                    <Sun className="text-yellow-400 mb-3" size={32} />
                    <h3 className="text-xl text-white mb-2">Say GM!</h3>
                    <p className="text-orange-300">Say good morning on-chain and build your streak</p>
                  </div>

                  <div onClick={() => setActiveTab('message')} className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer">
                    <MessageSquare className="text-amber-400 mb-3" size={32} />
                    <h3 className="text-xl text-white mb-2">Post Message</h3>
                    <p className="text-orange-300">Post immutable messages to the blockchain</p>
                  </div>

                  <div onClick={() => setActiveTab('vote')} className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer">
                    <CheckSquare className="text-yellow-400 mb-3" size={32} />
                    <h3 className="text-xl text-white mb-2">Vote</h3>
                    <p className="text-orange-300">Create and participate in on-chain polls</p>
                  </div>

                  <div onClick={() => setActiveTab('learn')} className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer">
                    <BookOpen className="text-amber-300 mb-3" size={32} />
                    <h3 className="text-xl text-white mb-2">Learn Stacks</h3>
                    <p className="text-orange-300">Read about stacks basics</p>
                  </div>
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

          {activeTab === 'gm' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 shadow-2xl">
                <div className="text-center mb-8">
                  <Sun className="text-yellow-400 mx-auto mb-4" size={64} />
                  <h2 className="text-4xl font-bold text-white mb-2">Say GM to Stacks!</h2>
                  <p className="text-orange-300">Today's GM count: 247</p>
                  <p className="text-orange-400 font-bold text-2xl mt-2">Your streak: 🔥 12 days</p>
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

          {activeTab === 'message' && (
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

          {activeTab === 'vote' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-4">Vote</h2>
                <p className="text-orange-300 mb-6">Create and participate in on-chain polls.</p>
              </div>
            </div>
          )}

          {activeTab === 'learn' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-6">📚 Learn Stacks</h2>
                <p className="text-purple-300 mb-8 text-center">
                  Click on available lessons to start learning. More lessons coming soon!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lessons.map((lesson, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleLessonClick(lesson)}
                      className={`rounded-xl p-6 border transition-all ${
                        lesson.isAvailable
                          ? 'bg-purple-900/40 border-purple-500/20 hover:border-purple-400/50 cursor-pointer hover:scale-[1.02]'
                          : 'bg-gray-800/40 border-gray-700/30 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
                          {!lesson.isAvailable && (
                            <span className="ml-3 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <BookOpen className={`${lesson.isAvailable ? 'text-pink-400' : 'text-gray-500'}`} size={24} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`${lesson.isAvailable ? 'text-purple-400' : 'text-gray-500'}`}>
                          {lesson.level}
                        </span>
                        <span className={`${lesson.isAvailable ? 'text-purple-400' : 'text-gray-500'}`}>
                          {lesson.duration}
                        </span>
                      </div>
                      {!lesson.isAvailable && (
                        <div className="mt-4 text-gray-400 text-sm italic">
                          Lesson in preparation
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedLesson && selectedLesson.isAvailable && (
        <LessonModal
          isOpen={isModalOpen}
          onClose={closeModal}
          lesson={{
            ...selectedLesson,
            content: null
          }}
        />
      )}
    </>
  );
}