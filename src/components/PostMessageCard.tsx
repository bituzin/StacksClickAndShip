import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PostMessageCard() {
  return (
    <Link
      to="/message"
      className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer"
      style={{ textDecoration: 'none' }}
    >
      <MessageSquare className="text-yellow-400 mb-3" size={32} />
      <h3 className="text-xl text-white mb-2">Post Message</h3>
      <p className="text-orange-300">Send a message on-chain to the community</p>
    </Link>
  );
}
