<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$account_id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$account_id) {
    echo json_encode(["status" => "error", "message" => "Account ID required"]);
    exit;
}

$query = "SELECT je.entry_date, je.voucher_no, je.description, t.debit, t.credit 
          FROM transactions t 
          JOIN journal_entries je ON t.journal_entry_id = je.id 
          WHERE t.account_id = ? 
          ORDER BY je.entry_date ASC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $account_id);
$stmt->execute();
$result = $stmt->get_result();

$ledger = [];
$running_balance = 0;

while($row = $result->fetch_assoc()) {
    // Running balance calculation based on account type normally happens in frontend, 
    // but we can send raw data here.
    $ledger[] = $row;
}

echo json_encode($ledger);
?>