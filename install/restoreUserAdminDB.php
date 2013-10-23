#!/opt/bitnami/php/bin/php  -q
<?php

require_once("./constants.php");

$longopts  = array(
    "backup:",       // Required where the backup is
    "optional::",    // Optional value
    "dummyOpt1",     // No value
    "dummyOpt2",     // No value
);


$OPTIONS = getopt("r:",$longopts);

$htdocs=false;
if( isset($OPTIONS["backup"]) ) {
   $backup = $OPTIONS["backup"];
   system("mysql $db_name -u $db_user -p".$db_pass." < ".$backup);
} else {
   echo "Usage:  restoreUserAdminDB.php --backup=[backup.sql]\n";
   exit();
}

?>
