<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../db_config.php';
include_once '../finance/accounting_logic.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->supplier_id) && !empty($data->items)) {
    $conn->begin_transaction();
    try {
        // ১. পারচেজ রেকর্ড তৈরি (Purchase Order)
        $total_amount = $data->total_amount;
        $purchase_query = "INSERT INTO purchases (supplier_id, total_amount, purchase_date, status) VALUES (?, ?, ?, 'Completed')";
        $stmt = $conn->prepare($purchase_query);
        $stmt->bind_param("ids", $data->supplier_id, $total_amount, $data->date);
        $stmt->execute();
        $purchase_id = $conn->insert_id;

        // ২. ইনভেন্টরি স্টক আপডেট
        foreach ($data->items as $item) {
            // স্টক বাড়ানো
            $update_stock = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?";
            $st_stmt = $conn->prepare($update_stock);
            $st_stmt->bind_param("ii", $item->qty, $item->product_id);
            $st_stmt->execute();
            
            // পারচেজ আইটেম ডিটেইলস সেভ
            $item_query = "INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)";
            $it_stmt = $conn->prepare($item_query);
            $it_stmt->bind_param("iiid", $purchase_id, $item->product_id, $item->qty, $item->price);
            $it_stmt->execute();
        }

        // ৩. অটো-অ্যাকাউন্টিং এন্ট্রি (Double Entry)
        $accounting = new Accounting($conn);
        $transactions = [
            // Debit: Inventory Account (Asset বাড়ছে)
            ['account_id' => 3, 'debit' => $total_amount, 'credit' => 0], 
            // Credit: Cash/Bank Account (Asset কমছে)
            ['account_id' => 1, 'debit' => 0, 'credit' => $total_amount] 
        ];

        $accounting->createEntry(
            $data->date, 
            "Stock Purchase - PO#$purchase_id", 
            'PURCHASE', 
            $purchase_id, 
            $transactions
        );

        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Purchase recorded and ledger updated", "purchase_id" => $purchase_id]);

    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data"]);
}
?>