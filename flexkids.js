// ==UserScript==
// @name         flexkids
// @namespace    https://github.com/ralbuh/tampermonkey
// @version      0.1
// @description  Blos flexkids download all pictures from fotoalbum page
// @author       Ralbuh
// @match        https://blos.flexkids.nl/ouder/fotoalbum
// @grant        GM_download
// ==/UserScript==

// there is some loading going on, at first only 10 pictures are shown, with the right button more can be loaded based on some album ids, so now using the other download function
function downloadAllLoaded() {
	[...document.querySelectorAll('.fotoalbumimages.images > img')].forEach(img => {
       // console.log(img.src);
        //var filename = img.src.match(/mediajpg\/media\/([0-9]*)/i)[1];
        var filename = img.getAttribute("data-id");
        var downloadUrl = `https://blos.flexkids.nl/ouder/media/download/media/${filename}`;
        var localName = `${filename}.jpg`;
        var arg = { url: downloadUrl, name: localName }
        GM_download(arg);
    });
}

function downloadAll() {
    fotoalbumViewer.albums[0].forEach(id => {
        var downloadUrl = `https://blos.flexkids.nl/ouder/media/download/media/${id}`;
        var localName = `${id}.jpg`;
        var arg = { url: downloadUrl, name: localName }
        GM_download(arg);

    });
}

(function() {
    'use strict';
	var button=document.createElement("input");
	button.type="button";
	button.value="Download all";
	button.onclick = downloadAll;
	button.setAttribute("style", "font-size:18px;position:absolute;bottom:0px;right:0px;");
	document.body.appendChild(button);
})();
