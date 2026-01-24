import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LearnCard() {
  const tutorials = [
    { title: 'What is Stacks?', slug: 'what-is-stacks' },
    { title: 'Proof of Transfer (PoX)', slug: 'pox' },
    { title: 'Bitcoin Layer 2 Explained', slug: 'bitcoin-layer2' },
    { title: 'Stacking - Earn Bitcoin', slug: 'stacking' },
    { title: 'Clarity vs Solidity', slug: 'clarity-vs-solidity' },
    { title: 'Build Your First dApp', slug: 'build-dapp' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-6">📚 Learn Stacks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tutorials.map((tutorial, idx) => (
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
  );
}
