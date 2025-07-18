import React from 'react';

export default function ClaimBounty({
  selectedBounty,
  location,
  userAnswer,
  setUserAnswer,
  isNearby,
  verifyAnswerAndDistance,
  onClose,
  onUpdateLocation,
}) {
  const getDistanceDisplay = () => {
    if (!location || !selectedBounty?.coords) return 'Unknown';

    const R = 6371e3;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(selectedBounty.coords.lat - location.lat);
    const dLng = toRad(selectedBounty.coords.lng - location.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(location.lat)) *
        Math.cos(toRad(selectedBounty.coords.lat)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = (R * c) / 1000;
    return `${dist.toFixed(1)}km ❌ Must be within 100m`;
  };

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-80 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-yellow-500 p-6 rounded-lg w-full max-w-lg shadow-lg">

        <h2 className="text-xl font-bold text-yellow-400 mb-4">🧭 Claim Bounty</h2>

        <div className="mb-4">
          <h3 className="text-2xl font-semibold text-white">{selectedBounty.title}</h3>
          <p className="text-sm text-gray-300 mt-1">{selectedBounty.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
              ⚡ {selectedBounty.reward} sats
            </span>
            <span className="bg-green-700 text-white text-xs font-bold px-2 py-1 rounded">
              {selectedBounty.difficulty.toLowerCase()}
            </span>
            {selectedBounty.createdBy && (
              <span className="text-xs text-gray-400 ml-auto">by {selectedBounty.createdBy}</span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-800 p-4 rounded border border-gray-600 mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-white font-semibold text-sm">📍 Location Verification</p>
            <button
              onClick={onUpdateLocation}
              className="text-xs text-yellow-400 border border-yellow-400 rounded px-2 py-1 hover:bg-yellow-500 hover:text-black"
            >
              Update Location
            </button>
          </div>
          <p className="text-sm text-gray-300">Bounty Location: {selectedBounty.coords.lat}, {selectedBounty.coords.lng}</p>
          <p className="text-sm text-gray-300">
            Your Distance:{" "}
            {isNearby(selectedBounty) ? (
              <span className="text-green-400 ml-2">✅ Within range</span>
            ) : (
              <span className="text-red-400 ml-2">{getDistanceDisplay()}</span>
            )}
          </p>
        </div>

        {/* Puzzle */}
        <div className="bg-gray-800 p-4 rounded border border-gray-600 mb-4">
          <p className="text-white font-semibold text-sm mb-2">🧩 Solve the Puzzle</p>
          <p className="text-purple-300 mb-2">{selectedBounty.challenge}</p>
          <input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full px-3 py-2 mb-1 rounded bg-zinc-800 text-white border border-zinc-600"
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            disabled={!verifyAnswerAndDistance()}
            className={`px-4 py-2 rounded font-bold ${
              verifyAnswerAndDistance()
                ? "bg-green-500 hover:bg-green-400 text-black"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            ✅ Claim {selectedBounty.reward} sats
          </button>
        </div>
      </div>
    </div>
  );
}
