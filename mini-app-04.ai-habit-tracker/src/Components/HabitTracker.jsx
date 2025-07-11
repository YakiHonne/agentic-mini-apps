import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Target, Zap, Calendar, TrendingUp } from "lucide-react";
import HabitCard from "./HabitCard";
import CreateHabitModal from "./CreateHabitModal";
import PostUpdateModal from "./PostUpdateModal";
import { addHabit, setCurrentHabit } from "../Store/habitTrackerSlice";
import { addToast } from "../Store/toastSlice";

export default function HabitTracker() {
  const dispatch = useDispatch();
  const { habits, loading } = useSelector((state) => state.habitTracker);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const handleCreateHabit = (habitData) => {
    const newHabit = {
      id: Date.now(),
      ...habitData,
      currentStreak: 0,
      totalCompletions: 0,
      createdAt: new Date().toISOString(),
      lastCompletedAt: null,
      stakingAmount: habitData.stakingAmount || 0,
      status: "active",
    };

    dispatch(addHabit(newHabit));
    dispatch(
      addToast({
        type: "success",
        message: `Habit "${newHabit.name}" created successfully!`,
      })
    );
    setShowCreateModal(false);
  };

  const handlePostUpdate = (habitId) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      setSelectedHabit(habit);
      dispatch(setCurrentHabit(habit));
      setShowPostModal(true);
    }
  };

  const totalStaked = habits.reduce(
    (sum, habit) => sum + (habit.stakingAmount || 0),
    0
  );
  const activeHabits = habits.filter((habit) => habit.status === "active");
  const completedToday = habits.filter((habit) => {
    if (!habit.lastCompletedAt) return false;
    const today = new Date().toDateString();
    const lastCompleted = new Date(habit.lastCompletedAt).toDateString();
    return today === lastCompleted;
  });

  return (
    <div className="habit-tracker">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-info">
            <h3>{activeHabits.length}</h3>
            <p>Active Habits</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Zap size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalStaked}</h3>
            <p>Sats Staked</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{completedToday.length}</h3>
            <p>Done Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{habits.reduce((sum, h) => sum + h.currentStreak, 0)}</h3>
            <p>Total Streak</p>
          </div>
        </div>
      </div>

      <div className="habits-section">
        <div className="section-header">
          <h2>Your Habits</h2>
          <button
            className="create-habit-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Create Habit
          </button>
        </div>

        <div className="habits-grid">
          {habits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No habits yet</h3>
              <p>Create your first habit to start tracking your progress!</p>
              <button
                className="create-first-habit-btn"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} />
                Create Your First Habit
              </button>
            </div>
          ) : (
            habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onPostUpdate={() => handlePostUpdate(habit.id)}
              />
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateHabit}
        />
      )}

      {showPostModal && selectedHabit && (
        <PostUpdateModal
          habit={selectedHabit}
          onClose={() => {
            setShowPostModal(false);
            setSelectedHabit(null);
          }}
        />
      )}
    </div>
  );
}
