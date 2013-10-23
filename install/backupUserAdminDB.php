#!/opt/bitnami/php/bin/php -q
<?php

require_once("./constants.php");

system("mysql $db_name -u $db_user -p".$db_pass." -e 'show tables like \"uc_%\"' | grep -v Tables_in | xargs mysqldump $db_name -u $db_user -p".$db_pass);

?>
