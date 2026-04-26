<?php
// /api-php/categories/delete_category.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../db_config.php';

$data = get_input_data();

if(!empty($data->id)){
    $id = (int)$data->id;

    $query = "DELETE FROM categories WHERE id = $id";

    if($conn->query($query)){
        http_response_code(200);
        echo json_encode(array("message" => "Category deleted successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to delete category. " . $conn->error));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
