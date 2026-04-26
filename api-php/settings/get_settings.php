<?php
// /api-php/settings/get_settings.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

// Create table if not exists
$createTable = "CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'Nasirah Mart',
    site_logo VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    currency VARCHAR(10) DEFAULT 'TK',
    tax_rate DECIMAL(5, 2) DEFAULT 5.00,
    shipping_fee DECIMAL(10, 2) DEFAULT 50.00,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
$conn->query($createTable);

// Check if settings exist, if not insert default
$check = $conn->query("SELECT * FROM settings LIMIT 1");
if($check->num_rows == 0){
    $conn->query("INSERT INTO settings (site_name) VALUES ('Nasirah Mart')");
    $check = $conn->query("SELECT * FROM settings LIMIT 1");
}

echo json_encode($check->fetch_assoc());
?>
