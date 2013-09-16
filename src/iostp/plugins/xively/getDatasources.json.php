<?php

require_once("constants.php");
require_once("MysqliDb.php");

//error_reporting(-1);

trigger_error("starting getDatasources.json.php", E_USER_NOTICE);

$_db = new Mysqlidb($db_host, $db_user, $db_pass, $db_name);

if(mysqli_connect_errno()) {
	echo "Connection Failed: " . mysqli_connect_errno();
	exit();
}

$tags = $_GET['tags'];



foreach( $tags as $tag ) {
   $_db->where("DATASTREAM_TAG.TAG", $tag);
}

$results = $_db->query('SELECT DATASTREAMS.UID AS UID, DATASTREAMS.UNITS AS UNITS, DATASTREAMS.SYMBOL AS SYMBOL FROM DATASTREAMS INNER JOIN DATASTREAM_TAG ON DATASTREAM_TAG.DS_UID=DATASTREAMS.UID');

$arr = [];
foreach ($results as $row ) {
    $arr[] = '{"datastream" : "'.$row['UID'].'", "units" : "'.$row['UNITS'].'", "symbol" : "'.$row['SYMBOL'].'"}';
}
//

$output = "[".join(",",$arr)."]";
echo $output;

trigger_error("DONE getDatasources.json.php:   ".$output, E_USER_NOTICE);

?>
