<?php
$user = $_POST['user'];
$token = $_POST['token'];

$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "device";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$sql = "insert into tokens values(now(),'".$user."','".$token."')";

$result = $conn->query($sql); 
$conn->close();
echo "ok";
?>
