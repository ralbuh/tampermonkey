// ==UserScript==
// @name         coronatest_refresh
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Refresh page every 30 seconds to prevent auto logging out
// @author       Ralbuh
// @match        https://coronatest.nl/testen/meest-recente-testuitslag
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(function(){ location.reload(); }, 30*1000);
})();