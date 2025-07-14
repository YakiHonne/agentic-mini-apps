import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import HabitTracker from "../Components/HabitTracker";
import UserProfile from "../Components/UserProfile";
import HowItWorks from "../Components/HowItWorks";
import { setHabits } from "../Store/habitTrackerSlice";

export default function Main({ userData, hostUrl }) {
  const dispatch = useDispatch();
  const { habits } = useSelector((state) => state.habitTracker);

  useEffect(() => {
    // Load habits from localStorage on component mount
    if (userData?.pubkey) {
      const savedHabits = localStorage.getItem(
        `zapMindr_habits_${userData.pubkey}`
      );
      if (savedHabits) {
        try {
          const parsedHabits = JSON.parse(savedHabits);
          dispatch(setHabits(parsedHabits));
        } catch (error) {
          console.error("Error loading habits from localStorage:", error);
        }
      }
    }
  }, [dispatch, userData?.pubkey]);

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    if (habits.length > 0 && userData?.pubkey) {
      localStorage.setItem(
        `zapMindr_habits_${userData.pubkey}`,
        JSON.stringify(habits)
      );
    }
  }, [habits, userData?.pubkey]);

  return (
    <div className="main-container">
      <div className="main-content">
        <div className="header-section">
          <h1>⚡ ZapMindr</h1>
          <p className="subtitle">Stake sats, build habits, earn rewards</p>

          <HowItWorks />
        </div>

        <UserProfile userData={userData} hostUrl={hostUrl} />

        <HabitTracker userData={userData} hostUrl={hostUrl} />
      </div>
    </div>
  );
}
