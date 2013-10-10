<?php
	if(isset($_SESSION["userCakeUser"]))
	{
		$_SESSION["userCakeUser"] = NULL;
		unset($_SESSION["userCakeUser"]);
	}
?>
<html>
<body>
Session has timed out, please relogin
</body>
</html>