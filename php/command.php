<?php
$command = $_POST['command'];
$value = $_POST['value'];
$mac = $_POST['mac'];
$user = $_POST['user'];
$user = 'testuser';

$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "media-server";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$sql = "update commands set state='".$value."', timestamp=now(), user='".$user."' where command='".$command."' and mac='".$mac."'";
$result = $conn->query($sql);
$conn->close();
?>
