
<?php
// ============================================================
// SAVE AS: api-php/accounting/get_transactions.php
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$page  = isset($_GET['page'])  ? max(1, intval($_GET['page']))  : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit'])         : 15;
$type  = isset($_GET['type'])  ? $_GET['type']                  : 'all';
$year  = isset($_GET['year'])  ? intval($_GET['year'])          : date('Y');
$offset = ($page - 1) * $limit;

$where = ["YEAR(trans_date) = $year"];
if ($type !== 'all') $where[] = "type = '" . $conn->real_escape_string($type) . "'";
$whereStr = implode(" AND ", $where);

$total = $conn->query("SELECT COUNT(*) AS cnt FROM transactions WHERE $whereStr")->fetch_assoc()['cnt'];
$result = $conn->query("SELECT * FROM transactions WHERE $whereStr ORDER BY trans_date DESC, id DESC LIMIT $limit OFFSET $offset");

$rows = [];
while ($r = $result->fetch_assoc()) {
    $rows[] = [
        'id'             => (int)$r['id'],
        'type'           => $r['type'],
        'reference_id'   => $r['reference_id'],
        'reference_type' => $r['reference_type'],
        'amount'         => (float)$r['amount'],
        'description'    => $r['description'],
        'trans_date'     => $r['trans_date'],
        'created_at'     => $r['created_at'],
    ];
}

echo json_encode(['transactions' => $rows, 'total' => (int)$total, 'page' => $page, 'limit' => $limit]);
?>