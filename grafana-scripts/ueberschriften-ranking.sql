-- Zählt, wie oft Nutzer eine Überschrift per "expand"-Event aufgeklappt haben.
-- 
-- 1. `event_label.name` entspricht der Überschrift.
-- 2. `COUNT(*)` ist die Anzahl der expand-Events pro Überschrift
-- 3. `JOIN matomo_log_action` verknüpft Events mit deren Kategorie (Seitentitel,- für den $Seite-Filter) und Label (Überschriftentext).
-- 4. `${Seite}`-Filter: 
--    - Falls "Übersicht" -> alle Überschriften auf der gesamten Seite
--    - Falls eine Seite gewählt wurde -> nur Überschriften dieser Seite berücksichtigen, gibt es hierbei keine Überschriften bleibt das Ranking leer.
-- 5. Überschriften werden nach Anzahl der expand-Events sortiert.

SELECT 
    event_label.name AS Titel,
    COUNT(*) AS Anzahl
FROM matomo_log_link_visit_action lva
JOIN matomo_log_action action_event
    ON action_event.idaction = lva.idaction_event_action
JOIN matomo_log_action event_label 
    ON lva.idaction_name = event_label.idaction  -- Überschrift Text
JOIN matomo_log_action event_category 
    ON event_category.idaction = lva.idaction_event_category  -- Titel
JOIN matomo_log_visit lv
    ON lv.idvisit = lva.idvisit
WHERE lv.idsite = 1
AND action_event.name = 'expand'
AND lv.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) 
    AND FROM_UNIXTIME(${__to}/1000)
AND event_label.name NOT IN ('Allgemeine Daten', 'Zitieren und Nachnutzen', 'Feedback')
AND (
    '${Seite}' = 'Übersicht'
    OR LOWER(event_category.name) LIKE LOWER('%${Seite}%')
)
GROUP BY event_label.name
ORDER BY Anzahl ${Sort};
