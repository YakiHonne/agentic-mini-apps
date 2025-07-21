import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const dummyTicket = {
  event: 'Bitcoin Meetup Lusaka',
  date: 'August 3, 2025',
  seat: 'A12',
  price: '0.0005 BTC',
};

const cardStyle = {
  maxWidth: 350,
  margin: '40px auto',
  padding: '20px 30px',
  border: '2px solid #4A90E2',
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  backgroundColor: '#fefefe',
  color: '#333',
  textAlign: 'center',
};

const buttonStyle = {
  marginTop: 20,
  backgroundColor: '#4A90E2',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  fontSize: 16,
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(74, 144, 226, 0.6)',
};

const lightningIconStyle = {
  width: 48,
  height: 48,
  marginBottom: 10,
  filter: 'drop-shadow(0 0 2px #F5A623)', // subtle glow effect
};


const App = () => {
  const [invoice, setInvoice] = useState(null);
  const [paid, setPaid] = useState(false);

  const handlePayment = async () => {
    const response = await fetch('http://localhost:3000/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 5000,
        memo: 'Ticket A12 – Bitcoin Meetup Lusaka',
      }),
    });

    const data = await response.json();
    setInvoice(data.invoice);

    const interval = setInterval(async () => {
      const res = await fetch(`http://localhost:3000/invoice/${data.payment_hash}/status`);
      const result = await res.json();
      if (result.paid) {
        clearInterval(interval);
        setPaid(true);
      }
    }, 1000);
  };

  return (
    <div style={cardStyle}>
       {/* Lightning Icon */}
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Lightning_Bolt.svg"
        alt="Lightning Icon"
        style={lightningIconStyle}
      />
      
      <h2 style={{ color: '#2C3E50' }}>{dummyTicket.event}</h2>
      <p><strong>Date:</strong> {dummyTicket.date}</p>
      <p><strong>Seat:</strong> {dummyTicket.seat}</p>
      <p><strong>Price:</strong> {dummyTicket.price}</p>

      {!invoice && !paid && (
        <button style={buttonStyle} onClick={handlePayment}>
          Pay with Lightning ⚡
        </button>
      )}

      {invoice && !paid && (
        <>
          <p>Scan QR to Pay:</p>
          <QRCodeCanvas value={invoice} size={200} />
          <p style={{ fontSize: 12, marginTop: 10, wordBreak: 'break-all' }}>
            {invoice}
          </p>
        </>
      )}

      {paid && (
        <div style={{ marginTop: 20, color: '#27AE60' }}>
          <h3>✅ Ticket Confirmed!</h3>
          <p>Thank you for your payment.</p>
        </div>
      )}
    </div>
  );
};

export default App;
