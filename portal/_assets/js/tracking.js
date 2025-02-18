var _paq = window._paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */

/* Only start tracking if the user has given consent */
_paq.push(['requireConsent']);

_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u="//localhost:8111/";
  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', '1']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();

