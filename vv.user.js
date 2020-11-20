// ==UserScript==
// @name         vakantieveilingen buy
// @namespace    http://vakantieveilingen.nl/
// @version      1.3.3
// @updateURL    https://github.com/kemalizing/tamper-scripts/raw/master/vv.user.js
// @description  try to take over the world!
// @author       You
// @include      *vakantieveilingen.nl*
// @grant       GM.setValue
// @grant       GM.getValue
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

var bidName = null;
var bidNameView = document.getElementById("lotTitle");
if(bidNameView){
    bidName = bidNameView.textContent.trim();
}

var maxBid = 0;
var maxBidKey = bidName+"_maxBid";

var winners = ""
var winnersKey = bidName+"_winners";

var avgWinner = null;
var minWinner = null;
var minWinnerKey = bidName+"_minWinner";

var vv_maxBid;
var tid;

function mycode() {
    //if(bidName){
        //console.log("maxBidKey:"+maxBidKey+" jq disptime:"+$("#biddingBlock .display-time-value").textContent);
    //}
    var bid = document.getElementById('jsActiveBidInput');
    var refreshLinks = $("a[data-track-action='reopen auction']");
    var button = document.getElementById('jsActiveBidButton');
    var minBid = document.getElementsByClassName('fastBidValue')[0];
    var timer = document.getElementsByClassName('timer-countdown-label')[0];

    if(button){
        $("#vv_note").show();
    } else {
        $("#vv_note").hide();
    }
    if(bid && timer){
        //console.log("maxBid:"+maxBid+" minBid:"+minBid.textContent+(minBid.textContent<=maxBid));
        //setCookie(location, minBid, 1);

        if(timer.textContent == "01" ){
            var minBidInt = parseInt(minBid.textContent);
            if(minBidInt<=maxBid){
                bid.value = minBid.textContent;
                button.click();
                abortTimer();
            }
        }
    }
    if(refreshLinks.length>0) {
        (async () => {

            winners = await GM.getValue(winnersKey, winners);
            var winnerArr = winners.split(", ");
            if(winnerArr.length>15){
                winnerArr = winnerArr.slice(winnerArr.length-15, winnerArr.length);
            }
            var currentWinner = parseInt(document.getElementById("jsMainLotCurrentBid").textContent);
            winnerArr.push(currentWinner);
            winners = winnerArr.join(", ");
            GM.setValue(winnersKey, winners);
            if(currentWinner>0 && (!minWinner || currentWinner<minWinner)){
                minWinner = currentWinner;
                GM.setValue(minWinnerKey, minWinner);
            }
        })();
        location.reload();
        abortTimer();
    }
}

function average(elmt){
    var sum = 0;
    for( var i = 0; i < elmt.length; i++ ){
        sum += parseInt( elmt[i], 10 ); //don't forget to add the base
    }

    var avg = sum/elmt.length;
    return avg;
}

function abortTimer() {
  clearInterval(tid);
}

function setMaxBid() {
    var newMax = parseInt(vv_maxBid.value);
    if(!isNaN(newMax)){
        maxBid = newMax;
        GM.setValue(maxBidKey, maxBid).then();
    }
}

(async () => {
    'use strict';
        console.log("XbidName:"+bidName);

    maxBid = await GM.getValue(maxBidKey, maxBid);
    winners = await GM.getValue(winnersKey, winners);
    minWinner = await GM.getValue(minWinnerKey, minWinner);
    var winnerArr = winners.split(", ");
    avgWinner = average(winnerArr).toFixed();

    var newHTML = document.createElement ('h1');
    newHTML.innerHTML = '<h1 id="vv_note" style="color:red;position:fixed;top:150px;right:100px;z-index:1111"> <strong>WILL BUY UP UNTIL € <input id="vv_maxBid" size=1 value="'+maxBid+'"/> </strong>'+
        '<br><small>Min won price: '+minWinner+' Avg won price:'+avgWinner+'<br>latest won prices: '+winners+'</small></h1>';
    document.body.appendChild (newHTML);
    vv_maxBid = document.getElementById('vv_maxBid');
    vv_maxBid.addEventListener ("input", setMaxBid , false);

    tid = setInterval(mycode, 500);
    // Your code here...
})();
