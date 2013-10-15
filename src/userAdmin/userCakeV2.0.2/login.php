<?php
/*
UserCake Version: 2.0.2
http://usercake.com
*/

require_once("models/config.php");
if (!securePage($_SERVER['PHP_SELF'])){die();}

//Prevent the user visiting the logged in page if he/she is already logged in
if(isUserLoggedIn()) { header("Location: /iostp_portal.php"); die(); }

$randomString = rand().time();

//Forms posted
if(!empty($_POST))
{
	$errors = array();
	$randomString = trim($_POST["randomString"]);
	$username = sanitize(trim($_POST["un_".$randomString]));
	$password = trim($_POST["pw_".$randomString]);
	
	//Perform some validation
	//Feel free to edit / change as required
	if($username == "")
	{
		$errors[] = lang("ACCOUNT_SPECIFY_USERNAME");
	}
	if($password == "")
	{
		$errors[] = lang("ACCOUNT_SPECIFY_PASSWORD");
	}

	if(count($errors) == 0)
	{
		//A security note here, never tell the user which credential was incorrect
		if(!usernameExists($username))
		{
			$errors[] = lang("ACCOUNT_USER_OR_PASS_INVALID");
		}
		else
		{
			$userdetails = fetchUserDetails($username);
			//See if the user's account is activated
			if($userdetails["active"]==0)
			{
				$errors[] = lang("ACCOUNT_INACTIVE");
			}
			else
			{
				//Hash the password and use the salt from the database to compare the password.
				$entered_pass = generateHash($password,$userdetails["password"]);
				
				if($entered_pass != $userdetails["password"])
				{
					//Again, we know the password is at fault here, but lets not give away the combination incase of someone bruteforcing
					$errors[] = lang("ACCOUNT_USER_OR_PASS_INVALID");
				}
				else
				{
					//Passwords match! we're good to go'
					
					//Construct a new logged in user object
					//Transfer some db data to the session object
					$loggedInUser = new loggedInUser();
					$loggedInUser->email = $userdetails["email"];
					$loggedInUser->user_id = $userdetails["id"];
					$loggedInUser->hash_pw = $userdetails["password"];
					$loggedInUser->title = $userdetails["title"];
					$loggedInUser->displayname = $userdetails["display_name"];
					$loggedInUser->username = $userdetails["user_name"];
					
					//Update last sign in
					$loggedInUser->updateLastSignIn();
					$_SESSION["userCakeUser"] = $loggedInUser;
					
					//Redirect to user account page
					header("Location: /iostp_portal.php");
					die();
				}
			}
		}
	}
}

require_once("models/header.php");

echo "
<body>
<div id='wrapper'>
<div id='top'><div id='logo'></div></div>
<div id='content'>
<h1>UserCake</h1>
<h2>Login</h2>
<div id='left-nav'>";

include("left-nav.php");

echo "
</div>
<div id='main'>";

echo resultBlock($errors,$successes);

//NOTE: we don't specify the input type='password' for the password field, we set it later via javascript.
//      This is needed to circumvent firefox from remembering the password
//      Note also the use of <span>U</span> and <span>P</span> - this is also to circumvent chrome from recognizing
//      a username/password combo and remembering the form values.

echo "
<div id='regbox'>
<form name='login' action='".$_SERVER['PHP_SELF']."' method='post' autocomplete='off'>
<p>
<label><span>U</span>sername:</label>
<input type='text' name='un_".$randomString."' />
</p>
<p>
<label><span>P</span>assword:</label>
<input name='pw_".$randomString."' />
<input type='hidden' name='randomString' value='".$randomString."'/>

</p>
<p>
<label>&nbsp;</label>
<input type='submit' value='Login' class='submit' />
<input type='button' value='Sign Up' onclick='window.location.href = \"/userAdmin/register.php\";'/>
</p>
</form>
</div>
</div>
<div id='bottom'></div>
</div>
<script language='javascript'>
  setTimeout(function() {
      document.forms['login']['pw_".$randomString."'].value='';
      document.forms['login']['pw_".$randomString."'].type='password';
      document.forms['login']['un_".$randomString."'].value='';
      },200);
</script>
</body>
</html>";

?>
