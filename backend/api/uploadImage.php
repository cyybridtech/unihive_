<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$target_dir = "../uploads/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if (!isset($_FILES["image"])) {
    echo json_encode(["status" => "error", "message" => "No file uploaded"]);
    exit;
}

$file = $_FILES["image"];
$target_file = $target_dir . time() . '_' . basename($file["name"]);

$check = getimagesize($file["tmp_name"]);
if ($check === false) {
    echo json_encode(["status" => "error", "message" => "File is not an image"]);
    exit;
}

if (move_uploaded_file($file["tmp_name"], $target_file)) {
    echo json_encode(["status" => "success", "url" => "/backend/uploads/" . basename($target_file)]);
} else {
    echo json_encode(["status" => "error", "message" => "Error uploading file"]);
}
?>
