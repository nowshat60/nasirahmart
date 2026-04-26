<?php
// /api-php/categories/add_category.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../db_config.php';

$data = get_input_data();

if(!empty($data->category_name)){
    $category_name = $conn->real_escape_string($data->category_name);
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $category_name)));
    $status = !empty($data->status) ? $conn->real_escape_string($data->status) : 'active';

    $query = "INSERT INTO categories (category_name, slug, status) VALUES ('$category_name', '$slug', '$status')";

    if($conn->query($query)){
        http_response_code(201);
        echo json_encode(array("message" => "Category created successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to create category. " . $conn->error));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
