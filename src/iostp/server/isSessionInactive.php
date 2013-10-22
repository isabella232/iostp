<?php

/**
  * We need a nice way to figure out if the session is inactive,  everytime the user changes the config of any kit,
  * the system updates the uc_users table with the new kit_data.  It also sets the last_kit_save_stamp to the timestamp
  * when the save took place.
  *
  * This script determines if the difference in time since this last_kit_save_stamp is greater than the $UserSessionTTL
  * value specified in constants.php
**/

require_once("../constants.php");

$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if(mysqli_connect_errno()) {
	echo "Connection Failed: " . mysqli_connect_errno();
	exit();
}


$username = mysql_real_escape_string($_POST['username']);
$token    = mysql_real_escape_string($_POST['token']);
$action   = isset($_POST['action']) ? $_POST['action'] : "";

$sql = "SELECT `password`,`last_kit_save_stamp` FROM uc_users where user_name = '".$username."'";

$results = $mysqli->query($sql);

$row = $results->fetch_row();
if( md5($row[0]) != $token ) {
   $msg = "Authentication error, token: ".$token." invalid for user: ".$username;
   echo "TRUE";  //we are inactive

   error_log($msg." - user's session is inactive");
} else if( $action == "reset" ) {  //reset the timestamp to 'now'
    $date = new DateTime();
    $mysqli->query("UPDATE uc_users set last_kit_save_stamp=".$date->getTimestamp()." where user_name = '$username'");
} else {

    $date = new DateTime();

    $results = $mysqli->query("SELECT `last_kit_save_stamp` FROM uc_users where user_name = '$username'");
    $row = $results->fetch_row();
    if( $row[0] < $date->getTimestamp()-$UserSessionTTL ) {
       echo "TRUE";
       error_log("User '".$username."' session has timed out");
    } else {
       echo "FALSE";
    }
}
$mysqli->close();
?>
