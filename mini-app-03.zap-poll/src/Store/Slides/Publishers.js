import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setToast(state, action) {
      return action.payload;
    },
  },
});


export const { setToast } = toastSlice.actions;

export const ToastReducer = toastSlice.reducer;

