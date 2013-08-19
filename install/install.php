#!/opt/bitnami/php/bin/php -q
<?php

require_once("constants.php");
require_once("functions.php");

$longopts  = array(
    "htdocs:",         // Required where htdocs root is 
    "optional::",    // Optional value
    "dummyOpt1",     // No value
    "dummyOpt2",     // No value
);

$OPTIONS = getopt("r:",$longopts);

$htdocs=false;
if( $OPTIONS["htdocs"] ) {
   $htdocs = $OPTIONS["htdocs"];
} else if( $OPTIONS["r"] ) {
   $htdocs = $OPTIONS["r"];
}

if( !$htdocs ) {
   echo "Usage:  install.php --htdocs=[rootdir of htdocs]\n";
   exit();
}

$userCakeDir = "../src/userAdmin/userCakeV2.0.2";

$userAdminDir = $htdocs."/userAdmin";

if( is_dir($userAdminDir) ) {
   delete($userAdminDir);
}

//mkdir( $userAdminDir ) || die("Unable to create userAdmin dir in stack");
 
recursive_copy($userCakeDir, $userAdminDir);

$result = file_get_contents("http://".$webhost_name.":".$webhost_port."/userAdmin/install/index.php?install=true");

if( strpos($result,"Connection Failed") !== false ) {
   echo "You will need to create a database\nEnter the following on the command line:\n\nprompt> ".$stackDir."/use_lampstack\nprompt> mysql -u ".$db_user." -p".$db_pass."\nmysql> create database ".$db_name.";\nmysql> quit;\n\nThen re-run this install script.\n";
} else {
  delete($userAdminDir."/install");
} 
?>

