<?php
// /api-php/inventory/adjust_stock.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../db_config.php';

$data = get_input_data();

if(!empty($data->product_id) && isset($data->quantity)){
    $conn->begin_transaction();
    try {
        $op = ($data->type === 'add') ? '+' : '-';
        $query = "UPDATE items SET quantity = quantity $op ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $data->quantity, $data->product_id);
        $stmt->execute();

        // Log adjustment if needed (optional)
        
        $conn->commit();
        http_response_code(200);
        echo json_encode(array("message" => "Stock adjusted successfully."));
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(array("message" => "Adjustment failed: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
