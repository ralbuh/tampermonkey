// ==UserScript==
// @name         Marktplaats delete all
// @namespace    ttps://github.com/ralbuh/tampermonkey
// @version      1.0
// @description  Marktplaats add delete all notifications button
// @author       Ralbuh
// @match        marktplaats.nl/notifications
// @grant        none
// ==/UserScript==

function deleteAll() {
	[...document.querySelectorAll('.mp-svg-delete')]
		.forEach(del => del.click());
}

(function() {
    'use strict';
		
	var button=document.createElement("input");
	button.type="button";
	button.value="Delete all";
	button.onclick = deleteAll;
	button.setAttribute("style", "font-size:18px;position:absolute;top:120px;right:40px;");
	document.body.appendChild(button); 
	
})();
