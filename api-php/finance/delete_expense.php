
<?php
// ============================================================
// SAVE AS: api-php/accounting/delete_expense.php
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
include_once '../db_config.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? intval($data['id']) : 0;

if (!$id) { echo json_encode(["success" => false, "message" => "ID required"]); exit; }

$stmt = $conn->prepare("DELETE FROM expenses WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    $conn->prepare("DELETE FROM transactions WHERE reference_id = ? AND reference_type = 'expense'")->execute();
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}
?>