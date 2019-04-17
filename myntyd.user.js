// ==UserScript==
// @name         Myntyd check if cafetariabudget gets increased > 0
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://inquisitive.myntyd.nl/profiel.php
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if ([...document.querySelectorAll('td')].some(it => it.innerText == "Cafetariabudget")) {
      var cafetariaBudget = [...document.querySelectorAll('td')]
        .filter(it => it.innerText == "Cafetariabudget")[0]
        .nextSibling
        .nextSibling
      if (cafetariaBudget.innerText > 0) {
       alert("Cafetaria budget is nu: " + cafetariaBudget.innerText);
      } else {
       setTimeout(function(){ document.querySelector("input[type='image'][alt='Samenvatting']").click(); }, 60*1000);
      }
    }
})();
