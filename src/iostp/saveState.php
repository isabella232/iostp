<?php

require_once("./constants.php");
//error_reporting(-1);

$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if(mysqli_connect_errno()) {
	echo "Connection Failed: " . mysqli_connect_errno();
	exit();
}


$username = mysql_real_escape_string($_POST['username']);
$token    = mysql_real_escape_string($_POST['token']);
$kitData  = mysql_real_escape_string($_POST['kitData']);

$sql = "SELECT `password` FROM uc_users where user_name = '".$username."'";

$results = $mysqli->query($sql);

$row = $results->fetch_row();
if( md5($row[0]) != $token ) {
   $msg = "Authentication error, token: ".$token." invalid for user: ".$username;
   echo $msg;
   error_log($msg);
   return;
}

$mysqli->query("UPDATE uc_users set kit_data = '$kitData' where user_name = '$username'");

$mysqli->close();
?>
