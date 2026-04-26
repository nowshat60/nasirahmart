<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

$query = "SELECT id, name, phone FROM suppliers ORDER BY name ASC";
$result = $conn->query($query);
$suppliers = [];

while($row = $result->fetch_assoc()) {
    $suppliers[] = $row;
}
echo json_encode($suppliers);
?>