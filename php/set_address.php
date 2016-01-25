
<?php
ob_start();
passthru('ifconfig | grep eth0');
$dump = ob_get_contents();
preg_match('/[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}/i', $dump, $mac);
$mac_address = $mac[0];
ob_end_clean();
$local_ip = $_SERVER["SERVER_ADDR"];
$public_ip = file_get_contents("http://pyfi.org/php/get_ip.php");
$rows['mac'] = $mac_address;
$rows['local_ip'] = $local_ip;
$rows['public_ip'] = $public_ip;
echo json_encode($rows);

$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "device";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

//$sql = "insert into device_info values(now(),'".$user."','".$mac."','".$local_ip."','".$public_ip."','".$device_port."','".$device_name."');";
$sql = "";
$result = $conn->query($sql); 
$conn->close();


?>

