<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

// Gelo 6 masher data calculate kora
$performance = [];

for ($i = 5; $i >= 0; $i--) {
    $month = date('Y-m', strtotime("-$i months"));
    $monthName = date('M', strtotime("-$i months"));
    
    // Revenue Calculation
    $revQuery = "SELECT SUM(t.credit - t.debit) as total 
                 FROM transactions t 
                 JOIN accounts a ON t.account_id = a.id 
                 JOIN journal_entries je ON t.journal_entry_id = je.id
                 WHERE a.type = 'Revenue' AND je.entry_date LIKE '$month%'";
    $rev = $conn->query($revQuery)->fetch_assoc()['total'] ?? 0;

    // Expense Calculation
    $expQuery = "SELECT SUM(t.debit - t.credit) as total 
                 FROM transactions t 
                 JOIN accounts a ON t.account_id = a.id 
                 JOIN journal_entries je ON t.journal_entry_id = je.id
                 WHERE a.type = 'Expense' AND je.entry_date LIKE '$month%'";
    $exp = $conn->query($expQuery)->fetch_assoc()['total'] ?? 0;

    $performance[] = [
        "name" => $monthName,
        "revenue" => (float)$rev,
        "expense" => (float)$exp,
        "profit" => (float)($rev - $exp)
    ];
}
$performance = [];
for ($i = 5; $i >= 0; $i--) {
    $month = date('Y-m', strtotime("-$i months"));
    $monthName = date('M', strtotime("-$i months"));
    
    $rev = $conn->query("SELECT SUM(t.credit - t.debit) as total FROM transactions t JOIN accounts a ON t.account_id = a.id JOIN journal_entries je ON t.journal_entry_id = je.id WHERE a.type = 'Revenue' AND je.entry_date LIKE '$month%'")->fetch_assoc()['total'] ?? 0;
    $exp = $conn->query("SELECT SUM(t.debit - t.credit) as total FROM transactions t JOIN accounts a ON t.account_id = a.id JOIN journal_entries je ON t.journal_entry_id = je.id WHERE a.type = 'Expense' AND je.entry_date LIKE '$month%'")->fetch_assoc()['total'] ?? 0;

    $performance[] = ["name" => $monthName, "revenue" => (float)$rev, "expense" => (float)$exp, "profit" => (float)($rev - $exp)];
}
echo json_encode($performance);
echo json_encode($performance);
?>