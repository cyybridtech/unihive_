-- Add to unihive DB in phpMyAdmin

CREATE TABLE IF NOT EXISTS `hostels` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `university_id` varchar(50),
  `address` varchar(255),
  `description` text,
  `distance_from_campus` varchar(20),
  `price_range` varchar(50),
  `main_image` varchar(500),
  `verified` tinyint(1) DEFAULT 1,
  `manager_id` varchar(50) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 4.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `hostel_id` varchar(50),
  `room_number` varchar(20),
  `capacity` int DEFAULT 1,
  `price` decimal(10,2),
  `available` tinyint(1) DEFAULT 1,
  `gender` enum('male','female','unisex') DEFAULT 'unisex',
  `type` varchar(50),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`hostel_id`) REFERENCES `hostels`(`id`) ON DELETE CASCADE
);

-- Sample data
INSERT INTO `hostels` VALUES 
('h1', 'Prestige Hall', 'u1', 'East Legon', 'Premium hostel', '0.3km', 'GH₵1200-2500', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 1, 4.7, NOW()),
('h2', 'Pentagon Hostel', 'u1', 'Haatso', 'Affordable rooms', '1.2km', 'GH₵800-1500', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 1, 4.2, NOW());

INSERT INTO `rooms` VALUES 
('r1', 'h1', '101', 1, 2500, 1, 'Single', NOW()),
('r2', 'h1', '102', 2, 1800, 1, 'Double', NOW()),
('r3', 'h2', 'A1', 2, 1500, 1, 'Double', NOW()),
('r4', 'h2', 'A2', 1, 1200, 1, 'Single', NOW());

