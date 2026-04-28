<?php
$host = "localhost";
$dbname = "unihive";
$user = "root";
$pass = ""; // default XAMPP password

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ensure required schema columns exist for current API expectations.
    $conn->exec("ALTER TABLE hostels ADD COLUMN IF NOT EXISTS manager_id VARCHAR(50) DEFAULT NULL");
    $conn->exec("ALTER TABLE hostels ADD COLUMN IF NOT EXISTS subaccount_code VARCHAR(100) DEFAULT NULL");
    $conn->exec("ALTER TABLE hostels ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100) DEFAULT NULL");
    $conn->exec("ALTER TABLE hostels ADD COLUMN IF NOT EXISTS account_number VARCHAR(100) DEFAULT NULL");
    $conn->exec("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS gender ENUM('male','female','unisex') DEFAULT 'unisex'");
    $conn->exec("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at timestamp NOT NULL DEFAULT current_timestamp()");
}
catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// NOTE To User: Replace with your live secret key in a secure environment variable.
define('PAYSTACK_SECRET_KEY', 'YOUR_PAYSTACK_SECRET_KEY');
?>