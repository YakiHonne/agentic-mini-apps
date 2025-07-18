import React, { useEffect, useState } from 'react';

export default function Nearby({ handleBountyClick }) {
  const [location, setLocation] = useState(null);
  const [bounties, setBounties] = useState([]);
  const [nearbyBounties, setNearbyBounties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bounties from backend
  useEffect(() => {
    fetch('/api/bounties') // 🔁 Adjust URL if different
      .then((res) => res.json())
      .then((data) => {
        setBounties(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch bounties:", err);
        setBounties([]);
        setLoading(false);
      });
  }, []);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(5));
        const lng = parseFloat(position.coords.longitude.toFixed(5));
        setLocation({ lat, lng });
      },
      (error) => {
        console.error("📡 Geolocation error:", error);
        setLocation(null);
      }
    );
  }, []);

  // Filter bounties near user
  useEffect(() => {
    if (location && Array.isArray(bounties)) {
      const withinRange = bounties
        .map((bounty) => {
          if (!bounty.coords) return null;
          const dist = calculateDistance(
            location.lat,
            location.lng,
            parseFloat(bounty.coords.lat),
            parseFloat(bounty.coords.lng)
          );
          return dist <= 100
            ? { ...bounty, distance: dist.toFixed(2) }
            : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);
      setNearbyBounties(withinRange);
    }
  }, [location, bounties]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="px-4 sm:px-6 py-10 min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      <h2 className="text-xl sm:text-2xl font-bold text-orange-400 mb-6 tracking-wide">
        🧭 Nearby Bounties <span className="text-sm">(within 100km)</span>
      </h2>

      {loading ? (
        <p className="text-gray-400 text-sm">🔄 Loading bounties...</p>
      ) : !location ? (
        <p className="text-gray-400 text-sm">📡 Getting your location...</p>
      ) : nearbyBounties.length === 0 ? (
        <p className="text-gray-400 text-sm">🚫 No bounties found nearby.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyBounties.map((bounty, index) => (
            <div
              key={index}
              onClick={() => handleBountyClick?.(bounty)}
              className="bg-zinc-900 border border-orange-700 hover:border-orange-400 rounded-2xl p-5 shadow transition duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-green-400 truncate">
                  {bounty.title}
                </h3>
                <span className="bg-orange-500 text-black text-xs font-semibold px-3 py-1 rounded-full">
                  ⚡ {bounty.reward} sats
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                {bounty.description}
              </p>

              {bounty.challenge && (
                <div className="bg-zinc-800 border border-purple-600 text-purple-300 text-xs rounded-md p-2 mb-3">
                  🧩 <em>Puzzle included</em>
                </div>
              )}

              <div className="flex justify-between text-xs text-orange-300 font-mono">
                <p>📍 {bounty.city}</p>
                <p>🛣️ {bounty.distance} km</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
