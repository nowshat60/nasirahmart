<?php
// /api-php/inventory/get_inventory.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$query = "SELECT i.*, w.name as warehouse_name 
          FROM items i 
          LEFT JOIN inventory_stocks ist ON i.id = ist.product_id 
          LEFT JOIN warehouses w ON ist.warehouse_id = w.id 
          ORDER BY i.quantity ASC";
$result = $conn->query($query);

if($result->num_rows > 0){
    $inventory_arr = array();
    while($row = $result->fetch_assoc()){
        $inventory_arr[] = array(
            "id" => (int)$row['id'],
            "item_name" => $row['item_name'],
            "sku" => $row['sku'],
            "image" => $row['image'],
            "quantity" => (int)$row['quantity'],
            "min_stock_level" => (int)$row['min_stock_level'],
            "warehouse_name" => $row['warehouse_name']
        );
    }
    http_response_code(200);
    echo json_encode($inventory_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No inventory found."));
}
$res = $conn->query("SELECT * FROM products ORDER BY stock_quantity ASC");
$items = [];
$stats = ['totalItems' => 0, 'lowStock' => 0, 'totalValue' => 0];

while($row = $res->fetch_assoc()) {
    $items[] = $row;
    $stats['totalItems']++;
    if($row['stock_quantity'] < 10) $stats['lowStock']++;
    $stats['totalValue'] += ($row['stock_quantity'] * $row['price']);
}

echo json_encode(['items' => $items, 'stats' => $stats]);
?>
