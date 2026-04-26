<?php
// /api-php/notifications/get_notifications.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

// Create table if not exists
$createTable = "CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($createTable);

$query = "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50";
$result = $conn->query($query);

$notifications = array();
if($result && $result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $notifications[] = $row;
    }
}

echo json_encode($notifications);
?>
