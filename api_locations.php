<?php
// api_locations.php - Fetch active delivery locations
header('Content-Type: application/json');
include 'db_connect.php';

try {
    $stmt = $pdo->query("SELECT country_name FROM locations WHERE is_active = 1");
    $locations = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode($locations);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
