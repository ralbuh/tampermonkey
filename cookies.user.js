// ==UserScript==
// @name         Cookies decline
// @namespace    ttps://github.com/ralbuh/tampermonkey
// @version      1.0
// @description  Cookies decline
// @author       Ralbuh
// @match        npostart.nl
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
	button.value="Decline all";
	button.onclick = deleteAll;
	button.setAttribute("style", "font-size:18px;position:absolute;bottom:0px;right:0px;");
	document.body.appendChild(button);
})();
