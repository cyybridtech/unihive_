<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'config.php';

// Admin and manager booking confirmation
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'manager'])) {
    echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$booking_id = (int)($data['booking_id'] ?? 0);
$status = $data['status'] ?? '';

if (!$booking_id || !in_array($status, ['approved', 'rejected', 'cancelled', 'completed'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid booking_id or status']);
    exit;
}

if ($_SESSION['role'] === 'manager' && $status !== 'completed') {
    echo json_encode(['status' => 'error', 'message' => 'Manager can only confirm completed bookings']);
    exit;
}

if ($_SESSION['role'] === 'manager' && $status === 'completed') {
    $managerCheck = $conn->prepare("SELECT h.manager_id, b.status FROM bookings b JOIN hostels h ON b.hostel_id = h.id WHERE b.id = ?");
    $managerCheck->execute([$booking_id]);
    $bookingMeta = $managerCheck->fetch(PDO::FETCH_ASSOC);
    if (!$bookingMeta || $bookingMeta['manager_id'] != $_SESSION['user_id']) {
        echo json_encode(['status' => 'error', 'message' => 'Booking not found for this manager']);
        exit;
    }
    if ($bookingMeta['status'] !== 'approved') {
        echo json_encode(['status' => 'error', 'message' => 'Only approved bookings can be confirmed']);
        exit;
    }
}

try {
    $conn->beginTransaction();

    // Update booking status
    $update = $conn->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    $updated = $update->execute([$status, $booking_id]);

    if (!$updated) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Booking not found']);
        exit;
    }

    // Optional: Update room availability (if rejected, set available=1)
    if ($status === 'rejected') {
        $reject_stmt = $conn->prepare("UPDATE rooms r JOIN bookings b ON r.id = b.room_id SET r.available = 1 WHERE b.id = ?");
        $reject_stmt->execute([$booking_id]);
    }

    // Get details for notification
    $details_stmt = $conn->prepare("
        SELECT b.user_id, h.name as hostel_name, r.room_number
        FROM bookings b
        LEFT JOIN hostels h ON b.hostel_id = h.id
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ?
    ");
    $details_stmt->execute([$booking_id]);
    $details = $details_stmt->fetch(PDO::FETCH_ASSOC);

    if ($details) {
        $user_id = (int)$details['user_id'];
        $hostel_name = $details['hostel_name'] ?? 'hostel';
        $room_number = $details['room_number'] ?? '';

        $title = ucfirst($status) . ' Booking';
        $status_text = ($status === 'approved') ? 'Congratulations! Your booking for' : 'Your booking for';
        $message = $status_text . ' ' . $hostel_name . ' (Room ' . $room_number . ') has been ' . $status . '.';

        $notif = $conn->prepare("
            INSERT INTO notifications (user_id, title, message, type, read_status, notification_date)
            VALUES (?, ?, ?, 'booking', 0, CURDATE())
        ");
        $notif->execute([$user_id, $title, $message]);
    }

    $conn->commit();

    echo json_encode([
        'status' => 'success',
        'message' => "Booking {$status} successfully",
        'booking_id' => $booking_id
    ]);

} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>

