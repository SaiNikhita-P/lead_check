/**
 * conversion-handler.js
 * Handles hashing, normalization, and sending of Enhanced Conversion data to Google Ads.
 */

/**
 * Normalizes and computes the SHA-256 hex hash of a string.
 * Supports both Web Crypto API (HTTPS/localhost) and CryptoJS fallback.
 */
async function sha256Hash(inputString) {
  if (!inputString) return null;
  
  // 1. Normalize: Trim leading/trailing whitespace and convert to lowercase
  const normalized = inputString.trim().toLowerCase();
  
  // 2. Try native Web Crypto API first (Secure Contexts / HTTPS / localhost)
  if (window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(normalized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn("Web Crypto API failed, falling back to CryptoJS:", e);
    }
  }
  
  // 3. Fallback to CryptoJS for HTTP / Insecure Contexts
  if (typeof CryptoJS !== 'undefined') {
    return CryptoJS.SHA256(normalized).toString(CryptoJS.enc.Hex);
  }
  
  throw new Error("No SHA-256 implementation available in this browser context.");
}

/**
 * Normalizes phone numbers according to Google Ads requirements (E.164 format).
 */
function normalizePhone(phoneString) {
  if (!phoneString) return '';
  let cleaned = phoneString.replace(/[\s\-\(\)]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

/**
 * Triggers the official Google Ads Conversion Event.
 */
function gtagReportConversion(url) {
  const callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  
  // Make sure gtag is available before trying to use it
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', {
        'send_to': 'AW-18289360180/cwibCNPshs4cELT6hZFE',
        'value': 10.0,
        'currency': 'USD',
        'transaction_id': 'lead_' + Date.now(),
        'event_callback': callback
    });
  } else {
    console.error("gtag is not defined. Ensure Google Tag is loaded in the HTML.");
    callback();
  }
  return false;
}

/**
 * Orchestrates the form submission, encryption, and dispatching.
 */
async function handleFormSubmit(event) {
  event.preventDefault(); // Prevent standard form reload
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Encrypting & Sending...';

  const rawEmail = document.getElementById('email').value;
  const rawPhone = normalizePhone(document.getElementById('phone').value);
  const rawFirstName = document.getElementById('firstName').value;
  const rawLastName = document.getElementById('lastName').value;

  try {
    const hashedEmail = await sha256Hash(rawEmail);
    const hashedPhone = await sha256Hash(rawPhone);
    const hashedFirstName = rawFirstName ? await sha256Hash(rawFirstName) : undefined;
    const hashedLastName = rawLastName ? await sha256Hash(rawLastName) : undefined;

    // Securely nested schema according to Google Ads requirements
    const userDataPayload = {
      "sha256_email_address": hashedEmail,
      "sha256_phone_number": hashedPhone
    };

    if (hashedFirstName || hashedLastName) {
      userDataPayload.address = {};
      if (hashedFirstName) userDataPayload.address.sha256_first_name = hashedFirstName;
      if (hashedLastName) userDataPayload.address.sha256_last_name = hashedLastName;
    }

    // 1. Set the pre-hashed user data in gtag BEFORE calling the conversion snippet
    gtag('set', 'user_data', userDataPayload);

    // 2. Call Google's conversion event
    gtagReportConversion();

    // UI Updates
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('leadForm').style.display = 'none';
    
    console.log(' Enhanced Conversion fired with SHA-256 hashed user_data:', userDataPayload);
  } catch (error) {
    console.error('Error during hashing or gtag dispatch:', error);
    alert('An error occurred while processing the form: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.innerText = 'Submit Lead & Fire Conversion';
  }
}
