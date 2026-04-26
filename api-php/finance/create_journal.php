<?php
// /api-php/finance/create_journal.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../db_config.php';
include_once './accounting_logic.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->date) && !empty($data->items)) {
    $accounting = new Accounting($conn);
    
    // Convert JSON items to array format for the logic class
    $transactions = [];
    foreach ($data->items as $item) {
        if ($item->account_id && ($item->debit > 0 || $item->credit > 0)) {
            $transactions[] = [
                'account_id' => $item->account_id,
                'debit' => $item->debit,
                'credit' => $item->credit
            ];
        }
    }

    try {
        $result = $accounting->createEntry(
            $data->date,
            $data->description,
            'JOURNAL', // Reference Type
            0,         // Reference ID
            $transactions
        );
        
        http_response_code(200);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Incomplete data"]);
}
?>