const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { pubkey } = req.body;
  if (!pubkey) return res.status(400).json({ success: false, message: "Missing pubkey" });

  try {
    const users = req.app.locals.db.collection("users");
    let user = await users.findOne({ pubkey });

    if (!user) {
      const result = await users.insertOne({ pubkey, createdAt: new Date() });
      user = await users.findOne({ _id: result.insertedId });
    }

    res.json({ success: true, userId: user._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
