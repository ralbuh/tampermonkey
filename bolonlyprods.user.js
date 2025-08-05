// ==UserScript==
// @name         bol only products
// @namespace    http://bol.com/
// @version      0.9.0
// @updateURL    https://github.com/ralbuh/tampermonkey/raw/master/bolonlyprods.user.js
// @description  bol.com bol own products filter
// @author       You
// @include      *bol.com*
// ==/UserScript==

let maxBid = 0;
let winners = ""
let avgWinner, minWinner = null;
let bidName, bidKey, winnersKey, maxBidKey, minWinnerKey, vv_maxBid, tid;

(async () => {
    'use strict';

    [...document.querySelectorAll('.product-item--row')].forEach(item => {
    	let seller = item.querySelector("div.product-seller").innerText;
    	if (seller != "Verkoop door bol.com") { item.remove() };
    })
})();
