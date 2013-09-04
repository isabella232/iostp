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
    return "IOSTP Example Kit";
};

ExampleKit.prototype.render = function() {
    return '\
        <div id="exampleKit-'+this.getId()+'">\
            <h2>my example page here</h2>\
            // you can put all your page level html here... make sure you uniq-ify things with your uniqueId \
        </div>\
        ';
};

ExampleKit.prototype.config = function() {
    if( this.getConfig() === undefined ) {
        window.alert("here we would configure this - the ExampleKit");
    } else {
        window.alert("I am configuring myself using this data: '"+this.getConfig()+"'");
    }
    return this;
};

ExampleKit.prototype.getConfig = function() {  //return whatever string (usually JSON) which you will be handed on reload
    return undefined;
};


/*
 * now register it globally so it can be used elsewhere.
 */
IOSTP.getInstance().register( new ExampleKit());


//onload stuff.................
$(function () {

});