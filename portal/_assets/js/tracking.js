
/**************Matomo Page Tag**************************** */
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

/********************************************************* */
/**************Scroll depth Event**************************** */

var maxScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
var percentagesArr = [25, 50, 75, 100];
const showed = {};
let timeout;
let previousPercentage;

var pagePath = window.location.pathname.split("?")[0].split("#")[0];

window.addEventListener("scroll", function () {
    var scrollVal = window.scrollY;
    var scrollPercentage = Math.round(scrollVal / maxScrollHeight * 100);
    let currentPercentage = 0;
    let i = 0;

    while (percentagesArr[i] <= scrollPercentage) {
        currentPercentage = percentagesArr[i++];
    }

    if (previousPercentage !== currentPercentage) {
        clearTimeout(timeout);

        if (currentPercentage !== 0 && !showed[currentPercentage]) {
            timeout = setTimeout(() => {
                // pathname as name to filter individual scroll depth for all sites
                // _paq.push(['trackEvent', 'Category', 'action', 'name (optional)', 'value (optional)']); percentage
                _paq.push(['trackEvent', 'Scrolltiefe', 'pagePath', currentPercentage]);
                console.log("Tracking Scrolltiefe:", currentPercentage, "auf Seite:", pagePath);
                showed[currentPercentage] = true;
            }, 2000);
        }

        previousPercentage = currentPercentage;
    }
});

window.addEventListener("resize", () => {
    maxScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
});