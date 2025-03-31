-- Berechnet die Konversionsrate von Besuchen, bei denen mindestens eine Tagebuchseite (Blatt XXXX) geöffnet wurde.
--
-- 1. Die Sub-query `visit_with_diary` ermittelt alle Besuche (`idvisit`), in denen eine Tagebuchseite geöffnet wurde:
--    - `matomo_log_link_visit_action` wird mit `matomo_log_action` verknüpft, um nur Seitentitel (`type = 4`) zu berücksichtigen.
--    - `REGEXP 'Blatt [0-9]{4}'` filtert nur Tagebuchseiten.
--    - `GROUP BY visit.idvisit` stellt sicher, dass jeder Besuch nur einmal gezählt wird.
--
-- 2. Der LEFT JOIN verbindet diese gefilterten Besuche mit allen Besuchen (`visit_all`), sodass auch Besuche ohne Tagebuchseiten erfasst werden.
-- 
-- 3. `COUNT(DISTINCT visit_with_diary.idvisit)` zählt Besuche mit mindestens einer Tagebuchseite.
-- 4. `COUNT(DISTINCT visit_all.idvisit)` zählt die Gesamtanzahl der Besuche
-- (Anzahl der Besuche mit ≥1 Tagebuchseiten aufgerufen) / (Gesamtanzahl der Besuche).

SELECT 
    COUNT(DISTINCT visit_with_diary.idvisit) / COUNT(DISTINCT visit_all.idvisit) AS conversion_rate
FROM matomo_log_visit AS visit_all
LEFT JOIN (
    SELECT visit.idvisit
    FROM matomo_log_link_visit_action AS lva
    JOIN matomo_log_action AS action_title 
        ON action_title.idaction = lva.idaction_name
        AND action_title.type = 4
    JOIN matomo_log_visit AS visit
        ON visit.idvisit = lva.idvisit
    WHERE visit.idsite = 1
    AND action_title.name REGEXP 'Blatt [0-9]{4}'
    AND visit.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) 
    AND FROM_UNIXTIME(${__to}/1000)
    GROUP BY visit.idvisit  -- Sorgt dafür, dass jeder Besuch nur einmal gezählt wird
) AS visit_with_diary
ON visit_all.idvisit = visit_with_diary.idvisit
WHERE visit_all.idsite = 1
AND visit_all.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) 
AND FROM_UNIXTIME(${__to}/1000);