// ==UserScript==
// @name         flexkids
// @namespace    ttps://github.com/ralbuh/tampermonkey
// @version      0.1
// @description  Blos flexkids download all pictures from fotoalbum page
// @author       Ralbuh
// @match        https://blos.flexkids.nl/ouder/fotoalbum
// @grant        GM_download
// ==/UserScript==

function getDateFromMetaData(fotoId, func) {
   		$.post("/ouder/fotoalbum/fotometa", {
			id: fotoId
        },
        function(data) { let date = data[0].MEDIA_DAG;
                        func(date);
                       }
		)
}

function downloadAll() {
    fotoalbumViewer.albums[0].forEach(id => {
        var downloadUrl = `https://blos.flexkids.nl/ouder/media/download/media/${id}`;
        var date = getDateFromMetaData(id, function(date){
            var localName = `${date} ${id}.jpg`;
            var arg = { url: downloadUrl, name: localName }
            GM_download(arg);
        });
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
