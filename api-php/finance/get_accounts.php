<?php
// /api-php/finance/get_accounts.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$query = "SELECT * FROM accounts ORDER BY code ASC";
$result = $conn->query($query);

if($result->num_rows > 0){
    $accounts_arr = array();
    while($row = $result->fetch_assoc()){
        $accounts_arr[] = array(
            "id" => (int)$row['id'],
            "code" => $row['code'],
            "name" => $row['name'],
            "type" => $row['type'],
            "balance" => (float)$row['balance'],
            "parent_id" => (int)$row['parent_id']
        );
    }
    http_response_code(200);
    echo json_encode($accounts_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No accounts found."));
}
?>
