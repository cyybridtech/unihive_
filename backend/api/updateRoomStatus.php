<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['room_id']) || !isset($data['available'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit;
}

$roomStmt = $conn->prepare("SELECT r.hostel_id, h.manager_id FROM rooms r LEFT JOIN hostels h ON r.hostel_id = h.id WHERE r.id = ?");
$roomStmt->execute([$data['room_id']]);
$room = $roomStmt->fetch(PDO::FETCH_ASSOC);

if (!$room) {
    echo json_encode(['status' => 'error', 'message' => 'Room not found']);
    exit;
}

if ($_SESSION['role'] !== 'admin') {
    if ($_SESSION['role'] !== 'manager' || $room['manager_id'] != $_SESSION['user_id']) {
        echo json_encode(['status' => 'error', 'message' => 'Admin or manager access required']);
        exit;
    }
}

$stmt = $conn->prepare("UPDATE rooms SET available = ? WHERE id = ?");
$success = $stmt->execute([$data['available'] ? 1 : 0, $data['room_id']]);

echo json_encode([
    'status' => $success ? 'success' : 'error',
    'message' => $success ? 'Room status updated' : 'Update failed'
]);
?>

