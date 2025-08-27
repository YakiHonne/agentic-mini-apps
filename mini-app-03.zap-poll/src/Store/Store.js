import { configureStore } from "@reduxjs/toolkit";
import {
  ToastReducer,
} from "./Slides/Publishers";

export const store = configureStore({
  reducer: {
    toast: ToastReducer,
  },
});
