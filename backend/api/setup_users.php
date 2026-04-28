<?php
require 'config.php';

echo "Setting up test users...\n";

// Admin user (password: password)
$admin_email = 'admin@unihive.com';
$admin_pass = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
$admin_sql = "INSERT IGNORE INTO users (full_name, email, password, role, phone, referral_code, credits) 
              VALUES ('Admin', :email, :pass, 'admin', '000', 'ADMIN001', 0)";
$stmt = $conn->prepare($admin_sql);
$stmt->execute(['email' => $admin_email, 'pass' => $admin_pass]);
echo "Admin user ready: $admin_email / password\n";

// Student user (password: password)
$student_email = 'student@unihive.com';
$student_pass = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
$student_sql = "INSERT IGNORE INTO users (full_name, email, password, role, phone, referral_code, credits) 
                VALUES ('Test Student', :email, :pass, 'student', '1234567890', 'STUDENT001', 10)";
$stmt = $conn->prepare($student_sql);
$stmt->execute(['email' => $student_email, 'pass' => $student_pass]);
echo "Student user ready: $student_email / password\n";

// Verify
$count = $conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
echo "Total users in DB: $count\n";

$result = $conn->query("SELECT email, role FROM users");
foreach ($result as $row) {
    echo "- {$row['email']} ({$row['role']})\n";
}

echo "\nSetup complete!\n";
echo "Test: http://localhost/unihive/src/index.html (login with test creds)\n";
echo "Curl test: curl -X POST http://localhost/unihive/backend/api/login.php -H 'Content-Type: application/json' -d '{\"email\":\"admin@unihive.com\",\"password\":\"password\"}'\n";
?>

