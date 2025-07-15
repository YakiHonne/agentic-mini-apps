import { configureStore } from "@reduxjs/toolkit";
import habitTrackerReducer from "./habitTrackerSlice";
import toastReducer from "./toastSlice";

export const store = configureStore({
  reducer: {
    habitTracker: habitTrackerReducer,
    toast: toastReducer,
  },
});
