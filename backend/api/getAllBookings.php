<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

require 'config.php';

if (!isset($_SESSION['role'])) {
    echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
    exit;
}

try {
    if ($_SESSION['role'] === 'manager') {
        $stmt = $conn->prepare("SELECT b.*, h.name as hostel_name, r.room_number as roomNumber, r.type as room_type, u.full_name as user_name, u.gender as user_gender
            FROM bookings b 
            LEFT JOIN hostels h ON b.hostel_id = h.id 
            LEFT JOIN rooms r ON b.room_id = r.id
            LEFT JOIN users u ON b.user_id = u.id
            WHERE h.manager_id = ?
            ORDER BY b.id DESC");
        $stmt->execute([$_SESSION['user_id']]);
    } else {
        $stmt = $conn->prepare("SELECT b.*, h.name as hostel_name, r.room_number as roomNumber, r.type as room_type, u.full_name as user_name, u.gender as user_gender
            FROM bookings b 
            LEFT JOIN hostels h ON b.hostel_id = h.id 
            LEFT JOIN rooms r ON b.room_id = r.id
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.id DESC");
        $stmt->execute();
    }
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'bookings' => $bookings]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

