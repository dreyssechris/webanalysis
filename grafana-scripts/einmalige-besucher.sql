-- Zählt Besucher, die nur eine einzelne Session hatten.
-- 
-- 1. Der Unterquery `single_visitors` filtert Besucher mit genau einer Session (`COUNT(idvisit) = 1`).
-- 2. `JOIN` verbindet diese mit `matomo_log_visit`, um nur deren Besuche zu zählen.
-- 3. `LEFT JOIN` auf `matomo_log_action` ermöglicht die Filterung nach Seiten.
-- 4. `OR`-Bedingung:
--    - `${Seite} = 'Übersicht'` -> Alle Seiten zählen.
--    - `${Seite} = 'Alle Tagebücher'` -> nur Seiten mit `Blatt XXXX` zählen.
--    - Andernfalls wird eine spezifische Seite (`title.name`) gefiltert.

SELECT COUNT(DISTINCT lv.idvisitor) AS single_session_visitors
FROM matomo_log_visit lv
JOIN (
    SELECT idvisitor
    FROM matomo_log_visit
    WHERE idsite = 1
    GROUP BY idvisitor
    HAVING COUNT(idvisit) = 1
) single_visitors ON lv.idvisitor = single_visitors.idvisitor
JOIN matomo_log_link_visit_action lva ON lv.idvisit = lva.idvisit
LEFT JOIN matomo_log_action title ON lva.idaction_name = title.idaction
WHERE lv.idsite = 1
AND lv.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) AND FROM_UNIXTIME(${__to}/1000)
AND (
    '${Seite}' = 'Übersicht'  
    OR LOWER(title.name) = LOWER('${Seite}') 
    OR ('${Seite}' = 'Alle Tagebücher' AND title.name REGEXP 'Blatt [0-9]{4}')
);