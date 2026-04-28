<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

include_once '../db_config.php';

$data   = json_decode(file_get_contents("php://input"), true);
$id     = isset($data['id'])     ? intval($data['id'])            : null;
$status = isset($data['status']) ? strtolower(trim($data['status'])) : null;

// ✅ FIX 1: Valid status whitelist — যেকোনো random value আসতে পারবে না
$validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

if (empty($id) || empty($status)) {
    echo json_encode([
        "success" => false,
        "message" => "Incomplete data",
        "received" => ["id" => $id, "status" => $status]
    ]);
    exit;
}

if (!in_array($status, $validStatuses)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid status: $status"
    ]);
    exit;
}

// ✅ FIX 2: Current status check — backward flow রোধ করা
$checkStmt = $conn->prepare("SELECT order_status FROM orders WHERE id = ?");
$checkStmt->bind_param("i", $id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Order not found"]);
    exit;
}

$currentRow    = $checkResult->fetch_assoc();
$currentStatus = strtolower($currentRow['order_status']);

// ✅ FIX 3: Delivered order আর পরিবর্তন করা যাবে না
if ($currentStatus === 'delivered' && $status !== 'delivered') {
    echo json_encode([
        "success" => false,
        "message" => "Delivered orders cannot be changed"
    ]);
    exit;
}

// Cancelled order কে uncancel করা যাবে না
if ($currentStatus === 'cancelled' && $status !== 'cancelled') {
    echo json_encode([
        "success" => false,
        "message" => "Cancelled orders cannot be reactivated"
    ]);
    exit;
}

$sql  = "UPDATE orders SET order_status = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    // ✅ FIX 4: Updated order data ফেরত পাঠানো হচ্ছে — frontend re-fetch ছাড়াই update করতে পারবে
    echo json_encode([
        "success"    => true,
        "message"    => "Order #$id marked as $status",
        "order_id"   => $id,
        "new_status" => $status
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $conn->error
    ]);
}
?>