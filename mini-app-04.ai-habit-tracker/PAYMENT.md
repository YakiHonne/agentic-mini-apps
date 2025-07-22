# Reward Calculation Logic

## Overview

This document explains how rewards are calculated for habit staking in the AI Habit Tracker mini-app. The logic ensures fair, predictable, and capped payouts, with different strategies for low and high staked amounts.

---

## 1. Low Stake (≤ 100 sats): 7-Day Stepped Distribution

- **Day 1:** 30% of staked amount (rounded down)
- **Day 2-3:** 50%
- **Day 4-6:** 70%
- **Day 7+:** 100%
- **Streak Bonuses:**
  - Day 3 (if streak ≥ 3): +1 sat
  - Day 7 (if streak ≥ 7): +2 sats
- **Total payout is capped at:** stake + 20% of stake (rounded down)

### Example (10 sats staked)

| Day | Base Reward | Streak Bonus | Total Reward | Cumulative        |
| --- | ----------- | ------------ | ------------ | ----------------- |
| 1   | 3           | 0            | 3            | 3                 |
| 2   | 5           | 0            | 5            | 8                 |
| 3   | 5           | 1            | 6            | 14 (capped at 12) |
| 4   | 7           | 0            | 7            | 21 (capped at 12) |
| 5   | 7           | 0            | 7            | 28 (capped at 12) |
| 6   | 7           | 0            | 7            | 35 (capped at 12) |
| 7   | 10          | 2            | 12           | 47 (capped at 12) |

> **Note:** Cumulative payout never exceeds 12 sats (10 + 2).

---

## 2. High Stake (> 100 sats): 30-Day Linear Distribution

- **Days 1-29:** Each day pays out `floor(stake / 30)` sats
- **Day 30:** Pays out the remainder to ensure the full stake is paid
- **Streak Bonuses:**
  - Day 10 (if streak ≥ 10): +5% of stake (rounded down)
  - Day 30 (if streak ≥ 30): +10% of stake (rounded down)
- **Total payout is capped at:** stake + 20% of stake (rounded down)

### Example (150 sats staked)

| Day | Base Reward | Streak Bonus | Total Reward | Cumulative |
| --- | ----------- | ------------ | ------------ | ---------- |
| 1   | 5           | 0            | 5            | 5          |
| ... | 5           | 0            | 5            | ...        |
| 10  | 5           | 7            | 12           | ...        |
| ... | 5           | 0            | 5            | ...        |
| 29  | 5           | 0            | 5            | ...        |
| 30  | 5           | 15           | 20           | ...        |

> **Note:** Cumulative payout never exceeds 180 sats (150 + 30).

---

## 3. Capping Logic

- **For all stakes:** The sum of all daily rewards and bonuses is capped at stake + 20% of stake (rounded down).
- If a daily reward would cause the total to exceed the cap, it is reduced so the cap is not exceeded.

---

## 4. Summary Table

| Stake | Max Payout (Cap) | Distribution  |
| ----- | ---------------- | ------------- |
| 10    | 12               | 7-day stepped |
| 50    | 60               | 7-day stepped |
| 100   | 120              | 7-day stepped |
| 150   | 180              | 30-day linear |
| 200   | 240              | 30-day linear |

---

## 5. Notes

- All rewards are paid in whole sats (no decimals).
- Streak bonuses are only awarded if the required streak is achieved on the specified day.
- The logic is designed to be fair, motivating, and easy to reason about for all users.
