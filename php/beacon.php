<?php

$gps_time = $_POST['timestamp'];
$longitude = $_POST['longitude'];
$latitude = $_POST['latitude'];
$speed = $_POST['speed'];
$bearing = $_POST['bearing'];
$accuracy = $_POST['accuracy'];
$mac = $_POST['mac'];
$ip = $_POST['ip'];
$user = $_POST['user'];
$token = $_POST['token'];

$ip = $_SERVER["REMOTE_ADDR"]; 
$servername = "localhost";
$username = "physiii";
$password = "qweasdzxc";
$dbname = "pyfi";
$rows = array();

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {die("Connection failed: " . $conn->connect_error);} 

$sql = "select token from mobile_tok where user='".$user."' and token='".$token."'";
$result = $conn->query($sql);

if (($row = $result->fetch_assoc()) == null) {
  echo "invalid token";
  return;
}

$sql = "INSERT INTO location (timestamp, user, mac, ip, longitude, latitude, speed, bearing, accuracy, time) 
         VALUES (now(), '".$user."', '".$mac."', '".$ip."', '".   $longitude."', '".$latitude."', '".$speed."', '".$bearing."', '".$accuracy."', '".$gps_time."'); ";

$conn->query($sql);
$sql = "select state from commands where command='ping' and mac='".$mac."'";
$result = $conn->query($sql);

while($row = $result->fetch_assoc()) {
  $rows['ping'] = $row{'state'};
  $rows['ip'] = $_SERVER["REMOTE_ADDR"];
}

echo json_encode($rows);  
?>
