
/**************Matomo Page Tag**************************** */
var _paq = window._paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */

/* Only start tracking if the user has given consent */
_paq.push(['requireConsent']);

_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']); // Otgoing links are beeing tracked
(function() {
  var u="//localhost:8111/";
  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', '1']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();

/**************Expand Headings Event: Tagebücher************************ */

document.addEventListener("DOMContentLoaded", function () {
  // Wähle alle Überschriften mit ID `heading-*`, aber **ignoriere `heading-0-0`**
  const headings = document.querySelectorAll("[id^='heading-']:not(#heading-0-0)");

  headings.forEach(heading => {
      heading.addEventListener("click", function () {
          const isExpanded = heading.getAttribute("aria-expanded") === "true";
          const headingText = heading.textContent.trim(); // Überschriftstext extrahieren

          if (!isExpanded) {
              // Startzeit → Überschrift wird aufgeklappt
              _paq.push([
                  "trackEvent",
                  "interaction",  // Event-Kategorie
                  "expand",  // Event-Aktion
                  headingText,  // Event-Label (Überschriftentext)
                  new Date().getTime() // Zeitstempel
              ]);
          } else {
              // Endzeit → Überschrift wird zugeklappt
              _paq.push([
                  "trackEvent",
                  "interaction",  // Event-Kategorie
                  "close",  // Event-Aktion
                  headingText,  // Event-Label (Überschriftentext)
                  new Date().getTime() // Zeitstempel
              ]);
          }
      });
  });
});

/**************Expand Headings Event: All Other************************ */

document.addEventListener("DOMContentLoaded", function () {
  // Wähle alle ausklappbaren Überschriften (`grid-header collapsed` mit `data-toggle="collapse"`)
  const collapsibleHeaders = document.querySelectorAll(".grid-header.collapsed[data-toggle='collapse']");

  collapsibleHeaders.forEach(header => {
      header.addEventListener("click", function () {
          const isExpanded = header.getAttribute("aria-expanded") === "true";
          const headerText = header.textContent.trim(); // Extrahiere den Text der Überschrift

          if (!isExpanded) {
              // Startzeit → Überschrift wird aufgeklappt
              _paq.push([
                  "trackEvent",
                  "interaction",  // Event-Kategorie
                  "expand",  // Event-Aktion
                  headerText,  // Event-Label (Überschriftentext)
                  new Date().getTime() // Zeitstempel
              ]);
          } else {
              // Endzeit → Überschrift wird zugeklappt
              _paq.push([
                  "trackEvent",
                  "interaction",  // Event-Kategorie
                  "close",  // Event-Aktion
                  headerText,  // Event-Label (Überschriftentext)
                  new Date().getTime() // Zeitstempel
              ]);
          }
      });
  });
});

/**************Expand Headings Event: Orte************************ */


/**************Audio Clip Event ********************************** */
document.addEventListener("DOMContentLoaded", function () {
    const audioPlayers = document.querySelectorAll(".audio-player");

    audioPlayers.forEach((audio) => {
        let audioTitle = audio.querySelector("source") ? audio.querySelector("source").src.split("/").pop() : "Unkown Audio"; // Dateiname als Titel

        audio.addEventListener("play", function () {
            _paq.push([
                "trackEvent",
                "audio",  // Event-Kategorie
                "play",  // Event-Aktion
                audioTitle,  // Event-Label (Dateiname)
                new Date().getTime() // Zeitstempel
            ]);

            console.log(`Event send: audio '${audioTitle}' started.`);
        });

        audio.addEventListener("pause", function () {
            _paq.push([
                "trackEvent",
                "audio",  // Event-Kategorie
                "pause",  // Event-Aktion
                audioTitle,  // Event-Label (Dateiname)
                new Date().getTime() // Zeitstempel
            ]);

            console.log(`Event send: audio '${audioTitle}' paused.`);
        });
    });
});

/**************Video Clip Event ********************************** */

document.addEventListener("DOMContentLoaded", function () {
    const videos = document.querySelectorAll("video");

    videos.forEach((video) => {
        const videoTitle = video.closest(".slider-item")?.querySelector("h3")?.innerText || "Unknown Video";
        
        video.addEventListener("play", function () {
            _paq.push([
                "trackEvent",
                "video",
                "play",
                videoTitle,
                new Date().getTime()
            ]);
            console.log(`Event send: video '${videoTitle}' started.`);
        });

        video.addEventListener("pause", function () {
            _paq.push([
                "trackEvent",
                "video",
                "pause",
                videoTitle,
                new Date().getTime()
            ]);
            console.log(`Event send: video '${videoTitle}' paused.`);
        });

    });
});



/*
function endMatomoSession() {
  _paq.push(['resetUserId']); // Neue User-ID setzen
  _paq.push(['forgetUserOptOut']); // Falls Opt-Out aktiv war, zurücksetzen
  _paq.push(['disableCookies']); // Cookies deaktivieren
  _paq.push(['trackPageView']); // Neue Session wird gestartet

  // Alle Matomo-Cookies löschen
  var cookies = document.cookie.split("; ");
  for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].split("=")[0];
      if (cookie.startsWith("_pk_") || cookie.startsWith("mtm_")) {
          document.cookie = cookie + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
  }
  console.log("Matomo: Session & Cookies gelöscht. Neue Session gestartet.");
}
endMatomoSession();
*/

