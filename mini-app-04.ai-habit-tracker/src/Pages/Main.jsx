import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import HabitTracker from "../Components/HabitTracker";
import { setHabits } from "../Store/habitTrackerSlice";

export default function Main() {
  const dispatch = useDispatch();
  const { habits, loading } = useSelector((state) => state.habitTracker);

  useEffect(() => {
    // Load habits from localStorage on component mount
    const savedHabits = localStorage.getItem("aiHabitTracker_habits");
    if (savedHabits) {
      try {
        const parsedHabits = JSON.parse(savedHabits);
        dispatch(setHabits(parsedHabits));
      } catch (error) {
        console.error("Error loading habits from localStorage:", error);
      }
    }
  }, [dispatch]);

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem("aiHabitTracker_habits", JSON.stringify(habits));
    }
  }, [habits]);

  return (
    <div className="fit-container fx-centered">
      <div style={{ width: "min(100%, 600px)", padding: "20px" }}>
        <div className="header-section">
          <h1>🎯 AI Habit Tracker</h1>
          <p className="subtitle">Stake sats, build habits, earn rewards</p>
        </div>
        <HabitTracker />
      </div>
    </div>
  );
}
