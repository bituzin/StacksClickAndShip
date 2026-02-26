import { Sun, CheckSquare, MessageSquare, User, Wallet } from 'lucide-react';

export default function MyStatsCard({ userAddress }: { userAddress?: string | null }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 shadow-2xl max-w-4xl mx-auto mt-12">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">My Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GM streak */}
        <div className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 flex flex-col items-center shadow-md">
          <Sun className="text-yellow-400 mb-3" size={40} />
          <h3 className="text-xl text-white mb-2">GM Streak</h3>
          <p className="text-orange-300 text-lg">—</p>
        </div>
        {/* Votes cast */}
        <div className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 flex flex-col items-center shadow-md">
          <CheckSquare className="text-green-400 mb-3" size={40} />
          <h3 className="text-xl text-white mb-2">Votes Cast</h3>
          <p className="text-orange-300 text-lg">—</p>
        </div>
        {/* Messages posted */}
        <div className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 flex flex-col items-center shadow-md">
          <MessageSquare className="text-blue-400 mb-3" size={40} />
          <h3 className="text-xl text-white mb-2">Messages Posted</h3>
          <p className="text-orange-300 text-lg">—</p>
        </div>
        {/* Username */}
        <div className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 flex flex-col items-center shadow-md">
          <User className="text-orange-300 mb-3" size={40} />
          <h3 className="text-xl text-white mb-2">Username</h3>
          <p className="text-orange-300 text-lg">—</p>
        </div>
      </div>
      {/* My Wallet */}
      <div className="mt-12">
        <div className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 flex flex-col items-center shadow-md">
          <Wallet className="text-orange-400 mb-3" size={40} />
          <h3 className="text-xl text-white mb-2">My Wallet</h3>
          <p className="text-orange-300 text-lg break-all">{userAddress ? userAddress : 'No wallet connected'}</p>
        </div>
      </div>
    </div>
  );
}