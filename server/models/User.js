// /models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  pubkey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
