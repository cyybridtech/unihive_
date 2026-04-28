<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['user_id']) || !isset($data['hostel_id']) || !isset($data['rating'])) {
            echo json_encode(['status' => 'error', 'message' => 'Missing fields: user_id, hostel_id, rating(1-5)']);
            exit;
        }
        
        $user_id = (int)$data['user_id'];
        $hostel_id = $data['hostel_id'];
        $rating = (int)$data['rating'];
        $comment = $data['comment'] ?? '';
        
        if ($rating < 1 || $rating > 5) {
            echo json_encode(['status' => 'error', 'message' => 'Rating must be 1-5']);
            exit;
        }
        
        // Check duplicate review
        $check = $conn->prepare("SELECT id FROM reviews WHERE user_id = ? AND hostel_id = ?");
        $check->execute([$user_id, $hostel_id]);
        if ($check->fetch()) {
            echo json_encode(['status' => 'error', 'message' => 'You already reviewed this hostel']);
            exit;
        }
        
        $stmt = $conn->prepare("
            INSERT INTO reviews (user_id, hostel_id, rating, comment, review_date) 
            VALUES (?, ?, ?, ?, CURDATE())
        ");
        
        if ($stmt->execute([$user_id, $hostel_id, $rating, $comment])) {
            echo json_encode([
                'status' => 'success', 
                'message' => 'Review submitted',
                'review_id' => $conn->lastInsertId()
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to save review']);
        }
        break;
        
    case 'GET':
        $hostel_id = $_GET['hostel_id'] ?? null;
        if (!$hostel_id) {
            echo json_encode(['status' => 'error', 'message' => 'hostel_id required']);
            exit;
        }
        
        $stmt = $conn->prepare("
            SELECT r.*, u.full_name as user_name, LEFT(u.email, 1) as user_avatar
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.hostel_id = ?
            ORDER BY r.id DESC
        ");
        $stmt->execute([$hostel_id]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'reviews' => $reviews]);
        break;
        
    default:
        echo json_encode(['status' => 'error', 'message' => 'Only POST/GET allowed']);
}
?>

