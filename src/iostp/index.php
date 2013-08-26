<?php 
/*
UserCake Version: 2.0.1
http://usercake.com
*/
require_once("userAdmin/models/config.php");
if (!securePage($_SERVER['PHP_SELF'])){die("Authentication error");}
require_once("userAdmin/models/header.php");
require_once("include/constants.php");

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
	<link type="text/css" rel="stylesheet" href="css/rickshaw.min.css"/>
	<link type="text/css" rel="stylesheet" href="css/start/jquery-ui-1.9.2.custom.css"/>

	<script type="text/javascript" src="js/jquery-1.8.3.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.js"></script>
    <script type="text/javascript" src="js/jquery-ui-1.9.2.custom.js"></script>
	<script type="text/javascript" src="js/custom.modernizr.js"></script>
	<script type="text/javascript" src="js/xivelyjs-1.0.0.min.js"></script>
	<script type="text/javascript" src="js/d3.v2.js"></script>
	<script type="text/javascript" src="js/rickshaw.min.js"></script>

    <script>
       $(function() {
               tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>";
               var keywords = ["Just a tab label","Long string","Short","Very very long string","tab","New tab","This is a new tab"];
               try {
          	      $tabs = $('#tabs').tabs({scrollable:true, closable: true});
         	   } catch(e) {
         	      window.alert("badstuff");
         	   }

               $('#addTab').click(function(){
                    var label = keywords[Math.floor(Math.random()*keywords.length)]
                    content = 'This is the content for the '+label+'<br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque hendrerit vulputate porttitor. Fusce purus leo, faucibus a sagittis congue, molestie tempus felis. Donec convallis semper enim, varius sagittis eros imperdiet in. Vivamus semper sem at metus mattis a aliquam neque ornare. Proin sed semper lacus.';
                    rnd = 'tab-' + Math.floor(Math.random()*10000);
                    try {
                        li = $( tabTemplate.replace( /#\{href\}/g, "#" + rnd ).replace( /#\{label\}/g, "label-"+rnd ) );
                        $tabs.find("ul").append(li);
                        $tabs.append("<div id='"+rnd+"'>new content here: "+content+"</div>");
                        $tabs.tabs("refresh");
                        $tabs.tabs("select", $tabs.children().length-2);
                    } catch(e) {
                       window.alert("error: "+e);
                    }
//                    setTimeout(function(){
//                       try {
//                          $tabs.append(jQuery('#'+rnd));
//                       } catch(e) { window.alert(e); }
//                    },1000)


                    return false;
		       });

               // close icon: removing the tab on click
               $( document ).on( "click","#tabs span.ui-icon-close", function() {
                 var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
                 var i = $("#"+panelId).index();
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

		#xivelyContent {
			background: #fff;
			box-shadow: inset 0px 0px 100px #f0f0f0;
		}

			.graphWrapper {
				-moz-box-shadow:inset 0px 0px 50px 25px #ffffff;
				-webkit-box-shadow:inset 0px 0px 50px 25px #ffffff;
				box-shadow:inset 0px 0px 50px 25px #ffffff;
				background-image: linear-gradient(bottom, rgb(255,255,255) 30%, rgb(245,245,245) 97%);
				background-image: -o-linear-gradient(bottom, rgb(255,255,255) 30%, rgb(245,245,245) 97%);
				background-image: -moz-linear-gradient(bottom, rgb(255,255,255) 30%, rgb(245,245,245) 97%);
				background-image: -webkit-linear-gradient(bottom, rgb(255,255,255) 30%, rgb(245,245,245) 97%);
				background-image: -ms-linear-gradient(bottom, rgb(255,255,255) 30%, rgb(245,245,245) 97%);
				background-image: -webkit-gradient(
					linear,
					left bottom,
					left top,
					color-stop(0.3, rgb(255,255,255)),
					color-stop(0.97, rgb(245,245,245))
				);
			}
	</style>
	<style>
	body{
		//font: 62.5% "Trebuchet MS", sans-serif;
		margin: 100px;
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

<div style="margin:20px 0">
			<a class="ui-state-default ui-corner-all" id="addTab" href="#" style="padding:6px 6px 6px 17px;text-decoration:none;position:relative">
				<span class="ui-icon ui-icon-plus" style="position:absolute;top:4px;left:1px"></span>
				Add new tab
			</a>
		</div>
<!-- Tabs -->
<div id="tabs">
	<ul>
		<li><a href="#tabs-1">First</a></li>
		<li><a href="#tabs-2">Second</a></li>
		<li><a href="#tabs-3">Third</a></li>
	</ul>
	<div id="tabs-1">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</div>
	<div id="tabs-2">Phasellus mattis tincidunt nibh. Cras orci urna, blandit id, pretium vel, aliquet ornare, felis. Maecenas scelerisque sem non nisl. Fusce sed lorem in enim dictum bibendum.</div>
	<div id="tabs-3">Nam dui erat, auctor a, dignissim quis, sollicitudin eu, felis. Pellentesque nisi urna, interdum eget, sagittis et, consequat vestibulum, lacus. Mauris porttitor ullamcorper augue.</div>
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
	<!-- Form -->
	<div id="form" style="background: #F0F0F0; border-bottom: 1px solid #CCC; padding: 25px; padding-bottom: 15px;">
		<div class="row">
			<div class="large-5 columns">
				<div class="row collapse">
					<div class="small-3 columns">
						<span class="prefix">API Key</span>
					</div>
					<div class="small-9 columns">
						<input type="text" placeholder="Valid Master API Key" id="apiKeyInput">
					</div>
				</div>
			</div>
			<div class="large-5 columns">
				<div class="row collapse">
					<div class="small-3 columns">
						<span class="prefix">Feed ID's</span>
					</div>
					<div class="small-9 columns">
						<input type="text" placeholder="Comma separated" id="feedsInput">
					</div>
				</div>
			</div>
			<div class="large-2 columns">
				<a id="setFeeds" href="#" data-reveal-id="secondModal" class="secondary button small expand">
					Visualize &raquo;
				</a>
			</div>
		</div>
	</div>
	<!-- Page Content -->
	<div id="xivelyContent" style="position: relative;">
		<a href="https://github.com/xively/channel-viz" class="hide-for-medium hide-for-small"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" alt="Fork me on GitHub"></a>
		<div id="welcome">
			<div class="row">
				<div class="large-1 columns">&nbsp;</div>
				<div class="large-10 columns text-center">
					<br/><br/><br/><br/><br/><br/><br/>
					<h1 class="subheader" style="text-align: center;">Welcome to Xively!</h1>
					<p>This page is an example of just one of many ways you can visualise your data on Xively.<br/>It was created with open-source tools, and reads data from Xively with the Xively JavaScript library.</p>
					<p>Read the tutorial <i>(comming soon)</i> on how to make and customise your own.</p>
				</div>
				<div class="large-1 columns">&nbsp;</div>
			</div>
			<div class="row">
				<div class="large-12 columns">
					<br/><br/><br/><br/><hr/><br/><br/><br/><br/>
					<div class="row">
						<div class="large-4 columns">
							<div class="hero panel">
								<p style="font-size: 14px;">To use this page, enter a Master API Key from your Xively account, and a list of the Feeds that you would like to display, into the forms above. You can view multiple Feeds by separating them with a comma, and select individual channels with an exclamation mark.</p>
							</div>
						</div>
						<div class="large-8 columns">
							<h4 class="subheader">Examples</h4>
							<hr/>
							<div class="row">
								<div class="large-4 columns">
									<strong style="text-transform: uppercase;">Multiple Feeds</strong>
								</div>
								<div class="large-8 columns">
									<pre><em>61916,61916</em></pre>
								</div>
							</div>
							<hr/>
							<div class="row">
								<div class="large-4 columns">
									<strong style="text-transform: uppercase;">Individual Channels</strong><br/>
									<small>separate with exclamation marks</small>
								</div>
								<div class="large-8 columns">
									<pre><em>61916!random5!random3600</em></pre><br/>
									<pre><em>61916!random5,61916!random3600</em></pre>
								</div>
							</div>
						</div>
					</div>
					<br/><br/><br/><br/><hr/><br/><br/><br/><br/>
				</div>
			</div>
			<div class="row">
				<div class="large-2 columns">&nbsp;</div>
				<div class="large-8 columns">
					<h5 class="subheader text-center">To begin visualizing data, enter your Xively Master API key above!</h5>
					<br/><br/><br/><br/><br/><br/><br/>
				</div>
				<div class="large-2 columns">&nbsp;</div>
			</div>
		</div>
		<div id="invalidApiKey" class="hidden">
			<div class="row">
				<div class="large-2 columns">&nbsp;</div>
				<div class="large-8 columns">
					<br/><br/><br/>
					<h1 class="subheader" style="text-align: center;">Uh oh!</h1>
					<h2 class="subheader" style="text-align: center;">Your API key is invalid!</h2>
					<p>Please try again or generate a new key on Xively. It is important to keep in mind that this API key must be a global API key in order to work in this example. Using an application-specific API key will cause this example to malfunction.</p>

					<a href="#" data-reveal-id="exampleModal" class="openStart radius secondary button expand">Click here to test a new API Key...</a>
					<br/><br/><br/>
				</div>
				<div class="large-2 columns">&nbsp;</div>
			</div>
		</div>
		<div id="validApiKey" class="hidden">
			<div class="row">
				<div class="large-2 columns">&nbsp;</div>
				<div class="large-8 columns">
					<br/><br/><br/>
					<br/><br/><br/>
					<h1 class="subheader" style="text-align: center;">Connected to Xively!</h1>
					<h5 class="subheader text-center">To begin visualizing data, enter your Xively feed information above...</h5>
				</div>
				<div class="large-2 columns">&nbsp;</div>
			</div>
			<div class="row">
				<div class="large-12 columns">
					<br/><br/><br/><br/><hr/><br/><br/><br/><br/>
					<div class="row">
						<div class="large-4 columns">
							<div class="hero panel">
								<p style="font-size: 14px;">To use this page, enter a Master API Key from your Xively account, and a list of the Feeds that you would like to display, into the forms above. You can view multiple Feeds by separating them with a comma, and select individual channels with an exclamation mark.</p>
							</div>
						</div>
						<div class="large-8 columns">
							<h4 class="subheader">Examples</h4>
							<hr/>
							<div class="row">
								<div class="large-4 columns">
									<strong style="text-transform: uppercase;">Multiple Feeds</strong>
								</div>
								<div class="large-8 columns">
									<pre><em>61916,61916</em></pre>
								</div>
							</div>
							<hr/>
							<div class="row">
								<div class="large-4 columns">
									<strong style="text-transform: uppercase;">Individual Channels</strong><br/>
									<small>separate with exclamation marks</small>
								</div>
								<div class="large-8 columns">
									<pre><em>61916!random5!random3600</em></pre><br/>
									<pre><em>61916!random5,61916!random3600</em></pre>
								</div>
							</div>
						</div>
					</div>
					<br/><br/><br/><br/>
					<br/><br/><br/><br/>
					<br/><br/><br/><br/>
				</div>
			</div>
		</div>
		<div id="feeds">
			<div class="feed hidden" id="exampleFeedNotFound" style="line-height: 25px; padding-top: 25px;">
				<div class="row title">
					<div class="large-12 columns">
						<h2 class="subheader value">Loading Feed Data...</h2>

						<div class="alert alert-box no-info">
							Sorry, this feed could not be found.
						</div>
					</div>
				</div>
			</div>
			<div class="feed hidden" id="exampleFeed" style="line-height: 25px; padding-top: 25px;">
				<div class="row title">
					<div class="large-12 columns">
						<h2 class="subheader value">Loading Feed Data...</h2>
					</div>
				</div>
				<div class="row">
					<div class="large-7 columns">
						<h4 class="subheader">Meta</h4>
						<div class="row id">
							<div class="large-4 columns"><strong>ID</strong></div>
							<div class="large-8 columns value"></div>
						</div>
						<div class="row description">
							<div class="large-4 columns"><strong>Description</strong></div>
							<div class="large-8 columns value"></div>
						</div>
						<div class="row link">
							<div class="large-4 columns"><strong>Link</strong></div>
							<div class="large-8 columns value"><a href="#">View on Xively &raquo;</a></div>
						</div>
						<div class="row creator">
							<div class="large-4 columns"><strong>Creator</strong></div>
							<div class="large-8 columns value"></div>
						</div>
						<div class="row updated">
							<div class="large-4 columns"><strong>Updated</strong></div>
							<div class="large-8 columns value"></div>
						</div>
						<div class="row tags">
							<div class="large-4 columns"><strong>Tags</strong></div>
							<div class="large-8 columns value"></div>
						</div>
					</div>
					<div class="large-5 columns">
						<h4 class="subheader">Location</h4>
						<div class="alert alert-box hidden no-location">
							Sorry, no location information is available.
						</div>
						<div class="row location-name">
							<div class="large-4 columns"><strong>Name</strong></div>
							<div class="large-8 columns value"></div>
						</div>
						<div class="row latitude">
							<div class="large-4 columns"><strong>Latitude</strong></div>
							<div class="large-8 columns value"></div>
						</div>
						<div class="row longitude">
							<div class="large-4 columns"><strong>Longitude</strong></div>
							<div class="large-8 columns value"></div>
						</div>
						<div class="row elevation">
							<div class="large-4 columns"><strong>Elevation</strong></div>
							<div class="large-8 columns value"></div>
						</div>
						<div class="row disposition">
							<div class="large-4 columns"><strong>Disposition</strong></div>
							<div class="large-8 columns value"></div>
						</div>
						<div class="row map">
							<div class="large-4 columns"><strong>Map</strong></div>
							<div class="large-8 columns value"><a href="#">View on Google Maps &raquo;</a></div>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="large-12 columns">
						<div class="button-group" style="float: right;">
							<a href="#" class="small button secondary duration-hour">6 Hrs</a>
							<a href="#" class="small button secondary duration-day">Day</a>
							<a href="#" class="small button secondary duration-week">Week</a>
							<a href="#" class="small button secondary duration-month">Month</a>
							<a href="#" class="small button secondary duration-90">90 Days</a>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="large-12 columns">
						<div class="datastreams" style="padding-bottom: 15px;">
							<div class="datastream hidden">
								<hr/>
								<div class="row">
									<div class="large-9 columns datastream-name subheader" style="font-size: 24px;">
										Datastream Name
									</div>
									<div class="large-3 columns datastream-value subheader" style="font-size: 24px; text-align: right;">
										420
									</div>
								</div>
								<div class="row">
									<div class="large-12 columns">
										<div class="graphWrapper" style="margin-top: 15px; padding: 10px; text-align: center;">
											<div class="graph" style="width: 600px; margin: auto;"></div>
										</div>
										<div class="slider" style="width: 600px; height: 15px; margin: auto;"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<hr/>
				</div>
			</div>
		</div>
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

	<!-- Modals -->
	<div id="loadingData" class="reveal-modal small text-center">
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
