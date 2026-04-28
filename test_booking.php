<?php
$data = json_encode([
    'user_id' => 'u1',
    'room_id' => 'r1',
    'hostel_id' => 'h1',
    'booking_date' => '2026-04-15'
]);

$ch = curl_init('http://localhost/unihive/backend/api/bookings.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($data)
]);

$response = curl_exec($ch);
echo "RESPONSE:\n" . $response;
?>
