<?php
// /api-php/users/get_users.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$query = "SELECT id, firstName, lastName, email, role, created_at FROM users ORDER BY created_at DESC";
$result = $conn->query($query);

$users = array();
if($result && $result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $users[] = $row;
    }
}

echo json_encode($users);
?>
