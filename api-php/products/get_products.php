<?php
// /api-php/products/get_products.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$query = "SELECT i.*, c.category_name 
          FROM items i 
          LEFT JOIN categories c ON i.category = c.id 
          ORDER BY i.id DESC";
$result = $conn->query($query);

if($result->num_rows > 0){
    $products_arr = array();
    while($row = $result->fetch_assoc()){
        $row['price'] = (float)$row['price'];
        $row['cutprice'] = (float)$row['cutprice'];
        $row['cost_price'] = (float)$row['cost_price'];
        $row['quantity'] = (int)$row['quantity'];
        $products_arr[] = $row;
    }
    http_response_code(200);
    echo json_encode($products_arr);
} else {
    http_response_code(200);
    echo json_encode(array());
}
?>
