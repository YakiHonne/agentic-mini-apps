import React, { useEffect, useState } from 'react';
import { FaBitcoin } from 'react-icons/fa';

export default function Feed() {
  const [bounties, setBounties] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("bounties");
    if (stored) setBounties(JSON.parse(stored));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white font-sans">

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-5 bg-black border-b border-orange-600 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-orange-500 flex items-center gap-2">
          <FaBitcoin className="text-xl sm:text-2xl text-orange-500" /> GeoSats
        </h1>
        <button className="bg-orange-500 hover:bg-orange-400 text-black px-5 py-2 rounded-full font-semibold shadow transition duration-200">
          + Create Bounty
        </button>
      </header>

      {/* Stats */}
      <section className="px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          { icon: "🏹", label: "Active Bounties", value: bounties.length },
          { icon: <FaBitcoin className="inline text-xl" />, label: "Total Rewards", value: `${bounties.reduce((sum, b) => sum + parseInt(b.reward || 0), 0)} sats` },
          { icon: "🗺️", label: "Nearby", value: "0" },
          { icon: "📍", label: "Your Location", value: "Found" }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-800 p-4 rounded-xl border border-orange-600 shadow-sm">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <h3 className="text-orange-400 font-semibold text-sm">{stat.label}</h3>
            <p className="text-white font-bold text-lg">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Bounty Feed */}
      <section className="px-6 py-8">
        <h2 className="text-xl font-bold text-orange-400 mb-6">🎯 Bounty Feed</h2>

        {bounties.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No bounties available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bounties.map((bounty, index) => (
              <div
                key={index}
                className="bg-zinc-900 border border-orange-600 rounded-2xl p-5 shadow-md hover:shadow-orange-500/30 transition duration-300"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-yellow-400">{bounty.title}</h3>
                  <span className="bg-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    <FaBitcoin className="inline mr-1" /> {bounty.reward} sats
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-4">{bounty.description}</p>

                {bounty.challenge && (
                  <div className="bg-zinc-800 border border-purple-600 text-purple-300 text-sm rounded-xl p-3 mb-4">
                    <strong className="block mb-1">🧩 Puzzle:</strong>
                    {bounty.challenge}
                  </div>
                )}

                <p className="text-xs text-gray-500 mb-1">📍 GPS: {bounty.coords?.lat}, {bounty.coords?.lng}</p>
                <p className="text-xs text-orange-300 mb-4">🧠 Difficulty: {bounty.difficulty || 'Easy'}</p>

                <button className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-2 rounded-lg transition duration-200">
                  ✅ Claim Bounty
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-gray-500 text-xs border-t border-gray-800">
        <p>© {new Date().getFullYear()} GeoSats · Built on Nostr · Lightning Ready <FaBitcoin className="inline text-orange-500 ml-1" /></p>
      </footer>
    </div>
  );
}
