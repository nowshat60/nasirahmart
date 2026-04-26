# PHP CRUD Integration Guide

This guide provides the PHP code and MySQL schema required to implement the CRUD functionality for Categories and Products as requested.

## 1. MySQL Database Schema

```sql
-- Create Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `category` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `cutprice` decimal(10,2) DEFAULT 0.00,
  `cost_price` decimal(10,2) DEFAULT 0.00,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `min_stock_level` int(11) DEFAULT 5,
  `image` varchar(255) DEFAULT NULL,
  `star` int(1) DEFAULT 5,
  `discount_percentage` int(3) DEFAULT 0,
  `status` varchar(50) DEFAULT 'published',
  `unit` varchar(50) DEFAULT 'Pieces (pc)',
  `short_description` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 2. PHP Backend Structure

Create a folder named `api-php` (or as per your setup) and add the following files.

### db_config.php
```php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$host = "localhost";
$user = "root";
$pass = "";
$db_name = "your_database_name";

$conn = new mysqli($host, $user, $pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}
?>
```

### categories/add_category.php
```php
<?php
require_once '../db_config.php';

$category_name = $_POST['category_name'];
$status = $_POST['status'] ?? 'active';
$slug = strtolower(str_replace(' ', '-', $category_name));
$image_path = "";

if (isset($_FILES['image'])) {
    $target_dir = "../../public/uploads/";
    if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
    
    $file_name = time() . "_" . basename($_FILES["image"]["name"]);
    $target_file = $target_dir . $file_name;
    
    if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
        $image_path = "/uploads/" . $file_name;
    }
}

$sql = "INSERT INTO categories (category_name, slug, status, image) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $category_name, $slug, $status, $image_path);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Category added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}
?>
```

### products/add_product.php
```php
<?php
require_once '../db_config.php';

$item_name = $_POST['item_name'];
$sku = $_POST['sku'];
$category = $_POST['category'];
$price = $_POST['price'];
$cutprice = $_POST['cutprice'] ?? 0;
$cost_price = $_POST['cost_price'] ?? 0;
$quantity = $_POST['quantity'];
$min_stock_level = $_POST['min_stock_level'] ?? 5;
$star = $_POST['star'] ?? 5;
$discount_percentage = $_POST['discount_percentage'] ?? 0;
$status = $_POST['status'] ?? 'published';
$unit = $_POST['unit'] ?? 'Pieces (pc)';
$short_description = $_POST['short_description'] ?? '';

$image_path = "";

if (isset($_FILES['image'])) {
    $target_dir = "../../public/uploads/";
    if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
    
    $file_name = time() . "_" . basename($_FILES["image"]["name"]);
    $target_file = $target_dir . $file_name;
    
    if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
        $image_path = "/uploads/" . $file_name;
    }
}

$sql = "INSERT INTO products (item_name, sku, category, price, cutprice, cost_price, quantity, min_stock_level, image, star, discount_percentage, status, unit, short_description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssidddiisiiiss", $item_name, $sku, $category, $price, $cutprice, $cost_price, $quantity, $min_stock_level, $image_path, $star, $discount_percentage, $status, $unit, $short_description);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}
?>
```

## 3. Frontend Integration Note

The React frontend is already configured to send `FormData` with `multipart/form-data` headers. Ensure your PHP server's `upload_max_filesize` and `post_max_size` are sufficient for your image uploads.
