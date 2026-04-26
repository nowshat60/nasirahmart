<?php
// support/api_chat_save.php - Save a new chat message
header('Content-Type: application/json');
include '../db_connect.php'; 

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['message_text']) || !isset($data['sender'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$message_text = $data['message_text'];
$sender = $data['sender']; 
$user_id = isset($data['user_id']) ? $data['user_id'] : null;

try {
    $sql = "INSERT INTO chat_messages (user_id, sender, message_text) VALUES (:user_id, :sender, :message_text)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':user_id' => $user_id,
        ':sender' => $sender,
        ':message_text' => $message_text
    ]);

    echo json_encode(['status' => 'success', 'message_id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
