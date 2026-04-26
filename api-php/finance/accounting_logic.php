<?php
// /api-php/finance/accounting_logic.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

class Accounting {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Pro-level Journal Entry with Voucher Generation
   // Existing class er bhetor createEntry function ta modify koro
public function createEntry($date, $description, $refType, $refId, $transactions) {
    $this->conn->begin_transaction();
    try {
        // Voucher Number Generation logic
        $vQuery = "SELECT COUNT(id) as total FROM journal_entries WHERE YEAR(entry_date) = YEAR(?)";
        $vStmt = $this->conn->prepare($vQuery);
        $vStmt->bind_param("s", $date);
        $vStmt->execute();
        $result = $vStmt->get_result()->fetch_assoc();
        $vNo = "JV-" . date('Y', strtotime($date)) . "-" . str_pad($result['total'] + 1, 4, '0', STR_PAD_LEFT);

        // Insert Master Entry
        $query = "INSERT INTO journal_entries (voucher_no, entry_date, description, reference_type, reference_id) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ssssi", $vNo, $date, $description, $refType, $refId);
        $stmt->execute();
        $entryId = $this->conn->insert_id;

        // Insert Transactions and Update Account Balances
        foreach ($transactions as $tx) {
            $txQuery = "INSERT INTO transactions (journal_entry_id, account_id, debit, credit) VALUES (?, ?, ?, ?)";
            $txStmt = $this->conn->prepare($txQuery);
            $txStmt->bind_param("iidd", $entryId, $tx['account_id'], $tx['debit'], $tx['credit']);
            $txStmt->execute();

            // Real-time Balance Update (Essential for Trial Balance)
            $updateAcc = "UPDATE accounts SET balance = balance + ? - ? WHERE id = ?";
            $upStmt = $this->conn->prepare($updateAcc);
            $upStmt->bind_param("ddi", $tx['debit'], $tx['credit'], $tx['account_id']);
            $upStmt->execute();
        }

        $this->conn->commit();
        return ["status" => "success", "voucher_no" => $vNo, "id" => $entryId];
    } catch (Exception $e) {
        $this->conn->rollback();
        throw $e;
    }
}
}
?>