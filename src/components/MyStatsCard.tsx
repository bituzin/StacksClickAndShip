import { Sun, CheckSquare, MessageSquare, User, Wallet, BarChart2 } from 'lucide-react';

interface MyStatsCardProps {
  userAddress?: string | null;
  username?: string | null;
  totalGm?: number | null;
  totalVotes?: number | null;
  totalMessages?: number | null;
}

export default function MyStatsCard({ userAddress, username, totalGm, totalVotes, totalMessages }: MyStatsCardProps) {
  const fmt = (val: number | null | undefined) =>
    val === null || val === undefined ? '…' : val.toString();

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-orange-500/60 shadow-2xl max-w-4xl mx-auto mt-12">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <BarChart2 className="text-yellow-400" size={36} />
        <span>My Stats</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GM count */}
        <div className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 flex flex-col items-center shadow-md">
          <Sun className="text-yellow-400 mb-3" size={40} />
          <h3 className="text-xl text-white mb-2">Total GMs</h3>
          <p className="text-orange-300 text-3xl font-bold">{fmt(totalGm)}</p>
        </div>
        {/* Votes cast */}
        <div className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 flex flex-col items-center shadow-md">
          <CheckSquare className="text-green-400 mb-3" size={40} />
          <h3 className="text-xl text-white mb-2">Votes Cast</h3>
          <p className="text-orange-300 text-3xl font-bold">{fmt(totalVotes)}</p>
        </div>
        {/* Messages posted */}
        <div className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 flex flex-col items-center shadow-md">
          <MessageSquare className="text-blue-400 mb-3" size={40} />
          <h3 className="text-xl text-white mb-2">Messages Posted</h3>
          <p className="text-orange-300 text-3xl font-bold">{fmt(totalMessages)}</p>
        </div>
        {/* Username */}
        <div className="bg-orange-800/60 rounded-xl p-6 border border-orange-600/40 flex flex-col items-center shadow-md">
          <User className="text-orange-300 mb-3" size={40} />
          <h3 className="text-xl text-white mb-2">Username</h3>
          <p className="text-orange-300 text-lg font-mono">
            {username ? `${username}.stacks` : (userAddress ? 'No name registered' : '—')}
          </p>
        </div>
      </div>
      {/* My Wallet */}
      <div className="mt-8">
        <div className="bg-orange-800/60 rounded-xl p-6 border border-orange-600/40 flex flex-col items-center shadow-md">
          <Wallet className="text-orange-400 mb-3" size={40} />
          <h3 className="text-xl text-white mb-2">My Wallet</h3>
          {userAddress ? (
            <a
              href={`https://explorer.stacks.co/address/${userAddress}?chain=mainnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-300 text-sm font-mono hover:underline break-all text-center"
            >
              {userAddress}
            </a>
          ) : (
            <p className="text-orange-500 text-lg">No wallet connected</p>
          )}
        </div>
      </div>
    </div>
  );
}