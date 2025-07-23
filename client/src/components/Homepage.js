import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBitcoin, FaMapMarkedAlt } from 'react-icons/fa';
import { nip19 } from 'nostr-tools';
import Nearby from './Nearby';

export default function Homepage() {
  const [npub, setNpub] = useState(null);

  // On page load, check if user is already logged in
  useEffect(() => {
    const pubkey = sessionStorage.getItem("geosats_pubkey"); // Using sessionStorage
    if (pubkey) {
      const encoded = nip19.npubEncode(pubkey);
      setNpub(encoded);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between px-6 relative overflow-hidden">

      {/* Floating Orange Shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600 opacity-20 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500 opacity-20 blur-3xl animate-pulse" />
      <div className="absolute top-40 right-1/4 w-64 h-64 bg-orange-400 opacity-10 blur-3xl animate-pulse" />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow pt-20">
        <h1 className="text-5xl font-extrabold mb-6 text-center leading-tight drop-shadow-lg">
          Bitcoin Bounty Hunts <br /> Across the Globe 🌍
        </h1>

        <p className="text-lg text-orange-300 mb-12 text-center max-w-2xl">
          Post bounties, solve them in the real world, and earn sats instantly using Lightning + Nostr.
        </p>

        {/* Nostr Login Section */}
        <div className="mb-10">
          {!npub ? (
            <Link
              to="/login"
              className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-6 py-3 rounded-full shadow-lg"
            >
              🔐 Connect with Nostr (Alby)
            </Link>
          ) : (
            <p className="text-green-400 text-sm text-center break-words px-4">
              ✅ Logged in as <br /><code>{npub}</code>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-16">
          {/* <Link
            to="/post"
            className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg"
          >
            <FaBitcoin /> <span>Create Bounty</span>
          </Link>

          <Link
            to="/nearby"
            className="border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black font-bold px-6 py-3 rounded-full flex items-center space-x-2"
          >
            <FaMapMarkedAlt /> <span>Find Bounties</span>
          </Link> */}
              <a
        href="https://snort.social/nprofile1qqstzne6fv0neq70uxf4ejxhc34pz23nj9wq8lawyvla2q2ql3zwvuqy4rvyq"
        target="_blank"
        rel="noopener noreferrer"
        className="border border-white text-white hover:bg-white hover:text-black font-bold px-6 py-3 rounded-full flex items-center space-x-2"
      >
        🎯 <span>View Bounties</span>
      </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-sm text-orange-400 opacity-80 text-center mb-4">
        Built with Nostr ⚡ Lightning | GeoSats 2025
      </footer>
    </div>
  );
}
