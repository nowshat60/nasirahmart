<?php
// /api-php/finance/get_expenses.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$query = "SELECT e.*, a.name as account_name 
          FROM expenses e 
          JOIN accounts a ON e.account_id = a.id 
          ORDER BY e.expense_date DESC";
$result = $conn->query($query);

if($result->num_rows > 0){
    $expenses_arr = array();
    while($row = $result->fetch_assoc()){
        $expenses_arr[] = array(
            "id" => (int)$row['id'],
            "category" => $row['category'],
            "amount" => (float)$row['amount'],
            "expense_date" => $row['expense_date'],
            "description" => $row['description'],
            "account_name" => $row['account_name']
        );
    }
    http_response_code(200);
    echo json_encode($expenses_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No expenses found."));
}
?>
