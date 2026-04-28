-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 15, 2026 at 01:08 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `unihive`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` varchar(50) NOT NULL,
  `hostel_id` varchar(50) NOT NULL,
  `booking_date` date NOT NULL,
  `status` enum('pending','approved','completed','cancelled') DEFAULT 'pending',
  `payment_status` enum('paid','unpaid') DEFAULT 'unpaid',
  `reservation_fee` decimal(10,2) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `room_id`, `hostel_id`, `booking_date`, `status`, `payment_status`, `reservation_fee`, `total_price`) VALUES
(1, 4, 'r12', 'h4', '2026-04-07', 'pending', 'unpaid', 50.00, 50.00),
(2, 4, 'r2', 'h1', '2026-04-07', 'pending', 'unpaid', 50.00, 50.00),
(3, 14, 'r11', 'h4', '2026-04-14', 'pending', 'unpaid', 50.00, 50.00),
(4, 14, 'r16', 'h5', '2026-04-14', 'pending', 'unpaid', 50.00, 50.00);

-- --------------------------------------------------------

--
-- Table structure for table `hostels`
--

CREATE TABLE `hostels` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `university_id` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `distance_from_campus` varchar(20) DEFAULT NULL,
  `price_range` varchar(50) DEFAULT NULL,
  `main_image` varchar(500) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 1,
  `manager_id` varchar(50) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 4.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `read_status` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `type` enum('booking','payment','hostel','info') DEFAULT NULL,
  `read_status` tinyint(1) DEFAULT 0,
  `notification_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `hostel_id` varchar(50) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `review_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` varchar(50) NOT NULL,
  `hostel_id` varchar(50) DEFAULT NULL,
  `room_number` varchar(20) DEFAULT NULL,
  `capacity` int(11) DEFAULT 1,
  `price` decimal(10,2) DEFAULT NULL,
  `available` tinyint(1) DEFAULT 1,
  `gender` enum('male','female','unisex') DEFAULT 'unisex',
  `type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `university_id` varchar(50) DEFAULT NULL,
  `role` enum('student','admin','manager') DEFAULT 'student',
  `password` varchar(255) NOT NULL,
  `avatar` varchar(10) DEFAULT NULL,
  `gender` enum('male','female') DEFAULT 'male',
  `referral_code` varchar(50) DEFAULT NULL,
  `credits` int(11) DEFAULT 0,
  `join_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `university_id`, `role`, `password`, `avatar`, `referral_code`, `credits`, `join_date`, `created_at`) VALUES
(1, 'Redof', 'redof@gmail.com', NULL, NULL, 'student', '$2y$10$5Qv4H6Z6oKqV3jY8nPqZ.eYq3pL5mN7oR8tU9vW0xY1zA2bC3dE', NULL, NULL, 0, NULL, '2026-04-03 04:35:28'),
(2, 'John', 'jj@gmail.com', NULL, NULL, 'student', '$2y$10$54j2wri0D/KAeUmQkS4J4uF4EneZe8t9MCTEbPTz57wS7FBzR6ELu', NULL, NULL, 0, NULL, '2026-04-03 05:01:44'),
(3, 'UniHive Admin', 'admin@unihive.com', '+233200000000', 'u1', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, 0, '2026-04-03', '2026-04-03 05:26:40'),
(4, 'Hannah', 'han@gmail.com', NULL, NULL, 'student', '$2y$10$Pt6kMngJf4wbePdhYwtUz.JewbsG6AXsDxVwEh1JM5w3r3iyT5YIm', NULL, NULL, 0, NULL, '2026-04-07 18:13:35'),
(5, 'cyybrid', 'cyybrid@gmail.com', NULL, NULL, 'admin', '$2y$10$n.0V9sTLyivC5OVcZyAv3ubxU7tUo7P3q5fSlFQcdEVl6jJOip0iy', NULL, NULL, 0, NULL, '2026-04-07 18:38:38'),
(7, 'Admin', 'admin@uni.com', '000', NULL, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ADMIN001', 0, NULL, '2026-04-07 19:23:19'),
(8, 'john', 'uni@gmail.com', '092883838', 'u2', 'student', '$2y$10$T/hA1BO1L9knvo3xUrXvG.CdmC59LA2dysA7FyXnhRMi.22ptU53.', NULL, 'REF-UNI297', 0, NULL, '2026-04-07 19:45:18'),
(11, 'Test Student', 'student@unihive.com', '1234567890', NULL, 'student', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'STUDENT001', 10, NULL, '2026-04-08 14:56:51'),
(14, 'morgan freeman', 'mog@gmail.com', '0244522973', 'u2', 'student', '$2y$10$8TkHkPMlC39ls1HmVt3e3eFc1xA7hB.fz/dRppEWqL0PldSBdv/AK', NULL, 'REF-MOG426', 0, NULL, '2026-04-14 21:28:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `hostels`
--
ALTER TABLE `hostels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_id` (`hostel_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
