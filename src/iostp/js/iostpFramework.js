"use strict";

function ObservationKit() {}

ObservationKit.prototype = {

    constructor: ObservationKit,

    clone: function() {
        alert("clone() should be overridden in subclass");
    },

    getName: function() {
        return this.name;
    },

    setName: function(str) {
        this.name = str;
    },

    getType: function() {
        return "Base ObservationKit";
    },

    getId: function() {
        return this.id;
    },

    setId: function(i) {
        this.id = i;
    },

    setConfig: function(data) {
        alert("ObservationKit.setConfig() should be overridden in subclass");
    },

    config: function() {
        window.alert("ObservationKit.config() called - method should be overridden");
    },

    getConfig: function() {
        alert("ObservationKit.getConfig() should be overridden in subclass");
    },

    render: function() {
        return $('<div><P>ObservationKit.render() method not overriden...this is all I can do now.</P></div>');
    }
}

/**
 * Iostp is a singleton so we can easily get to it
 */
var IOSTP = (function () {   // declare 'Singleton' as the returned value of a self-executing anonymous function
    "use strict";
    // 'instance' and 'constructor' should not be availble in a "public" scope
    // here they are "private", thus available only within
    // the scope of the self-executing anonymous function
    var _instance = null;
    var _constructor = function () {
        this.kitRegistry = [];
        this.uniqueId = 0;
        this.kits = [];
    };

    /* returns an array of structs {id,type} so we can make a UI picker for all the registered kits */
    _constructor.prototype = {      // *************  prototypes will be "public" methods available from the instance

        /* each of the javascript modules loaded by the main page will register their kits using this method */
        register: function (kit) {
            if (!kit instanceof ObservationKit) {
                throw new IostpException("Illegal attempt to register an unknown ObservationKit: " + JSON.stringify(kit), kit);
            }
            if (_instance.getKitOfType(kit.getType()) == null) {
                this.kitRegistry.push(kit);
            } else {
                throw new IostpException("Illegal attempt to register a duplicate kit of type: " + kit.getType());
            }
        },

        resetTimeoutTimestamp: function() {
            console.log("Resetting timeout timestamp");
            $.ajax( {
                    type: "POST",
                    url: "/server/isSessionInactive.php",
                    async: false,
                    data: {
                        username: $("#username").val(),
                        token:    $("#token").val(),
                        action:   "reset"
                    }
                }
            );
        },
        getKitTypes: function () {
            var types = [];
            $.each(this.kitRegistry, function (i, kit) {
                types.push(kit.getType());
            });
            return types;
        },

        /* returns a clone of a kit so it can be configured by the user */
        getKit: function (id) {
           // return myClone(this.kitRegistry[id],true).setId(_instance.uniqueId++);
//            return jQuery.extend(true, {}, this.kitRegistry[id]).setId(_instance.uniqueId++);
            return this.kitRegistry[id].clone().setId(_instance.uniqueId++);
        },

        /* get a kit of a particular type - used to reconstitute the user's state from textual config string */
        getKitOfType: function (type) {
            console.log(">>getKitOfType('"+type+"') called");
            for( var i=0; i<this.kitRegistry.length; i++ ) {
                if (this.kitRegistry[i].getType() == type) {
                    console.log("cloning kit: "+i);
    //                return myClone(this.kitRegistry[i],true).setId(_instance.uniqueId++);
//                    var clonedKit = jQuery.extend(true, {}, this.kitRegistry[i]);
                    var clonedKit = this.kitRegistry[i].clone();
                    clonedKit.setId(_instance.uniqueId++);
                    return clonedKit;
                }
            }
            return null;
        },

        /**
         * Here we setup our kits and if there are no kits, we define a default kit so the student has something to
         * see when he first comes to the page.
         */
        configure: function (cfgDataStr) {

            var cfgData = JSON.parse(cfgDataStr);

            if (cfgData.length == 0) { //if nothing defined, need to prime the pump with a default kit
                var defaultKitConfig = '{ "type" : "Xively Data Viewer", "name":"My 1st Observation Kit", "configData":"{\\"datastreams\\":[{\\"index\\":0, \\"datastream\\": \\"61916!random3600\\"},{\\"index\\":0,\\"name\\":\\"sin()\\", \\"datastream\\": \\"61916!sine3600\\"},{\\"index\\":1, \\"datastream\\":\\"2045025466!temp\\"}]}"}';
                cfgData.push(JSON.parse(defaultKitConfig));
                console.log("after push, cfgData.length = "+cfgData.length);
            }

            cfgData.forEach(function (cfg) {
                var kit = _instance.getKitOfType(cfg.type);
                if (kit != null) {
                    kit.setName(cfg.name);
                    kit.setConfig(cfg.configData);
                    IOSTP.getInstance().addKit(kit);
                }
            });
        },

        addKit: function(kit) {
            this.kits.push(kit);
        },

        removeKit: function(index) {
            console.log("removing kit: "+index);
            this.kits.splice(index,1);
        },

        getUserConfig: function(json) {
            if( json != undefined && json == true) {
                var cfg = [];
                $.each(this.kits, function(indx,kit) {
                    cfg.push({
                        type: kit.getType(),
                        name: kit.getName(),
                        configData: kit.getConfig()
                    });
                });
                return JSON.stringify(cfg);
            } else {
                return this.kits;
            }
        }


    };


    // using the module pattern, return a static object
    // which essentially is a list of "public static" methods
    return {
        // because getInstance is defined within the same scope
        // it can access the "private" 'instance' and 'constructor' vars
        getInstance: function () {
            if (!_instance) {
                console.log('creating IOSTP singleton...'); // this should only happen once
                _instance = new _constructor();
                console.log('IOSTP singleton creation done.');
            }
            return _instance;
        }
    }

})(); // self execute




function IostpException(msg, obj) {
    this.message = msg;
    this.name = "IostpException";
    this.object = obj;
}


/**
 * every 1000ms, we check to see if the user's config (of all kits) has changed.  If so, we push the data back to the server
 */
$(function () {
    var previousConfig;
    setInterval(function(){
        var userConfig = IOSTP.getInstance().getUserConfig(true);
        if( previousConfig != userConfig) {
            console.log("updating serverside data");
            previousConfig = userConfig;
            $.ajax( {
                type: "POST",
                url:  "/server/saveState.php",
                async: false,
                data: {
                    username:   $("#username").val(),
                    token:      $("#token").val(),
                    kitData:    userConfig
                }
            });
        }
    }, 1000);
    setInterval(function(){
        $.ajax( {
            type: "POST",
            url:  "/server/isSessionInactive.php",
            async: true,
            data: {
                username:   $("#username").val(),
                token:      $("#token").val()
            },
            success: function(result) {
                if( result == "TRUE" ) {
                    window.location.replace("/sessionTimedout.php");
                } else {
                    console.log("Session is active");
                }
            },
            error: function() {
                console.log("Error on server accessing /server/isSessionInactive.php");
                window.location.replace("http://iostp.org/");
            }
        });
    }, 30000);  //every 30 seconds

    // reset the timestamp on the server when page is first loaded.
    IOSTP.getInstance().resetTimeoutTimestamp();
});

