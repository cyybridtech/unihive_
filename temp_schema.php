<?php
require 'backend/api/config.php';
try {
    $stmt = $conn->query("DESCRIBE bookings");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
