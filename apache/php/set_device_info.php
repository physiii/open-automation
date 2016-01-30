<?php
$device_name = $_POST['device_name'];
$device_port = $_POST['port'];

$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "device";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$sql = "update device_info set device_name='".$device_name."', device_port='".$device_port."' where id='0'";

$result = $conn->query($sql); 
$conn->close();
echo "ok";
?>
