<?php
$user = $_POST['usr'];
$value = $_POST['val'];

$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "media-server";

if ($user == '') {
  echo "invalid";
  return;
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$sql = "select * from uf_user where user_name='".$user."';";
$result = $conn->query($sql);
if (($row = $result->fetch_assoc()) != null) {
  echo "user exist";
  return;
}

//if ($rows == null) {
  $sql = "select * from mobile_tok where user='".$user."';";
  $result = $conn->query($sql);
  while($row = $result->fetch_assoc()) {
    $rows[] = $row;
  }  
  if ($rows == null) {  
    $sql = "insert into mobile_tok values (now(),'".$user."', sha2('".$value."', 512));";
    echo "inserted"; 
  } else {
    $sql = "update mobile_tok set token=sha2('".$value."', 512) where user='".$user."';";
    echo "updated"; 
  }
  $result = $conn->query($sql); 
//} 

$conn->close();
?>
