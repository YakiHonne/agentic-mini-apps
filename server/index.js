require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const authRoutes = require('./routes/authRoutes');
const puzzle = require('./routes/puzzle');
const bounty = require('./routes/bounty');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/geosats';

MongoClient.connect(MONGO_URI)
  .then(client => {
    app.locals.db = client.db();

    app.use('/api', authRoutes);
    app.use('/api', puzzle);
    app.use('/api/nostr', bounty);

    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection failed:", err));
