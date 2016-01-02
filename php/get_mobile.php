<?php

$value = $_POST['val'];
$user = $_POST['user'];

$servername = "localhost";
$username = "physiii";
$password = "qweasdzxc";
$dbname = "pyfi";
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {die("Connection failed: " . $conn->connect_error);}

$sql = "select token from mobile_tok where user='".$user."' and token=sha2('".$value."',512);";
$result = $conn->query($sql);
while($row = $result->fetch_assoc()) {
  $rows['token'] = $row{'token'};  
}

echo json_encode($rows);
$conn->close();
?>
