<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require 'config.php';

// Accept user_id from session (PHP session) or query string (localStorage auth fallback)
$user_id = $_GET['user_id'] ?? $_SESSION['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'User ID required']);
    exit;
}

$user_id = (int)$user_id; // sanitize

try {
    $stmt = $conn->prepare("
        SELECT b.*, h.name as hostel_name, r.room_number as roomNumber, r.type as room_type,
               u.full_name as user_name, u.email as user_email, u.gender as user_gender
        FROM bookings b
        LEFT JOIN hostels h ON b.hostel_id = h.id
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.user_id = ?
        ORDER BY b.id DESC
    ");
    $stmt->execute([$user_id]);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'bookings' => $bookings]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
