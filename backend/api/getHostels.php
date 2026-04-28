<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'config.php';

try {
$stmt = $conn->prepare("
    SELECT 
        h.*,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as review_count
    FROM hostels h
    LEFT JOIN reviews r ON h.id = r.hostel_id
    GROUP BY h.id
");
    $stmt->execute();
    $db_hostels = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $hostels = [];
    foreach ($db_hostels as $h) {
        $hostels[] = [
            'id' => $h['id'],
            'name' => $h['name'],
            'universityId' => $h['university_id'],
            'address' => $h['address'],
            'description' => $h['description'],
            'facilities' => ['WiFi', 'Security'], 
            'distanceFromCampus' => $h['distance_from_campus'],
            'priceRange' => $h['price_range'],
            'mainImage' => $h['main_image'],
            'gallery' => [$h['main_image']],
            'managerId' => $h['manager_id'] ?? null,
            'subaccountCode' => $h['subaccount_code'] ?? null,
            'verified' => (bool)$h['verified'],
            'rating' => (float)$h['rating'],
            'reviewCount' => (int)$h['review_count']
        ];
    }
    
    echo json_encode(['status' => 'success', 'hostels' => $hostels]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
