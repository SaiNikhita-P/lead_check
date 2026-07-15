/**
 * background.js
 * Listens for conversion tracking pings and audits them in real-time.
 */

const GOOGLE_ADS_FILTERS = [
  "*://www.googleadservices.com/pagead/conversion/*",
  "*://www.google.com/pagead/1p-conversion/*"
];

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    try {
      const url = new URL(details.url);
      const params = url.searchParams;

      // Only check requests that have the 'em' parameter
      if (params.has("em")) {
        const emParam = params.get("em");
        console.log(`[Auditor] Conversion Ping Detected: ${url.pathname}`);

        // Validate the Enhanced Conversions Signature
        if (emParam.startsWith("tv.1~")) {
          console.log("✅ Success: Enhanced Conversion PII signature detected!");
          console.log(`🔒 Hashed Value: ${emParam}`);
        } else {
          console.warn("❌ Failed: 'em' parameter found but does not have the expected tv.1~ signature.");
        }
      }
    } catch (e) {
      console.error("Error parsing URL:", e);
    }
  },
  { urls: GOOGLE_ADS_FILTERS }
);
