<?php
// /api-php/orders/update_status.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../db_config.php';

$data = get_input_data();

if(!empty($data->id) && !empty($data->status)){
    $query = "UPDATE orders SET status = ?, courier = ?, tracking_number = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssi", $data->status, $data->courier, $data->tracking_number, $data->id);
    
    if($stmt->execute()){
        http_response_code(200);
        echo json_encode(array("message" => "Order updated successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Update failed: " . $conn->error));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
