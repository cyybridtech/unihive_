<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'config.php';

if (!isset($_SESSION['role']) || ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'manager')) {
    echo json_encode(['status' => 'error', 'message' => 'Admin or manager only']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['hostel_id']) || !isset($data['room_number']) || !isset($data['price'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

if ($_SESSION['role'] === 'manager') {
    $hostelCheck = $conn->prepare("SELECT manager_id FROM hostels WHERE id = ?");
    $hostelCheck->execute([$data['hostel_id']]);
    $hostelRow = $hostelCheck->fetch(PDO::FETCH_ASSOC);
    if (!$hostelRow || $hostelRow['manager_id'] != $_SESSION['user_id']) {
        echo json_encode(['status' => 'error', 'message' => 'Manager can only add rooms to assigned hostel']);
        exit;
    }
}

$id = 'r' . time() . rand(100, 999);
$stmt = $conn->prepare("
    INSERT INTO rooms (id, hostel_id, room_number, capacity, price, available, gender, type, image) 
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
");

$success = $stmt->execute([
    $id,
    $data['hostel_id'],
    $data['room_number'],
    $data['capacity'] ?? 1,
    $data['price'],
    $data['gender'] ?? 'unisex',
    $data['type'] ?? 'Standard',
    $data['image'] ?? 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80'
]);

if ($success) {
    echo json_encode(['status' => 'success', 'id' => $id]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to create room']);
}
?>

