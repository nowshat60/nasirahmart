<?php
include_once 'db_config.php';
$result = $conn->query("DESCRIBE items");
$columns = [];
while($row = $result->fetch_assoc()) {
    $columns[] = $row;
}
echo json_encode($columns);
?>
