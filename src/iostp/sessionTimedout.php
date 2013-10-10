<?php
require_once("userAdmin/models/config.php");
if (!securePage($_SERVER['PHP_SELF'])){die();}

//Log the user out
if(isUserLoggedIn())
{
    trigger_error("Logging user '".$loggedInUser->username."' out.",E_USER_NOTICE);
	$loggedInUser->userLogOut();
} else {
    trigger_error("User '".$loggedInUser->username."' not logged in", E_USER_ERROR);
}

?>
<html>
<body>
Session has timed out, please relogin
</body>
</html>