
<?php
// ============================================================
// SAVE AS: api-php/accounting/get_summary.php
// Revenue, Expense, Profit — daily/monthly/yearly breakdown
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$period = isset($_GET['period']) ? $_GET['period'] : 'monthly'; // daily | monthly | yearly
$year   = isset($_GET['year'])   ? intval($_GET['year'])   : date('Y');
$month  = isset($_GET['month'])  ? intval($_GET['month'])  : date('n');

// ── Total Revenue (delivered + processing + shipped orders, non-cancelled)
$revQ = $conn->prepare("SELECT COALESCE(SUM(total),0) AS revenue FROM orders WHERE order_status != 'Cancelled' AND YEAR(created_at) = ?");
$revQ->bind_param("i", $year);
$revQ->execute();
$totalRevenue = $revQ->get_result()->fetch_assoc()['revenue'];

// ── Total Expenses this year
$expQ = $conn->prepare("SELECT COALESCE(SUM(amount),0) AS expenses FROM expenses WHERE YEAR(expense_date) = ?");
$expQ->bind_param("i", $year);
$expQ->execute();
$totalExpenses = $expQ->get_result()->fetch_assoc()['expenses'];

// ── Chart data
if ($period === 'daily') {
    // Last 30 days
    $chartSQL = "
        SELECT DATE_FORMAT(d.day,'%d %b') AS label,
               COALESCE(r.rev,0)  AS revenue,
               COALESCE(e.exp,0)  AS expenses,
               COALESCE(r.rev,0) - COALESCE(e.exp,0) AS profit
        FROM (
            SELECT DATE_SUB(CURDATE(), INTERVAL n DAY) AS day
            FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                  UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
                  UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
                  UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
                  UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
                  UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29) nums
        ) d
        LEFT JOIN (
            SELECT DATE(created_at) AS day, SUM(total) AS rev
            FROM orders WHERE order_status != 'Cancelled'
            GROUP BY DATE(created_at)
        ) r ON r.day = d.day
        LEFT JOIN (
            SELECT expense_date AS day, SUM(amount) AS exp
            FROM expenses GROUP BY expense_date
        ) e ON e.day = d.day
        ORDER BY d.day ASC";
} elseif ($period === 'yearly') {
    $chartSQL = "
        SELECT YEAR(d.m) AS label,
               COALESCE(r.rev,0) AS revenue,
               COALESCE(e.exp,0) AS expenses,
               COALESCE(r.rev,0) - COALESCE(e.exp,0) AS profit
        FROM (
            SELECT DATE_FORMAT(DATE_SUB(NOW(), INTERVAL n YEAR),'%Y-01-01') AS m
            FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) nums
        ) d
        LEFT JOIN (
            SELECT YEAR(created_at) AS yr, SUM(total) AS rev
            FROM orders WHERE order_status != 'Cancelled' GROUP BY yr
        ) r ON r.yr = YEAR(d.m)
        LEFT JOIN (
            SELECT YEAR(expense_date) AS yr, SUM(amount) AS exp
            FROM expenses GROUP BY yr
        ) e ON e.yr = YEAR(d.m)
        ORDER BY d.m ASC";
} else {
    // Monthly (default) — all 12 months of selected year
    $chartSQL = "
        SELECT DATE_FORMAT(CONCAT($year,'-',m.n,'-01'),'%b') AS label,
               COALESCE(r.rev,0) AS revenue,
               COALESCE(e.exp,0) AS expenses,
               COALESCE(r.rev,0) - COALESCE(e.exp,0) AS profit
        FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
              UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
              UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) m
        LEFT JOIN (
            SELECT MONTH(created_at) AS mo, SUM(total) AS rev
            FROM orders WHERE order_status != 'Cancelled' AND YEAR(created_at) = $year
            GROUP BY mo
        ) r ON r.mo = m.n
        LEFT JOIN (
            SELECT MONTH(expense_date) AS mo, SUM(amount) AS exp
            FROM expenses WHERE YEAR(expense_date) = $year
            GROUP BY mo
        ) e ON e.mo = m.n
        ORDER BY m.n ASC";
}

$chartData = [];
$chartResult = $conn->query($chartSQL);
while ($row = $chartResult->fetch_assoc()) {
    $chartData[] = [
        'label'    => $row['label'],
        'revenue'  => (float)$row['revenue'],
        'expenses' => (float)$row['expenses'],
        'profit'   => (float)$row['profit'],
    ];
}

// ── Order status breakdown (for pie chart)
$statusQ = $conn->query("SELECT LOWER(order_status) AS status, COUNT(*) AS cnt, SUM(total) AS total FROM orders GROUP BY order_status");
$statusData = [];
while ($r = $statusQ->fetch_assoc()) {
    $statusData[] = ['status' => $r['status'], 'count' => (int)$r['cnt'], 'total' => (float)$r['total']];
}

echo json_encode([
    'total_revenue'  => (float)$totalRevenue,
    'total_expenses' => (float)$totalExpenses,
    'net_profit'     => (float)$totalRevenue - (float)$totalExpenses,
    'profit_margin'  => $totalRevenue > 0 ? round(($totalRevenue - $totalExpenses) / $totalRevenue * 100, 1) : 0,
    'chart_data'     => $chartData,
    'status_data'    => $statusData,
    'year'           => $year,
    'period'         => $period,
]);
?>

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

<?php
// ============================================================
// SAVE AS: api-php/accounting/add_expense.php
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
include_once '../db_config.php';

$data = json_decode(file_get_contents("php://input"), true);

$category_id   = isset($data['category_id'])   ? intval($data['category_id'])      : null;
$description   = isset($data['description'])   ? trim($data['description'])         : '';
$amount        = isset($data['amount'])        ? floatval($data['amount'])           : 0;
$expense_date  = isset($data['expense_date'])  ? $data['expense_date']              : date('Y-m-d');
$note          = isset($data['note'])          ? trim($data['note'])                 : '';

if (!$category_id || $amount <= 0) {
    echo json_encode(["success" => false, "message" => "Category and amount are required"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO expenses (category_id, description, amount, expense_date, note) VALUES (?,?,?,?,?)");
$stmt->bind_param("isdss", $category_id, $description, $amount, $expense_date, $note);

if ($stmt->execute()) {
    $newId = $stmt->insert_id;
    // Auto-add to transaction ledger
    $tStmt = $conn->prepare("INSERT INTO transactions (type, reference_id, reference_type, amount, description, trans_date) VALUES ('expense',?,?, ?,?,?)");
    $ref = 'expense';
    $tStmt->bind_param("issss", $newId, $ref, $amount, $description, $expense_date);
    $tStmt->execute();
    echo json_encode(["success" => true, "id" => $newId, "message" => "Expense added"]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}
?>