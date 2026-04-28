<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$reference = $data['reference'] ?? '';
$booking_id = $data['booking_id'] ?? '';

if (!$reference || !$booking_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing reference or booking ID']);
    exit;
}

// Verify with Paystack
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://api.paystack.co/transaction/verify/" . rawurlencode($reference),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Cache-Control: no-cache",
    ],
]);

$response = curl_exec($curl);
$result = json_decode($response, true);
unset($curl);

if ($result && $result['status'] === true && $result['data']['status'] === 'success') {

    // 1. Get Room and Hostel Details for the notification

    $stmt = $conn->prepare("
        SELECT b.user_id, u.email as user_email, u.full_name, u.gender as user_gender, r.room_number, r.type as room_type, h.name as hostel_name, h.manager_id
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        JOIN hostels h ON b.hostel_id = h.id
        WHERE b.id = ?
    ");
    $stmt->execute([$booking_id]);
    $details = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$details) {
        echo json_encode(['status' => 'error', 'message' => 'Booking details not found']);
        exit;
    }

    // 2. Generate Secure Auth Code (e.g., UNH-A7B2)
    $authCode = "UNH-" . strtoupper(substr(md5(uniqid()), 0, 6));

    // 3. Automated Approval: Update Booking status, payment_status, and auth_code
    $update = $conn->prepare("
        UPDATE bookings 
        SET payment_status = 'paid', 
            status = 'approved', 
            auth_code = ? 
        WHERE id = ?
    ");

    if ($update->execute([$authCode, $booking_id])) {

        // 4. Mark room as unavailable
        $room_update = $conn->prepare("UPDATE rooms SET available = 0 WHERE id = (SELECT room_id FROM bookings WHERE id = ?)");
        $room_update->execute([$booking_id]);

        // 5. Create Detailed Success Notification
        $notifMsg = "Booking Confirmed! Room: {$details['room_number']} ({$details['room_type']}) at {$details['hostel_name']}. Your Security Code: {$authCode}";

        $notif = $conn->prepare("
            INSERT INTO notifications (user_id, title, message, type, read_status, notification_date)
            VALUES (?, 'Booking Confirmed! 🎉', ?, 'payment', 0, CURDATE())
        ");

        $notif->execute([$details['user_id'], $notifMsg]);

        if (!empty($details['manager_id'])) {
            $managerMsg = "New paid booking from " . ($details['full_name'] ?? 'a student') .
                          " ({$details['user_gender']}) for room {$details['room_number']} at {$details['hostel_name']}. Code: {$authCode}.";
            $managerNotif = $conn->prepare("
                INSERT INTO notifications (user_id, title, message, type, read_status, notification_date)
                VALUES (?, 'New Paid Booking', ?, 'booking', 0, CURDATE())
            ");
            $managerNotif->execute([$details['manager_id'], $managerMsg]);
        }

        // Send email with secret code
        require_once 'sendEmail.php';
        sendBookingEmail(
            $details['user_email'] ?? '',  // Need to JOIN users.email
            'Student', 
            $booking_id, 
            $details['room_number'], 
            $details['hostel_name'], 
            $authCode
        );

        echo json_encode([
            'status' => 'success',
            'message' => 'Payment verified and booking automatically approved',
            'authCode' => $authCode,
            'roomDetails' => [
                'number' => $details['room_number'],
                'type' => $details['room_type']
            ]
        ]);

    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database update failed']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Payment verification failed']);
}
?>