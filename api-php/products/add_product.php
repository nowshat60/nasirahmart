<?php
// /api-php/products/add_product.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../db_config.php';

$data = get_input_data();

if(!empty($data->item_name) && !empty($data->price)){
    $item_name = $conn->real_escape_string($data->item_name);
    $category = !empty($data->category) ? (int)$data->category : 0;
    $price = (float)$data->price;
    $cutprice = !empty($data->cutprice) ? (float)$data->cutprice : 0;
    $cost_price = !empty($data->cost_price) ? (float)$data->cost_price : 0;
    $sku = !empty($data->sku) ? $conn->real_escape_string($data->sku) : '';
    $quantity = !empty($data->quantity) ? (int)$data->quantity : 0;
    $min_stock_level = !empty($data->min_stock_level) ? (int)$data->min_stock_level : 5;
    $image = !empty($data->image) ? $conn->real_escape_string($data->image) : '';
    $star = !empty($data->star) ? (int)$data->star : 5;
    $discount_percentage = !empty($data->discount_percentage) ? (int)$data->discount_percentage : 0;

    $query = "INSERT INTO items (item_name, sku, category, price, cutprice, cost_price, quantity, min_stock_level, image, star, discount_percentage) 
              VALUES ('$item_name', '$sku', '$category', $price, $cutprice, $cost_price, $quantity, $min_stock_level, '$image', $star, $discount_percentage)";

    if($conn->query($query)){
        http_response_code(201);
        echo json_encode(array("message" => "Product created successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to create product. " . $conn->error));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
