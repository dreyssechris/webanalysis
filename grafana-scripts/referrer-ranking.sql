-- Analysiert die Besucherquellen des Bildungsportals und zählt die Besuche pro Referrer.
-- Berücksichtigt nur externe Traffic-Quellen.
-- Verwendet die Grafana-Variable: ${Sort} für die Anzahl der Besuche, um das Ranking umkehren zu können

SELECT
    COUNT(*) AS Besuche,
    visit.referer_url AS Referrer,
    SUM(visit.visit_total_actions = 1) AS Bounce_Count
FROM matomo_log_visit AS visit
WHERE visit.idsite = 1
AND (
    visit.referer_type = 2     -- Suchmaschinen
    OR visit.referer_type = 3  -- Externe Websites
    OR visit.referer_type = 6  -- Bezahlte Anzeigen
    OR visit.referer_type = 7  -- Soziale Netzwerke
)
AND visit.referer_url IS NOT NULL
AND visit.visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000)
AND FROM_UNIXTIME(${__to}/1000)
GROUP BY visit.referer_url
ORDER BY Besuche ${Sort};