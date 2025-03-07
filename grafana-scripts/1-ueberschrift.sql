-- Berechnet die Konversionsrate von Besuchen mit mindestens einer "expand"-Aktion (Übeschrift aufgeklappt).
-- 
-- 1. Die Sub-query `visit_with_expand` filtert Besuche mit "expand"-Aktionen.
-- 2. `GROUP BY visit.idvisit` stellt sicher, dass jeder Besuch nur einmal gezählt wird.
-- 3. Der LEFT JOIN verbindet diese Besuche mit allen (`visit_all`), um auch Besuche ohne "expand"-Aktion zu berücksichtigen.
-- (Anzahl der Besuche mit ≥1 Überschrift aufgeklappt) / (Gesamtanzahl der Besuche).

SELECT 
    (COUNT(DISTINCT visit_with_expand.idvisit) /
     COUNT(DISTINCT visit_all.idvisit)) AS conversion_rate
FROM matomo_log_visit AS visit_all
LEFT JOIN (
    SELECT visit.idvisit
    FROM matomo_log_link_visit_action AS lva
    JOIN matomo_log_action AS action_event
        ON action_event.idaction = lva.idaction_event_action
        AND action_event.name = 'expand'
    JOIN matomo_log_visit AS visit
        ON visit.idvisit = lva.idvisit
    WHERE visit.idsite = 1
    AND visit.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) 
    AND FROM_UNIXTIME(${__to}/1000)
    GROUP BY visit.idvisit
) AS visit_with_expand
ON visit_all.idvisit = visit_with_expand.idvisit
WHERE visit_all.idsite = 1
AND visit_all.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) 
AND FROM_UNIXTIME(${__to}/1000);