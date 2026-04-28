<?php
require 'config.php';
if(isset($_SESSION['user_id'])){
    $stmt = $conn->prepare("SELECT id, full_name, email, role, avatar, credits FROM users WHERE id = :id");
    $stmt->execute(['id'=>$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['status'=>'success','user'=>$user]);
}else{
    echo json_encode(['status'=>'error','message'=>'Not logged in']);
}
?>