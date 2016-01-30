<?php
ob_start();
passthru('ifconfig | grep eth0');
$dump = ob_get_contents();
preg_match('/[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}/i', $dump, $mac);
$mac_address = str_replace(":","",$mac[0]);
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

//$sql = "insert into device_info values('0',now(),'username','tempmac','127.0.0.1','123.123.123.123','3030','devname');";
$sql = "update device_info set mac='".$mac_address."', local_ip='".$local_ip."', public_ip='".$public_ip."' where id='0'";
$result = $conn->query($sql); 
$conn->close();

?>

