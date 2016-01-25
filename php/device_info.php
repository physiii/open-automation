<?php
//header('Access-Control-Allow-Origin: *'); 

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

$sql = "create table device_info (timestamp text, user text, mac text, local_ip text, public_ip text, device_port text, device_name text)";
$result = $conn->query($sql); 

$sql = "select * from device_info limit 1;";
$result = $conn->query($sql);
$rows = array();
$previous_timestamp = "init";

while($row = $result->fetch_assoc()) {
      $rows[] = $row;
}

echo json_encode($rows);
$conn->close();
?>
