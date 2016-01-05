<?php
$ipAddress = $_POST['ipAddress'];
$port = $_POST['port'];
$user = $_POST['user'];
$password = $_POST['password'];

$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "userfrosting";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "select user from devices where user='".$user."' and ip='".$ipAddress."' and port='".$port."'";
$result = $conn->query($sql);
$rows = array();
while($row = $result->fetch_assoc()) {
  $rows[] = $row;
  if ($row['user'] != null) return;
}

$sql = "insert into devices values(now(), '".$user."','".$ipAddress."', '".$port."')";
$result = $conn->query($sql);

$conn->close();
?>
