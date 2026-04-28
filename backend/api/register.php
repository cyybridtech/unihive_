<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['full_name']) ||
    !isset($data['email']) ||
    !isset($data['password'])
) {
    echo json_encode([
        'status' => 'error',
        'message' => 'All fields are required'
    ]);
    exit;
}

$full_name = trim($data['full_name']);
$email = trim($data['email']);
$password = trim($data['password']);
$phone = $data['phone'] ?? NULL;
$university_id = $data['universityId'] ?? NULL;
$role = $data['role'] ?? 'student';
$gender = $data['gender'] ?? 'male';

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Check if user already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
$stmt->execute(['email' => $email]);

if ($stmt->fetch(PDO::FETCH_ASSOC)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Email already exists'
    ]);
    exit;
}

// Generate referral code
$referral_code = 'REF-' . strtoupper(substr($email, 0, 3)) . rand(100, 999);

// Insert user
$stmt = $conn->prepare("
    INSERT INTO users (full_name, email, phone, university_id, password, role, gender, credits, referral_code, created_at) 
    VALUES (:full_name, :email, :phone, :university_id, :password, :role, :gender, 0, :referral_code, NOW())
");

try {
    $stmt->execute([
        'full_name' => $full_name,
        'email' => $email,
        'phone' => $phone,
        'university_id' => $university_id,
        'password' => $hashedPassword,
        'role' => $role,
        'gender' => $gender,
        'referral_code' => $referral_code
    ]);
    $user_id = $conn->lastInsertId();
    
    // Send welcome email (silent fail OK)
    require_once 'sendEmail.php';
    @sendWelcomeEmail($email, $full_name, $user_id);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Registration successful',
        'user_id' => $user_id
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Registration failed: ' . $e->getMessage()
    ]);
}
?>
