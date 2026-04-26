<?php
// /api-php/orders/get_orders.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$query = "SELECT o.*, u.firstName, u.lastName, u.email 
          FROM orders o 
          JOIN users u ON o.user_id = u.id 
          ORDER BY o.created_at DESC";
$result = $conn->query($query);

if($result->num_rows > 0){
    $orders_arr = array();
    while($row = $result->fetch_assoc()){
        $orders_arr[] = array(
            "id" => (int)$row['id'],
            "user_name" => $row['firstName'] . ' ' . $row['lastName'],
            "email" => $row['email'],
            "total_amount" => (float)$row['total_amount'],
            "status" => $row['status'],
            "payment_method" => $row['payment_method'],
            "payment_status" => $row['payment_status'],
            "created_at" => $row['created_at'],
            "address" => $row['address'],
            "city" => $row['city'],
            "phone" => $row['phone']
        );
    }
    http_response_code(200);
    echo json_encode($orders_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No orders found."));
}
?>
