<?php
require 'config.php';

$hostel_id = $_GET['hostel_id'] ?? 'h1702874235123'; // Default newest
$user_ids = [1,2,4,8,11,14]; // Sample users

echo "Seeding test reviews for $hostel_id\n";

foreach ($user_ids as $u) {
  $rating = rand(3,5);
  $comment = "Test review rating $rating from user $u. Great hostel!";
  $stmt = $conn->prepare("INSERT IGNORE INTO reviews (user_id, hostel_id, rating, comment, review_date) VALUES (?, ?, ?, ?, CURDATE())");
  $stmt->execute([$u, $hostel_id, $rating, $comment]);
  echo "Added review from user $u (rating $rating)\n";
}

echo "\nTest: http://localhost/unihive/backend/api/getHostels.php (check rating)\n";
?>

