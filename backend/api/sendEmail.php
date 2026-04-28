<?php
/**
 * Pure PHP Mail - JSON Safe (no HTML output)
 */

function sendWelcomeEmail($email, $full_name, $user_id) {
    $subject = 'Welcome to UniHive!';
    $message = "Welcome to UniHive, $full_name!\n\nYour account ($user_id) created successfully.\n\nBest,\nUniHive Team";
    $headers = 'From: noreply@cyybridtechnnology.com' . "\r\n" .
               'Reply-To: noreply@cyybridtechnnology.com' . "\r\n" .
               'X-Mailer: UniHive/1.0';
    
    $result = @mail($email, $subject, $message, $headers);
    error_log("Welcome email to $email (ID:$user_id): " . ($result ? 'SENT' : 'FAILED'));
    return $result;
}

function sendBookingEmail($email, $full_name, $booking_id, $room_number, $hostel_name, $auth_code) {
    $subject = 'Booking Confirmed - Check-in Ready';
    $message = "Booking Confirmed!\n\n";
    $message .= "Booking ID: $booking_id\n";
    $message .= "Room: $room_number\n";
    $message .= "Hostel: $hostel_name\n";
    $message .= "🔐 Secret Check-in Code: $auth_code\n\n";
    $message .= "Show this code to the hostel manager during check-in.\n\n";
    $message .= "UniHive Team";
    
    $headers = 'From: noreply@cyybridtechnnology.com' . "\r\n" .
               'Reply-To: noreply@cyybridtechnnology.com' . "\r\n" .
               'X-Mailer: UniHive/1.0';
    
    $result = @mail($email, $subject, $message, $headers);
    error_log("Booking email #$booking_id to $email: " . ($result ? 'SENT' : 'FAILED'));
    return $result;
}

// Prevent PHP warning leaks
header('Content-Type: application/json');
?>

