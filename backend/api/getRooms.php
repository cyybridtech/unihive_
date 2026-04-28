<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'config.php';

try {
    $stmt = $conn->query("SELECT * FROM rooms");
    $db_rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $rooms = [];
    foreach ($db_rooms as $r) {
        $rooms[] = [
            'id' => $r['id'],
            'hostelId' => $r['hostel_id'],
            'roomNumber' => $r['room_number'],
            'capacity' => (int)$r['capacity'],
            'price' => (float)$r['price'],
            'available' => (bool)$r['available'],
            'gender' => $r['gender'] ?? 'unisex',
            'description' => $r['type'] . ' room',
            'image' => $r['image'] ?? 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
            'type' => $r['type']
        ];
    }
    
    echo json_encode(['status' => 'success', 'rooms' => $rooms]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
