"use strict";

function ExampleKit(myname) {

    ObservationKit.call(this);

    this.name = myname;

}

ExampleKit.prototype = Object.create(ObservationKit.prototype);  //inherit ObservationKit

ExampleKit.prototype.constructor = ExampleKit; //correct constructor prototype to point to ExampleKit

ExampleKit.prototype.setConfig = function(c) {
    this.myConfig = c;
};
ExampleKit.prototype.getConfig = function() {
    return this.myConfig;
};

ExampleKit.prototype.clone = function() {
    var other = new ExampleKit(this.getName());
    return other;
};

ExampleKit.prototype.getName = function() {
    return this.name;
};

ExampleKit.prototype.getType = function() {
    return "IOSTP Example Kit";
};

ExampleKit.prototype.render = function() {
    return $('\
        <div id="exampleKit-'+this.getId()+'">\
            <h2>your config is: <span class="configstring"></span></h2>\
            you can put all your page level html here...<br/>make sure you uniq-ify things with your uniqueId \
        </div>\
        ');
};

ExampleKit.prototype.config = function() {
    if( this.getConfig() == undefined ) {
        var val = window.prompt("Enter your config:");
        $("#exampleKit-"+this.getId()+" .configstring").text(val);
        this.setConfig(val);
    } else {
        $("#exampleKit-"+this.getId()+" .configstring").text(this.getConfig());
    }
    return this;
};


/*
 * now register it globally so it can be used elsewhere.
 */
IOSTP.getInstance().register( new ExampleKit());


//onload stuff.................
$(function () {

});