-- Analysiert die Zugriffsquellen auf das Bildungsportal und kategorisiert diese.
-- Außerdem wird die Anzahl der Besuche über die jeweilige Quelle angezeigt.
SELECT
    CASE
        WHEN referer_type = 1 THEN 'Direkt' -- kein Referrer
        WHEN referer_type = 2 THEN 'Suchmaschine'
        WHEN referer_type = 3 THEN 'Externe Website'
        WHEN referer_type = 7 THEN 'Soziale Netzwerke'
        ELSE 'Andere'
    END AS traffic_source,
    COUNT(*) AS value
FROM matomo_log_visit
WHERE idsite = 1
AND visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) AND FROM_UNIXTIME(${__to}/1000)
GROUP BY referer_type;