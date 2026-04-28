<?php
require 'config.php';
session_destroy();
echo json_encode(['status'=>'success','message'=>'Logged out']);
?>