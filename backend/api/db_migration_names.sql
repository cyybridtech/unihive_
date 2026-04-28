-- Add first_name, last_name to users
ALTER TABLE users ADD COLUMN first_name VARCHAR(50) AFTER full_name;
ALTER TABLE users ADD COLUMN last_name VARCHAR(50) AFTER first_name;
ALTER TABLE users ADD COLUMN id_verification_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending' AFTER id_photo;

-- Run in phpMyAdmin
-- SELECT first_name, last_name, full_name FROM users LIMIT 5;
