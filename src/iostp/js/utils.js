"use strict";

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