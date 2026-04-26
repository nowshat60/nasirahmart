<?php
// support/api_chat_fetch.php - Fetch chat history
header('Content-Type: application/json');
include '../db_connect.php';

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

try {
    if ($user_id) {
        $sql = "SELECT * FROM chat_messages WHERE user_id = :user_id OR user_id IS NULL ORDER BY created_at ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $user_id]);
    } else {
        $sql = "SELECT * FROM chat_messages WHERE user_id IS NULL ORDER BY created_at ASC LIMIT 50";
        $stmt = $pdo->query($sql);
    }
    
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($messages);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
