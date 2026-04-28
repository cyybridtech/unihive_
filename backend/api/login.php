
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

$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($email) || empty($password)) {
    echo json_encode(['status'=>'error','message'=>'Invalid credentials']);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM users WHERE email = :email");
$stmt->execute(['email'=>$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if($user && password_verify($password, $user['password'])){
    $role = $user['role'] ?? '';

    if (empty($role)) {
        $hostelCheck = $conn->prepare("SELECT COUNT(*) as count FROM hostels WHERE manager_id = :user_id");
        $hostelCheck->execute(['user_id' => $user['id']]);
        $hostelRow = $hostelCheck->fetch(PDO::FETCH_ASSOC);
        if ($hostelRow && intval($hostelRow['count']) > 0) {
            $role = 'manager';
        }
    }

    if (empty($role)) {
        $role = 'student';
    }

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $role;
    echo json_encode([
        'status'=>'success',
        'message'=>'Login successful',
        'user'=>[
            'id'=>$user['id'],
            'full_name'=>$user['full_name'],
            'email'=>$user['email'],
            'phone'=>$user['phone'] ?? '',
            'university_id'=>$user['university_id'],
            'role'=>$role,
            'gender'=>$user['gender'] ?? 'male',
            'avatar'=>$user['avatar'] ?? '',
            'credits'=>$user['credits'] ?? 0,
            'referral_code'=>$user['referral_code'] ?? '',
            'created_at'=>$user['created_at'] ?? ''
        ]
    ]);
}else{
    echo json_encode(['status'=>'error','message'=>'Invalid credentials']);
}
?>