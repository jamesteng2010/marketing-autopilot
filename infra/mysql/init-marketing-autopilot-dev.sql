-- Marketing Autopilot — dev database on Kids Guard Prod MySQL (Docker)
-- Safe: CREATE IF NOT EXISTS only; does NOT touch kids-guard-prod or other databases.
-- Password is substituted by provision script (never commit real password).

CREATE DATABASE IF NOT EXISTS `marketing-autopilot-dev`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'marketing-autopilot'@'%' IDENTIFIED BY '__MARKETING_AUTOPILOT_DB_PASS__';

GRANT ALL PRIVILEGES ON `marketing-autopilot-dev`.* TO 'marketing-autopilot'@'%';

FLUSH PRIVILEGES;
