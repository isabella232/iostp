"use strict";

function ObservationKit() {}

ObservationKit.prototype.getName = function() {
    return this.name;
};

ObservationKit.prototype.setName = function(str) {
    this.name = str;
    return this;
}

ObservationKit.prototype.getType = function() {
    return "Base ObservationKit";
};

ObservationKit.prototype.getId = function() {
    return this.id;
}

ObservationKit.prototype.setId = function(i) {
    this.id = i;
    return this;
}

ObservationKit.prototype.setConfig = function(data) {
    this.configData = data;
    return this;
};
ObservationKit.prototype.config = function() {
    window.alert("ObservationKit.config() called - method should be overridden");
};

ObservationKit.prototype.getConfig = function() {
    return this.configData;
};

ObservationKit.prototype.render = function() {
    return $('<div><P>ObservationKit.render() method not overriden...this is all I can do now.</P></div>');
};


/**
 * Iostp is a singleton so we can easily get to it
 */
var IOSTP;
IOSTP = (function () {   // declare 'Singleton' as the returned value of a self-executing anonymous function
    "use strict";
    // 'instance' and 'constructor' should not be availble in a "public" scope
    // here they are "private", thus available only within
    // the scope of the self-executing anonymous function
    var _instance = null;
    var _constructor = function () {
        this.kitRegistry = [];
        this.uniqueId = 0;
    };

    // *************  prototypes will be "public" methods available from the instance

    /* each of the javascript modules loaded by the main page will register their kits using this method */
    _constructor.prototype.register = function (kit) {
        if (!kit instanceof ObservationKit) {
            throw new IostpException("Illegal attempt to register an unknown ObservationKit: " + JSON.stringify(kit), kit);
        }
        if (_instance.getKitOfType(kit.type) == null) {
            this.kitRegistry.push(kit);
        } else {
            throw new IostpException("Illegal attempt to register a duplicate kit of type: " + kit.type);
        }
    };

    /* returns an array of structs {id,type} so we can make a UI picker for all the registered kits */
    _constructor.prototype.getKitTypes = function () {
        var types = [];
        $.each(this.kitRegistry, function (i, kit) {
            types.push(kit.getType());
        });
        return types;
    };

    /* returns a clone of a kit so it can be configured by the user */
    _constructor.prototype.getKit = function (id) {
        return clone(this.kitRegistry[id]).setId(_instance.uniqueId++);
    };

    /* get a kit of a particular type - used to reconstitute the user's state from textual config string */
    _constructor.prototype.getKitOfType = function (type) {
        for( var i=0; i<this.kitRegistry.length; i++ ) {
            if (this.kitRegistry[i].getType() == type) {
                return clone(this.kitRegistry[i]).setId(_instance.uniqueId++);
            }
        }
        return null;
    };

    /**
     * Here we setup our kits and if there are no kits, we define a default kit so the student has something to
     * see when he first comes to the page.
     */
    _constructor.prototype.configure = function (cfgDataStr) {

        var cfgData = JSON.parse(cfgDataStr);

        if (cfgData.length == 0) { //if nothing defined, need to prime the pump with a default kit
            var defaultKitConfig = '{ "type" : "Xively Data Viewer", "name":"My 1st Observation Kit", "configData":"[{\\"dataStream\\": \\"61916!random3600\\"}]"}';
            cfgData.push(JSON.parse(defaultKitConfig));
            console.log("after push, cfgData.length = "+cfgData.length);
        }

        var kits = [];
        cfgData.forEach(function (cfg) {
            var kit = _instance.getKitOfType(cfg.type);
            if (kit != null) {
                kits.push(kit.setName(cfg.name).setConfig(cfg.configData));
            }
        });
        return kits;
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


$(function () {

});