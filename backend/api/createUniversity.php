<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'config.php';

// Auth check
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Admin only']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name']) || trim($data['name']) === '') {
    echo json_encode(['status' => 'error', 'message' => 'University name is required']);
    exit;
}

$id = 'u' . time() . rand(10, 99);
$stmt = $conn->prepare("INSERT INTO universities (id, name, city, country) VALUES (?, ?, ?, ?)");

$success = $stmt->execute([
    $id,
    $data['name'],
    $data['city'] ?? '',
    $data['country'] ?? 'Ghana'
]);

if ($success) {
    echo json_encode(['status' => 'success', 'id' => $id]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to create university']);
}
?>
