import React from 'react';
import { Mail } from 'lucide-react';

interface MessageLeaderboardRow {
  user: string;
  count: number;
}

interface PostMessageCardProps {
  isAuthenticated: boolean;
  todayMessages: number | null;
  totalMessages: number | null;
  userMessages: number | null;
  messageLeaderboard: MessageLeaderboardRow[];
  fetchMessageCounts: () => Promise<void>;
  setTxPopup: (popup: { show: boolean; txId: string }) => void;
}

const POST_MESSAGE_CONTRACT_ADDRESS = import.meta.env.VITE_POST_MESSAGE_CONTRACT_ADDRESS;
const POST_MESSAGE_CONTRACT_NAME = import.meta.env.VITE_POST_MESSAGE_CONTRACT_NAME;

export default function PostMessageCard({
  isAuthenticated,
  todayMessages,
  totalMessages,
  userMessages,
  messageLeaderboard,
  fetchMessageCounts,
  setTxPopup
}: PostMessageCardProps) {
  return (
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
              const { openContractCall, StacksMainnet } = await import('@stacks/connect');

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
                onFinish: (data: any) => {
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
  );
}
