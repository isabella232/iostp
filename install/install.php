#!/opt/bitnami/php/bin/php -q
<?php

require_once("constants.php");
require_once("functions.php");

function startsWith($haystack, $needle)
{
    return !strncmp($haystack, $needle, strlen($needle));
}


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



if( startsWith($htdocs,"/opt/bitnami") ) {  // we only need .htaccess when running in our sandboxes
   echo "Production installation, no need for ".$htdocs."/.htaccess - deleting...\n";
   unlink( glob($htdocs."/{,.}*", GLOB_BRACE);
}

$result = file_get_contents("http://".$webhost_name.":".$webhost_port."/userAdmin/install/index.php?install=true");

if(!$result) {
   echo "I don't think your webserver has started up yet.";
} else {

    if( strpos($result,"Connection Failed") !== false ) {
       echo "You will need to create a database\nEnter the following on the command line:\n\nprompt> ..if running a local sandbox, issue:  use_lampstack\nprompt> mysql -u ".$db_user." -p".$db_pass."\nmysql> create database ".$db_name.";\nmysql> quit;\n\nThen re-run this install script.\n";
    } else {
      delete($userAdminDir."/install");
    }

    recursive_copy("../src/iostp", $htdocs);

    // Xively plugin specific-------------------------------------------------
    copy("constants.php",$htdocs."/constants.php");
    //------------------------------------------------------------------------

    echo "creating /usr/bin/freshenData.php\n";
    $fp = fopen("/usr/bin/freshenData.php", "a+");
    fwrite($fp, "#!/usr/bin/php -q\n");
    $header = file_get_contents("./constants.php");
    fwrite($fp, $header."\n");
    $script = file_get_contents("../freshenData.php");
    fwrite($fp, $script);
    fclose($fp);

    if( !file_exists("/usr/share/iostp")) mkdir("/usr/share/iostp");

    copy("../schools.csv", "/usr/share/iostp/schools.csv");
}
?>

