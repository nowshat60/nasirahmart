<?php
// /api-php/finance/get_statements.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$startDate = isset($_GET['start']) ? $_GET['start'] : date('Y-m-01');
$endDate = isset($_GET['end']) ? $_GET['end'] : date('Y-m-d');

$data = [
    'pnl' => [],
    'balance' => [],
    'trial' => [],
    'totals' => ['revenue' => 0, 'expenses' => 0, 'netProfit' => 0, 'assets' => 0, 'liabilities' => 0, 'equity' => 0]
];

// 1. Fetch Trial Balance (All accounts with current balances)
$trialQuery = "SELECT code, name, type, 
               CASE WHEN balance >= 0 THEN balance ELSE 0 END as dr,
               CASE WHEN balance < 0 THEN ABS(balance) ELSE 0 END as cr 
               FROM accounts ORDER BY code ASC";
$resTrial = $conn->query($trialQuery);
while($row = $resTrial->fetch_assoc()) {
    $data['trial'][] = $row;
}

// 2. Fetch P&L (Revenue and Expenses)
$pnlQuery = "SELECT name, type, balance FROM accounts WHERE type IN ('Revenue', 'Expense')";
$resPnl = $conn->query($pnlQuery);
while($row = $resPnl->fetch_assoc()) {
    $val = (float)$row['balance'];
    if($row['type'] == 'Revenue') {
        $data['totals']['revenue'] += abs($val);
        $data['pnl'][] = ['name' => $row['name'], 'amount' => abs($val), 'type' => 'Revenue'];
    } else {
        $data['totals']['expenses'] += $val;
        $data['pnl'][] = ['name' => $row['name'], 'amount' => $val, 'type' => 'Expense'];
    }
}
$data['totals']['netProfit'] = $data['totals']['revenue'] - $data['totals']['expenses'];

// 3. Fetch Balance Sheet (Assets, Liabilities, Equity)
$bsQuery = "SELECT name, type, balance FROM accounts WHERE type IN ('Asset', 'Liability', 'Equity')";
$resBs = $conn->query($bsQuery);
while($row = $resBs->fetch_assoc()) {
    $data['balance'][] = ['name' => $row['name'], 'amount' => (float)$row['balance'], 'type' => $row['type']];
    if($row['type'] == 'Asset') $data['totals']['assets'] += (float)$row['balance'];
    if($row['type'] == 'Liability') $data['totals']['liabilities'] += (float)$row['balance'];
    if($row['type'] == 'Equity') $data['totals']['equity'] += (float)$row['balance'];
}

echo json_encode($data);
?>