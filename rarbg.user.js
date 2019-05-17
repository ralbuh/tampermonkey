// ==UserScript==
// @name         Rarbg replace 22pixx links
// @namespace    ttps://github.com/ralbuh/tampermonkey
// @version      1.0
// @description  Bypass ad heavy in between pages
// @author       Ralbuh
// @match        http*://rarbg.to/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    [...document.querySelectorAll('a')]
        .filter(link => link.href.includes('22pixx') || link.href.includes('imgprime'))
        .forEach(link => link.href = link.href
                 .replace('x-o','y-o')
                 .replace('a-i','b-i')
                 .replace('imga-u','imgb-u'));

    /* version 2
    document.querySelectorAll('a').forEach(function(link) {
        if (link.href.includes('22pixx')) {
            console.log(link.href);
            link.href = link.href.replace('x-o','y-o'); //.replace('.html','')
            console.log(link.href);
        }
    });
    */
    /* version 1
    var anchors = document.querySelectorAll('a');
    for(var i=0;i<anchors.length;i++){
        var url = anchors[i].href
        if (url.includes('22pixx')) {
            console.log(url);
            anchors[i].href = url.replace('x-o','y-o'); //.replace('.html','')
            console.log(anchors[i].href);
        }
    }*/

})();
