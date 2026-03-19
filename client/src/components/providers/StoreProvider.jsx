"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";

// Client-side provider that wires Redux into the app tree
export default function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
