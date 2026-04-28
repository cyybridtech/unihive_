<?php
require 'config.php';

// Create universities table
$conn->exec("
CREATE TABLE IF NOT EXISTS `universities` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
");

// Add image column to rooms if it doesn't exist
try {
    $conn->exec("ALTER TABLE `rooms` ADD COLUMN `image` varchar(500) DEFAULT NULL");
    echo "Added image column to rooms.\n";
} catch (PDOException $e) {
    echo "Column image might already exist: " . $e->getMessage() . "\n";
}

echo "Database updated successfully!\n";
?>
