// ==UserScript==
// @name         Myntyd check if cafetariabudget gets increased > 0
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://inquisitive.myntyd.nl/profiel.php
// @grant        none
// ==/UserScript==
function notifyMe(text) {
  if (Notification.permission !== "granted") {
      Notification.requestPermission();
  } else {
    var notification = new Notification('Cafetaria budget', {
      body: text,
      requireInteraction: true
    });
  }
}


(function() {
    'use strict';
    if ([...document.querySelectorAll('td')].some(it => it.innerText == "Cafetariabudget")) {
      var cafetariaBudget = [...document.querySelectorAll('td')]
        .filter(it => it.innerText == "Cafetariabudget")[0]
        .nextSibling
        .nextSibling
      var currentText = "Cafetaria budget is nu:" + cafetariaBudget.innerText;
      var currentBudget = parseFloat(cafetariaBudget.innerText.replace('€ ',''));

      if (currentBudget > 0) {
        notifyMe(currentText);
        //alert(currentText);
      } else {
        console.log(currentText);
        console.log("last refresh: " + new Date());
        //notifyMe(currentText);
        setTimeout(function(){
            document.querySelector("input[type='image'][alt='Samenvatting']").click();
        }, 60*1000);
      }
    }
})();
