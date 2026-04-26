<?php
// /api-php/categories/update_category.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../db_config.php';

$data = get_input_data();

if(!empty($data->id) && !empty($data->category_name)){
    $id = (int)$data->id;
    $category_name = $conn->real_escape_string($data->category_name);
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $category_name)));
    $status = !empty($data->status) ? $conn->real_escape_string($data->status) : 'active';

    $query = "UPDATE categories SET category_name = '$category_name', slug = '$slug', status = '$status' WHERE id = $id";

    if($conn->query($query)){
        http_response_code(200);
        echo json_encode(array("message" => "Category updated successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to update category. " . $conn->error));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
