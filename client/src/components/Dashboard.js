import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClaimBounty from './ClaimBounty';
import Nearby from './Nearby';
import { publishToNostr } from './NostrPublish';

export default function Dashboard() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [cityInfo, setCityInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [activeTab, setActiveTab] = useState('map');
  const [bounties, setBounties] = useState(() => {
    const stored = localStorage.getItem('bounties');
    return stored ? JSON.parse(stored) : [];
  });
  const [bountyData, setBountyData] = useState({
    title: '',
    description: '',
    reward: '',
    difficulty: 'Easy',
    challenge: '',
    coords: null,
    city: '',
    manualChallenge: '',
    useAI: false
  });

  useEffect(() => {
    const pubkey = localStorage.getItem("geosats_pubkey");
    if (!pubkey) navigate("/login");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat: lat.toFixed(5), lng: lng.toFixed(5) });

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || "Unknown";
            const country = data.address.country || "";
            setCityInfo(`${city}, ${country}`);
          } catch (err) {
            console.error("Reverse geocoding failed:", err);
            setCityInfo("Unable to fetch city info");
          }
        },
        (error) => {
          console.error("Location error:", error);
          setLocation({ error: "Location access denied" });
        }
      );
    } else {
      setLocation({ error: "Geolocation not supported" });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const createBounty = () => {
    if (!bountyData.title || !bountyData.coords) return alert("Fill out all required fields.");
    const newBounty = { ...bountyData };
    const updated = [...bounties, newBounty];
    setBounties(updated);
    localStorage.setItem("bounties", JSON.stringify(updated));
    setIsModalOpen(false);
    setBountyData({
      title: '',
      description: '',
      reward: '',
      difficulty: 'Easy',
      challenge: '',
      coords: null,
      city: '',
      manualChallenge: '',
      useAI: false
    });
  };

  const handleCreateBounty = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/nostr/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bountyData),
      });
  
      const result = await response.json();
  
      if (response.ok && result.success) {
        console.log("✅ Event ID:", result.nostrEventId);
        alert("Bounty successfully published!");
      } else {
        console.error("❌ Publish error:", result.error);
        alert("Failed to publish bounty: " + result.error);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Network error: " + err.message);
    }
  };
  

  const useCurrentLocation = () => {
    if (location && !location.error) {
      setBountyData((prev) => ({
        ...prev,
        coords: location,
        city: cityInfo,
      }));
    }
  };

  const generateChallenge = async () => {
    if (bountyData.useAI) {
      try {
        const res = await fetch('/api/generate-puzzle');
        const data = await res.json();
        setBountyData((prev) => ({ ...prev, challenge: data.puzzle }));
      } catch (err) {
        console.error("AI Puzzle generation failed:", err);
        setBountyData((prev) => ({ ...prev, challenge: "Failed to fetch AI puzzle" }));
      }
    } else {
      const fallback = bountyData.manualChallenge.trim();
      if (fallback) {
        setBountyData((prev) => ({ ...prev, challenge: fallback }));
      } else {
        const puzzles = [
          "I have keys but no locks, space but no rooms. What am I?",
          "What walks on four legs in the morning, two in the afternoon and three in the evening?",
          "I speak without a mouth and hear without ears. What am I?"
        ];
        const rand = Math.floor(Math.random() * puzzles.length);
        setBountyData((prev) => ({ ...prev, challenge: puzzles[rand] }));
      }
    }
  };

  const isNearby = (bounty) => {
    if (!location || !bounty.coords) return false;
    const R = 6371e3;
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(bounty.coords.lat - location.lat);
    const dLng = toRad(bounty.coords.lng - location.lng);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(location.lat)) * Math.cos(toRad(bounty.coords.lat)) * Math.sin(dLng/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance < 100;
  };

  const handleBountyClick = (bounty) => {
    setSelectedBounty(bounty);
    setIsClaimModalOpen(true);
  };

  const verifyAnswerAndDistance = () => {
    if (!selectedBounty || !location) return false;
    const correct = userAnswer.toLowerCase().trim() === selectedBounty.challenge.toLowerCase().split(" ")[0];
    const isClose = isNearby(selectedBounty);
    return correct && isClose;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white font-sans animate-gradient-slow">
<header className="backdrop-blur-md bg-black/70 shadow-lg border-b border-orange-700 px-6 sm:px-10 py-5 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-50">
  <h1 className="text-5xl font-bold font-serif text-orange-500 tracking-wider mb-3 sm:mb-0 drop-shadow-[0_1px_1px_#f97316] hover:underline hover:decoration-wavy transition duration-300">
  ₿ GeoSats
    </h1>
  <div className="flex flex-wrap gap-3">
    <button
      onClick={() => setIsModalOpen(true)}
      className="bg-gradient-to-r from-orange-200 to-orange-600/80 text-black px-5 py-2 rounded-full font-bold shadow-md hover:from-orange-500 hover:to-orange-700 transition duration-300 backdrop-blur-sm"
    >
      ➕ New Bounty
    </button>
    <button
      onClick={handleLogout}
      className="bg-gradient-to-r from-red-600 to-orange-600/80 text-black px-5 py-2 rounded-full font-bold shadow-md hover:from-orange-500 hover:to-orange-700 transition duration-300 backdrop-blur-sm"
    >
      Logout
    </button>
  </div>
</header>


{/* Beautiful, centered tab section */}
<section className="flex flex-wrap gap-4 py-6 px-6 sm:px-10 bg-gradient-to-r from-black via-zinc-900 to-black sticky top-0 z-40 mt-4">
  {[
    { id: 'map', label: '🗺️ Map' },
    { id: 'feed', label: '📜 Feed' },
    { id: 'nearby', label: '📍 Nearby' }
  ].map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out shadow hover:scale-105 ${
        activeTab === tab.id
          ? 'bg-orange-500 text-black shadow-lg'
          : 'bg-zinc-800 text-gray-300 hover:text-orange-400 hover:bg-orange-900/30'
      }`}
    >
      {tab.label}
    </button>
  ))}
</section>


    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-10 py-8">
      {[{ icon: "📍", label: "Active Hunts", value: `${bounties.length} missions` },
        { icon: "⚡", label: "Sats Distributed", value: `${bounties.reduce((sum, b) => sum + parseInt(b.reward || 0), 0)} sats` },
        { icon: "🌐", label: "Nearby Clues", value: `${bounties.filter(isNearby).length} nearby` },
        { icon: "📡", label: "Your Location", value: `${location?.lat}, ${location?.lng}`, sub: cityInfo },
      ].map((item, i) => (
        <div key={i} className="bg-gradient-to-br from-white-500 to-black p-5 rounded-2xl border border-orange-700 text-center shadow-md hover:shadow-orange-500/20 transition">
          <div className="text-4xl mb-2">{item.icon}</div>
          <h3 className="text-orange-800 font-semibold text-lg">{item.label}</h3>
          <p className="text-white">{item.value}</p>
          {item.sub && <p className="text-sm text-orange-300">{item.sub}</p>}
        </div>
      ))}
    </section>



    {activeTab === 'map' && (
      <section className="relative px-4 md:px-10 py-10">
        <h2 className="text-xl font-bold text-orange-400 mb-5">Live Bounty Map</h2>
        <div className="relative bg-gray-950 border border-orange-800 rounded-xl min-h-[300px] overflow-hidden">
          {bounties.map((b, i) => (
            <div key={i} onClick={() => handleBountyClick(b)} className="absolute bg-black border border-orange-600 text-white px-3 py-2 rounded shadow-md text-xs cursor-pointer hover:bg-orange-900"
              style={{ top: `${30 + (i * 40) % 200}px`, left: `${30 + (i * 60) % 300}px` }}>
              <p className="font-semibold">{b.title}</p>
              <p className="text-orange-300">{b.reward} sats</p>
              <p className="text-xs text-gray-400">📍 {b.city}</p>
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs">
            <div className="relative flex items-center justify-center">
              <div className="absolute animate-ping w-4 h-4 rounded-full bg-orange-500 opacity-75"></div>
              <div className="relative w-2.5 h-2.5 bg-orange-600 rounded-full z-10"></div>
              <span className="ml-2 text-orange-300">🧭 You are here</span>
            </div>
          </div>
        </div>
      </section>
    )}

    {activeTab === 'feed' && (
      <section className="px-4 md:px-10 py-10">
        <h2 className="text-xl font-bold text-orange-400 mb-6">Bounty Feed</h2>
        {bounties.length === 0 ? (
          <p className="text-gray-400 text-center">No bounties posted yet.</p>
        ) : (
          bounties.map((bounty, i) => (
            <div key={i} onClick={() => handleBountyClick(bounty)}
              className="mb-6 p-5 rounded-xl bg-zinc-900 border border-orange-700 hover:shadow-[0_0_12px_#f97316] hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg text-yellow-400 font-bold">{bounty.title}</h3>
                <span className="bg-orange-500 text-black text-sm px-3 py-1 rounded-full font-semibold">
                  ⚡ {bounty.reward} sats
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-3">{bounty.description}</p>
              {bounty.challenge && <div className="bg-purple-900 text-purple-300 text-sm rounded p-3 mb-3">
                <strong>Puzzle:</strong> {bounty.challenge}</div>}
              <p className="text-xs text-gray-400 mb-1">📍 {bounty.city}</p>
              <p className="text-xs text-orange-300">🧭 Lat: {bounty.coords?.lat}, Lng: {bounty.coords?.lng}</p>
            </div>
          ))
        )}
      </section>
    )}

    {activeTab === 'nearby' && (
      <Nearby bounties={bounties} handleBountyClick={handleBountyClick} />
    )}

    {isClaimModalOpen && selectedBounty && (
      <ClaimBounty
        selectedBounty={selectedBounty}
        location={location}
        userAnswer={userAnswer}
        setUserAnswer={setUserAnswer}
        isNearby={isNearby}
        verifyAnswerAndDistance={verifyAnswerAndDistance}
        onClose={() => setIsClaimModalOpen(false)}
        onUpdateLocation={() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({ lat: position.coords.latitude.toFixed(5), lng: position.coords.longitude.toFixed(5) });
            },
            (err) => console.error("Location update error", err)
          );
        }}
      />
    )}

    {isModalOpen && (
      <div className="fixed z-50 inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="bg-zinc-900 border border-orange-700 p-6 rounded-lg shadow-xl w-full max-w-md mx-auto z-50">
          <h2 className="text-xl font-bold text-orange-400 mb-4">Create New Bounty</h2>
          <input type="text" placeholder="e.g., Find the hidden QR code" value={bountyData.title} onChange={(e) => setBountyData({ ...bountyData, title: e.target.value })} className="w-full mb-3 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600" />
          <textarea placeholder="Describe what hunters need to do..." value={bountyData.description} onChange={(e) => setBountyData({ ...bountyData, description: e.target.value })} className="w-full mb-3 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600" />
          <input type="number" placeholder="Reward (sats)" value={bountyData.reward} onChange={(e) => setBountyData({ ...bountyData, reward: e.target.value })} className="w-full mb-3 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600" />
          <select value={bountyData.difficulty} onChange={(e) => setBountyData({ ...bountyData, difficulty: e.target.value })} className="w-full mb-3 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600">
            <option disabled value="">Select difficulty</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <div className="flex justify-between gap-2 mb-3">
            <button onClick={useCurrentLocation} className="bg-orange-500 text-black px-3 py-2 rounded text-sm hover:bg-orange-400">📍 Use Current Location</button>
            <button onClick={generateChallenge} className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-500">🧠 Generate AI Puzzle</button>
          </div>
          {bountyData.coords && (
            <div className="flex justify-between gap-2 mb-3">
              <input type="text" readOnly value={bountyData.coords.lat} className="w-1/2 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600" placeholder="Latitude" />
              <input type="text" readOnly value={bountyData.coords.lng} className="w-1/2 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600" placeholder="Longitude" />
            </div>
          )}
          <textarea placeholder="Add a riddle or puzzle that hunters must solve at the location..." value={bountyData.manualChallenge} onChange={(e) => setBountyData({ ...bountyData, manualChallenge: e.target.value })} className="w-full mb-3 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600" />
          {bountyData.challenge && <p className="text-orange-300 text-sm mb-3">🧩 {bountyData.challenge}</p>}
          <button
            onClick={async () => {
              createBounty();             // Save to localStorage
              await handleCreateBounty(); // Publish to Nostr
            }}
            className="bg-green-500 text-black font-bold w-full py-2 rounded hover:bg-green-400"
          >
            ✅ Create & Publish
          </button>
          <button onClick={() => setIsModalOpen(false)} className="mt-4 text-sm text-gray-400 hover:text-red-400 underline block mx-auto">Cancel</button>
        </div>
      </div>
    )}

    <footer className="py-6 px-4 text-center text-gray-400 text-xs border-t border-gray-800">
      <p>© {new Date().getFullYear()} GeoSats · Built on Nostr · Lightning Ready ⚡</p>
    </footer>
  </div>
);
}
