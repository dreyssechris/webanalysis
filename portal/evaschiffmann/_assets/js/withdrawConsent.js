
// callback if document is fully loaded
document.addEventListener("DOMContentLoaded", function() { 
  
    // localstorage to safe state in the browser if user has given consent or not
    var consentGiven = localStorage.getItem("trackingConsent") === "given";
  
    var toggleButton = document.getElementById("toggleConsent"); 
  
    // button text according to the state
    if(consentGiven) {
      toggleButton.textContent = "Tracking deaktivieren"
    } else {
      toggleButton.textContent = "Tracking erlauben"
    }
  
    // event listener for the button
    toggleButton.addEventListener("click", function() {
      if(consentGiven) {
        // withdraw consent - chnege button text - update consentGiven
        _paq.push(['forgetConsentGiven']); 
        alert("Tracking-Consent erfolgreich widerrufen.")
        localStorage.setItem("trackingConsent", "revoked");
        toggleButton.textContent = "Tracking erlauben";
        consentGiven = false; 
      } else {
        // give consent - change button text - update consentGiven
        _paq.push(['rememberConsentGiven']); 
        alert("Tracking-Consent erfolgreich erteilt."); 
        localStorage.setItem("trackingConsent", "given")
        toggleButton.textContent = "Tracking deaktivieren"
        consentGiven = true; 
      }
    })
  });