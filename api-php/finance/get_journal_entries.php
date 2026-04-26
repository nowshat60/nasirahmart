<?php
// /api-php/finance/get_journal_entries.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$query = "SELECT * FROM journal_entries ORDER BY entry_date DESC";
$result = $conn->query($query);

$entries = array();
if($result && $result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $entries[] = $row;
    }
}

echo json_encode($entries);
?>
