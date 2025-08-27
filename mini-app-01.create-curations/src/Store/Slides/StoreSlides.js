import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
  name: "toast",
  initialState: null,
  reducers: {
    setToast(state, action) {
      return action.payload;
    },
  },
});

const nostrAuthorsSlice = createSlice({
  name: "nostrAuthors",
  initialState: [],
  reducers: {
    setNostrAuthors(state, action) {
      return action.payload;
    },
  },
});


export const { setToast } = toastSlice.actions;
export const { setNostrAuthors } = nostrAuthorsSlice.actions;

export const NostrAuthorsReducer = nostrAuthorsSlice.reducer;
export const ToastReducer = toastSlice.reducer;

