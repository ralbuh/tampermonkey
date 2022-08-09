// ==UserScript==
// @name         vakantieveilingen auto buy
// @namespace    http://vakantieveilingen.nl/
// @version      1.5.0
// @updateURL    https://github.com/ralbuh/tampermonkey/raw/master/vakantieveilingen.user.js
// @description  vakantieveilingen.nl auto bid
// @author       You
// @include      *vakantieveilingen.nl*
// @grant        GM.setValue
// @grant        GM.getValue
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

let maxBid = 0;
let winners = ""
let avgWinner, minWinner = null;
let bidName, bidKey, winnersKey, maxBidKey, minWinnerKey, vv_maxBid, tid;

function bidLogic() {
    //console.log("maxBidKey:"+maxBidKey+" jq disptime:"+$("#biddingBlock .display-time-value").textContent);
    let refreshLinks = document.querySelector('a[data-aq="reopen-auction"]'); // this one only appears after the auction has closed
    let bid = document.querySelector("input#bid"); // input field for user bid
    let button = document.querySelector('button[data-aq="place-bid"]'); // bid button for user bid
    let minBid = document.querySelectorAll('button[data-aq="fastbid-button"]')[1]; // second fastbid button underneath the user bid input field
    let timer = document.querySelector('div.timer-countdown-label'); // this one only appears during last minute (sub 60 seconds countdown)

    if (button){
        $("#vv_note").show();
    } else {
        $("#vv_note").hide();
    }

    if (bid && timer){
        //console.log("maxBid:"+maxBid+" minBid:"+minBid.textContent+(minBid.textContent<=maxBid));
        //setCookie(location, minBid, 1);

        if(timer.textContent == "01" ){
            let minBidInt = parseInt(minBid.textContent);
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
            let winnerArr = [];
            if(winners != "") winnerArr = winners.split(", ");
            //if(winnerArr.length>15) winnerArr = winnerArr.slice(winnerArr.length-15, winnerArr.length);

            let currentHighestBid = parseInt(document.querySelector('div[data-aq="highest-bid"] > h3').textContent.replace('€','').trim());
            let currentWinner = document.querySelector('h2.MuiTypography-big-extra').textContent;
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

function hashCode(str) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        //hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function average(elmt){
    let sum = 0;
    for( let i = 0; i < elmt.length; i++ ){
        sum += parseInt( elmt[i], 10 ); //don't forget to add the base
    }

    var avg = sum/elmt.length;
    return avg;
}

function abortTimer() {
    clearInterval(tid);
}

function setMaxBid() {
    let newMax = parseInt(vv_maxBid.value);
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

    let injectedAutoBuyBox = document.createElement('div');
    injectedAutoBuyBox.id = "vv_note";
    injectedAutoBuyBox.style.cssText = "font-size: 1.2em; color:white; background-color:rgb(0 103 145 / 80%); border-radius: 20px; padding: 10px 20px; position:fixed; bottom:50px; right:50px; z-index:1111;";
    injectedAutoBuyBox.innerHTML = `<p><b>Max auto bid € <input style="font-size: 1em;font-weight: bold;background: transparent;color: white;border: none;" id="vv_maxBid" size=1 value="${maxBid}"/></b></p>`;
    document.body.appendChild(injectedAutoBuyBox);

    maxBid = await GM.getValue(maxBidKey, maxBid);
    winners = await GM.getValue(winnersKey, winners);
    minWinner = await GM.getValue(minWinnerKey, minWinner);
    if (minWinner) {
        let winnerArr = winners.split(", ");
        //console.log(`winnerArr: ${winnerArr} fixed: ${average(winnerArr)} winners: ${winners}`);
        avgWinner = average(winnerArr).toFixed();
        let statisticsObj = document.createElement("p");
        statisticsObj.style.cssText="max-width: 400px;";
        statisticsObj.innerHTML = `<small>Min won price: ${minWinner} Avg won price: ${avgWinner}</br>latest won prices: ${winners}</small>`;
        injectedAutoBuyBox.append(statisticsObj);
    }

    vv_maxBid = document.getElementById('vv_maxBid');
    vv_maxBid.addEventListener ("input", setMaxBid , false);

    tid = setInterval(bidLogic, 500);
})();
