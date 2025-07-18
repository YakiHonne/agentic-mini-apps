// /services/authService.js
const User = require('../models/User');

async function findOrCreateUser(pubkey) {
  let user = await User.findOne({ pubkey });
  if (!user) {
    user = await User.create({ pubkey });
  }
  return user;
}

module.exports = {
  findOrCreateUser,
};
