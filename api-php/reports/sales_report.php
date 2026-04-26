<?php
// /api-php/reports/sales_report.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$report = array();

// Total Revenue
$revQuery = "SELECT SUM(total_amount) as total_revenue FROM orders WHERE status != 'cancelled'";
$revResult = $conn->query($revQuery);
$report['total_revenue'] = (float)$revResult->fetch_assoc()['total_revenue'];

// Total Orders
$ordQuery = "SELECT COUNT(id) as total_orders FROM orders";
$ordResult = $conn->query($ordQuery);
$report['total_orders'] = (int)$ordResult->fetch_assoc()['total_orders'];

// Average Order Value
$report['average_order_value'] = $report['total_orders'] > 0 ? $report['total_revenue'] / $report['total_orders'] : 0;

// Top Products
$topQuery = "SELECT i.item_name as name, COUNT(oi.id) as sales 
             FROM order_items oi 
             JOIN items i ON oi.product_id = i.id 
             GROUP BY i.id 
             ORDER BY sales DESC 
             LIMIT 5";
$topResult = $conn->query($topQuery);
$report['top_products'] = array();
while($row = $topResult->fetch_assoc()){
    $report['top_products'][] = $row;
}

echo json_encode($report);
?>
