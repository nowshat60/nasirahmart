<?php
$host = "localhost";
$db_name = "nasirahmart_db";
$username = "root";
$password = "";
$key = "your_secret_key_here"; // Secret key for JWT

$conn = new mysqli($host, $username, $password, $db_name);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Helper function to get input data from JSON or $_REQUEST
function get_input_data() {
    $json = file_get_contents("php://input");
    $data = json_decode($json);
    
    if (!$data) {
        $data = new stdClass();
        foreach ($_REQUEST as $key => $value) {
            $data->$key = $value;
        }
    }
    return $data;
}
?>
