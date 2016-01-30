<?php
$device_name = $_POST['device_name'];
$device_port = $_POST['device_port'];

$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "device";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

if ($device_port) {
  $sql = "update device_info set device_port='".$device_port."' where id='0'";
}
if ($device_name) {
  $sql = "update device_info set device_name='".$device_name."' where id='0'";
}
//$sql = "update device_info set device_name='".$device_name."', device_port='".$device_port."' where id='0'";

$result = $conn->query($sql); 
$conn->close();
echo "ok";
?>
