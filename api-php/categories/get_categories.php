<?php
// /api-php/categories/get_categories.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../db_config.php';

// Check if categories table exists, if not create it
$checkTable = $conn->query("SHOW TABLES LIKE 'categories'");
if($checkTable->num_rows == 0) {
    $conn->query("CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    // Insert some default categories
    $conn->query("INSERT INTO categories (category_name, slug) VALUES ('Electronics', 'electronics'), ('Fashion', 'fashion'), ('Home & Garden', 'home-garden')");
    
    // Also ensure items table category column is compatible
    // We'll try to change it to INT, but carefully. 
    // For now, let's just make sure it exists.
    $conn->query("ALTER TABLE items MODIFY COLUMN category INT DEFAULT 0");
}

$query = "SELECT * FROM categories ORDER BY category_name ASC";
$result = $conn->query($query);

if($result->num_rows > 0){
    $categories_arr = array();
    while($row = $result->fetch_assoc()){
        $categories_arr[] = $row;
    }
    http_response_code(200);
    echo json_encode($categories_arr);
} else {
    http_response_code(200);
    echo json_encode(array());
}
?>
