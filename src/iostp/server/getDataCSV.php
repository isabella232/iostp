<?php

require_once('xively-php/vendors/com.rapiddigitalllc/xively/api.php');
require_once("../constants.php");

/*
 * convert a date string to ISO-8601 date string (e.g. 2013-05-05T16:34:42+00:00)
 */

function isoDate( $d ) {
   $a = date_parse($d);
   $strtime = $a['year'].'-'.$a['month'].'-'.$a['day'].' '.$a['hour'].':'.$a['minute'];
   $time = date_create_from_format("Y-m-j H:i",$strtime);
   $time = date_add( $time, DateInterval::createFromDateString( ($a['zone']*60).' seconds'));
   return $time->format('Y-m-d\\TH:i:s+00:00');
}

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="data_' . $_POST['kitName'] . '.csv"');

$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if(mysqli_connect_errno()) {
	echo "Connection Failed: " . mysqli_connect_errno();
	exit();
}


$username = mysql_real_escape_string($_POST['username']);
$token    = mysql_real_escape_string($_POST['token']);
$kitData  = mysql_real_escape_string($_POST['kitData']);
$start    = mysql_real_escape_string($_POST['start']);
$end      = mysql_real_escape_string($_POST['end']);
$interval = mysql_real_escape_string($_POST['interval']);

$startArr = date_parse($start);

$kitData = str_replace('\\"', '"', $kitData);

$sql = "SELECT `password` FROM uc_users where user_name = '".$username."'";
$results = $mysqli->query($sql);
$row = $results->fetch_row();
if( md5($row[0]) != $token ) {
   $msg = "Authentication error, token: ".$token." invalid for user: ".$username;
   echo $msg;
   error_log($msg);
   return;
}

$xi = \Xively\Api::forge();
$xi = \Xively\Api::forge('680dCuji2cKgPYrCsGErbtkRumbCRuUx9WRR3mH9iRFPYPAn');

$kitDataJson = json_decode($kitData);

foreach ( $kitDataJson->datastreams as $cfg ) {
    //trigger_error("cfg: ".$cfg->datastream, E_USER_NOTICE);

    list($feedId, $dsId) = split('!', $cfg->datastream);

    #pull data from stream by range

    $r = $xi->feeds($feedId)->datastreams($dsId)->range(array(
        'start' => $start,
        'end' => $end,
        'interval' => $interval,
        'limit' => 1000,
    ))->get();

    echo "Datastream:,\"".$feedId."!".$dsId."\"\n";
    echo "Tags:\n";

    for ($i = 0; $i < count($r->tags); ++$i) {
        echo "\"".$r->tags[$i]."\"\n";
    }

    if( isset($r->unit) ) {
        echo "Unit:,\"".$r->unit->label."\",Symbol:,\"".$r->unit->symbol."\"\n";
    }
    if( isset($r->datapoints)  ) {
        echo "Data:\n";
        foreach ( $r->datapoints as $p ) {
            echo "\"".$p->at."\",\"".$p->value."\"\n";
        }
    }
}

	
$mysqli->close();


?>
