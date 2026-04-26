<?php
// /api-php/get_summery.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'db_config.php';

$summary = array();

// 1. Total Sales (Revenue)
$salesQuery = "SELECT SUM(total_amount) as total_sales FROM orders WHERE status != 'cancelled'";
$salesResult = $conn->query($salesQuery);
$summary['total_sales'] = (float)$salesResult->fetch_assoc()['total_sales'];

// 2. Total Orders
$ordersQuery = "SELECT COUNT(id) as total_orders FROM orders";
$ordersResult = $conn->query($ordersQuery);
$summary['total_orders'] = (int)$ordersResult->fetch_assoc()['total_orders'];

// 3. Total Customers
$customersQuery = "SELECT COUNT(id) as total_customers FROM users WHERE role = 'user'";
$customersResult = $conn->query($customersQuery);
$summary['total_customers'] = (int)$customersResult->fetch_assoc()['total_customers'];

// 4. Inventory Value (Asset)
$inventoryQuery = "SELECT SUM(price * quantity) as inventory_value FROM items";
$inventoryResult = $conn->query($inventoryQuery);
$summary['inventory_value'] = (float)$inventoryResult->fetch_assoc()['inventory_value'];

// 5. Low Stock Count
$lowStockQuery = "SELECT COUNT(id) as low_stock FROM items WHERE quantity <= min_stock_level";
$lowStockResult = $conn->query($lowStockQuery);
$summary['low_stock_count'] = (int)$lowStockResult->fetch_assoc()['low_stock'];

// 6. Monthly Sales Trend (Last 6 Months)
$trendQuery = "SELECT DATE_FORMAT(created_at, '%b') as month, SUM(total_amount) as sales 
               FROM orders 
               WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
               GROUP BY month 
               ORDER BY created_at ASC";
$trendResult = $conn->query($trendQuery);
$summary['sales_trend'] = array();
while($row = $trendResult->fetch_assoc()){
    $summary['sales_trend'][] = $row;
}

http_response_code(200);
echo json_encode($summary);
?>
