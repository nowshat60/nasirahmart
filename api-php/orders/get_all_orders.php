<?php
/**
 * get_all_orders.php
 * ✅ STANDARDIZED: Returns consistent field names (snake_case)
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../db_config.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
// ✅ Standardized query with consistent aliases
$query = "
    SELECT 
        o.id,
        o.customer_name,
        o.customer_id,
        o.subtotal,
        o.tax,
        0 AS shipping_fee,
        o.total AS total_amount,
        o.order_status AS status,
        o.created_at,
        o.payment_method,
        o.items,
        u.email AS user_email,
'' AS user_phone,
'' AS user_address
    FROM orders o
    LEFT JOIN users u ON o.customer_id = u.id
    ORDER BY o.created_at DESC
";

$result = $conn->query($query);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit;
}

$orders = [];

while ($row = $result->fetch_assoc()) {
    // Parse items JSON
    $items = $row['items'];
    if (is_string($items)) {
        $decoded = json_decode($items, true);
        $items = is_array($decoded) ? $decoded : [];
    } elseif (!is_array($items)) {
        $items = [];
    }

    // ✅ Enrich items with product names
    $itemDetails = [];
    foreach ($items as $item) {
        $pid = isset($item['id']) ? intval($item['id']) : 0;
        $itemName = $item['name'] ?? "Product #$pid";
        
        $itemDetails[] = [
            "id" => $pid,
            "name" => $itemName,
            "quantity" => $item['quantity'] ?? 1,
            "price" => floatval($item['price'] ?? 0),
            "subtotal" => floatval(($item['price'] ?? 0) * ($item['quantity'] ?? 1))
        ];
    }

    // ✅ Standardized response format
    $orders[] = [
        "id" => (int)$row['id'],
        "order_number" => "ORD-" . str_pad($row['id'], 6, '0', STR_PAD_LEFT),
        "customer_name" => $row['customer_name'],
        "customer_id" => (int)$row['customer_id'],
        "customer_email" => $row['user_email'] ?? '',
        "customer_phone" => $row['user_phone'] ?? '',
        "customer_address" => $row['user_address'] ?? 'Dhaka, Bangladesh',
        "subtotal" => (float)$row['subtotal'],
        "tax" => (float)$row['tax'],
        "shipping_fee" => (float)($row['shipping_fee'] ?? 0),
        "total_amount" => (float)$row['total_amount'],    // ✅ Standardized
        "status" => $row['status'],
        "payment_method" => $row['payment_method'],
        "created_at" => $row['created_at'],
        "items" => $itemDetails,
        "tracking_number" => "NM-TRK-" . str_pad($row['id'], 6, '0', STR_PAD_LEFT)
    ];
}

echo json_encode($orders);
?>