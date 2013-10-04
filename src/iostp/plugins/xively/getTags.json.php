<?php

require_once("../../constants.php");
//error_reporting(-1);

$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if(mysqli_connect_errno()) {
	echo "Connection Failed: " . mysqli_connect_errno();
	exit();
}

//TODO:  remove the where not like '%2222%' clause
$results = $mysqli->query("SELECT DISTINCT TAG FROM DATASTREAM_TAG where TAG not like '%2222%' ORDER BY TAG ASC");

$options = [];
while ($row = $results->fetch_row()) {
    array_push($options, '"'.$row[0].'"');
}

echo "[".join(',',$options)."]";

/* free result set */
$results->close();

$mysqli->close();

?>
