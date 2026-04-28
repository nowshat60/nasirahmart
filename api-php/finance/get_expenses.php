
<?php
// ============================================================
// SAVE AS: api-php/accounting/get_expenses.php
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$month = isset($_GET['month']) ? intval($_GET['month']) : 0;
$year  = isset($_GET['year'])  ? intval($_GET['year'])  : date('Y');

$sql = "SELECT e.*, ec.name AS category_name
        FROM expenses e
        JOIN expense_categories ec ON e.category_id = ec.id";
$conditions = ["YEAR(e.expense_date) = $year"];
if ($month > 0) $conditions[] = "MONTH(e.expense_date) = $month";
$sql .= " WHERE " . implode(" AND ", $conditions) . " ORDER BY e.expense_date DESC";

$result = $conn->query($sql);
$expenses = [];
while ($row = $result->fetch_assoc()) {
    $expenses[] = [
        'id'            => (int)$row['id'],
        'category_id'   => (int)$row['category_id'],
        'category_name' => $row['category_name'],
        'description'   => $row['description'],
        'amount'        => (float)$row['amount'],
        'expense_date'  => $row['expense_date'],
        'note'          => $row['note'],
        'created_at'    => $row['created_at'],
    ];
}

// Category summary for pie chart
$catQ = $conn->query("SELECT ec.name, SUM(e.amount) AS total
    FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id
    WHERE YEAR(e.expense_date) = $year " . ($month > 0 ? "AND MONTH(e.expense_date) = $month" : "") . "
    GROUP BY ec.name ORDER BY total DESC");
$categoryBreakdown = [];
while ($r = $catQ->fetch_assoc()) {
    $categoryBreakdown[] = ['name' => $r['name'], 'value' => (float)$r['total']];
}

// Categories list for form dropdown
$cats = [];
$catListQ = $conn->query("SELECT * FROM expense_categories ORDER BY name");
while ($r = $catListQ->fetch_assoc()) $cats[] = $r;

echo json_encode([
    'expenses'  => $expenses,
    'breakdown' => $categoryBreakdown,
    'categories'=> $cats,
    'total'     => array_sum(array_column($expenses, 'amount')),
]);
?>