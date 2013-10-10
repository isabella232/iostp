<?php

// -- require_once("install/constants.php");

function getFeedData($user, $page) {
    $context = stream_context_create(array(
        'http' => array(
        )
    ));

   $apiKey = "680dCuji2cKgPYrCsGErbtkRumbCRuUx9WRR3mH9iRFPYPAn";
   $json = file_get_contents("https://api.xively.com/v2/feeds/?user=".$user."&page=".$page."&key=".$apiKey, false, $context);
   echo "JSON: ".$json;
   $obj = json_decode($json);
   return $obj;
}

$xivelyUser = "iostp";

$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if(mysqli_connect_errno()) {
	echo "Connection Failed: " . mysqli_connect_errno();
	exit();
}

//mysql_select_db($db_name) or die(mysql_error());

$createFeedsTable = "CREATE TABLE IF NOT EXISTS FEEDS_TEMP " .
                "  ( FEED_ID VARCHAR(255) PRIMARY KEY, " .
                "  TITLE VARCHAR(255), " .
                "  PRIVATE BOOLEAN, " .
                "  DEVICE_SERIAL VARCHAR(255), " .
                "  FEED_URL VARCHAR(255), " .
                "  CREATED TIMESTAMP, " .
                "  UPDATED TIMESTAMP, " .
                "  LOCATION_LAT FLOAT, " .
                "  LOCATION_LONG FLOAT);";

$createDatastreamsTable = "CREATE TABLE IF NOT EXISTS DATASTREAMS_TEMP " .
                " ( DATASTREAM_ID VARCHAR(255), " .
                " FEED_ID VARCHAR(255), " .
                " UNITS VARCHAR(255), " .
                " SYMBOL VARCHAR(255), " .
                " UID VARCHAR(255));";
$createDatastreamTagTable = "CREATE TABLE IF NOT EXISTS DATASTREAM_TAG_TEMP " .
                " ( DS_UID VARCHAR(255), " .
                " TAG VARCHAR(255), UNIQUE INDEX TAG_IDX (DS_UID,TAG)); ";
$createFeedTagTable = "CREATE TABLE IF NOT EXISTS FEED_TAG_TEMP " .
                " ( FEED_ID VARCHAR(255), " .
                " TAG VARCHAR(255), INDEX USING HASH (TAG)); ";
$createLocationsTable = "CREATE TABLE IF NOT EXISTS LOCATIONS_TEMP " .
                " ( NAME VARCHAR(255) PRIMARY KEY, " .
                " LATITUDE  FLOAT, " .
                " LONGITUDE FLOAT, " .
                " ELEVATION FLOAT);";
$createSchoolLocationsTable = "CREATE TABLE IF NOT EXISTS SCHOOL_LOCATIONS_TEMP " .
                " ( NAME VARCHAR(255) PRIMARY KEY, " .
                " ZIP VARCHAR(15), " .
                " LATITUDE  FLOAT, " .
                " LONGITUDE FLOAT, " .
                " ELEVATION FLOAT);";

$sql = [
   "FEEDS_TEMP" => $createFeedsTable,
   "DATASTREAMS_TEMP" => $createDatastreamsTable,
   "DATASTREAM_TAG_TEMP" => $createDatastreamTagTable,
   "FEED_TAG_TEMP" => $createFeedTagTable,
   "LOCATIONS_TEMP" => $createLocationsTable,
   "SCHOOL_LOCATIONS_TEMP" => $createSchoolLocationsTable
   ];

// CREATE OUR TEMP TABLES
foreach ($sql as $key => $value ) {
    $stmt = $mysqli->prepare("DROP TABLE ".$key.";");
    if( $stmt->execute() ) {
        echo "Table: ".$key." dropped.\n";
    }
    $stmt = $mysqli->prepare($value);
    if( $stmt->execute() ) {
        echo "Table: ".$key." created.\n";
    } else {
        echo "Failed to create table: ".$key."\n";
        exit();
    }
}

$nFeedsProcessed = 0;
$nFeedsToProcess = -1;

