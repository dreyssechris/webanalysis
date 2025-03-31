-- Berechnet die durchschnittliche Verweildauer (in Minuten) für die gesamte Website oder für eine bestimmte Seite/Tagebuchseiten.
-- 
-- 1. **CASE-Statement:**
--    - Wenn `${Seite} = 'Übersicht'`, wird die durchschnittliche Sitzungsdauer aus `matomo_log_visit` berechnet.
--    - Andernfalls wird (je nach Auswhal) die Verweildauer auf einer bestimmten Seite oder den Tagebuchseiten berechnet.
--
-- 2. **Berechnung der Sitzungsdauer (Übersicht):**
--    - `SUM(visit_total_time) / COUNT(*)`, die gesamte auf der Seite verbrachte Zeit im Verhältnis zur Anzahl der Sitzungen
--  
-- 3. **Berechnung der Verweildauer pro Seite:**
--    - `TIMESTAMPDIFF(SECOND, start_time, end_time)`: Differenz zw. öffnen einer Seite und beginn der nächsten Aktion
--    - `MIN(next_action.server_time)`: Die frühste folgende Aktion wird gesucht
--    - `AVG(...)`: Mittelt die Verweildauer über alle gemessenen Seiten.
--
-- 4. **JOINs & Bedingungen:**
--    - `JOIN matomo_log_action title`: Stellt sicher, dass nur Seitentitel (`type = 4`) berücksichtigt werden.
--    - `JOIN matomo_log_action url`: Filtert gültige URLs (`type = 1`).
--    - `WHERE end_time IS NOT NULL`: Verhindert die Berücksichtigung von Seiten ohne Folgebesuch.

SELECT (
    CASE 
        -- ------------- avg Session Verweildauer ---------------------------- --
        WHEN '${Seite}' = 'Übersicht' THEN 
            (SELECT 
                ROUND(SUM(visit_total_time) / COUNT(*) / 60, 2) AS avg_time_on_site
             FROM matomo_log_visit
             WHERE idsite = 1
               AND visit_first_action_time 
                 BETWEEN FROM_UNIXTIME(${__from}/1000) 
                 AND FROM_UNIXTIME(${__to}/1000)
            )

        -- ------------- avg Unterseiten Verweildauer oder auf allen Tagebuchseiten ---------------------------- --
        ELSE 
            (SELECT 
                ROUND(AVG(TIMESTAMPDIFF(SECOND, start_time, end_time)) / 60, 2) AS avg_time_on_page_minutes
             FROM (
                SELECT 
                    lva1.server_time AS start_time,  
                    (
                        SELECT MIN(lva2.server_time)
                        FROM matomo_log_link_visit_action lva2
                        LEFT JOIN matomo_log_action next_url ON lva2.idaction_url = next_url.idaction
                        WHERE lva2.idvisit = lva1.idvisit  
                          AND lva2.server_time > lva1.server_time
                          AND next_url.type = 1
                    ) AS end_time
                FROM matomo_log_link_visit_action lva1
                LEFT JOIN matomo_log_action title ON lva1.idaction_name = title.idaction  
                LEFT JOIN matomo_log_action url ON lva1.idaction_url = url.idaction  
                WHERE lva1.idsite = 1  
                  AND title.type = 4
                  AND url.type = 1
                  AND (
                      ('${Seite}' = 'Alle Tagebücher' AND title.name REGEXP 'Blatt [0-9]{4}') 
                      OR title.name = '${Seite}' 
                  )
                  AND lva1.server_time 
                    BETWEEN FROM_UNIXTIME(${__from}/1000) 
                    AND FROM_UNIXTIME(${__to}/1000)
             ) AS page_durations
             WHERE end_time IS NOT NULL
            )
    END
) AS avg_time_result;