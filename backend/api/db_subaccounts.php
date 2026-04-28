<?php
require 'config.php';

try {
    $conn->exec("ALTER TABLE hostels ADD COLUMN subaccount_code VARCHAR(100) NULL");
    echo "Added subaccount_code to hostels.\n";
} catch (Exception $e) { echo $e->getMessage() . "\n"; }

try {
    $conn->exec("ALTER TABLE hostels ADD COLUMN bank_name VARCHAR(100) NULL");
    echo "Added bank_name to hostels.\n";
} catch (Exception $e) { echo $e->getMessage() . "\n"; }

try {
    $conn->exec("ALTER TABLE hostels ADD COLUMN account_number VARCHAR(100) NULL");
    echo "Added account_number to hostels.\n";
} catch (Exception $e) { echo $e->getMessage() . "\n"; }

?>
