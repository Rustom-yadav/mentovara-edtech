/**
 * Promisified script loader to avoid manual DOM manipulation inside hooks.
 * Includes a safety timeout to prevent hanging promises.
 */
export function loadExternalScript(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Script load timeout: ${url}`));
    }, timeoutMs);

    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      if (typeof window !== "undefined" && (window.Razorpay || existingScript.dataset.loaded === "true")) {
        clearTimeout(timeout);
        resolve(true);
      } else {
        existingScript.addEventListener("load", () => {
          clearTimeout(timeout);
          resolve(true);
        });
        existingScript.addEventListener("error", () => {
          clearTimeout(timeout);
          reject(new Error(`Failed to load script ${url}`));
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.dataset.loaded = "false";
    
    script.onload = () => {
      script.dataset.loaded = "true";
      clearTimeout(timeout);
      resolve(true);
    };
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load script ${url}`));
    };

    document.body.appendChild(script);
  });
}
