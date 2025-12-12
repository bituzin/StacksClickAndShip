import React from 'react';
import { X, BookOpen, CheckCircle, Shield, Code, Zap, Bitcoin, Award, Clock, ExternalLink, Layers, Cpu, Database, Lock, Globe, Rocket, Users, BarChart3 } from 'lucide-react';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: {
    title: string;
    level: string;
    duration: string;
    content: React.ReactNode;
  };
}

export default function LessonModal({ isOpen, onClose, lesson }: LessonModalProps) {
  if (!isOpen) return null;

  const getLessonContent = () => {
    if (lesson.title === 'What is Stacks?') {
      return (
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mb-4">
              <Layers className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Bitcoin's Smart Contract Layer</h1>
            <p className="text-orange-200 text-lg max-w-3xl mx-auto">
              Stacks brings programmability to Bitcoin without compromising its security or modifying its core protocol.
            </p>
          </div>

          {/* Core Concept */}
          <div className="bg-gradient-to-r from-orange-900/20 to-purple-900/20 p-6 rounded-2xl border border-orange-500/20 mb-8">
            <div className="flex items-start mb-4">
              <div className="bg-orange-500/20 p-3 rounded-lg mr-4">
                <Shield className="text-orange-400" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">The Bitcoin Layer 2 Solution</h3>
                <p className="text-orange-200">
                  Stacks operates as a separate blockchain that settles transactions on Bitcoin. Every Stacks block is 
                  anchored to a Bitcoin block, inheriting Bitcoin's unmatched security while adding smart contract capabilities.
                </p>
              </div>
            </div>
          </div>

          {/* Architecture Diagram */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-6 text-center">📊 How Stacks Connects to Bitcoin</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="bg-yellow-900/40 p-4 rounded-xl border border-yellow-500/30">
                    <Bitcoin className="text-yellow-400 mx-auto mb-2" size={32} />
                    <div className="text-white font-bold">Bitcoin Layer 1</div>
                    <div className="text-yellow-300 text-sm">Security & Settlement</div>
                  </div>
                </div>
                <div className="text-purple-400 text-2xl">⇅</div>
                <div className="text-center">
                  <div className="bg-orange-900/40 p-4 rounded-xl border border-orange-500/30">
                    <Layers className="text-orange-400 mx-auto mb-2" size={32} />
                    <div className="text-white font-bold">Stacks Layer 2</div>
                    <div className="text-orange-300 text-sm">Smart Contracts & dApps</div>
                  </div>
                </div>
              </div>
              <div className="text-gray-400 text-sm text-center max-w-md">
                Stacks blocks reference Bitcoin blocks, creating a cryptographic link
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-orange-900/30 p-6 rounded-2xl border border-orange-500/20">
              <div className="flex items-center mb-4">
                <div className="bg-green-500/20 p-2 rounded-lg mr-3">
                  <Lock className="text-green-400" size={24} />
                </div>
                <h4 className="text-white font-bold text-lg">Bitcoin Security First</h4>
              </div>
              <ul className="space-y-3 text-orange-300">
                <li className="flex items-start">
                  <CheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span><strong>Proof of Work Security</strong> - Inherits Bitcoin's battle-tested security model</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span><strong>Settles on Bitcoin</strong> - Every transaction is anchored to Bitcoin</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span><strong>No Compromises</strong> - Bitcoin remains unchanged and secure</span>
                </li>
              </ul>
            </div>

            <div className="bg-purple-900/30 p-6 rounded-2xl border border-purple-500/20">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                  <Cpu className="text-blue-400" size={24} />
                </div>
                <h4 className="text-white font-bold text-lg">Smart Contract Power</h4>
              </div>
              <ul className="space-y-3 text-purple-300">
                <li className="flex items-start">
                  <CheckCircle className="text-blue-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span><strong>Clarity Language</strong> - Safe, predictable smart contracts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-blue-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span><strong>Full Programmability</strong> - Build complex dApps like on Ethereum</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-blue-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span><strong>Gas Predictability</strong> - Know costs upfront, no surprises</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-6 text-center">🚀 What Can You Build on Stacks?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 p-5 rounded-xl border border-blue-500/20 text-center">
                <Database className="text-blue-400 mx-auto mb-3" size={32} />
                <h4 className="text-white font-bold mb-2">DeFi on Bitcoin</h4>
                <p className="text-blue-300 text-sm">Lending, borrowing, trading with Bitcoin security</p>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 p-5 rounded-xl border border-purple-500/20 text-center">
                <Globe className="text-purple-400 mx-auto mb-3" size={32} />
                <h4 className="text-white font-bold mb-2">Bitcoin NFTs</h4>
                <p className="text-purple-300 text-sm">Digital art and collectibles secured by Bitcoin</p>
              </div>
              <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 p-5 rounded-xl border border-green-500/20 text-center">
                <Users className="text-green-400 mx-auto mb-3" size={32} />
                <h4 className="text-white font-bold mb-2">Social dApps</h4>
                <p className="text-green-300 text-sm">Decentralized social networks and communities</p>
              </div>
            </div>
          </div>

          {/* Technical Deep Dive */}
          <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-700/30 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Code className="text-gray-400 mr-3" size={24} />
              Technical Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">🔗 Block Anchoring</h4>
                <p className="text-gray-300 text-sm">
                  Stacks blocks include a hash of the previous Bitcoin block, creating an immutable link. 
                  This means altering Stacks history would require altering Bitcoin's history - practically impossible.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">⚡ Microblocks</h4>
                <p className="text-gray-300 text-sm">
                  For faster transactions, Stacks uses microblocks that settle quickly and are later confirmed 
                  when anchored to Bitcoin blocks, balancing speed with ultimate security.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-6 text-center">📈 Stacks by the Numbers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-900/20 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-white mb-1">$1.3B+</div>
                <div className="text-orange-300 text-sm">Market Cap</div>
              </div>
              <div className="bg-purple-900/20 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-purple-300 text-sm">dApps Built</div>
              </div>
              <div className="bg-blue-900/20 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-white mb-1">45M+</div>
                <div className="text-blue-300 text-sm">STX Stacked</div>
              </div>
              <div className="bg-green-900/20 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-white mb-1">60K+</div>
                <div className="text-green-300 text-sm">Developers</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center p-6 bg-gradient-to-r from-orange-900/20 to-amber-900/20 rounded-2xl border border-orange-500/30">
            <Rocket className="text-amber-400 mx-auto mb-3" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Ready to Build?</h3>
            <p className="text-orange-300 mb-4">
              Start your journey with Stacks today. Build secure, Bitcoin-powered applications.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://docs.stacks.co"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg hover:from-orange-700 hover:to-amber-600 transition-all inline-flex items-center"
              >
                <BookOpen className="mr-2" size={18} />
                Read Docs
              </a>
              <a
                href="https://explorer.stacks.co"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-800/50 transition-colors inline-flex items-center"
              >
                <BarChart3 className="mr-2" size={18} />
                Explore Network
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="mt-10 pt-8 border-t border-gray-700/30">
            <h4 className="text-white font-bold mb-6 text-center text-lg">🔗 Learning Resources</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="https://docs.stacks.co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-orange-900/20 rounded-xl hover:bg-orange-800/30 transition-all group border border-orange-500/20"
              >
                <div className="bg-orange-500/20 p-2 rounded-lg mr-4">
                  <BookOpen className="text-orange-400" size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium group-hover:text-orange-300">Official Docs</div>
                  <div className="text-orange-400 text-sm">Complete technical documentation</div>
                </div>
                <ExternalLink size={16} className="text-orange-500 group-hover:text-orange-300" />
              </a>
              <a
                href="https://stacks.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-purple-900/20 rounded-xl hover:bg-purple-800/30 transition-all group border border-purple-500/20"
              >
                <div className="bg-purple-500/20 p-2 rounded-lg mr-4">
                  <Globe className="text-purple-400" size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium group-hover:text-purple-300">Website</div>
                  <div className="text-purple-400 text-sm">Learn about the ecosystem</div>
                </div>
                <ExternalLink size={16} className="text-purple-500 group-hover:text-purple-300" />
              </a>
              <a
                href="https://github.com/stacks-network"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gray-800/40 rounded-xl hover:bg-gray-700/50 transition-all group border border-gray-700/30"
              >
                <div className="bg-gray-700/50 p-2 rounded-lg mr-4">
                  <Code className="text-gray-400" size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium group-hover:text-gray-300">GitHub</div>
                  <div className="text-gray-400 text-sm">Source code and examples</div>
                </div>
                <ExternalLink size={16} className="text-gray-500 group-hover:text-gray-300" />
              </a>
            </div>
          </div>

          {/* Completion */}
          <div className="mt-10 pt-8 border-t border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold mb-2">🎉 Lesson Complete!</h4>
                <p className="text-gray-400 text-sm">
                  You've learned the fundamentals of Stacks. Ready for the next lesson?
                </p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all flex items-center">
                <CheckCircle className="mr-2" size={20} />
                Mark as Complete
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return lesson.content;
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black w-full max-w-5xl h-[90vh] rounded-2xl border border-orange-500/30 shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-orange-900/50 to-purple-900/50 p-6 border-b border-orange-500/30 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
              <div className="flex items-center mt-2 space-x-3">
                <span className="text-orange-400 bg-orange-900/50 px-3 py-1 rounded-full text-sm">
                  {lesson.level}
                </span>
                <div className="flex items-center text-orange-300">
                  <Clock size={16} className="mr-1" />
                  <span>{lesson.duration}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-orange-300 hover:text-white bg-orange-900/30 hover:bg-orange-800/50 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center bg-gradient-to-r from-orange-900/40 to-amber-900/40 px-4 py-2 rounded-full border border-orange-500/30">
                    <Award className="text-yellow-400 mr-2" size={20} />
                    <span className="text-white text-sm">Complete for 50 XP</span>
                  </div>
                  <div className="text-sm text-orange-400">
                    Progress: <span className="text-white font-bold">1/6</span> lessons
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/40 to-black/40 rounded-2xl p-8 border border-gray-700/30">
                {getLessonContent()}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700/30">
                <h4 className="text-white font-bold mb-4">💡 Pro Tip</h4>
                <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-4 rounded-xl border border-blue-500/20">
                  <p className="text-blue-300">
                    <strong>Want to try Stacks?</strong> Start with the testnet first! It uses test STX tokens and 
                    allows you to experiment without risking real funds. Visit the Hiro Wallet to get test tokens.
                  </p>
                </div>
              </div>

              {/* Removed Previous/Next Lesson buttons */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}