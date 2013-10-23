# Internet of Schools Things Portal

Participate in the creation of [The Internet of Schools Things Portal](http://iostp.org/)

* **Contents** - Portal code for The Internet of Schools Things Portal

* **Author**   - Robert Light     light@MouseToMouse.com
* **Copyright** - Copyright (c) 2013

## License:  TODO - what should this be??


This portal can installed in an AWS instance configured by following the directions in:

   iostp/aws-info/AWS-Provisioning-Instructions.txt

It can also be run within a Bitnami sandbox (for development purposes) as described in:

   iostp/aws-info/Sandbox-Provisioning-Instructions.txt


The basic idea is that different "observation kits" can be constructed by 3rd parties by implementing a "plugin"
as outlined in iostp/src/iostp/js/exampleKit.js

Each of the plugins (traditionally installed in iostp/src/iostp/plugins/[myplugindir] is an equal party to the overall
portal framework.  The portal framework will take care of the following functions:

   a) User authentication and administration
   b) Saving observation kit configuration data for each observation kit in defined by the user
   c) Restoring the observation kit configurations each time the user logs in to the state it was at last use.

The portal plugin developer needs to be mindful that his plugin is playing in the same page with all other plugins as
well as with other instances of his own plugin.  Therefore, it is usually wise to make the parent DOM node of the
plugins DOM elements to be a <div> with an id which is unique among all instances of his plugin.  Each plugin instance
has a getId() method which returns an index which is globally unique and can be used to create a <div> tag with a
unique id string.

See how we do this in the xively plugin where in getHtml() we return the parent tag:
         <div id="xivelyKit-'+this.getId()+'">
