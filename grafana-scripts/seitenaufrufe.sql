-- Analysiert die Seitenaufrufe und gruppiert diese nach Seitentitel
-- Handelt es sich um einen Tagebucheintrag wird aus dem Titel nur das Blatt XXXX extrahiert um den Titel zu verkürzen
-- Es werden nur echte Seitentitel (`type = 4`) berücksichtigt, keine Events oder andere Aktionen.
-- Sortierung nach Seitenaufrufen und Begrenzung auf max. 10 St.
SELECT 
    CASE 
        WHEN log_action_title.name REGEXP 'Blatt [0-9]{4}' 
        THEN REGEXP_SUBSTR(log_action_title.name, 'Blatt [0-9]{4}')
        ELSE log_action_title.name
    END AS page_title, 
    COUNT(*) AS page_views
FROM matomo_log_link_visit_action
JOIN matomo_log_action AS log_action_title 
    ON log_action_title.idaction = matomo_log_link_visit_action.idaction_name
    AND log_action_title.type = 4
JOIN matomo_log_visit AS visit
    ON visit.idvisit = matomo_log_link_visit_action.idvisit
WHERE matomo_log_link_visit_action.idsite = 1
AND visit.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) AND FROM_UNIXTIME(${__to}/1000)
GROUP BY page_title
ORDER BY page_views ${Sort}
LIMIT 10;                   -- optional, Entfernen für Ansicht auf alle Seiten
