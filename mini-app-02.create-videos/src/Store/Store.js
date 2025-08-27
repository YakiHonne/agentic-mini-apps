import { configureStore } from "@reduxjs/toolkit";
import { NostrAuthorsReducer, ToastReducer } from "./Slides/StoreSlides";

export const store = configureStore({
  reducer: {
    toast: ToastReducer,
    nostrAuthors: NostrAuthorsReducer,
  },
});
