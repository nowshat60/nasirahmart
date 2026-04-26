<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'db_config.php';
include_once 'jwt_helper.php';

$data = get_input_data();

if(!empty($data->email) && !empty($data->password)){
    $query = "SELECT id, firstName, lastName, email, password, role FROM users WHERE email = ? LIMIT 0,1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $data->email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if($user && password_verify($data->password, $user['password'])){
        $token = array(
           "iss" => "nasirahmart",
           "aud" => "nasirahmart_users",
           "iat" => time(),
           "nbf" => time(),
           "data" => array(
               "id" => $user['id'],
               "firstName" => $user['firstName'],
               "lastName" => $user['lastName'],
               "email" => $user['email'],
               "role" => $user['role']
           )
        );

        $jwt = JwtHelper::encode($token, $key);

        http_response_code(200);
        echo json_encode(array(
            "message" => "Successful login.",
            "jwt" => $jwt,
            "user" => $token['data']
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Login failed. Invalid credentials."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
