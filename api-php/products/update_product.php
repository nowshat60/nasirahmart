<?php
// /api-php/products/update_product.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../db_config.php';

$data = get_input_data();

if(!empty($data->id) && !empty($data->item_name)){
    $id = (int)$data->id;
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

    $query = "UPDATE items SET 
              item_name = '$item_name', 
              sku = '$sku', 
              category = '$category', 
              price = $price, 
              cutprice = $cutprice, 
              cost_price = $cost_price, 
              quantity = $quantity, 
              min_stock_level = $min_stock_level, 
              image = '$image', 
              star = $star, 
              discount_percentage = $discount_percentage 
              WHERE id = $id";

    if($conn->query($query)){
        http_response_code(200);
        echo json_encode(array("message" => "Product updated successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to update product. " . $conn->error));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
