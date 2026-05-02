<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// OPTIONS রিকোয়েস্ট হ্যান্ডেল করা (CORS এর জন্য জরুরি)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include_once '../db_config.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true); // true দিলে এটি Array হিসেবে আসবে

// Array ফরম্যাটে চেক করা হচ্ছে
$id = isset($data['id']) ? $data['id'] : null;
$status = isset($data['status']) ? $data['status'] : null;

if(!empty($id) && !empty($status)){
    // কলামের নাম 'order_status' ই আছে কি না তা ডাটাবেসে একবার চেক করে নিন
    $sql = "UPDATE orders SET order_status = ? WHERE id = ?"; 
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $status, $id);
    
    if($stmt->execute()){
        echo json_encode(["success" => true, "message" => "Order $status successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Database Error: " . $conn->error]);
    }
} else {
    // এখানে এররটি কেন হচ্ছে তা পরিষ্কার বোঝা যাবে
    echo json_encode([
        "success" => false, 
        "message" => "Incomplete Data",
        "received_id" => $id,
        "received_status" => $status,
        "raw_json_error" => json_last_error_msg()
    ]);
}
?>