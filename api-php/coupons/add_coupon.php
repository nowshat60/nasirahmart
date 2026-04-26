<?php
// /api-php/coupons/add_coupon.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../db_config.php';

$data = get_input_data();

if(!empty($data->code) && !empty($data->discount)){
    $query = "INSERT INTO coupons (code, discount, type, expiry, status) VALUES (?, ?, ?, ?, 'active')";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sdss", $data->code, $data->discount, $data->type, $data->expiry);
    
    if($stmt->execute()){
        $newId = $conn->insert_id;
        http_response_code(201);
        echo json_encode(array(
            "message" => "Coupon created successfully.",
            "coupon" => array(
                "id" => $newId,
                "code" => $data->code,
                "discount" => $data->discount,
                "type" => $data->type,
                "expiry" => $data->expiry,
                "status" => "active"
            )
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to create coupon. " . $conn->error));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
