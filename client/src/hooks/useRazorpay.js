"use client";

import { useState, useEffect, useCallback } from "react";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Dynamically loads the Razorpay Checkout SDK and returns loading state.
 * Safe to call multiple times — script is loaded only once.
 */
export function useRazorpay() {
  // Initialize state based on whether script is already loaded (lazy initialization)
  const [isLoaded, setIsLoaded] = useState(() => {
    if (typeof window !== "undefined" && window.Razorpay) return true;
    return false;
  });

  useEffect(() => {
    if (window.Razorpay) {
      // Use setTimeout to avoid 'Calling setState synchronously within an effect' lint error
      setTimeout(() => setIsLoaded(true), 0);
      return;
    }

    // Check if script tag already exists (e.g. another component mounted it)
    const existing = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );
    
    if (existing) {
      existing.addEventListener("load", () => setIsLoaded(true));
      return;
    }

    // Inject the script
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () =>
      console.error("Failed to load Razorpay SDK. Check your network.");
    document.body.appendChild(script);
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
