import React, { useEffect, useState } from 'react';
import { nip19 } from 'nostr-tools';
import { useNavigate } from 'react-router-dom';

export default function NostrLogin() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const pubkey = localStorage.getItem("geosats_pubkey");
    if (pubkey) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleNostrLogin = async () => {
    setError("");

    if (!window.nostr) {
      setError("⚠️ Nostr extension not found. Please install Alby.");
      return;
    }

    try {
      const pubkey = await window.nostr.getPublicKey();
      sessionStorage.setItem("geosats_pubkey", pubkey);
      navigate('/dashboard');

      const npub = nip19.npubEncode(pubkey);

      // Save pubkey to localStorage
      localStorage.setItem("geosats_pubkey", pubkey);

      // Send login request to backend
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkey }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("geosats_user_id", data.userId);
        navigate('/dashboard');
      } else {
        setError(`❌ Server rejected login: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("❌ Nostr login error:", err);
      setError("❌ Failed to log in via Nostr.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold text-pink-500 mb-6">🔐 Sign In with Nostr</h1>

      <button
        onClick={handleNostrLogin}
        className="bg-orange-500 hover:bg-orange-400 text-black font-bold py-3 px-6 rounded-lg shadow-md"
      >
        Connect via Alby
      </button>

      {error && (
        <p className="text-red-400 mt-4 text-sm text-center max-w-md">{error}</p>
      )}
    </div>
  );
}
