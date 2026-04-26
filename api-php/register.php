<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'db_config.php';

$data = get_input_data();

if(!empty($data->firstName) && !empty($data->lastName) && !empty($data->email) && !empty($data->password)){
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
    $query = "INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, 'user')";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssss", $data->firstName, $data->lastName, $data->email, $password_hash);

    if($stmt->execute()){
        http_response_code(201);
        echo json_encode(array("message" => "User was created."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create user."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
