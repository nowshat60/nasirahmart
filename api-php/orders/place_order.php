<?php
/**
 * place_order.php
 * ✅ STANDARDIZED: Expects 'total_amount', saves to DB column 'total'
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$host = "localhost";
$db_name = "nasirahmart_db";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $json = file_get_contents("php://input");
    $data = json_decode($json);

    if (!empty($data->cart_items)) {
        $conn->beginTransaction();

        // ✅ FIX 1: Standardized field mapping
        // Frontend sends: total_amount OR totalAmount
        $totalAmount = $data->total_amount ?? 
                       $data->totalAmount ?? 
                       $data->total ?? 0;
        
        $subtotal = $data->subtotal ?? 
                    $data->subTotal ?? 
                    ($totalAmount - ($data->tax ?? 0) - ($data->shipping_fee ?? 0));
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
) VALUES (
    :customer_id,
    :customer_name,
    :items,
    :subtotal,
    :tax,
    :total,
    :payment_method,
    'pending',
    NOW()
)";
        
        $stmt = $conn->prepare($query);

        $stmt->bindValue(':customer_id', $data->customer_id ?? 0);
        $stmt->bindValue(':customer_name', $data->customer_name ?? 'Guest');
        $stmt->bindValue(':items', json_encode($data->cart_items));
        $stmt->bindValue(':subtotal', $subtotal);
        $stmt->bindValue(':tax', $data->tax ?? 0);
        // ✅ DB column 'total' receives the calculated total_amount
        $stmt->bindValue(':total', $totalAmount);
        $stmt->bindValue(':payment_method', $data->payment_method ?? 'cod');

        $stmt->execute();
        
        $order_id = $conn->lastInsertId();

        // Insert order items
        $item_query = "INSERT INTO order_items 
            (order_id, product_id, quantity, unit_price, tax_amount, subtotal)
            VALUES 
            (:order_id, :p_id, :qty, :price, :tax, :subtotal)";
        
        $item_stmt = $conn->prepare($item_query);

        foreach ($data->cart_items as $item) {
            $item_subtotal = (float)$item->price * (int)$item->quantity;
            $item_stmt->bindValue(':order_id', $order_id);
            $item_stmt->bindValue(':p_id', $item->id ?? $item->product_id);
            $item_stmt->bindValue(':qty', $item->quantity);
            $item_stmt->bindValue(':price', $item->price);
            $item_stmt->bindValue(':tax', 0);
            $item_stmt->bindValue(':subtotal', $item_subtotal);
            $item_stmt->execute();
        }

        $conn->commit();

        echo json_encode([
            "success" => true, 
            "message" => "Order placed successfully!", 
            "order_id" => $order_id,
            "total_amount" => $totalAmount  // ✅ Standardized response
        ]);

    } else {
        echo json_encode([
            "success" => false, 
            "message" => "Cart is empty"
        ]);
    }

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage(),
        "line" => $e->getLine(),
        "file" => $e->getFile()
    ]);
    exit;
}
?>