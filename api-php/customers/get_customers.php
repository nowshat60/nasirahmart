<?php
// /api-php/customers/get_customers.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$query = "SELECT u.id, u.firstName, u.lastName, u.email, u.created_at,
          (SELECT COUNT(id) FROM orders WHERE user_id = u.id) as total_orders,
          (SELECT SUM(total_amount) FROM orders WHERE user_id = u.id) as ltv
          FROM users u 
          WHERE u.role = 'user'
          ORDER BY ltv DESC";
$result = $conn->query($query);

if($result->num_rows > 0){
    $customers_arr = array();
    while($row = $result->fetch_assoc()){
        $customers_arr[] = array(
            "id" => (int)$row['id'],
            "name" => $row['firstName'] . ' ' . $row['lastName'],
            "email" => $row['email'],
            "joined_at" => $row['created_at'],
            "total_orders" => (int)$row['total_orders'],
            "ltv" => (float)$row['ltv']
        );
    }
    http_response_code(200);
    echo json_encode($customers_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No customers found."));
}
?>
