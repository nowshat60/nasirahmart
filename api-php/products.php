<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_config.php';

$query = "SELECT * FROM items ORDER BY id DESC";
$result = $conn->query($query);

if($result->num_rows > 0){
    $products_arr = array();
    while($row = $result->fetch_assoc()){
        extract($row);
        $product_item = array(
            "id" => $id,
            "item_name" => $item_name,
            "category" => $category,
            "price" => (float)$price,
            "cutprice" => (float)$cutprice,
            "discount_percentage" => (int)$discount_percentage,
            "image" => $image,
            "star" => (int)$star
        );
        array_push($products_arr, $product_item);
    }
    http_response_code(200);
    echo json_encode($products_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No products found."));
}
?>
