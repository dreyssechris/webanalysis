// callback if document is fully loaded
document.addEventListener("DOMContentLoaded", function() { 
  
    // eventListener if "Ok" was clicked: ID 'cookieOk'
    document.getElementById('cookieOk').addEventListener('click', function() {
      // signal to matomo that consent was given
      _paq.push(['rememberConsentGiven']);
      // safe the state
      localStorage.setItem("trackingConsent", "given");
    });
});