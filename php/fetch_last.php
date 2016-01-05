<?php
$last_coord = $_POST['last_coord'];
$mac = $_POST['mac'];

$servername = "localhost";
$username = "physiii";
$password = "qweasdzxc";
$dbname = "pyfi";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "select * from location where mac='".$mac."' order by timestamp desc limit 1";
$result = $conn->query($sql);
$rows = array();
while($row = $result->fetch_assoc()) {
  $rows[] = $row;
}

echo json_encode($rows);
$conn->close();
?>
