<?php
// /api-php/coupons/get_coupons.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

// Create table if not exists
$createTable = "CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount DECIMAL(10, 2) NOT NULL,
    type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    expiry DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($createTable);

$query = "SELECT * FROM coupons ORDER BY created_at DESC";
$result = $conn->query($query);

$coupons = array();
if($result && $result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $coupons[] = $row;
    }
}

echo json_encode($coupons);
?>
