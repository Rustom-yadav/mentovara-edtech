"use client";

import { useState, useEffect, useCallback } from "react";
import { loadExternalScript } from "@/utilities";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Dynamically loads the Razorpay Checkout SDK and returns loading state.
 */
export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadExternalScript(RAZORPAY_SCRIPT_URL)
      .then(() => setIsLoaded(true))
      .catch((err) => console.error(err.message));
  }, []);

  /**
   * Opens the Razorpay Checkout modal.
   * @param {Object} options - Razorpay Checkout options (key, amount, order_id, handler, etc.)
   * @returns {Object|null} The Razorpay instance, or null if SDK isn't loaded
   */
  const openCheckout = useCallback(
    (options) => {
      if (!isLoaded || !window.Razorpay) {
        console.error("Razorpay SDK not loaded yet.");
        return null;
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
      return rzp;
    },
    [isLoaded]
  );

  return { isLoaded, openCheckout };
}
