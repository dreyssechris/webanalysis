-- Analysiert die Gerätetypen mit welchen auf das Bildungsportal zugegriffen wird.
-- Außerdem wird die Anzahl der Besuche über das jeweilige Gerät angezeigt.
SELECT 
    CASE 
        WHEN config_device_type = 0 THEN 'Desktop'
        WHEN config_device_type = 1 THEN 'Smartphone'
        WHEN config_device_type = 2 THEN 'Tablet'
        WHEN config_device_type = 5 THEN 'TV'
        ELSE 'Unknown'
    END AS device, 
    COUNT(*) AS value
FROM matomo_log_visit
WHERE idsite = 1
AND visit_first_action_time BETWEEN FROM_UNIXTIME(${__from}/1000) AND FROM_UNIXTIME(${__to}/1000)
GROUP BY config_device_type;