<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'OPTIONS':
        http_response_code(200);
        exit();

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['user_id']) || !isset($data['room_id']) || !isset($data['hostel_id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
            exit;
        }

        $user_id    = (int)$data['user_id'];
        $room_id    = $data['room_id'];
        $hostel_id  = $data['hostel_id'];
        $booking_date = $data['booking_date'] ?? date('Y-m-d');

        // Fetch actual room price from DB
        $room_stmt = $conn->prepare("SELECT price FROM rooms WHERE id = ?");
        $room_stmt->execute([$room_id]);
        $room = $room_stmt->fetch(PDO::FETCH_ASSOC);
        if (!$room) {
            echo json_encode(['status' => 'error', 'message' => 'Room not found']);
            exit;
        }
        $total_amount = (float)$room['price'];

        // Check room is still available
        $avail_stmt = $conn->prepare("SELECT available FROM rooms WHERE id = ?");
        $avail_stmt->execute([$room_id]);
        $avail = $avail_stmt->fetch(PDO::FETCH_ASSOC);
        if (!$avail || !(bool)$avail['available']) {
            echo json_encode(['status' => 'error', 'message' => 'Sorry, this room has just been booked by someone else.']);
            exit;
        }

        try {
            $conn->beginTransaction();

            // 1. Insert booking
            $stmt = $conn->prepare("
                INSERT INTO bookings (user_id, room_id, hostel_id, booking_date, status, payment_status, reservation_fee, total_price)
                VALUES (?, ?, ?, ?, 'pending', 'unpaid', ?, ?)
            ");
            $stmt->execute([$user_id, $room_id, $hostel_id, $booking_date, $total_amount, $total_amount]);
            $booking_id = $conn->lastInsertId();

// 2. Room availability updated after payment (verifyPayment.php)
            // $conn->prepare("UPDATE rooms SET available = 0 WHERE id = ?")->execute([$room_id]); // Commented - wait for payment

            // 3. Create booking notification for the student
            $hostel_row = $conn->prepare("SELECT name FROM hostels WHERE id = ?");
            $hostel_row->execute([$hostel_id]);
            $hostel = $hostel_row->fetch(PDO::FETCH_ASSOC);
            $hostel_name = $hostel['name'] ?? 'your hostel';

            $notif = $conn->prepare("
                INSERT INTO notifications (user_id, title, message, type, read_status, notification_date)
                VALUES (?, ?, ?, 'booking', 0, CURDATE())
            ");
            $notif->execute([
                $user_id,
                'Booking Created',
                "Your booking for {$hostel_name} (GH₵" . number_format($total_amount, 2) . ") has been created. Complete payment to secure your room."
            ]);

            $conn->commit();

            echo json_encode([
                'status'     => 'success',
                'message'    => "Booking created for GH₵" . number_format($total_amount, 2),
                'booking_id' => $booking_id
            ]);
        } catch (PDOException $e) {
            $conn->rollBack();
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'GET':
        // Student get their own bookings (fallback for getUserBookings)
        $user_id = $_SESSION['user_id'] ?? ($_GET['user_id'] ?? null);
        if (!$user_id) {
            echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
            exit;
        }
        $user_id = (int)$user_id;
        try {
            $stmt = $conn->prepare("
                SELECT b.*, h.name as hostel_name, r.room_number as roomNumber, r.type as room_type
                FROM bookings b
                LEFT JOIN hostels h ON b.hostel_id = h.id
                LEFT JOIN rooms r ON b.room_id = r.id
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC
            ");
            $stmt->execute([$user_id]);
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'bookings' => $bookings]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        break;
}
?>
