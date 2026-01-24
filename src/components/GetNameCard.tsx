import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GetNameCard() {
  return (
    <Link
      to="/getname"
      className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer"
      style={{ textDecoration: 'none' }}
    >
      <User className="text-yellow-400 mb-3" size={32} />
      <h3 className="text-xl text-white mb-2">Get Your Name</h3>
      <p className="text-orange-300">Register your unique Stacks username</p>
    </Link>
  );
}
