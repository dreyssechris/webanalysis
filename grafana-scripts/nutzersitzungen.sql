-- Ermittelt detaillierte Nutzerpfade für eine bestimmte Session-ID (${Session}).
--
-- Die Query kombiniert die unterschiedlichen querys für die events und page-views mittels `UNION ALL`:
--
-- 1. **Seitenaufrufe (Page Views):**
--    - Verknüpft `matomo_log_link_visit_action` mit `matomo_log_action` für Seitentitel und URLs.
--    - Falls der Titel eine Tagebuchseite ist (`Blatt XXXX`), wird diese extrahiert.
--    - Die Endzeit wird durch die erste darauffolgende Seitenaktion bestimmt.
--
-- 2. **Überschrift-Tracking (Events mit Kategorie `interaction` und Aktion `expand`):**
--    - Identifiziert "expand"-Events.
--    - Die Endzeit ist entweder ein darauffolgendes "close"-Event oder eine Seitenaktion.
--
-- 3. **Audio-Tracking (Kategorie `audio`, Aktion `play`):**
--    - Identifiziert Startzeitpunkte durch `play`-Events.
--    - Die Endzeit ist entweder ein `pause`-Event oder eine darauffolgende Seitenaktion.
--
-- 4. **Video-Tracking (Kategorie `video`, Aktion `play`):**
--    - Analog zu Audio: `play` = Startzeit, `pause` oder Seitenaufruf = Endzeit.
--
-- 5. **Outlinks (externe Links):**
--    - Zeigt Klicks auf externe Links, die nicht zu `evaschiffmann.de` gehören.
--    - Die Endzeit ist hier statisch auf +1 Sekunde gesetzt.
--
-- Das Ergebnis ist eine chronologisch sortierte Liste von Aktionen (Seiten, Events), die pro Session eine zeitliche Abfolge der Nutzerinteraktionen darstellt.

