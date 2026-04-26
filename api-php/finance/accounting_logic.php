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

    /**
     * Create a Journal Entry with Transactions (Double-Entry)
     */
    public function createEntry($date, $description, $refType, $refId, $transactions) {
        $this->conn->begin_transaction();
        try {
            // 1. Insert Journal Entry
            $query = "INSERT INTO journal_entries (entry_date, description, reference_type, reference_id) VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("sssi", $date, $description, $refType, $refId);
            $stmt->execute();
            $entryId = $this->conn->insert_id;

            // 2. Insert Transactions (Debits and Credits)
            $totalDebit = 0;
            $totalCredit = 0;

            foreach ($transactions as $tx) {
                $txQuery = "INSERT INTO transactions (journal_entry_id, account_id, debit, credit) VALUES (?, ?, ?, ?)";
                $txStmt = $this->conn->prepare($txQuery);
                $txStmt->bind_param("iidd", $entryId, $tx['account_id'], $tx['debit'], $tx['credit']);
                $txStmt->execute();

                // Update Account Balance
                $balanceUpdate = ($tx['debit'] > 0) ? "balance = balance + ?" : "balance = balance - ?";
                $balanceAmount = ($tx['debit'] > 0) ? $tx['debit'] : $tx['credit'];
                
                // Note: Balance logic depends on account type (Asset/Expense: Debit+, Liability/Equity/Revenue: Credit+)
                // For simplicity, we just store raw balance and handle logic in reports
                $accUpdate = "UPDATE accounts SET balance = balance + (? - ?) WHERE id = ?";
                $accStmt = $this->conn->prepare($accUpdate);
                $accStmt->bind_param("ddi", $tx['debit'], $tx['credit'], $tx['account_id']);
                $accStmt->execute();

                $totalDebit += $tx['debit'];
                $totalCredit += $tx['credit'];
            }

            // 3. Verify Trial Balance (Debits == Credits)
            if (abs($totalDebit - $totalCredit) > 0.001) {
                throw new Exception("Trial balance mismatch: Debits ($totalDebit) != Credits ($totalCredit)");
            }

            $this->conn->commit();
            return $entryId;
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    /**
     * Automated Journal Entry for a Sale
     */
    public function recordSale($orderId, $total, $costOfGoods, $paymentMethod) {
        // Accounts (Assuming IDs from schema insert)
        $cashAcc = 2; // Cash
        $arAcc = 3;   // Accounts Receivable
        $inventoryAcc = 4; // Inventory
        $revenueAcc = 9;   // Sales Revenue
        $cogsAcc = 11;     // COGS

        $debitAcc = ($paymentMethod === 'COD') ? $arAcc : $cashAcc;

        $transactions = [
            // Revenue Entry
            ['account_id' => $debitAcc, 'debit' => $total, 'credit' => 0],
            ['account_id' => $revenueAcc, 'debit' => 0, 'credit' => $total],
            // Inventory/COGS Entry
            ['account_id' => $cogsAcc, 'debit' => $costOfGoods, 'credit' => 0],
            ['account_id' => $inventoryAcc, 'debit' => 0, 'credit' => $costOfGoods]
        ];

        return $this->createEntry(date('Y-m-d'), "Sale recorded for Order #$orderId", 'Order', $orderId, $transactions);
    }
}
?>
