<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../db_config.php';

$userId = isset($_GET['userId']) ? intval($_GET['userId']) : 0;

$query = "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $userId);
$stmt->execute();

$result = $stmt->get_result();

$orders = [];

while ($row = $result->fetch_assoc()) {
    $orders[] = [
        "id" => (int)$row['id'],
        "createdAt" => $row['created_at'],
        "totalAmount" => (float)$row['total'],
        "status" => strtolower($row['order_status']),
        "paymentMethod" => $row['payment_method'],
        "items" => json_decode($row['items'], true) ?? []
    ];
}

echo json_encode($orders);
?>