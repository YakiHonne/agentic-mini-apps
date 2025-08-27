const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
let payments = {};

// Simulate invoice generation
app.post('/invoice', (req, res) => {
  const { amount, memo } = req.body;

  const fakePaymentHash = uuidv4();
  const fakeInvoice = `lnbc${amount}n1${fakePaymentHash.slice(0, 20)}...`;

  payments[fakePaymentHash] = {
    paid: false,
    created: Date.now(),
  };

  // Simulate payment after 5 seconds
  setTimeout(() => {
    payments[fakePaymentHash].paid = true;
  }, 5000);

  res.json({
    invoice: fakeInvoice,
    payment_hash: fakePaymentHash,
  });
});

// Check invoice status
app.get('/invoice/:hash/status', (req, res) => {
  const { hash } = req.params;
  const payment = payments[hash];

  if (!payment) {
    return res.status(404).json({ error: 'Unknown payment hash' });
  }

  res.json({ paid: payment.paid });
});

app.listen(PORT, () => {
  console.log(`✅ Simulated Lightning server running on http://localhost:${PORT}`);
});
