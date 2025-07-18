// controllers/authController.js
exports.loginWithPubkey = async (req, res, db) => {
    const { pubkey } = req.body;
  
    if (!pubkey) {
      return res.status(400).json({ success: false, message: "Missing pubkey" });
    }
  
    try {
      let user = await db.collection("users").findOne({ pubkey });
  
      if (!user) {
        const insertResult = await db.collection("users").insertOne({
          pubkey,
          createdAt: new Date()
        });
        user = await db.collection("users").findOne({ _id: insertResult.insertedId });
      }
  
      res.json({ success: true, userId: user._id });
    } catch (err) {
      console.error("Login DB error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  