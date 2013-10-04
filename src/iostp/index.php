<!DOCTYPE html>
<?php
/*
UserCake Version: 2.0.1
http://usercake.com
*/
require_once("userAdmin/models/config.php");
if (!securePage($_SERVER['PHP_SELF'])){die("Authentication error");}
require_once("userAdmin/models/header.php");
require_once("./constants.php");

?>
<!DOCTYPE html>
<!--[if IE 8]> <html class="no-js lt-ie9" lang="en" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en" > <!--<![endif]-->


<!--
	Original incarnation was as 'channel-viz' 
	Prepared by Paul Cheek
	(c) 2013 LogMeIn, Inc.
-->

<head>

	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width" />
	<title>Visualising Xively Feeds with D3</title>

	<link type="text/css" rel="stylesheet" href="css/normalize.css" />
	<link type="text/css" rel="stylesheet" href="css/foundation.min.css" />
	<link type="text/css" rel="stylesheet" href="css/start/jquery-ui-1.9.2.custom.css"/>

    <!-- add a style sheet for each plugin -->
	<link type="text/css" rel="stylesheet" href="plugins/xively/xivelyKit.css"/>
	<link type="text/css" rel="stylesheet" href="plugins/xively/rickshaw.min.css"/>

	<script type="text/javascript" src="js/jquery-1.8.3.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.js"></script>
    <script type="text/javascript" src="js/jquery-ui-1.9.2.custom.js"></script>
	<script type="text/javascript" src="js/custom.modernizr.js"></script>
	<script type="text/javascript" src="plugins/xively/xivelyjs-1.0.0.min.js"></script>
	<script type="text/javascript" src="js/d3.v2.js"></script>
	<script type="text/javascript" src="plugins/xively/rickshaw.min.js"></script>
    <script type="text/javascript" src="js/iostpFramework.js"></script>
    <script type="text/javascript" src="plugins/xively/jquery-timepickerAddon.js"></script>
    <script type="text/javascript" src="js/utils.js"></script>


    <!--
       One of these for each our observation kit types.
       Eventually, we can setup some kind of registration process where teachers can create their own software and
       register them with the system and make them available to everyone or particular users...just set up php to
       inject a new javascript tag here for every appropriate kit module (it may be dependent on student or teacher id.
     -->
    <script type="text/javascript" src="plugins/xively/xivelyKit.js"></script>
    <script type="text/javascript" src="js/exampleKit.js"></script>


    <script>
       function addObservationKit() {
          var kitName = $("#kit_name").val();
          var kitType = $("#kit_types input:checked")[0].value;
          var kit = IOSTP.getInstance().getKitOfType(kitType);
          kit.setName(kitName);
          addTab(kit);
       }
       function addTab(kit) {
           $tabs = $('#tabs').tabs({closable: true});
           var ul = $('#tabs .tabs-ul');
           var divId = "observationKit-" + kit.getId();
           var li = $( tabTemplate.replace( /#\{href}/g, "#"+divId).replace( /#\{label\}/g, kit.getName() ) );
           ul.append(li);
           var div = $("<div></div>");
           div.attr("id",divId);
           div.append(kit.render());
           $tabs.append(div);
           kit.config();
           $tabs.tabs("refresh");
           $tabs.tabs("select", $tabs.tabs("length")-1);
           IOSTP.getInstance().addKit(kit);
       }

       $(function() {
           IOSTP.getInstance().configure("<?php
                echo '[]'; // inject configuration data for this user here.
                           // Each element of the array is a JSON string: {type: typeString, name: nameString, configData:"data here"}
                ?>");

           tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>";

           IOSTP.getInstance().getUserConfig(false).forEach(function (kit) {
               addTab(kit);
           });

           //setup add new observation kit dialog
           var first = true;
           IOSTP.getInstance().getKitTypes().forEach( function(kitType) {
               $("#kit_types").append("<input type='radio' name='kit_type' value='"+kitType+"' "+(first?"checked":"")+">"+kitType+"</input><br/>");
               first = false;
           });

           var addObservationKitDialog = $( "#dialog" ).dialog({
              autoOpen: false,
              modal: true,
              buttons: {
                Add: function() {
                  addObservationKit();
                  $( this ).dialog( "close" );
                },
                Cancel: function() {
                  $( this ).dialog( "close" );
                }
              },
              close: function() {
  //              form[ 0 ].reset();
              }
           });
           // addTab form: calls addTab function on submit and closes the dialog
//           var form = addObservationKitDialog.find( "form" ).submit(function( event ) {
//                  addObservationKit();
//                  alert("submit btn clicked");
//              dialog.dialog( "close" );
//              event.preventDefault();
//           });

           $('#addTab').click(function(){
               addObservationKitDialog.dialog("open");
               return false;
           });

           // close icon: removing the tab on click
           $( document ).on( "click","#tabs span.ui-icon-close", function() {
             var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
             var i = $("#"+panelId).index();
             IOSTP.getInstance().removeKit(i);
             var delCurSelTab = $("#tabs").tabs("option","selected") == i-1;
             $( "#" + panelId ).remove();
             $tabs.tabs( "refresh" );
             if(delCurSelTab) $tabs.tabs("select", i-1);
           });
       });
    </script>
	<style type="text/css">
		body, html {
			max-width: 100%;
			min-height: 100%;
			overflow-x: hidden;
			background: #666 url(img/loading.gif) center center no-repeat;
		}

		.hidden {
			display: none;
		}


        #dialog label, #dialog input { display:inline; }
        #dialog label { margin-top: 0.5em; }
        #kit_types {border: 1px; border-style:solid; border-color: light-gray; }

	</style>
	<style>
	body{
		//font: 62.5% "Trebuchet MS", sans-serif;
		margin: 0px;   //WARNING: if you use a non-zero margin the dialogs don't drag properly.
	}
	#dialog-link {
		padding: .4em 1em .4em 20px;
		text-decoration: none;
		position: relative;
	}
	#dialog-link span.ui-icon {
		margin: 0 5px 0 0;
		position: absolute;
		left: .2em;
		top: 50%;
		margin-top: -8px;
	}
	#icons {
		margin: 0;
		padding: 0;
	}
	#icons li {
		margin: 2px;
		position: relative;
		padding: 4px 0;
		cursor: pointer;
		float: left;
		list-style: none;
	}
	#icons span.ui-icon {
		float: left;
		margin: 0 4px;
	}
	.fakewindowcontain .ui-widget-overlay {
		position: absolute;
	}
	</style>

