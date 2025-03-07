-- Berechnet die Konversionsrate von Besuchen, bei denen mindestens 3 verschiedene Tagebucheinträge (Blatt XXXX) geöffnet wurden.
-- 
-- 1. Die Sub-query `visit_with_diary` filtert Besuche mit Tagebucheinträgen.
-- 2. `JOIN matomo_log_action` stellt sicher, dass nur echte Seitentitel (`type = 4`) berücksichtigt werden.
-- 3. `GROUP BY visit.idvisit` stellt sicher, dass jeder Besuch nur einmal gezählt wird.
-- 4. `HAVING COUNT(DISTINCT log_action_title.name) >= 3` filtert nur Besuche mit mindestens 3 verschiedenen Tagebucheinträgen.
-- 5. LEFT JOIN verbindet diese Besuche mit allen (`visit_all`), um auch Besuche ohne oder mit weniger als 3 Tagebuchseiten zu berücksichtigen.
-- (Anzahl der Besuche mit ≥3 Tagebucheinträgen geöffnet) / (Gesamtanzahl der Besuche).


SELECT 
    (COUNT(DISTINCT visit_with_diary.idvisit) / COUNT(DISTINCT visit_all.idvisit)) AS diary_conversion_rate_3plus
FROM matomo_log_visit AS visit_all
LEFT JOIN (
    SELECT visit.idvisit
    FROM matomo_log_link_visit_action
    JOIN matomo_log_action AS log_action_title 
        ON log_action_title.idaction = matomo_log_link_visit_action.idaction_name
        AND log_action_title.type = 4
    JOIN matomo_log_visit AS visit
        ON visit.idvisit = matomo_log_link_visit_action.idvisit
    WHERE visit.idsite = 1
    AND log_action_title.name REGEXP 'Blatt [0-9]{4}' 
    AND visit.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) 
    AND FROM_UNIXTIME(${__to}/1000)
    GROUP BY visit.idvisit
    HAVING COUNT(DISTINCT log_action_title.name) >= 3
) AS visit_with_diary
ON visit_all.idvisit = visit_with_diary.idvisit

WHERE visit_all.idsite = 1
AND visit_all.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) 
AND FROM_UNIXTIME(${__to}/1000);
