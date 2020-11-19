// ==UserScript==
// @name         Blos flexkids download all pictures
// @namespace    https://github.com/ralbuh/tampermonkey
// @version      0.1
// @description  Blos flexkids download all pictures from fotoalbum page
// @author       Ralbuh
// @match        https://blos.flexkids.nl/ouder/fotoalbum
// @grant        GM_download
// ==/UserScript==

function downloadAll() {
	[...document.querySelectorAll('.fotoalbumimages.images > img')].forEach(img => {
//        console.log(img.src);
        var downloadUrl = img.src.replace("formaat/klein","formaat/groot");
        var filename = img.src.match(/mediajpg\/media\/([0-9]*)/i)[1];
        var localName = `${filename}.jpg`;
        var arg = { url: downloadUrl, name: localName };
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

