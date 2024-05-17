// ==UserScript==
// @name         funda
// @namespace    https://github.com/ralbuh/funda
// @version      0.2
// @description  Funda download all pictures of a house
// @author       Ralbuh
// @downloadURL  https://github.com/ralbuh/tampermonkey/raw/master/funda.user.js
// @updateURL    https://github.com/ralbuh/tampermonkey/raw/master/funda.user.js
// @match        https://www.funda.nl/*
// @grant        GM_download
// ==/UserScript==

function getHighestSrcFromSrcSet(srcSet) {
    return srcSet.split(",")
      .reduce(
        (acc, item) => {
          let [url, width] = item.trim().split(" ");
          width = parseInt(width);
          if (width > acc.width) return { width, url };
          return acc;
        },
        { width: 0, url: "" }
      ).url
}


function downloadAll() {
    [...document.querySelectorAll('.media-viewer-fotos__item img')].forEach(foto => {
        let downloadUrl = getHighestSrcFromSrcSet(foto.srcset)
        let fileName = downloadUrl.split('/').pop()
        console.log(`url: ${downloadUrl}, srcset: ${foto.srcset}`)
        GM_download({
            url: downloadUrl,
            name: fileName
        });
    });
}


(function() {
    'use strict';
    var button = document.createElement("input");
    button.type = "button";
    button.value = "Download all";
    button.onclick = downloadAll;
    button.setAttribute("style", "font-size:18px;position:absolute;bottom:0px;right:0px;");
    document.body.appendChild(button);
})();
