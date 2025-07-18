const express = require('express');
const { publishBountyToNostr } = require('../utils/nostr');
const router = express.Router();

router.post('/create', async (req, res) => {
  const bountyData = req.body;
  const db = req.app.locals.db;

  try {
    const saved = await db.collection('bounties').insertOne(bountyData);
    const result = await publishBountyToNostr(bountyData);

    res.json({
      success: result.success,
      message: result.success ? 'Published to Nostr' : 'Bounty saved, but failed to publish to Nostr',
      acceptedRelays: result.acceptedRelays,
      rejectedRelays: result.rejectedRelays,
      eventId: result.event.id,
      mongoId: saved.insertedId
    });

  } catch (error) {
    console.error("❌ Error in /create:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
