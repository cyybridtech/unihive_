<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'config.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Admin only']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name']) || !isset($data['university_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

$bank_code = $data['bank_code'] ?? '';
$account_number = $data['account_number'] ?? '';
$subaccount_code = null;
$paystack_data = ['success' => false, 'message' => 'No bank details provided'];

if ($bank_code && $account_number) {
    $curl = curl_init();
    $sub_data = json_encode([
        'business_name' => $data['name'],
        'settlement_bank' => $bank_code,
        'account_number' => $account_number,
        'percentage_charge' => 5 // Main account keeps 5%
    ]);
    
    curl_setopt_array($curl, array(
      CURLOPT_URL => "https://api.paystack.co/subaccount",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_POSTFIELDS => $sub_data,
      CURLOPT_HTTPHEADER => array(
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Content-Type: application/json"
      ),
    ));
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    if (!$err) {
        $resObj = json_decode($response, true);
        if (isset($resObj['status']) && $resObj['status'] === true) {
            $subaccount_code = $resObj['data']['subaccount_code'];
        }
    }
}

$manager_id = null;
if (!empty($data['manager_full_name']) && !empty($data['manager_email']) && !empty($data['manager_password'])) {
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute(['email' => $data['manager_email']]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($existing) {
        echo json_encode(['status' => 'error', 'message' => 'Manager email already exists']);
        exit;
    }

    $managerPassword = password_hash($data['manager_password'], PASSWORD_DEFAULT);
    $managerReferral = 'MANAGER-' . strtoupper(substr($data['manager_email'], 0, 3)) . rand(100, 999);

    $userStmt = $conn->prepare("INSERT INTO users (full_name, email, phone, university_id, password, role, gender, credits, referral_code, created_at) VALUES (?, ?, ?, ?, ?, 'manager', ?, 0, ?, NOW())");
    $userSuccess = $userStmt->execute([
        $data['manager_full_name'],
        $data['manager_email'],
        $data['manager_phone'] ?? null,
        $data['university_id'] ?? null,
        $managerPassword,
        $data['manager_gender'] ?? 'male',
        $managerReferral
    ]);

    if ($userSuccess) {
        $manager_id = $conn->lastInsertId();
    }
}

$id = 'h' . time() . rand(100, 999);
$stmt = $conn->prepare("
    INSERT INTO hostels (id, name, university_id, address, description, distance_from_campus, price_range, main_image, verified, manager_id, subaccount_code, bank_name, account_number) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
");

$success = $stmt->execute([
    $id,
    $data['name'],
    $data['university_id'],
    $data['address'] ?? '',
    $data['description'] ?? '',
    $data['distance_from_campus'] ?? '1.0km',
    $data['price_range'] ?? 'GH₵1000-2000',
    $data['main_image'] ?? 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    $manager_id,
    $subaccount_code,
    $bank_code,
    $account_number
]);

if ($success) {
echo json_encode([
  'status' => 'success', 
  'id' => $id,
  'manager_id' => $manager_id,
  'paystack' => $paystack_data,
  'subaccount_code' => $subaccount_code
]);
} else {
    echo json_encode([
      'status' => 'error', 
      'message' => 'DB insert failed',
      'paystack' => $paystack_data
    ]);
}
?>