// GET THE DATA FROM XIVELY
for( $page = 0; $nFeedsProcessed < $nFeedsToProcess || $nFeedsToProcess==-1; $page ++ ) {

   echo "Getting datastreams";

    $results = getFeedData($xivelyUser,$page);
    $count = count($results->results);
    $nFeedsToProcess = $results->totalResults;

    if( $count == 0 ) break;

    $insertFeedStmt = $mysqli->prepare("INSERT INTO FEEDS_TEMP (FEED_ID,TITLE,DEVICE_SERIAL,PRIVATE,FEED_URL,CREATED,UPDATED,LOCATION_LAT,LOCATION_LONG ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $insertFeedTagStmt = $mysqli->prepare("INSERT INTO FEED_TAG_TEMP (FEED_ID,TAG ) VALUES ( ?, ? )");
    $insertDSTagStmt = $mysqli->prepare("INSERT INTO DATASTREAM_TAG_TEMP (DS_UID,TAG ) VALUES ( ?, ? )");
    $insertDatastreamStmt = $mysqli->prepare("INSERT INTO DATASTREAMS_TEMP (DATASTREAM_ID,FEED_ID,UNITS,SYMBOL,UID) VALUES (?,?,?,?,?)");

    foreach( $results->results as $feed) {
       $id = $feed->id;
       $title= $feed->title;
       $private= $feed->private == 'true' ? 1 : 0;
       $created=$feed->created;
       $updated=$feed->updated;
       $feedUrl = $feed->feed;
       $deviceSerial = property_exists($feed, 'device_serial') ? $feed->device_serial : '';
       $deviceLocationLat  = property_exists($feed,"location") && property_exists($feed->location,"lat") ? $feed->location->lat : 'NULL';
       $deviceLocationLong = property_exists($feed,"location") && property_exists($feed->location,"lon") ? $feed->location->lon : 'NULL';

       $insertFeedStmt->bind_param('sssisssdd', $id, $title, $deviceSerial, $private, $feedUrl, $created, $updated, $deviceLocationLat, $deviceLocationLong);
       $insertFeedStmt->execute();
       $nFeedsProcessed++;

       if( property_exists($feed,'tags') ) {
           foreach( $feed->tags as $tag ) {
              $insertFeedTagStmt->bind_param('ss', $id, $tag);
              $insertFeedTagStmt->execute();
           }
       }
       if( property_exists($feed,'datastreams') ) {
          foreach( $feed->datastreams as $ds ) {
             $dsId = $ds->id;
             $dsUID= $id.'!'.$dsId;
             $dsUnitSymbol = '';
             $dsUnit =  property_exists($ds,"unit") && property_exists($ds->unit,'label') ? $ds->unit->label : '';
             $insertDatastreamStmt->bind_param('sssss',$dsId,$id,$dsUnit,$dsUnitSymbol,$dsUID);
             $insertDatastreamStmt->execute();
             echo ".";
             if( property_exists($ds,'tags') ) {
                foreach( $ds->tags as $tag ) {
                   $insertDSTagStmt->bind_param('ss', $dsUID, $tag);
                   if( !$insertDSTagStmt->execute() ) {
                       echo "\nINFO: found duplicate tag on ".$dsUID." tag:".$tag."\n";
                   }
                }
             }
          }
       }
    }
}

// Read in the schools.csv data into SCHOOL_LOCATIONS_TEMP

echo "\n\nProcessing /usr/share/schools.csv\n";
$header = NULL;   //NAME,LAT,LONG,ELEV,ZIP
$insertSchoolStmt = $mysqli->prepare("INSERT INTO SCHOOL_LOCATIONS_TEMP (NAME,LATITUDE,LONGITUDE,ELEVATION,ZIP) VALUES (?,?,?,?,?)");
if (file_exists($schoolsCsvFile) && is_readable($schoolsCsvFile) && ($handle = fopen($schoolsCsvFile, 'r')) !== FALSE) {
    while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
        if(!$header) {
            $header = $row;
        } else {
            $data = array_combine($header, $row);
            $insertSchoolStmt->bind_param('sddds',$data['NAME'],$data['LAT'],$data['LONG'],$data['ELEV'],$data['ZIP']);
            $insertSchoolStmt->execute();
            echo "Added: ".$data['NAME']."\n";
        }
    }
    fclose($handle);
    echo "Done.\n\n";
} else {
    die("No schools.csv file found");
}

// DO A ROUND-ROBIN RENAME TO GET NEW TABLES INTO POSITION - make a single RENAME so it is atomic.
$renameSql = "RENAME TABLE ";
foreach ($sql as $key => $value ) {
    $root = str_replace('_TEMP','',$key);
    if( $mysqli->query("SELECT 1 FROM ".$root) ) {
        $renameSql .= $root." TO ".$root."_OLD,";
    }
    $renameSql .= $root."_TEMP TO ".$root.",";
}
$renameSql =  substr($renameSql, 0, -1);
$stmt = $mysqli->prepare($renameSql);
if( $stmt->execute() ) {
    echo "Tables redeployed.\n";
} else {
    echo "Failed to do round-robin rename.\n";
}

// FINALLY drop the _OLD table if it exists
foreach ($sql as $key => $value ) {
    $root = str_replace('_TEMP','',$key);
    $stmt = $mysqli->prepare("DROP TABLE ".$root."_OLD");
    if( $stmt->execute() ) {
        echo "Previous table: ".$root." dropped.\n";
    }
}

$mysqli->close();

?>
