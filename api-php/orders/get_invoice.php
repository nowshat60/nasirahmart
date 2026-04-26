<?php
// /api-php/orders/get_invoice.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$orderId = isset($_GET['id']) ? $_GET['id'] : null;

if($orderId){
    $query = "SELECT o.*, u.firstName, u.lastName, u.email 
              FROM orders o 
              JOIN users u ON o.user_id = u.id 
              WHERE o.id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $orderId);
    $stmt->execute();
    $result = $stmt->get_result();

    if($row = $result->fetch_assoc()){
        // Fetch items
        $itemsQuery = "SELECT oi.*, i.item_name 
                       FROM order_items oi 
                       JOIN items i ON oi.product_id = i.id 
                       WHERE oi.order_id = ?";
        $stmt_items = $conn->prepare($itemsQuery);
        $stmt_items->bind_param("i", $orderId);
        $stmt_items->execute();
        $itemsResult = $stmt_items->get_result();
        
        $items = array();
        while($itemRow = $itemsResult->fetch_assoc()){
            $items[] = $itemRow;
        }

        $row['items'] = $items;
        
        echo json_encode($row);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Order not found."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Order ID required."));
}
?>
