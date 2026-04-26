<?php
// api_search.php - Dynamic product autocomplete suggestions
header('Content-Type: application/json');
include 'db_connect.php'; // Assume this file contains your PDO connection

$query = isset($_GET['q']) ? $_GET['q'] : '';
$category = isset($_GET['category']) ? $_GET['category'] : 'All';

try {
    $sql = "SELECT id, item_name, category_name, price, image FROM products WHERE status = 'published'";
    $params = [];

    if (!empty($query)) {
        $sql .= " AND item_name LIKE :query";
        $params[':query'] = "%$query%";
    }

    if ($category !== 'All') {
        $sql .= " AND category_name = :category";
        $params[':category'] = $category;
    }

    $sql .= " LIMIT 6";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($products);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
