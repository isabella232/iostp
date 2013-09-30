"use strict";

/**
 *  cloning of objects
 */
function clone(src, deep) {

    var toString = Object.prototype.toString;
    if(!src && typeof src != "object"){
        //any non-object ( Boolean, String, Number ), null, undefined, NaN
        return src;
    }

    //Honor native/custom clone methods
    if(src.clone && toString.call(src.clone) == "[object Function]"){
        return src.clone(deep);
    }

    //DOM Elements
    if(src.nodeType && toString.call(src.cloneNode) == "[object Function]"){
        return src.cloneNode(deep);
    }

    //Date
    if(toString.call(src) == "[object Date]"){
        return new Date(src.getTime());
    }

    //RegExp
    if(toString.call(src) == "[object RegExp]"){
        return new RegExp(src);
    }

    //Function
    if(toString.call(src) == "[object Function]"){
        //Wrap in another method to make sure == is not true;
        //Note: Huge performance issue due to closures, comment this :)
        return (function(){
            src.apply(this, arguments);
        });

    }

    var ret, index;
    //Array
    if(toString.call(src) == "[object Array]"){
        //[].slice(0) would soft clone
        ret = src.slice();
        if(deep){
            index = ret.length;
            while(index--){
                ret[index] = clone(ret[index], true);
            }
        }
    }
    //Object
    else {
        ret = src.constructor ? new src.constructor() : {};
        for (var prop in src) {
            ret[prop] = deep
                ? clone(src[prop], true)
                : src[prop];
        }
    }

    return ret;
};


//ARRAY Utils

/**
 * removes all occurances of an element from an array
 * @param val - the element we are searching for
 * @returns true - if something removed, false otherwise
 */
Array.prototype.remove = function(val) {
    var found = false;
    for (var i = 0, j = 0, l = this.length; i < l; i++) {
        if (this[i] !== val) {
            this[j++] = this[i];
        } else {
            found = true;
        }
    }
    this.length = j;
    return found;
}