"use strict";

function ExampleKit(myname) {
    this.name = myname;
}

ExampleKit.prototype = new ObservationKit();  //inherit ObservationKit

ExampleKit.prototype.constructor = ExampleKit; //correct constructor prototype to point to ExampleKit

ExampleKit.prototype.getName = function() {
    return this.name;
};

ExampleKit.prototype.getType = function() {
    return "Xively Data Viewer";
};

ExampleKit.prototype.render = function() {
    return $('<div><P>My Xively div here</P></div>');
};

ExampleKit.prototype.config = function(cfgData) {
    if( cfgData === undefined ) {
        window.alert("here we would configure this the ExampleKit");
    } else {
        window.alert("I am configuring myself using this data: '"+cfgData+"'");
    }
};

ExampleKit.prototype.getConfig = function() {
    return "my ExampleKit configuration data here";
};

/*
 * now register it globally so it can be used elsewhere.
 */
IOSTP.getInstance().register( new ExampleKit());

$(function () {

});