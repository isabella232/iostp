"use strict";

function XivelyKit(myname) {
    this.name = myname;
}

XivelyKit.prototype = new ObservationKit();  //inherit ObservationKit

XivelyKit.prototype.constructor = XivelyKit; //correct constructor prototype to point to XivelyKit

XivelyKit.prototype.getName = function() {
    return this.name;
};

XivelyKit.prototype.getType = function() {
    return "Xively Data Viewer";
};

XivelyKit.prototype.render = function() {
    return $('<div><P>My Xively div here</P></div>');
};

XivelyKit.prototype.config = function(cfgData) {
    if( cfgData === undefined ) {
        window.alert("here we would configure UI this kit");
    } else {
        window.alert("I am configuring myself using this data: '"+cfgData+"'");
    }
};

XivelyKit.prototype.getConfig = function() {
    return "my xively configuration data here";
};

/*
 * now register it globally so it can be used elsewhere.
 */
IOSTP.getInstance().register( new XivelyKit() );

$(function () {

});