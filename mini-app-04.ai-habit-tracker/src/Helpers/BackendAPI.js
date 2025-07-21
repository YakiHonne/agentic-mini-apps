const BACKEND_URL = "https://custodaian-ln-node-production.up.railway.app"; // Update this if your backend is deployed elsewhere

export async function claimReward({
  walletAddress,
  amount,
  habitName,
  userPubkey,
}) {
  const res = await fetch(`${BACKEND_URL}/reward/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, amount, habitName, userPubkey }),
  });
  return res.json();
}

export async function recordHabitEntry({
  id,
  userPubkey,
  lightningAddress,
  habitName,
  stakedAmount,
  paymentPreimage,
  paymentHash,
  timestamp,
  extra,
}) {
  const res = await fetch(`${BACKEND_URL}/habits/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      userPubkey,
      lightningAddress,
      habitName,
      stakedAmount,
      paymentPreimage,
      paymentHash,
      timestamp,
      extra,
    }),
  });
  return res.json();
}
