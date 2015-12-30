<?php

$last_coord = $_POST['last_coord'];
$mac = $_POST['mac'];
$user = $_POST['user'];

$servername = "localhost";
$username = "physiii";
$password = "qweasdzxc";
$dbname = "pyfi";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "select * from location where mac='".$mac."' limit 4000";
$result = $conn->query($sql);
$rows = array();
$previous_timestamp = "init";

while($row = $result->fetch_assoc()) {
  $distance_lng = $previous_lng - $row['longitude'];
  $distance_lat = $previous_lat - $row['latitude'];
    if ($distance_lng > 0.0001) {
      $rows[] = $row;
    }
    $previous_timestamp = $row['timestamp'];
  $previous_lng = $row['longitude'];
  $previous_lat = $row['latitude'];
}

echo json_encode($rows);
$conn->close();
?>
