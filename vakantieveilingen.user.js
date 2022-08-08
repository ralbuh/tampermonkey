// ==UserScript==
// @name         vakantieveilingen buy
// @namespace    http://vakantieveilingen.nl/
// @version      1.3.4
// @updateURL    https://github.com/ralbuh/tampermonkey/raw/master/vakantieveilingen.user.js
// @description  vakantieveilingen.nl auto bid
// @author       You
// @include      *vakantieveilingen.nl*
// @grant        GM.setValue
// @grant        GM.getValue
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

var maxBid = 0;
var winners = ""
var avgWinner, minWinner = null;
var bidName, bidKey, winnersKey, maxBidKey, minWinnerKey, vv_maxBid, tid;

function hashCode(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        //hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function bidLogic() {
    //console.log("maxBidKey:"+maxBidKey+" jq disptime:"+$("#biddingBlock .display-time-value").textContent);
    var refreshLinks = document.querySelector('a[data-aq="reopen-auction"]'); // this one only appears after the auction has closed
    var bid = document.querySelector("input#bid"); // input field for user bid
    var button = document.querySelector('button[data-aq="place-bid"]'); // bid button for user bid
    var minBid = document.querySelectorAll('button[data-aq="fastbid-button"]')[1]; // second fastbid button underneath the user bid input field
    var timer = document.querySelector('div.timer-countdown-label'); // this one only appears during last minute (sub 60 seconds countdown)

    if (button){
        $("#vv_note").show();
    } else {
        $("#vv_note").hide();
    }

    if (bid && timer){
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

    if (refreshLinks) {
        (async () => {

            winners = await GM.getValue(winnersKey, winners);
            var winnerArr = [];
            if(winners != "") winnerArr = winners.split(", ");
            if(winnerArr.length>15) winnerArr = winnerArr.slice(winnerArr.length-15, winnerArr.length);

            var currentHighestBid = parseInt(document.querySelector('div[data-aq="highest-bid"] > h3').textContent.replace('€','').trim());
            var currentWinner = document.querySelector('h2.MuiTypography-big-extra').textContent;
            console.log(currentHighestBid);
            winnerArr.push(currentHighestBid);
            winners = winnerArr.join(", ");
            GM.setValue(winnersKey, winners);

            if(currentHighestBid>0 && (!minWinner || currentHighestBid<minWinner)){
                minWinner = currentHighestBid;
                GM.setValue(minWinnerKey, minWinner);
            }
        })();

        //location.reload(); // not needed anymore since page automatically reloads
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

    while(!bidName){
        bidName = document.querySelector('h3.MuiTypography-big-extra').textContent;
        //console.log("bidName:" + bidName);
    }

    bidKey = hashCode(bidName);
    winnersKey = bidKey+"_winners";
    maxBidKey = bidKey+"_maxBid";
    minWinnerKey = bidKey+"_minWinner";

    maxBid = await GM.getValue(maxBidKey, maxBid);
    winners = await GM.getValue(winnersKey, winners);
    minWinner = await GM.getValue(minWinnerKey, minWinner);
    var winnerArr = winners.split(", ");
    console.log("winnerArr:"+winnerArr+" fixed:"+average(winnerArr)+" winners:"+winners);
    avgWinner = average(winnerArr).toFixed();

    var newHTML = document.createElement ('h3');
    newHTML.innerHTML = `
    <div id="vv_note" style="color:red; background-color:rgb(52 147 0 / 50%); position:fixed; top:150px; right:100px; z-index:1111">
      <p style="opacity: 1">
        <strong>WILL BUY UP UNTIL € <input id="vv_maxBid" size=1 value="${maxBid}"/></strong>
        <br>
        <small>Min won price: ${minWinner} Avg won price: ${avgWinner}<br>latest won prices: ${winners}</small>
      </p>
    </div>`;
    document.body.appendChild (newHTML);

    vv_maxBid = document.getElementById('vv_maxBid');
    vv_maxBid.addEventListener ("input", setMaxBid , false);

    tid = setInterval(bidLogic, 500);
})();

// org: https://github.com/kemalizing/tamper-scripts/raw/master/vv.user.js
