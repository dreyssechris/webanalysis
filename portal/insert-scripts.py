import os

#! Execute once to insert all scripts and events needed for matomo tracking - enables matomo tracking
#! To remove matomo tracking execute withdraw-scripts.py

#####################################################
# part 1: Paths for .html files in root dir.
#####################################################

root_tracking_script = '<script src="_assets/js/tracking.js"></script>'
root_confirm_script  = '<script src="_assets/js/confirmConsent.js"></script>'
root_withdraw_script = '<script src="_assets/js/withdrawConsent.js"></script>'
root_insertion       = root_confirm_script + "\n" + root_tracking_script + "\n"

toggle_button_snippet = '<p><br> <button id="toggleConsent"></button> </p>'

# search for .html files in root dir
for file in os.listdir("."):
    if file.lower().endswith(".html") and os.path.isfile(file):
        try:
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
            
            if "</body>" in content:
                # insert withdraw-script into datenschutz-page if its not existing yet
                if file.lower() == "datenschutz.html":
                    # insert the tracking consent button if not already there
                    marker = '<div class="joText-wrapper">'
                    if marker in content and toggle_button_snippet not in content:
                        content = content.replace(marker, marker + "\n" + toggle_button_snippet, 1)
                        print(f"Toggle button inserted in datenschutz.html: {file}")
                    else:
                        print(f"Toggle button already present or marker not found in datenschutz.html: {file}")

                    if root_withdraw_script in content:
                        print(f"Withdraw script already inserted in datenschutz.html: {file}")
                    else:
                        new_content = content.replace("</body>", root_withdraw_script + "\n" + root_insertion + "</body>")
                        with open(file, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Withdraw script inserted into datenschutz.html: {file}")
                    continue  # Verarbeitung dieser Datei abgeschlossen.
                
                # for all other files check if confirm and tracking tags are existing
                if root_tracking_script in content or root_confirm_script in content:
                    print(f"Scripts already inserted in (root): {file}")
                else:
                    new_content = content.replace("</body>", root_insertion + "</body>")
                    with open(file, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Scripts inserted into (root): {file}")
            else:
                print(f"No </body> tag found in (root): {file}")
        except Exception as e:
            print(f"Error editing {file}: {e}")


#####################################################
# part 2: os.walk through dirs and insert scripts
#####################################################

sub_tracking_script = '<script src="../_assets/js/tracking.js"></script>'
sub_confirm_script  = '<script src="../_assets/js/confirmConsent.js"></script>'
sub_insertion       = sub_confirm_script + "\n" + sub_tracking_script + "\n"

toggleConsent_button = '<p><br> <button id="toggleConsent"></button> </p>'

# repeat insertion for subfolders of root
for dirpath, dirnames, filenames in os.walk("."):
    # skip root dir cause links are different
    if os.path.abspath(dirpath) == os.path.abspath("."):
        continue 
    for file in filenames:
        if file.lower().endswith(".html"):
            file_path = os.path.join(dirpath, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                if "</body>" in content:
                    # check if one tag is existing
                    if (sub_tracking_script in content or 
                        sub_confirm_script  in content):
                        print(f"Scripts already inserted in (sub): {file_path}")
                    else:
                        # insert before "</body>"
                        new_content = content.replace("</body>", sub_insertion + "</body>")
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Scripts inserted into (sub): {file_path}")
                else:
                    print(f"No </body> tag found in: {file_path}")
            except Exception as e:
                print(f"Error editing {file_path}: {e}")

#############################################################
# part 3: create `_assets/js` and insert scripts if missing
#############################################################

target_folder = os.path.join("_assets", "js")

if not os.path.isdir(target_folder): 
    os.makedirs(target_folder)
    print(f"Successfully created folder: {target_folder}")
else: 
    print(f"Folder already exists: {target_folder}")

# create those files if not existing
files_to_create = {
    "confirmConsent.js": """// callback if document is fully loaded
document.addEventListener("DOMContentLoaded", function() { 
    // eventListener if "Ok" was clicked: ID 'cookieOk'
    document.getElementById('cookieOk').addEventListener('click', function() {
        // signal to matomo that consent was given
        _paq.push(['rememberConsentGiven']);
        // save the state
        localStorage.setItem("trackingConsent", "given");
    });
});""",
    "withdrawConsent.js": """
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
        // withdraw consent - change button text - update consentGiven
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
  });""",
  "tracking.js": """/**************Matomo Page Tag**************************** */
var _paq = window._paq = window._paq || [];

/* Only start tracking if the user has given consent */
_paq.push(['requireConsent']);

_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']); // Otgoing links are beeing tracked

(function() {
  var u="//localhost:8111/"; // Matomo URL
  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', '1']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();

/**************Expand Headings Event: Tagebücher************************ */

document.addEventListener("DOMContentLoaded", function () {
    // all headings with the id: `heading-*`, ignore `heading-0-0`
    const headings = document.querySelectorAll("[id^='heading-']:not(#heading-0-0)");

    // eventListener for each heading
    // send a expand-Event if the heading is expanded
    // send a close-Event if the heading is closed
    // events contain the page title where the event took place, so it can be displayed in Grafana
    // send a time stamp when the event is executed, so it can be displayed in grafana
    headings.forEach(heading => {
        heading.addEventListener("click", function () {
            const isExpanded = heading.getAttribute("aria-expanded") === "true";
            const headingText = heading.textContent.trim();

            if (!isExpanded) {
                _paq.push([
                    "trackEvent",
                    "interaction - " + document.title,
                    "expand",
                    headingText,
                    new Date().getTime()
                ]);
            } else {
                _paq.push([
                    "trackEvent",
                    "interaction",
                    "close",
                    headingText,
                    new Date().getTime()
                ]);
            }
        });
    });

    // Also an close-Event should be triggered if the user leaves the page, but hasn't manually closed the heading
    window.addEventListener("beforeunload", function () {
        const expandedHeadings = document.querySelectorAll("[id^='heading-'][aria-expanded='true']");
        expandedHeadings.forEach(heading => {
            _paq.push([
                "trackEvent",
                "interaction",
                "close",
                heading.textContent.trim(),
                new Date().getTime()
            ]);
        });
    });
});

/**************Expand Headings Event: All Other************************ */

document.addEventListener("DOMContentLoaded", function () {
    // the query selector for each heading that isn't on a "Tagebuchseite" or "Orte"
    const collapsibleHeaders = document.querySelectorAll(".grid-header.collapsed[data-toggle='collapse']");

    collapsibleHeaders.forEach(header => {
        header.addEventListener("click", function () {
            const isExpanded = header.getAttribute("aria-expanded") === "true";
            const headerText = header.textContent.trim();

            // check if other headings are currently expanded
            const expandedHeaders = document.querySelectorAll(".grid-header[aria-expanded='true']");

            // send a close-Event for all headings but the current one
            // background: if another heading is openend the heading opened before will be automatically closed
            //             but that doesn't trigger a close-Event automatically,
            //             so a manual close-Event must be sent
            // exception: if the page is "Orte" there are nested headings,
            //            so with this logic if the nested heading is expanded a close-Event will be sent for the above heading, although its still opened  
            //            which isn't that much of a problem, because the user will most likely be reading the text of nested heading anyway 
            expandedHeaders.forEach(expanded => {
                if (expanded !== header) {
                    _paq.push([
                        "trackEvent",
                        "interaction",
                        "close",
                        expanded.textContent.trim(),
                        new Date().getTime()
                    ]);


                }
            });

            // same Logic like the "Tagebuch"- headings
            if (!isExpanded) {
                // `expand`-Event für die aktuelle Überschrift senden
                _paq.push([
                    "trackEvent",
                    "interaction - " + document.title,
                    "expand",
                    headerText,
                    new Date().getTime()
                ]);

            } else {
                // `close`-Event für die aktuelle Überschrift senden
                _paq.push([
                    "trackEvent",
                    "interaction",
                    "close",
                    headerText,
                    new Date().getTime()
                ]);
            }
        });
    });

    // same like "Tagebuch" send close event if page is closed
    window.addEventListener("beforeunload", function () {
        const expandedHeaders = document.querySelectorAll(".grid-header[aria-expanded='true']");
        expandedHeaders.forEach(header => {
            _paq.push([
                "trackEvent",
                "interaction",
                "close",
                header.textContent.trim(),
                new Date().getTime()
            ]);
        });
    });
});


/**************Expand Headings Event: Orte************************ */
document.addEventListener("DOMContentLoaded", function () {
    // the query selector for each heading on page "Orte"
    const mapSlideItems = document.querySelectorAll(".map-slide-item");

    mapSlideItems.forEach(slide => {
        const titleElement = slide.querySelector(".title_or_symbols h2 p");
        const closeButton = slide.querySelector(".close");

        if (titleElement) {
            const titleText = titleElement.textContent.trim(); // Extrahiere den Titel

            // Prüfe, ob eine andere Überschrift bereits geöffnet ist
            slide.addEventListener("mouseenter", function () {
                const expandedSlides = document.querySelectorAll(".map-slide-item[aria-expanded='true']");

                expandedSlides.forEach(expanded => {
                    if (expanded !== slide) {
                        const expandedTitle = expanded.querySelector(".title_or_symbols h2 p");
                        if (expandedTitle) {
                            _paq.push([
                                "trackEvent",
                                "interaction",
                                "close",
                                expandedTitle.textContent.trim(),
                                new Date().getTime()
                            ]);
                        }

                        // Markiere die vorherige als geschlossen
                        expanded.setAttribute("aria-expanded", "false");
                    }
                });

                // `expand`-Event für die aktuelle Überschrift senden
                _paq.push([
                    "trackEvent",
                    "interaction - " + document.title,
                    "expand",
                    titleText,
                    new Date().getTime()
                ]);

                slide.setAttribute("aria-expanded", "true");
            });

            // Event für explizites Schließen über den Button
            if (closeButton) {
                closeButton.addEventListener("click", function () {
                    _paq.push([
                        "trackEvent",
                        "interaction",
                        "close",
                        titleText,
                        new Date().getTime()
                    ]);

                    slide.setAttribute("aria-expanded", "false");
                });
            }
        }
    });

    // Close-Event für alle offenen Überschriften beim Verlassen der Seite**
    window.addEventListener("beforeunload", function () {
        const expandedSlides = document.querySelectorAll(".map-slide-item[aria-expanded='true']");
        expandedSlides.forEach(slide => {
            const titleElement = slide.querySelector(".title_or_symbols h2 p");
            if (titleElement) {
                _paq.push([
                    "trackEvent",
                    "interaction",
                    "close",
                    titleElement.textContent.trim(),
                    new Date().getTime()
                ]);
            }
        });
    });
});

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

    // `pause`-Event beim Verlassen der Seite, falls das Audio noch läuft
    window.addEventListener("beforeunload", function () {
        audioPlayers.forEach(audio => {
            if (!audio.paused) { // Falls das Audio noch läuft
                let audioTitle = audio.querySelector("source") ? audio.querySelector("source").src.split("/").pop() : "Unkown Audio";
                _paq.push([
                    "trackEvent",
                    "audio",
                    "pause",
                    audioTitle,
                    new Date().getTime()
                ]);
            }
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

    // `pause`-Event beim Verlassen der Seite, falls das Video noch läuft
    window.addEventListener("beforeunload", function () {
        videos.forEach(video => {
            if (!video.paused) { // Falls das Video noch läuft
                const videoTitle = video.closest(".slider-item")?.querySelector("h3")?.innerText || "Unknown Video";
                _paq.push([
                    "trackEvent",
                    "video",
                    "pause",
                    videoTitle,
                    new Date().getTime()
                ]);
            }
        });
    });
});

/********************************************************* */
/**************Scroll depth Event**************************** */
/*
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
                _paq.push(['trackEvent', 'scroll_depth', pagePath, currentPercentage]);
                console.log("Tracking scroll_depth:", currentPercentage, "on Site:", pagePath);
                showed[currentPercentage] = true;
            }, 2000);
        }

        previousPercentage = currentPercentage;
    }
});

window.addEventListener("resize", () => {
    maxScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
});

*/
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

""",
}

# for each file check if exists - if not it will be created
for filename, default_content in files_to_create.items(): 
    file_path = os.path.join(target_folder, filename)
    if not os.path.exists(file_path): 
        with open(file_path, "w", encoding="utf-8") as f: 
            f.write(default_content)
        print(f"Created Script: {file_path}")
    else: 
        print(f"File already exists: {file_path}")