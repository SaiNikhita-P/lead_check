/**
 * conversion-handler.js
 * Simplified Enhanced Conversions using Google's automatic hashing.
 */

function gtagReportConversion() {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', {
        'send_to': 'AW-18289360180/cwibCNPshs4cELT6hZFE',
        'value': 10.0,
        'currency': 'USD',
        'transaction_id': 'lead_' + Date.now()
    });
  }
}

function handleFormSubmit(event) {
  event.preventDefault(); // Prevent standard form reload
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;

  // 1. Get raw input values directly
  const rawEmail = document.getElementById('email').value;
  const rawPhone = document.getElementById('phone').value;
  const rawFirstName = document.getElementById('firstName').value;
  const rawLastName = document.getElementById('lastName').value;

  // 2. Prepare payload without hashing
  const userDataPayload = {
    "email": rawEmail,
    "phone_number": rawPhone
  };

  // Address matching requires Postal Code and Country too
  if (rawFirstName || rawLastName) {
    userDataPayload.address = {
      "first_name": rawFirstName,
      "last_name": rawLastName
      // "postal_code": "94043", (Highly Recommended)
      // "country": "US"        (Highly Recommended)
    };
  }

  // 3. Set standard data in gtag. Google automatically encrypts this!
  gtag('set', 'user_data', userDataPayload);

  // 4. Trigger conversion
  gtagReportConversion();

  // UI Updates
  document.getElementById('successMessage').style.display = 'block';
  document.getElementById('leadForm').style.display = 'none';
}
