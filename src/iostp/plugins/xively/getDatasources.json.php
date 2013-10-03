<?php

require_once("/constants.php");
require_once("MysqliDb.php");

//error_reporting(-1);

trigger_error("starting getDatasources.json.php", E_USER_NOTICE);

$_db = new Mysqlidb($db_host, $db_user, $db_pass, $db_name);

if(mysqli_connect_errno()) {
	echo "Connection Failed: " . mysqli_connect_errno();
	exit();
}

$tags = $_GET['tags'];



$rawQuery = "select DATASTREAMS.UID as DS_UID, DATASTREAMS.UNITS AS UNITS, DATASTREAMS.SYMBOL AS SYMBOL FROM DATASTREAMS INNER JOIN DATASTREAM_TAG on DATASTREAM_TAG.DS_UID=DATASTREAMS.UID";
$rawQuery .=" WHERE (";

$count = 0;
$params = [];
foreach( $tags as $tag ) {
   $rawQuery .= "DATASTREAM_TAG.TAG=? OR ";
   $count++;
   $params[] = $tag;
}

$arr = [];
if( $count > 0 ) {
    $rawQuery = rtrim($rawQuery," OR ");
    $rawQuery .= ") GROUP BY DS_UID HAVING COUNT(DS_UID) = ?";
    $params[] = $count;

    trigger_error($rawQuery,E_USER_NOTICE);
    $results = $_db->rawQuery($rawQuery,$params);

    foreach ($results as $row ) {
        $arr[] = '{"datastream" : "'.$row['DS_UID'].'", "units" : "'.$row['UNITS'].'", "symbol" : "'.$row['SYMBOL'].'"}';
    }
}
//

$output = "[".join(",",$arr)."]";
echo $output;

trigger_error("DONE getDatasources.json.php:   ".$output, E_USER_NOTICE);

?>
