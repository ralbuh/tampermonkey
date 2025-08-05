// ==UserScript==
// @name         bol only products
// @namespace    http://bol.com/
// @version      0.9.0
// @updateURL    https://github.com/ralbuh/tampermonkey/raw/master/bolonlyprods.user.js
// @description  bol.com bol own products filter
// @author       You
// @include      *bol.com/nl/nl/s*
// @include      *bol.com/nl/nl/l*
// ==/UserScript==

// Price overview name constants
const SELLER_BOL = "bol";
const SELLER_BOL_RETOURDEALS = "retourdeals";
const SELLER_BOLCOM = "bol.com";
const SELLER_BOLCOM_RETOURDEALS = "bol.com retourdeals";

function removeNonBol() {
    // Two options, old non flex with class names or flex with no identifiable class names
    //1
    [...document.querySelectorAll('li.product-item--row')].forEach(item => {
        let seller = item.querySelector('div.product-seller').textContent.trim();
    	if (!isSoldByBol(seller)) { item.remove() };
    });

    //2
    [...document.querySelectorAll('[data-bltgi*="ProductList_Middle"]')].forEach(item => {
        let seller = item.querySelector('.mt-4').textContent.trim();
    	if (!isSoldByBol(seller)) { item.remove() };
    });
};

function isSoldByBol(sellerText) {
    return sellerText.endsWith(SELLER_BOLCOM)
					|| sellerText.endsWith(SELLER_BOLCOM_RETOURDEALS)
					|| sellerText.endsWith(SELLER_BOL)
					|| (sellerText.includes(SELLER_BOL) && sellerText.includes(SELLER_BOL_RETOURDEALS));
};

(async () => {
    'use strict';

    let injectedRemoveButton = document.createElement('div');
    injectedRemoveButton.id = "remove_btn";
    //injectedRemoveButton.classList.add('c-btn-custom');
    //injectedRemoveButton.style.cssText = "font-size: 1.2em; color:white; background-color:rgba(255, 143, 0, 0.8); border-radius: 20px; padding: 10px 20px; position:fixed; bottom:50px; right:50px; z-index:1111;";
    injectedRemoveButton.style.cssText = "border-style: solid; border-color:var(--colors-blue200); border-radius: 10px; padding: 10px 20px; position:fixed; bottom:20px; right:20px; z-index:1111;";
    injectedRemoveButton.innerHTML = `<a>Only Bol own products</a>`;
    injectedRemoveButton.addEventListener("click", removeNonBol);
    document.body.appendChild(injectedRemoveButton);

})();
