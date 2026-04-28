<?php
require 'config.php';

$stmt = $conn->query("SELECT id, name, email, role FROM users WHERE role = 'admin'");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
