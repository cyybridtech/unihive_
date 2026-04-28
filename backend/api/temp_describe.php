<?php
require 'config.php';

echo "UNIVERSITIES_TABLE:\n";
$stmt = $conn->query("DESCRIBE universities");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "ROOMS_TABLE:\n";
$stmt = $conn->query("DESCRIBE rooms");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
