import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const articles = {
  'what-is-stacks': {
    title: 'What is Stacks?',
    level: 'Beginner',
    content: `Stacks is a Layer 2 blockchain built on Bitcoin . Its core mission is to bring smart contracts and decentralized applications (dApps) to Bitcoin without requiring changes to the Bitcoin base layer itself.

Key Features & How It Works
🔗 Built on Bitcoin: Stacks is anchored to Bitcoin. All major transactions are settled on the Bitcoin blockchain, inheriting its unparalleled security and finality.

🔄 Proof of Transfer (PoX): This unique consensus mechanism uses existing Bitcoin to secure the network. Participants ("miners") commit BTC to process transactions and mint new STX tokens, while others can "stack" STX to earn Bitcoin rewards.

📜 Clarity Smart Contracts: Developers write contracts in Clarity, a secure and predictable programming language. Clarity's code is transparent and avoids hidden pitfalls, making DeFi and dApps on Bitcoin safer.

⚡ Stacks Token (STX): The native cryptocurrency of the network. It's used for transaction fees, deploying smart contracts, and participating in the PoX consensus.

Why It Matters
Stacks unlocks Bitcoin's potential beyond just a store of value. It enables a new wave of innovation on the most secure blockchain, including:

🏦 Bitcoin DeFi (lending, borrowing, trading)

🎨 NFTs secured by Bitcoin

🌐 Decentralized social apps & more

In short, Stacks acts as the smart contract layer for Bitcoin, transforming it into a full-fledged, programmable ecosystem.`
  },
  'pox': { title: '', level: '', content: '' },
  'bitcoin-layer2': {
    title: 'Bitcoin Layer 2 Explained',
    level: '',
    content: `What is Bitcoin Layer 2 (L2)?\nA Layer 2 is an additional protocol or blockchain built on top of Bitcoin’s base layer (Layer 1). Its goal is to expand Bitcoin’s capabilities without sacrificing its security and decentralization.\n\nWhy do we need Layer 2 solutions?\n\n🔋 Bitcoin L1 Limitations:\n- Low throughput (~7 transactions per second)\n- High fees during network congestion\n- Limited programmability\n\n🛠️ The L2 Solution:\nInstead of changing Bitcoin itself, Layer 2 moves transactions off the main chain and only records the final result on Bitcoin. It’s like doing calculations on a notepad and writing only the answer in the official ledger.\n\nTypes of Layer 2 solutions:\n\n🔄 State Channels (e.g., Lightning Network):\nPrivate payment channels, instant and cheap micropayments, only channel open/close hits the main chain.\n\n🏗️ Sidechains (e.g., Stacks, Rootstock):\nIndependent blockchains with their own rules, two-way BTC transfer, support for smart contracts and dApps.\n\n📜 Client-Side Validation / Rollups (e.g., BitVM):\nOff-chain transactions, data compression and publication to Bitcoin, security via fraud/validity proofs (still in research phase).\n\nWhy are Bitcoin L2s important?\n\n🚀 Scalability:\nFaster and cheaper transactions.\n\n🔐 Security inheritance:\nThey use Bitcoin’s security and decentralization as a foundation.\n\n💡 Innovation:\nEnable DeFi, NFTs, and fast payments on Bitcoin without risking the main chain.\n\nThe trade-off: security vs. scalability\nEvery L2 introduces new trust assumptions or technical complexity to achieve scalability. The best solutions minimize these trade-offs and maximize their connection to Bitcoin.\n\nSummary:\nLayer 2 solutions turn Bitcoin from “digital gold” into a dynamic financial and application ecosystem, allowing it to scale globally while keeping its base layer rock-solid.`
  },
  'stacking': { title: '', level: '', content: '' },
  'clarity-vs-solidity': { title: '', level: '', content: '' },
  'build-dapp': { title: '', level: '', content: '' }
};

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articles[slug as keyof typeof articles] : undefined;

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">Article not found</h2>
            <p className="text-purple-200 mb-6">The article you're looking for doesn't exist.</p>
            <Link 
              to="/#learn" 
              className="inline-block bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white py-3 px-8 rounded-full transition-all"
            >
              &larr; Back to Learn
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Link 
            to="/#learn" 
            className="inline-flex items-center text-purple-300 hover:text-purple-100 mb-6 transition-colors"
          >
            &larr; Back to Learn
          </Link>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{article.title}</h1>
              </div>
              <BookOpen className="text-purple-400" size={48} />
            </div>
            
            <div className="prose prose-invert max-w-none">
              {article.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-lg text-purple-100 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-purple-500/30">
              <Link 
                to="/#learn" 
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl"
              >
                &larr; Back to Learn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
