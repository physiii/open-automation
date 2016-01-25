<?php

$user = $_POST['user'];
$pwd = $_POST['pwd'];
$mac = $_POST['mac'];
$device_name = $_POST['device_name'];
$device_port = $_POST['port'];
$local_ip = $_SERVER["SERVER_ADDR"];

$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "device";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$public_ip = "123.123.123.123";
$sql = "insert into device_info values(now(),'".$user."','".$mac."','".$local_ip."','".$public_ip."','".$device_port."','".$device_name."');";
$result = $conn->query($sql); 
$conn->close();
echo "ok";
?>
