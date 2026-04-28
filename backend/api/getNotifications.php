<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require 'config.php';

$user_id = $_SESSION['user_id'] ?? ($_GET['user_id'] ?? null);
if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}
$user_id = (int)$user_id;

try {
    $stmt = $conn->prepare("
        SELECT id, user_id, title, message, type, read_status, notification_date
        FROM notifications
        WHERE user_id = ?
        ORDER BY id DESC
    ");
    $stmt->execute([$user_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $notifications = array_map(function($n) {
        return [
            'id'     => 'db_' . $n['id'],
            'userId' => (string)$n['user_id'],
            'title'  => $n['title'],
            'message'=> $n['message'],
            'type'   => $n['type'] ?? 'info',
            'read'   => (bool)$n['read_status'],
            'date'   => $n['notification_date'],
            'db_id'  => (int)$n['id'],
        ];
    }, $rows);

    echo json_encode(['status' => 'success', 'notifications' => $notifications]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
