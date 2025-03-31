-- Berechnet die Absprungrate (Bounce Rate).
--
-- 1. `SUM(CASE WHEN visit_total_actions = 1 THEN 1 ELSE 0 END)`, sodass nur Besuche mit einer Aktion gezählt werden 
-- Das Ergebnis wird durch alle Besuche geteilt und das Verhältnis entspricht der Bounce Rate (Absprungrate)

SELECT 
    (SUM(
    CASE
        WHEN visit_total_actions = 1 THEN 1 
        ELSE 0 
    END)) / 
    COUNT(*) AS bounce_rate
FROM matomo_log_visit
WHERE idsite = 1
AND visit_first_action_time 
    BETWEEN FROM_UNIXTIME(${__from}/1000) 
    AND FROM_UNIXTIME(${__to}/1000);