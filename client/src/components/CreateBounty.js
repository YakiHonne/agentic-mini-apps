// src/components/CreateBounty.js
import React from 'react';
import { connectToRelay, signAndPublishEvent } from '../nostr/utils';

export default function CreateBounty({
  bountyData,
  setBountyData,
  setIsModalOpen,
  generateChallenge,
  useCurrentLocation,
  keys,
  bounties,
  setBounties,
}) {
  const publishToNostr = async (bounty) => {
    try {
      const relay = await connectToRelay();

      const eventTemplate = {
        kind: 30000,
        pubkey: keys.pk,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["d", "bounty"], ["city", bounty.city]],
        content: JSON.stringify(bounty),
      };

      const event = await signAndPublishEvent(relay, keys.sk, eventTemplate);
      console.log("✅ Bounty published to Nostr:", event);
    } catch (error) {
      console.error("❌ Failed to publish to Nostr:", error);
    }
  };

  const handleCreate = async () => {
    if (!bountyData.title || !bountyData.coords) {
      alert("Fill out all required fields.");
      return;
    }

    const newBounty = { ...bountyData };
    const updated = [...bounties, newBounty];

    setBounties(updated);
    localStorage.setItem("bounties", JSON.stringify(updated));
    await publishToNostr(newBounty);
    setIsModalOpen(false);

    setBountyData({
      title: '',
      description: '',
      reward: '',
      difficulty: 'Easy',
      challenge: '',
      coords: null,
      city: '',
      useAI: true,
      manualChallenge: ''
    });
  };

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-orange-700 p-6 rounded-lg shadow-xl w-full max-w-md mx-auto z-50">
        <h2 className="text-xl font-bold text-orange-400 mb-4">Create New Bounty</h2>

        <input
          type="text"
          placeholder="e.g., Find the hidden QR code"
          value={bountyData.title}
          onChange={(e) => setBountyData({ ...bountyData, title: e.target.value })}
          className="w-full mb-3 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600"
        />
        <textarea
          placeholder="Describe what hunters need to do..."
          value={bountyData.description}
          onChange={(e) => setBountyData({ ...bountyData, description: e.target.value })}
          className="w-full mb-3 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600"
        />
        <input
          type="number"
          placeholder="Reward (sats)"
          value={bountyData.reward}
          onChange={(e) => setBountyData({ ...bountyData, reward: e.target.value })}
          className="w-full mb-3 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600"
        />
        <select
          value={bountyData.difficulty}
          onChange={(e) => setBountyData({ ...bountyData, difficulty: e.target.value })}
          className="w-full mb-3 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600"
        >
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

        <textarea
          placeholder="Add a riddle or puzzle..."
          value={bountyData.manualChallenge}
          onChange={(e) => setBountyData({ ...bountyData, manualChallenge: e.target.value })}
          className="w-full mb-3 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-600"
        />

        {bountyData.challenge && <p className="text-orange-300 text-sm mb-3">🧩 {bountyData.challenge}</p>}

        <button onClick={handleCreate} className="bg-green-500 text-black font-bold w-full py-2 rounded hover:bg-green-400">✅ Create & Publish</button>
        <button onClick={() => setIsModalOpen(false)} className="mt-4 text-sm text-gray-400 hover:text-red-400 underline block mx-auto">Cancel</button>
      </div>
    </div>
  );
}
