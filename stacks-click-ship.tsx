import React, { useState } from 'react';
import { Sun, MessageSquare, Upload, BookOpen, Home, Plus, X, CheckSquare, User } from 'lucide-react';

export default function StacksClickAndShip() {
  const [activeTab, setActiveTab] = useState('home');
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);
  const [voteTitle, setVoteTitle] = useState('');
  const [voteDescription, setVoteDescription] = useState('');
  const [voteOptions, setVoteOptions] = useState(['', '']);
  const [voteDuration, setVoteDuration] = useState('144');
  const [votesPerUser, setVotesPerUser] = useState('1');
  const [requiresSTX, setRequiresSTX] = useState(false);
  const [minSTXAmount, setMinSTXAmount] = useState('0');

  const addVoteOption = () => {
    if (voteOptions.length < 10) {
      setVoteOptions([...voteOptions, '']);
    }
  };

  const removeVoteOption = (index) => {
    if (voteOptions.length > 2) {
      setVoteOptions(voteOptions.filter((_, i) => i !== index));
    }
  };

  const updateVoteOption = (index, value) => {
    const newOptions = [...voteOptions];
    newOptions[index] = value;
    setVoteOptions(newOptions);
  };

  const resetVoteForm = () => {
    setVoteTitle('');
    setVoteDescription('');
    setVoteOptions(['', '']);
    setVoteDuration('144');
    setVotesPerUser('1');
    setRequiresSTX(false);
    setMinSTXAmount('0');
  };

  const handleCreateVote = () => {
    // TODO: Implement contract call to create-poll
    console.log('Creating vote:', {
      title: voteTitle,
      description: voteDescription,
      options: voteOptions.filter(o => o.trim() !== ''),
      duration: voteDuration,
      votesPerUser,
      requiresSTX,
      minSTXAmount
    });
    setShowCreateVoteModal(false);
    resetVoteForm();
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gm', label: 'GM', icon: Sun },
    { id: 'vote', label: 'Vote', icon: Vote },
    { id: 'message', label: 'Send Message', icon: MessageSquare },
    { id: 'deploy', label: 'Deploy', icon: Upload },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'get-name', label: 'Get Your Name', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-5xl font-bold text-white text-center mb-2">
            StacksClickAndShip
          </h1>
          <p className="text-xl text-purple-300 text-center italic">
            * GM, deploy, learn *
          </p>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="bg-purple-950/50 backdrop-blur-sm border-b border-purple-500/20">
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
                      ? 'bg-purple-600 text-white border-b-4 border-orange-400'
                      : 'text-purple-300 hover:bg-purple-800/50 hover:text-white'
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-4xl font-bold text-white mb-6">Welcome to StacksClickAndShip 🚀</h2>
              <p className="text-purple-200 text-lg mb-8">
                Your all-in-one toolkit for the Stacks blockchain. Deploy contracts, say GM, send messages, and learn - all in one place.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-900/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer">
                  <Sun className="text-orange-400 mb-3" size={32} />
                  <h3 className="text-xl font-bold text-white mb-2">GM Broadcaster</h3>
                  <p className="text-purple-300">Say good morning on-chain and build your streak</p>
                </div>

                <div className="bg-purple-900/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer">
                  <MessageSquare className="text-blue-400 mb-3" size={32} />
                  <h3 className="text-xl font-bold text-white mb-2">Message Board</h3>
                  <p className="text-purple-300">Post immutable messages to the blockchain</p>
                </div>

                <div className="bg-purple-900/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer">
                  <Upload className="text-green-400 mb-3" size={32} />
                  <h3 className="text-xl font-bold text-white mb-2">Contract Deployer</h3>
                  <p className="text-purple-300">Deploy Clarity smart contracts with ease</p>
                </div>

                <div className="bg-purple-900/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer">
                  <BookOpen className="text-pink-400 mb-3" size={32} />
                  <h3 className="text-xl font-bold text-white mb-2">Learn Stacks</h3>
                  <p className="text-purple-300">Interactive tutorials and documentation</p>
                </div>

                <div className="bg-blue-100/40 rounded-xl p-6 border border-blue-400/20 hover:border-blue-400/50 transition-all cursor-pointer" onClick={() => setActiveTab('get-name')}>
                  <User className="text-cyan-600 mb-3" size={32} />
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Get Your Name</h3>
                  <p className="text-blue-800">Register your unique username on Stacks blockchain</p>
                </div>
              </div>

              <div className="mt-8 text-center space-x-4">
                <button className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  Connect Wallet
                </button>
                <button 
                  onClick={() => setShowCreateVoteModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🗳️ Create Vote
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Vote Modal */}
        {showCreateVoteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl border-2 border-purple-500/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-purple-900/95 backdrop-blur-sm border-b border-purple-500/30 p-6 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">🗳️ Create New Vote</h2>
                <button 
                  onClick={() => { setShowCreateVoteModal(false); resetVoteForm(); }}
                  className="text-purple-300 hover:text-white transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-purple-300 mb-2 font-semibold">📝 Title (max 100 chars)</label>
                  <input 
                    type="text"
                    maxLength={100}
                    value={voteTitle}
                    onChange={(e) => setVoteTitle(e.target.value)}
                    placeholder="e.g., What should we build next?"
                    className="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50"
                  />
                  <div className="text-purple-400 text-sm mt-1">{voteTitle.length}/100</div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-purple-300 mb-2 font-semibold">📄 Description (optional, max 500 chars)</label>
                  <textarea 
                    maxLength={500}
                    value={voteDescription}
                    onChange={(e) => setVoteDescription(e.target.value)}
                    placeholder="Add more context about this vote..."
                    className="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 h-24 resize-none"
                  ></textarea>
                  <div className="text-purple-400 text-sm mt-1">{voteDescription.length}/500</div>
                </div>

                {/* Options */}
                <div>
                  <label className="block text-purple-300 mb-3 font-semibold">✅ Options (min 2, max 10)</label>
                  <div className="space-y-3">
                    {voteOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <input 
                          type="text"
                          maxLength={100}
                          value={option}
                          onChange={(e) => updateVoteOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50"
                        />
                        {voteOptions.length > 2 && (
                          <button 
                            onClick={() => removeVoteOption(index)}
                            className="flex-shrink-0 w-8 h-8 bg-red-600/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {voteOptions.length < 10 && (
                    <button 
                      onClick={addVoteOption}
                      className="mt-3 w-full bg-purple-800/40 hover:bg-purple-700/60 border border-purple-500/30 hover:border-purple-400 rounded-lg px-4 py-2 text-purple-300 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      <span>Add Option ({voteOptions.length}/10)</span>
                    </button>
                  )}
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Duration */}
                  <div>
                    <label className="block text-purple-300 mb-2 font-semibold">⏱️ Duration (blocks)</label>
                    <input 
                      type="number"
                      min="10"
                      value={voteDuration}
                      onChange={(e) => setVoteDuration(e.target.value)}
                      className="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50"
                    />
                    <div className="text-purple-400 text-xs mt-1">~{Math.floor(Number(voteDuration) / 144)} days</div>
                  </div>

                  {/* Votes per user */}
                  <div>
                    <label className="block text-purple-300 mb-2 font-semibold">🎯 Votes per user</label>
                    <input 
                      type="number"
                      min="1"
                      value={votesPerUser}
                      onChange={(e) => setVotesPerUser(e.target.value)}
                      className="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50"
                    />
                  </div>
                </div>

                {/* STX Requirement */}
                <div className="bg-purple-950/30 rounded-lg p-4 border border-purple-500/20">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={requiresSTX}
                      onChange={(e) => setRequiresSTX(e.target.checked)}
                      className="w-5 h-5 rounded border-purple-500/30 text-purple-600 focus:ring-purple-400"
                    />
                    <span className="text-purple-300 font-semibold">💰 Require minimum STX balance to vote</span>
                  </label>
                  
                  {requiresSTX && (
                    <div className="mt-3">
                      <input 
                        type="number"
                        min="0"
                        step="0.000001"
                        value={minSTXAmount}
                        onChange={(e) => setMinSTXAmount(e.target.value)}
                        placeholder="0.000000"
                        className="w-full bg-purple-950/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50"
                      />
                      <div className="text-purple-400 text-xs mt-1">Minimum STX balance required</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-purple-900/95 backdrop-blur-sm border-t border-purple-500/30 p-6 flex gap-3">
                <button 
                  onClick={() => { setShowCreateVoteModal(false); resetVoteForm(); }}
                  className="flex-1 bg-purple-800/50 hover:bg-purple-700/70 text-purple-200 hover:text-white font-bold py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateVote}
                  disabled={!voteTitle.trim() || voteOptions.filter(o => o.trim()).length < 2}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  🗳️ Create Vote
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vote' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-4">🗳️ Decentralized Voting</h2>
                <p className="text-purple-200 text-lg mb-6">
                  Create and participate in on-chain votes. All results are transparent and immutable.
                </p>
                <button 
                  onClick={() => setShowCreateVoteModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                >
                  🗳️ Create New Vote
                </button>
              </div>

              <div className="mt-10">
                <h3 className="text-2xl font-bold text-white mb-4">📊 Active Votes</h3>
                <div className="space-y-4">
                  {[
                    { 
                      title: 'What should we build next?', 
                      creator: 'alice.stx', 
                      votes: 142, 
                      ends: '2 days', 
                      options: ['NFT Marketplace', 'DAO Tools', 'DeFi Protocol'] 
                    },
                    { 
                      title: 'Approve community grant proposal', 
                      creator: 'bob.btc', 
                      votes: 89, 
                      ends: '5 days', 
                      options: ['Yes', 'No', 'Abstain'] 
                    },
                  ].map((vote, idx) => (
                    <div key={idx} className="bg-purple-900/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/50 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-white mb-2">{vote.title}</h4>
                          <p className="text-purple-300 text-sm">Created by {vote.creator}</p>
                        </div>
                        <div className="bg-purple-700/50 px-4 py-2 rounded-lg">
                          <p className="text-orange-400 font-bold text-sm">Ends in {vote.ends}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {vote.options.map((option, optIdx) => (
                          <button 
                            key={optIdx}
                            className="w-full bg-purple-950/50 hover:bg-purple-800/50 border border-purple-500/30 hover:border-purple-400 rounded-lg px-4 py-3 text-left text-white transition-all"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-purple-400">💬 {vote.votes} votes</span>
                        <button className="text-purple-400 hover:text-white transition-colors">View Details →</button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Empty state if no votes */}
                <div className="mt-8 text-center text-purple-400 text-sm">
                  <p>No active votes found. Create one to get started!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gm' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <div className="text-center mb-8">
                <Sun className="text-orange-400 mx-auto mb-4" size={64} />
                <h2 className="text-4xl font-bold text-white mb-2">Good Morning Stacks! ☀️</h2>
                <p className="text-purple-300">Today's GM count: 247</p>
                <p className="text-orange-400 font-bold text-2xl mt-2">Your streak: 🔥 12 days</p>
              </div>

              <div className="mb-6">
                <label className="block text-purple-300 mb-2">Optional message:</label>
                <input 
                  type="text" 
                  placeholder="gm from Poland! 🇵🇱" 
                  className="w-full bg-purple-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                />
              </div>

              <button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl">
                ☀️ Say GM (0.01 STX)
              </button>

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
                className="w-full bg-purple-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 h-32 resize-none mb-2"
              ></textarea>
              <div className="text-purple-400 text-sm mb-4">0/280 characters</div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-purple-300">💰 Cost: 0.02 STX</span>
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                  📤 Post Message
                </button>
              </div>

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

        {activeTab === 'deploy' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6">🚀 Deploy Smart Contract</h2>
              
              <div className="mb-4">
                <label className="block text-purple-300 mb-2">Contract Name</label>
                <input 
                  type="text" 
                  placeholder="my-token" 
                  className="w-full bg-purple-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="mb-4">
                <label className="block text-purple-300 mb-2">📄 Upload .clar file or paste code</label>
                <textarea 
                  placeholder="(define-data-var counter uint u0)&#10;&#10;(define-public (increment)&#10;  (ok (var-set counter (+ (var-get counter) u1))))"
                  className="w-full bg-purple-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 h-48 font-mono text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <label className="block text-purple-300 mb-2">Network</label>
                  <select className="bg-purple-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400">
                    <option>Testnet</option>
                    <option>Mainnet</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-purple-300 mb-2">💰 Estimated Fee</label>
                  <div className="bg-purple-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-orange-400 font-bold">
                    0.05 STX
                  </div>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl">
                🚀 Deploy Contract
              </button>
            </div>
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-yellow-100 via-orange-200 to-pink-200 backdrop-blur-md rounded-2xl p-8 border border-yellow-400/30 shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">📚 Learn Stacks</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'What is Stacks?', level: 'Beginner', duration: '5 min' },
                  { title: 'Proof of Transfer (PoX)', level: 'Intermediate', duration: '10 min' },
                  { title: 'Bitcoin Layer 2 Explained', level: 'Beginner', duration: '7 min' },
                  { title: 'Stacking - Earn Bitcoin', level: 'Intermediate', duration: '12 min' },
                  { title: 'Clarity vs Solidity', level: 'Advanced', duration: '15 min' },
                  { title: 'Build Your First dApp', level: 'Intermediate', duration: '30 min' }
                ].map((tutorial, idx) => (
                  <div key={idx} className="bg-purple-900/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-white">{tutorial.title}</h3>
                      <BookOpen className="text-pink-400" size={24} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-400">{tutorial.level}</span>
                      <span className="text-purple-400">{tutorial.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'get-name' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-blue-100 via-cyan-200 to-green-200 backdrop-blur-md rounded-2xl p-8 border border-blue-400/30 shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">🆔 Get Your Name</h2>
              
              <div className="mb-4">
                <label className="block text-purple-300 mb-2">Enter your desired name</label>
                <input 
                  type="text" 
                  placeholder="my-awesome-name" 
                  className="w-full bg-purple-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-purple-300">🌟 Availability: <span className="font-bold text-green-400">Available!</span></span>
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                  ⏩ Claim Name
                </button>
              </div>

              <div className="text-center text-purple-400 text-sm">
                <p>* Names are permanent and unique to your profile *</p>
                <p>* You can change your name once every 30 days *</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}