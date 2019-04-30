// ==UserScript==
// @name         Ziggo connectbox pw
// @namespace    https://github.com/ralbuh/tampermonkey
// @version      0.1
// @description  Hide password for ziggobox
// @author       Ralbuh
// @match        http://192.168.1.1/
// @grant        none
// @require http://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

(function() {
    'use strict';
    $('input#Password').prop('type','password')
})();