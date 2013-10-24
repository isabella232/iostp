"use strict";

function ExampleKit(myname) {

    ObservationKit.call(this);

    this.name = myname;

}

ExampleKit.prototype = Object.create(ObservationKit.prototype);  //inherit ObservationKit

ExampleKit.prototype.constructor = ExampleKit; //correct constructor prototype to point to ExampleKit

/**
 * The string given in the argument was retrieved from the database and is that value as of the last running of the portal.
 * Our task here is to interpret this string and set our parameters.
 * @param - {string} containing the state of this kit
 */
ExampleKit.prototype.setConfig = function(c) {
    this.myConfig = c;
};

/**
 * Returns the config as a string (in our case, JSON) which will later be handed back to an instance to configure itself
 * @returns - {string} describing the configuration of this kit
 */
ExampleKit.prototype.getConfig = function() {
    return this.myConfig;
};

/**
 * return a clone of our kit to be used as an instance
 * @returns {ExampleKit}
 */
ExampleKit.prototype.clone = function() {
    var other = new ExampleKit(this.getName());
    return other;
};

ExampleKit.prototype.getName = function() {
    return this.name;
};

ExampleKit.prototype.getType = function() {
    return "IOSTP Example Kit";  //shows in the UI when the user wants to create a new instance of an observation kit
};

/**
 * the render() method lays out the DOM elements that define the instance of this observation kit
 * @returns {*|jQuery|HTMLElement}
 */
ExampleKit.prototype.render = function() {
    return $('\
        <div id="exampleKit-'+this.getId()+'">\
            <h2>your config is: <span class="configstring"></span></h2>\
            you can put all your page level html here...<br/>make sure you uniq-ify things with your uniqueId \
        </div>\
        ');
};

/**
 * config() either pops a dialog to ask the user to set up the kit (or perhaps it does nothing and presents the user with some
 * kind of default view.
 *
 * If getConfig() returns a string, then the kit has to prepare itself so that when render() is called, everything looks as it
 * should based on the getConfig() text.  Usually getConfig() returns JSON which is stored serverside.
 *
 */
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


//onload script stuff.
// usually, we setup page-global DOM elements here.
$(function () {

});