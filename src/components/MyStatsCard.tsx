import React from 'react';

export default function MyStatsCard() {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 shadow-2xl max-w-2xl mx-auto mt-12">
      <h2 className="text-3xl font-bold text-white mb-6">My Stats</h2>
      <p className="text-orange-200 text-lg mb-4">Your Stacks activity stats will appear here soon.</p>
      <ul className="text-orange-300">
        <li>GM streak: —</li>
        <li>Votes cast: —</li>
        <li>Messages posted: —</li>
        <li>Username: —</li>
      </ul>
    </div>
  );
}