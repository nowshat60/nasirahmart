<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$stats = [
    'totalAssets' => 0,
    'totalRevenue' => 0,
    'totalExpenses' => 0,
    'netProfit' => 0
];

// Revenue
$res = $conn->query("SELECT SUM(credit - debit) as total FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE a.type = 'Revenue'");
$stats['totalRevenue'] = (float)$res->fetch_assoc()['total'];

// Expenses
$res = $conn->query("SELECT SUM(debit - credit) as total FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE a.type = 'Expense'");
$stats['totalExpenses'] = (float)$res->fetch_assoc()['total'];

// Assets
$res = $conn->query("SELECT SUM(balance) as total FROM accounts WHERE type = 'Asset'");
$stats['totalAssets'] = (float)$res->fetch_assoc()['total'];

$stats['netProfit'] = $stats['totalRevenue'] - $stats['totalExpenses'];

echo json_encode($stats);
?>