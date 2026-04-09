// ==UserScript==
// @name         vakantieveilingen auto buy
// @namespace    http://vakantieveilingen.nl/ralbuh
// @version      1.7.1
// @updateURL    https://github.com/ralbuh/tampermonkey/raw/master/vakantieveilingen.user.js
// @downloadURL  https://github.com/ralbuh/tampermonkey/raw/master/vakantieveilingen.user.js
// @description  vakantieveilingen.nl auto bid
// @author       ralbuh
// @include      *vakantieveilingen.nl*
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

// Constants
const POLL_INTERVAL = 500; // ms
const LAST_SECOND = "01";
const NOTIFICATION_BOTTOM = "50px";
const NOTIFICATION_RIGHT = "50px";
const MAX_WAIT_ATTEMPTS = 50;
const WAIT_ATTEMPT_DELAY = 100; // ms

// Global state
let maxBid = 0;
let winners = "";
let avgWinner = null;
let minWinner = null;
let bidName = null;
let bidKey = null;
let winnersKey = null;
let maxBidKey = null;
let minWinnerKey = null;
let vv_maxBid = null;
let tid = null;

/**
 * Wait for an element to appear in the DOM
 * @param {string} selector - CSS selector to wait for
 * @param {number} maxAttempts - Maximum attempts before timeout
 * @returns {Promise<Element|null>} The element or null if not found
 */
async function waitForElement(selector, maxAttempts = MAX_WAIT_ATTEMPTS) {
    return new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(() => {
            const el = document.querySelector(selector);
            if (el || attempts++ >= maxAttempts) {
                clearInterval(interval);
                resolve(el);
            }
        }, WAIT_ATTEMPT_DELAY);
    });
}

/**
 * Generate a unique key from a string
 * @param {string} str - String to hash
 * @returns {number} Hash code
 */
const hashCode = (str) => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
    }
    return hash;
};

/**
 * Calculate the average of an array of numeric strings
 * @param {string[]} elmt - Array of numeric strings
 * @returns {number} Average value
 */
const average = (elmt) => {
    if (!elmt || elmt.length === 0) return 0;
    const sum = elmt.reduce((acc, val) => acc + parseInt(val, 10), 0);
    return sum / elmt.length;
};

/**
 * Stop the bid logic timer
 */
const abortTimer = () => {
    if (tid) {
        clearInterval(tid);
        tid = null;
    }
};

/**
 * Update the maximum bid value
 */
const setMaxBid = async () => {
    const newMax = parseInt(vv_maxBid.value, 10);
    if (!isNaN(newMax)) {
        maxBid = newMax;
        await GM.setValue(maxBidKey, maxBid);
    }
};

/**
 * Update notification visibility based on auction state
 * @param {boolean} isAuctionActive - Whether the auction is still active
 */
const updateNotificationVisibility = (isAuctionActive) => {
    const notification = document.querySelector('#vv_note');
    if (notification) {
        notification.style.visibility = isAuctionActive ? 'visible' : 'hidden';
    }
};

/**
 * Parse bid amount from text
 * @param {string} text - Text containing bid amount
 * @returns {number} Parsed bid amount
 */
const parseBidAmount = (text) => {
    if (!text) return 0;
    const cleaned = text.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
};

/**
 * Main bidding logic executed on interval
 */
const bidLogic = async () => {
    try {
        const refreshLinks = document.querySelector('div.bidblock-loss__actions');
        const bid = document.querySelector("div.auction__bid-input input");
        const button = document.querySelector('div.auction__bid-input button.btn-n');
        const minBidButtons = document.querySelectorAll('div.auction__quick-bid button');
        const minBid = minBidButtons.length > 1 ? minBidButtons[1] : null;
        const timer = document.querySelector('div.timer-countdown-label');

        // Update notification visibility
        updateNotificationVisibility(!!button);

        // Auto bid logic when in last second
        if (bid && timer && minBid) {
            if (timer.textContent === LAST_SECOND) {
                const minBidInt = parseBidAmount(minBid.textContent);
                if (minBidInt > 0 && minBidInt <= maxBid) {
                    bid.value = minBid.textContent;
                    button.click();
                    abortTimer();
                }
            }
        }

        // Handle auction closed state
        if (refreshLinks) {
            const highestBidElement = document.querySelector('span.bidblock-loss_price-won');

            if (highestBidElement) {
                winners = await GM.getValue(winnersKey, winners);
                const winnerArr = winners ? winners.split(", ").map(w => parseInt(w, 10)) : [];

                const currentHighestBid = parseBidAmount(highestBidElement.textContent);

                if (currentHighestBid > 0) {
                    winnerArr.push(currentHighestBid);
                    winners = winnerArr.join(", ");
                    await GM.setValue(winnersKey, winners);

                    if (!minWinner || currentHighestBid < minWinner) {
                        minWinner = currentHighestBid;
                        await GM.setValue(minWinnerKey, minWinner);
                    }
                }
            }

            abortTimer();
        }
    } catch (error) {
        console.error("Error in bidLogic:", error);
    }
};