(
        -- ------------- Nutzerpfade ---------------------------- --
    SELECT 
        COALESCE(
            CASE 
                WHEN title.name REGEXP 'Blatt [0-9]{4}' THEN REGEXP_SUBSTR(title.name, 'Blatt [0-9]{4}')
                ELSE title.name
            END,
            url.name, 
            'Unknown'
        ) AS page_title,  
        lva1.server_time AS start_time,  
        (
            SELECT MIN(lva2.server_time)
            FROM matomo_log_link_visit_action lva2
            LEFT JOIN matomo_log_action next_url ON lva2.idaction_url = next_url.idaction
            WHERE lva2.idvisit = ${Session}  
            AND lva2.server_time > lva1.server_time
            AND next_url.type = 1
        ) AS end_time,
        'Page View' AS event_type -- label name
    FROM matomo_log_link_visit_action lva1
    LEFT JOIN matomo_log_action title ON lva1.idaction_name = title.idaction  
    LEFT JOIN matomo_log_action url ON lva1.idaction_url = url.idaction  
    WHERE lva1.idvisit = ${Session}  
    AND (title.type = 4 OR title.type IS NULL)  
    AND url.type = 1
)
UNION ALL
(
        -- ------------- Event-Tracking Überschriften (headings) ---------------------------- --
    SELECT 
        event_name.name AS page_title,  
        open_event.server_time AS start_time,  
        COALESCE(
            (
                SELECT MIN(close_event.server_time)  
                FROM matomo_log_link_visit_action close_event  
                WHERE close_event.idvisit = open_event.idvisit  
                AND close_event.server_time > open_event.server_time  
                AND close_event.idaction_event_action = (
                    SELECT idaction FROM matomo_log_action WHERE name = 'close' LIMIT 1
                )  
            ),
            (
                SELECT MIN(next_page.server_time)
                FROM matomo_log_link_visit_action next_page
                LEFT JOIN matomo_log_action next_url ON next_page.idaction_url = next_url.idaction
                WHERE next_page.idvisit = open_event.idvisit
                AND next_page.server_time > open_event.server_time
                AND next_url.type = 1  
            )
        ) AS end_time,
        'Event: Überschrift' AS event_type
    FROM matomo_log_link_visit_action open_event
    JOIN matomo_log_action event_cat ON open_event.idaction_event_category = event_cat.idaction
    JOIN matomo_log_action event_action ON open_event.idaction_event_action = event_action.idaction
    JOIN matomo_log_action event_name ON open_event.idaction_name = event_name.idaction
    WHERE open_event.idvisit = ${Session}  
    AND event_cat.name LIKE 'interaction%'
    AND event_action.name = 'expand'
)
UNION ALL
(
        -- ------------- Event-Tracking Audio ---------------------------- --
    SELECT 
        event_name.name AS page_title,
        audio_play.server_time AS start_time,
        COALESCE(
            (
                SELECT MIN(audio_pause.server_time)
                FROM matomo_log_link_visit_action audio_pause
                WHERE audio_pause.idvisit = audio_play.idvisit
                AND audio_pause.server_time > audio_play.server_time
                AND audio_pause.idaction_event_action = (
                    SELECT idaction FROM matomo_log_action WHERE name = 'pause' LIMIT 1
                )  
            ),
            (
                SELECT MIN(next_page.server_time)
                FROM matomo_log_link_visit_action next_page
                LEFT JOIN matomo_log_action next_url ON next_page.idaction_url = next_url.idaction
                WHERE next_page.idvisit = audio_play.idvisit
                AND next_page.server_time > audio_play.server_time
                AND next_url.type = 1  
            )
        ) AS end_time,
        'Event: Audio' AS event_type
    FROM matomo_log_link_visit_action audio_play
    JOIN matomo_log_action event_cat ON audio_play.idaction_event_category = event_cat.idaction
    JOIN matomo_log_action event_action ON audio_play.idaction_event_action = event_action.idaction
    JOIN matomo_log_action event_name ON audio_play.idaction_name = event_name.idaction
    WHERE audio_play.idvisit = ${Session}  
    AND event_cat.name = 'audio'
    AND event_action.name = 'play'
)
UNION ALL
(
        -- ------------- Event-Tracking Video ---------------------------- --
    SELECT 
        event_name.name AS page_title,  
        video_play.server_time AS start_time,  
        COALESCE(
            (
                SELECT MIN(video_pause.server_time)  
                FROM matomo_log_link_visit_action video_pause  
                WHERE video_pause.idvisit = video_play.idvisit  
                AND video_pause.server_time > video_play.server_time  
                AND video_pause.idaction_event_action = (
                    SELECT idaction FROM matomo_log_action WHERE name = 'pause' LIMIT 1
                )  
            ),
            (
                SELECT MIN(next_page.server_time)
                FROM matomo_log_link_visit_action next_page
                LEFT JOIN matomo_log_action next_url ON next_page.idaction_url = next_url.idaction
                WHERE next_page.idvisit = video_play.idvisit
                AND next_page.server_time > video_play.server_time
                AND next_url.type = 1  
            )
        ) AS end_time,
        'Event: Video' AS event_type
    FROM matomo_log_link_visit_action video_play
    JOIN matomo_log_action event_cat ON video_play.idaction_event_category = event_cat.idaction
    JOIN matomo_log_action event_action ON video_play.idaction_event_action = event_action.idaction
    JOIN matomo_log_action event_name ON video_play.idaction_name = event_name.idaction
    WHERE video_play.idvisit = ${Session}  
    AND event_cat.name = 'video'
    AND event_action.name = 'play'
)
UNION ALL
(
        -- ------------- Outlinks ---------------------------- --
    SELECT
        COALESCE(
            (SELECT name FROM matomo_log_action WHERE idaction = lva.idaction_name LIMIT 1),
            SUBSTRING_INDEX(event_name.name, '/', 3),
            'Externer Link'
        ) AS page_title,
        lva.server_time AS start_time,
        DATE_ADD(lva.server_time, INTERVAL 1 SECOND) AS end_time,
        'Event: Outlink' AS event_type
    FROM matomo_log_link_visit_action lva
    LEFT JOIN matomo_log_action event_name
        ON lva.idaction_url = event_name.idaction  
    WHERE lva.idvisit = ${Session}
    AND event_name.name NOT LIKE 'localhost/evaschiffmann%' -- webanalytics.duckdns.org/evaschiffmann%
)
ORDER BY start_time ASC;