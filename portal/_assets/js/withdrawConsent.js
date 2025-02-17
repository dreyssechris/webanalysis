// callback if document is fully loaded
document.addEventListener("DOMContentLoaded", function() { 
  
    // eventListener if consent removke button was clicked
    document.getElementById('revokeConsentButton').addEventListener('click', function() {
      // signal to matomo that consent was given
      _paq.push(['forgetConsentGiven']);
      alert("Tracking-Consent erfolgreich widerrufen.");
    });
});