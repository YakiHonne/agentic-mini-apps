import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  habits: [],
  currentHabit: null,
  stakingWallet: null,
  loading: false,
  error: null,
  aiAnalysis: null,
  posts: [],
};

const habitTrackerSlice = createSlice({
  name: "habitTracker",
  initialState,
  reducers: {
    setHabits: (state, action) => {
      state.habits = action.payload;
    },
    addHabit: (state, action) => {
      state.habits.push(action.payload);
    },
    updateHabit: (state, action) => {
      const index = state.habits.findIndex((h) => h.id === action.payload.id);
      if (index !== -1) {
        state.habits[index] = action.payload;
      }
    },
    setCurrentHabit: (state, action) => {
      state.currentHabit = action.payload;
    },
    setStakingWallet: (state, action) => {
      state.stakingWallet = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setAiAnalysis: (state, action) => {
      state.aiAnalysis = action.payload;
    },
    addPost: (state, action) => {
      state.posts.push(action.payload);
    },
    updateHabitStreak: (state, action) => {
      const { habitId, success } = action.payload;
      const habit = state.habits.find((h) => h.id === habitId);
      if (habit) {
        if (success) {
          habit.currentStreak += 1;
          habit.totalCompletions += 1;
          habit.lastCompletedAt = new Date().toISOString();
        } else {
          habit.currentStreak = 0;
        }
      }
    },
    resetError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setHabits,
  addHabit,
  updateHabit,
  setCurrentHabit,
  setStakingWallet,
  setLoading,
  setError,
  setAiAnalysis,
  addPost,
  updateHabitStreak,
  resetError,
} = habitTrackerSlice.actions;

export default habitTrackerSlice.reducer;
