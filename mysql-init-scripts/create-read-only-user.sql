CREATE USER 'grafana_read'@'%' IDENTIFIED BY 'grafana';

-- only select-rights
GRANT SELECT ON matomo.* TO 'grafana_read'@'%';

-- reload privileges
FLUSH PRIVILEGES;