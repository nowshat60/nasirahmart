<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include_once '../db_config.php';

$query = "SELECT * FROM orders ORDER BY created_at DESC";
$result = $conn->query($query);

$orders = [];

while($row = $result->fetch_assoc()){
    $orders[] = [
        "id" => $row['id'],
        "user_name" => $row['customer_name'],
        "total_amount" => $row['total'],
        "status" => strtolower($row['order_status']),
        "created_at" => $row['created_at'],
        "payment_method" => $row['payment_method']
    ];
}

echo json_encode($orders);
?>