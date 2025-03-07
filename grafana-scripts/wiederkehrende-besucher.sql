-- Zählt die wiederkehrenden Besucher für eine ausgewählte Seite, alle Seiten oder alle Tagebucheinträge. Die verschiedenen Tagebucheinträge werden als eine Seite behandelt.
-- 
-- 1. `COUNT(DISTINCT lv.idvisitor)` zählt wiederkehrende Besucher.
-- 2. `JOIN` verknüpft Besuche mit Aktionen und Seitentiteln.
-- 3. `visitor_returning = 1`, dass nur wiederkehrende Besucher gezählt werden.
-- 4. `OR`-Bedingung:
--    - `${Seite} = 'Übersicht'` -> Alle Seiten zählen.
--    - `${Seite} = 'Alle Tagebücher'` -> nur Seiten mit `Blatt XXXX` zählen.
--    - Andernfalls wird eine spezifische Seite (`title.name`) gefiltert.

SELECT COUNT(DISTINCT lv.idvisitor) AS returning_visitors
FROM matomo_log_visit lv
JOIN matomo_log_link_visit_action lva ON lv.idvisit = lva.idvisit
LEFT JOIN matomo_log_action title ON lva.idaction_name = title.idaction
WHERE lv.idsite = 1
AND lv.visitor_returning = 1
AND lv.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) AND FROM_UNIXTIME(${__to}/1000)
AND (
    '${Seite}' = 'Übersicht'  
    OR LOWER(title.name) = LOWER('${Seite}') 
    OR ('${Seite}' = 'Alle Tagebücher' AND title.name REGEXP 'Blatt [0-9]{4}')
);