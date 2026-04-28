<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'config.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Admin only']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$hostel_id = $data['hostel_id'] ?? null;

if (!$hostel_id) {
    echo json_encode(['status' => 'error', 'message' => 'Hostel id is required']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM hostels WHERE id = ?");
$stmt->execute([$hostel_id]);
$hostel = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$hostel) {
    echo json_encode(['status' => 'error', 'message' => 'Hostel not found']);
    exit;
}

$conn->beginTransaction();
try {
    $deleteBookings = $conn->prepare("DELETE FROM bookings WHERE hostel_id = ?");
    $deleteBookings->execute([$hostel_id]);

    $deleteReviews = $conn->prepare("DELETE FROM reviews WHERE hostel_id = ?");
    $deleteReviews->execute([$hostel_id]);

    $deleteRooms = $conn->prepare("DELETE FROM rooms WHERE hostel_id = ?");
    $deleteRooms->execute([$hostel_id]);

    $deleteHostel = $conn->prepare("DELETE FROM hostels WHERE id = ?");
    $deleteHostel->execute([$hostel_id]);

    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Hostel deleted']);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Failed to delete hostel', 'detail' => $e->getMessage()]);
}
