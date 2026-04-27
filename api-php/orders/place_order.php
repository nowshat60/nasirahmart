<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// ডাটাবেস কনফিগ
$host = "localhost";
$db_name = "nasirahmart_db";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage(),
        "line" => $e->getLine(),
        "file" => $e->getFile()
    ]);
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->cart_items)) {
    try {
        $conn->beginTransaction();

        // ১. orders টেবিলে ইনসার্ট (আপনার ডিজাইন অনুযায়ী কলাম নাম)
        $query = "INSERT INTO orders (
    customer_id,
    customer_name,
    items,
    subtotal,
    tax,
    total,
    payment_method,
    order_status,
    created_at
)
VALUES (
    :customer_id,
    :customer_name,
    :items,
    :subtotal,
    :tax,
    :total,
    :payment_method,
    'Pending',
    NOW()
)";
        
        $stmt = $conn->prepare($query);

$stmt->bindValue(':customer_id', $data->customer_id ?? 0);
$stmt->bindValue(':customer_name', $data->customer_name ?? 'Guest');
$stmt->bindValue(':items', json_encode($data->cart_items));
$stmt->bindValue(':subtotal', $data->subtotal ?? 0);
$stmt->bindValue(':tax', $data->tax ?? 0);
$stmt->bindValue(':total', $data->total_amount ?? 0);
$stmt->bindValue(':payment_method', $data->payment_method ?? 'Cash');

$stmt->execute();

$order_id = $conn->lastInsertId();

        // ২. order_items টেবিলে বিস্তারিত ইনসার্ট
        $item_query = "INSERT INTO order_items
(order_id, product_id, quantity, unit_price, tax_amount, subtotal)
VALUES
(:order_id, :p_id, :qty, :price, :tax, :subtotal)";
        $item_stmt = $conn->prepare($item_query);

        foreach ($data->cart_items as $item) {
    $item_stmt->bindValue(':order_id', $order_id);
    $item_stmt->bindValue(':p_id', $item->id);
    $item_stmt->bindValue(':qty', $item->quantity);
    $item_stmt->bindValue(':price', $item->price);
    $item_stmt->bindValue(':tax', 0);
    $item_stmt->bindValue(
        ':subtotal',
        $item->price * $item->quantity
    );

    $item_stmt->execute();
}

        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Order placed!", "order_id" => $order_id]);

    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Cart is empty"]);
}
?>