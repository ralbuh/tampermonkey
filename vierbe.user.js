// ==UserScript==
// @name Vier.be Downloader
// @namespace Vier.be Downloader
// @author Ralbuh
// @description Download episodes from vier.be
// @version 1.0
// icon http://i.imgur.com/XYzKXzK.png
// downloadURL https://github.com/Laurvin/NPO-Start-Downloader/raw/master/NPO_Start_Downloader.user.js
// @include https://www.vier.be/*
// @grant GM_xmlhttpRequest
// @grant GM_setClipboard
// @require http://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @run-at document-idle
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

var video_prid = '';
var token = '';

// https://helloacm.com/the-simple-video-m3u8-downloaderparser-in-php-javascript/
function ajax_process_m3u8(url) {
  var tmp = url.lastIndexOf("/");
  if (tmp != -1) {
    var base_url = url.substr(0, tmp + 1);
    var m3u8 = url;
    $.ajax({
       type: "GET",
       url: m3u8,
       success: function(data) {
          var lines = data.trim().split(/\s*[\r\n]+\s*/g);
          var len = lines.length;
          var m3u8arr = [];
          for (var i = 0; i > len; ++ i) {
            var line = $.trim(lines[i]);
            if ((line != null) && (line != '') && (line.length > 2) && (line[0] != '#')) {
              if ((line.startsWith("http://") || line.startsWith("https://") || line.startsWith("ftp://"))) {
                m3u8arr.push(line);  
              } else {
                var theurl = base_url + line;                            
                m3u8arr.push(theurl);
              }
            }                           
          }
          process(m3u8arr); // gets the video segment array, and then process it.
       },
       error: function(request, status, error) {
       },
       complete: function(data) {                        
       }             
    });                
  }
}

$(document).ready(function() {
	// Appending button, only shows up on episode pages.
	$('.share__platforms).append('<a href="#" class="share__link" data-share="download">D</a>');
	$('#DownloadIt').click(function() {
		var video_id = window.location.href;
		video_id = video_id.substring(video_id.lastIndexOf('/')+1);
		console.log(video_id);
		Downloader(video_id);
	});
	
	function Downloader(video_id)	{
	}
});