/**
 * Initialize the auction title and storage keys
 */
const initializeAuction = async () => {
    const titleElement = await waitForElement('h1.auction__title');

    if (!titleElement || !titleElement.textContent) {
        console.warn("Could not find auction title");
        return false;
    }

    bidName = titleElement.textContent.trim();
    bidKey = hashCode(bidName);
    winnersKey = `${bidKey}_winners`;
    maxBidKey = `${bidKey}_maxBid`;
    minWinnerKey = `${bidKey}_minWinner`;

    return true;
};

/**
 * Create and inject the auto-buy notification box
 */
const createNotificationBox = () => {
    const injectedAutoBuyBox = document.createElement('div');
    injectedAutoBuyBox.id = "vv_note";
    injectedAutoBuyBox.style.cssText = `
        font-size: 1.2em;
        color: white;
        background-color: rgba(255, 143, 0, 0.8);
        border-radius: 20px;
        padding: 10px 20px;
        position: fixed;
        bottom: ${NOTIFICATION_BOTTOM};
        right: ${NOTIFICATION_RIGHT};
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;
    injectedAutoBuyBox.innerHTML = `
        <b>Max auto bid € <input 
            style="font-size: 1em; font-weight: bold; background: transparent; color: white; border: none; border-bottom: 1px solid white;" 
            id="vv_maxBid" 
            type="number"
            size="1" 
            value="${maxBid}"/></b>
    `;

    return injectedAutoBuyBox;
};

/**
 * Update statistics display
 */
const updateStatistics = (injectedAutoBuyBox) => {
    if (minWinner) {
        const winnerArr = winners ? winners.split(", ") : [];
        const calculatedAvg = average(winnerArr).toFixed(2);

        // Remove existing statistics if present
        const existingStats = injectedAutoBuyBox.querySelector("p");
        if (existingStats) {
            existingStats.remove();
        }

        const statisticsObj = document.createElement("p");
        statisticsObj.style.cssText = "max-width: 400px; margin: 10px 0 0 0; font-size: 0.9em;";
        statisticsObj.innerHTML = `
            <small>
                Min won price: €${minWinner}<br>
                Avg won price: €${calculatedAvg}<br>
                Latest won prices: ${winners}
            </small>
        `;
        injectedAutoBuyBox.append(statisticsObj);
    }
};

/**
 * Main initialization
 */
(async () => {
    'use strict';

    try {
        // Wait for auction title to load
        const titleLoaded = await initializeAuction();
        if (!titleLoaded) {
            console.error("Failed to initialize auction");
            return;
        }

        // Create and inject notification box
        const injectedAutoBuyBox = createNotificationBox();
        document.body.appendChild(injectedAutoBuyBox);

        // Load stored values
        maxBid = await GM.getValue(maxBidKey, 0);
        winners = await GM.getValue(winnersKey, "");
        minWinner = await GM.getValue(minWinnerKey, null);

        // Update statistics display
        updateStatistics(injectedAutoBuyBox);

        // Setup input handler
        vv_maxBid = document.getElementById('vv_maxBid');
        if (vv_maxBid) {
            vv_maxBid.addEventListener("input", setMaxBid, false);
        }

        // Start bid logic timer
        tid = setInterval(bidLogic, POLL_INTERVAL);

        console.log("Vakantieveilingen auto bid script initialized");
    } catch (error) {
        console.error("Error initializing script:", error);
    }
})();
