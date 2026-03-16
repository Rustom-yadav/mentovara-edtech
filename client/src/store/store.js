import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import courseReducer from "./slices/courseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});
