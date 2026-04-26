<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'db_config.php';
include_once 'jwt_helper.php';

$data = get_input_data();

// Check for JWT token in headers
$headers = getallheaders();
$jwt = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

if(!$jwt){
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Token missing."));
    exit();
}

try {
    $decoded = JwtHelper::decode($jwt, $key);
    if (!$decoded) throw new Exception("Invalid token");
    $userId = $decoded->data->id;

    if(!empty($data->items) && !empty($data->shippingDetails)){
        // Start transaction
        $conn->begin_transaction();

        try {
            // 0. Stock Verification
            foreach($data->items as $item){
                $stock_query = "SELECT quantity FROM items WHERE id = ?";
                $stmt_stock = $conn->prepare($stock_query);
                $stmt_stock->bind_param("i", $item->id);
                $stmt_stock->execute();
                $stock_result = $stmt_stock->get_result();
                if($row = $stock_result->fetch_assoc()){
                    if($row['quantity'] < $item->quantity){
                        throw new Exception("Insufficient stock for item: " . $item->item_name);
                    }
                } else {
                    throw new Exception("Item not found: " . $item->item_name);
                }
            }

            // 1. Create Order
            $order_query = "INSERT INTO orders (user_id, total_amount, subtotal, tax, shipping_cost, discount, address, billing_address, city, phone, zip_code, payment_method, payment_status, transaction_id, status, created_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())";
            $stmt = $conn->prepare($order_query);
            $discount = isset($data->discount) ? $data->discount : 0;
            $billing_address = isset($data->billingDetails->address) ? $data->billingDetails->address : $data->shippingDetails->address;
            $payment_method = isset($data->paymentMethod) ? $data->paymentMethod : 'COD';
            $payment_status = ($payment_method === 'COD') ? 'unpaid' : 'paid';
            $transaction_id = isset($data->transactionId) ? $data->transactionId : null;
            
            $stmt->bind_param("idddddssssssss", 
                $userId, 
                $data->total, 
                $data->subtotal, 
                $data->tax, 
                $data->shipping, 
                $discount,
                $data->shippingDetails->address, 
                $billing_address,
                $data->shippingDetails->city, 
                $data->shippingDetails->phone, 
                $data->shippingDetails->zipCode,
                $payment_method,
                $payment_status,
                $transaction_id
            );
            $stmt->execute();
            $orderId = $conn->insert_id;

            // 2. Create Order Items
            foreach($data->items as $item){
                $item_query = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
                $stmt_item = $conn->prepare($item_query);
                $stmt_item->bind_param("iiid", $orderId, $item->id, $item->quantity, $item->price);
                $stmt_item->execute();
            }

            // 3. Inventory Update (Only if COD or successful gateway payment)
            // The frontend only calls this if bKash/Card is successful, so we update here.
            foreach($data->items as $item){
                $update_query = "UPDATE items SET quantity = quantity - ? WHERE id = ?";
                $stmt_update = $conn->prepare($update_query);
                $stmt_update->bind_param("ii", $item->quantity, $item->id);
                $stmt_update->execute();
            }

            // 4. Post-Order Automated Tasks (Mocked)
            // - Notification: Send Email/SMS
            // - Admin Sync: Handled by DB entry
            // - Invoice Generation: Logic would go here or triggered by event

            // Commit transaction
            $conn->commit();

            http_response_code(201);
            echo json_encode(array(
                "message" => "Order created successfully.",
                "orderId" => "ORD-" . str_pad($orderId, 6, "0", STR_PAD_LEFT),
                "estimatedDelivery" => date('Y-m-d', strtotime('+3 days'))
            ));

        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(array("message" => "Order creation failed: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token."));
}
?>
