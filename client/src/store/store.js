import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

// Root Redux store for the Mentovara frontend
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});