</head>
<body>
    <div class="hidden">
      <form>
        <input type="hidden" id="username" value="<?php echo $loggedInUser->username;?>"/>
        <input type="hidden" id="token"    value="<?php echo md5($loggedInUser->hash_pw);?>"/>
      </form>
    </div>
    <!-- Header -->
	<div style="background: #101C24;">
		<div class="row">
			<div class="large-12 columns">
				<h1 style="color: #FFF; text-shadow: 0px 1px 0px #000;">
			          <?php echo $productName; ?>
                      <a href="/userAdmin/logout.php" class="hide-for-medium hide-for-small"><img style="position: absolute; top: 10%; right: 0; border: 0;" width=70 height=70 src="img/logoutBtn.png" alt="Logout"></a>
                </h1>
			</div>
		</div>
	</div>



    <div id="dialog" title="New Observation Kit">
      <form>
        <fieldset class="ui-helper-reset">
          <label for="kit_name">What do you want to call it?</label>
          <input type="text" name="kit_name" id="kit_name" value="" class="ui-widget-content ui-corner-all" />
          <label for="kit_types">What kind of kit?</label>
          <div id="kit_types"></div>
        </fieldset>
      </form>
    </div>

    <div style="margin:20px 0">
                <a class="ui-state-default ui-corner-all" id="addTab" href="#" style="padding:6px 6px 6px 17px;text-decoration:none;position:relative">
                    <span class="ui-icon ui-icon-plus" style="position:absolute;top:4px;left:1px"></span>
                    Add a new Observation Kit
                </a>
            </div>
    <!-- Tabs -->
    <div id="tabs">
        <ul class="tabs-ul">
        </ul>
    </div>




	<!-- Footer -->
	<div style="background: #0D1B23;">
		<div style="padding: 15px;">
			<div class="row">
				<div class="large-8 columns" style="color: rgb(81, 98, 111); padding-top: 10px; padding-bottom: 10px;">
					<small>
						This page was created with open-source tools, and uses data from <a style="font-weight: bold; color: rgb(81, 98, 111);" href="https://xively.com">Xively</a>. Read the <a style="font-weight: bold; color: rgb(81, 98, 111);" href="#">Tutorial (coming soon)</a> on how to make your own.
					</small>
				</div>
				<div class="large-4 columns" style="color: rgb(81, 98, 111); padding-top: 10px; padding-bottom: 10px;">
					<small>
						<a style="color: rgb(81, 98, 111);" href="https://github.com/xively/channel-viz/blob/master/LICENSE.md">This library is Open Source, under the BSD 3-Clause license.</a>
					</small>
				</div>
			</div>
		</div>
	</div>





    <!-- TODO:  keep these -->
	<!-- Modals -->
	<div id="loadingData" class="reveal-modal small text-center hidden">
		<br/><br/><h2 class="subheader">Loading...</h2><br/><br/>
	</div>

	<script>
		document.write('<script src=' +
		('__proto__' in {} ? 'js/zepto' : 'js/jquery') +
		'.js><\/script>')
	</script>

	<script src="js/foundation.min.js"></script>
	<script src="follows.js"></script>

</body>
</html>
