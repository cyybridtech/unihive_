-- UniHive Database Migration
-- Run this in phpMyAdmin → unihive database → SQL tab

-- 1. Add created_at to bookings (if missing)
ALTER TABLE `bookings` 
  ADD COLUMN IF NOT EXISTS `created_at` timestamp NOT NULL DEFAULT current_timestamp();

-- 2. Add gender to users and update role values
ALTER TABLE `users` 
  MODIFY COLUMN `role` enum('student','admin','manager') DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS `gender` enum('male','female') DEFAULT 'male';

-- 3. Add manager assignment to hostels
ALTER TABLE `hostels`
  ADD COLUMN IF NOT EXISTS `manager_id` varchar(50) DEFAULT NULL;

-- 4. Add gender classification to rooms
ALTER TABLE `rooms`
  ADD COLUMN IF NOT EXISTS `gender` enum('male','female','unisex') DEFAULT 'unisex';

-- 5. Create saved_hostels table (so bookmarks persist)
CREATE TABLE IF NOT EXISTS `saved_hostels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `hostel_id` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_hostel_unique` (`user_id`, `hostel_id`),
  CONSTRAINT `saved_hostels_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
