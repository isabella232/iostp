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



if( ! startsWith($htdocs,"/opt/bitnami") ) {  // we only need .htaccess when running in our sandboxes
   echo "Sandbox installation.  We will create ".$htdocs."/.htaccess   ...\n";
   $fp = fopen($htdocs."/.htaccess","w");
   fwrite($fp,"ModPagespeed off\n");
   fclose($fp);
}

$apacheWebServer = "http://localhost:80/";  //production
if( ! startsWith($htdocs,"/opt/bitnami") ) {  // Sandbox
    $apacheWebServer = "http://localhost:8083/";
}
$result = file_get_contents($apacheWebServer."userAdmin/install/index.php?install=true");

if(!$result) {
   echo "Your webserver has not started @ ".$apacheWebServer."\n";
   echo "We cannot continue the installation.\n";
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

    if( startsWith($htdocs,"/opt/bitnami") ) {  // we create freshenData.php in /usr/bin for production (since we are running as sudo)
        echo "Production installation.... creating /usr/bin/freshenData.php      schools.csv file is in /usr/share/iostp/schools.csv\n";
        $fp = fopen("/usr/bin/freshenData.php", "w");
        fwrite($fp, "#!/usr/bin/php -q\n");
        fwrite($fp, "<?php \$schoolsCsvFile = \"/usr/share/iostp/schools.csv\"; ?>");
        copy("../schools.csv", "/usr/share/iostp/schools.csv");
        echo "Creating a crontab entry in /etc/cron.d/iostp\n";
        $cronFp = fopen("/etc/cron.d/iostp","w");
        fwrite($cronFp,"*/5 * * * * xively /usr/bin/freshenData.php");
        fclose($cronFp);
        system("chmod u+x /usr/bin/freshenData.php");
    } else {
        echo "Sandbox installation, creating /tmp/freshenData.php     schools.csv file is in /tmp/schools.csv\n";
        $fp = fopen("/tmp/freshenData.php","w");
        fwrite($fp, "#!/usr/bin/php -q\n");
        fwrite($fp, "<?php \$schoolsCsvFile = \"/tmp/schools.csv\"; ?>");
        copy("../schools.csv", "/tmp/schools.csv");
    }
    $header = file_get_contents("./constants.php");
    fwrite($fp, $header."\n");
    $script = file_get_contents("../freshenData.php");
    fwrite($fp, $script);
    fclose($fp);

    if( !file_exists("/usr/share/iostp")) mkdir("/usr/share/iostp");

}
?>

