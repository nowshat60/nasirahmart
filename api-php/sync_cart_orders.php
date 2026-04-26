<?php
// /api-php/sync_cart_orders.php
// Sync cart count and latest order status for a user

header("Content-Type: application/json");
include_once 'db_config.php';

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$user_id) {
    echo json_encode(["error" => "User ID is required"]);
    exit;
}

try {
    // Fetch latest order
    $stmt = $pdo->prepare("SELECT id, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$user_id]);
    $latestOrder = $stmt->fetch(PDO::FETCH_ASSOC);

    // Mock cart count (if server-side cart is implemented, fetch from database)
    $cartCount = 0; 

    echo json_encode([
        "cartCount" => $cartCount,
        "latestOrder" => $latestOrder ? [
            "id" => $latestOrder['id'],
            "status" => ucfirst($latestOrder['status']),
            "date" => $latestOrder['created_at']
        ] : null
    ]);

} catch (PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
