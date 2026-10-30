// ==UserScript==
// @name         Bol Employee Discount
// @namespace    https://gitlab.bol.io/martijnsteenbergen/bol-extensions/
// @version      1.0.0
// @description  Shows estimated employee discount price on bol.com product and list pages
// @author       Based on Better Bol by Martijn Steenbergen, Martin Luhrman, Robin Trietsch, Ivan Plantevin, Ralf Floris
// @match        *://www.bol.com/*
// @match        *://acc2.bol.com/*
// @match        *://test2.bol.com/*
// @match        *://ra-*.pro.bol.io/*
// @match        *://ra-*.stg.bol.io/*
// @grant        unsafeWindow
// ==/UserScript==

'use strict';

// ---------------------------------------------------------------------------
// Data — discount categories with VAT rate, discount %, and plaza fee config
// Source: packages/application/src/packages/employee-discount/data.ts
// ---------------------------------------------------------------------------

const VAT_LOW = 0.09;
const VAT_HIGH = 0.21;
const MAX_DISCOUNT_EUR = 500;

const DISCOUNT_SETS = [
    {id: 43646, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Auto & Motor'},
    {id: 11271, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Baby Hardwaren en Lifestyle'},
    {id: 16947, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Kindermode'},
    {id: 47024, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Herenmode'},
    {id: 46673, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Damesmode'},
    {id: 43228, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.13, fullName: 'Beauty'},
    {id: 12442, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.13, fullName: 'Persoonlijke verzorging'},
    {id: 12541, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.13, fullName: 'Gezondheid'},
    {id: 10823, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.13, fullName: 'Persoonlijke Verzorging en Huishoudmiddelen'},
    {id: 3136, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 3.0, plazaVariableFeePercentage: 0.07, fullName: 'Elektronica'},
    {id: 3134, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 3.0, plazaVariableFeePercentage: 0.06, fullName: 'Computer'},
    {id: 10714, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 3.0, plazaVariableFeePercentage: 0.07, fullName: 'Beeld en Geluid Accessoires'},
    {id: 18201, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 3.0, plazaVariableFeePercentage: 0.06, fullName: 'Consoles'},
    {id: 4006, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 3.0, plazaVariableFeePercentage: 0.05, fullName: "Camera's & Accesoires"},
    {id: 18100, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 3.0, plazaVariableFeePercentage: 0.05, fullName: 'Televisies & Accesoires'},
    {id: 4034, vat: VAT_HIGH, discount: 0.2, plazaFixedFeePrice: 3.0, plazaVariableFeePercentage: 0.06, fullName: 'Telefoonaccessoires'},
    {id: 18148, vat: VAT_HIGH, discount: 0.2, plazaFixedFeePrice: 3.0, plazaVariableFeePercentage: 0.06, fullName: 'Tabletaccessoires'},
    {id: 8299, vat: VAT_LOW, discount: 0.2, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Algemene Boeken'},
    {id: 3132, vat: VAT_HIGH, discount: 0.2, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Muziek'},
    {id: 3133, vat: VAT_HIGH, discount: 0.2, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Film'},
    {id: 3135, vat: VAT_HIGH, discount: 0.2, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Games'},
    {id: 7000, vat: VAT_HIGH, discount: 0.2, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Software'},
    {id: 7111, vat: VAT_HIGH, discount: 0.2, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Dataopslag & Geheugen'},
    {id: 7934, vat: VAT_HIGH, discount: 0.2, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Kern Speelgoed'},
    {id: 14648, vat: VAT_HIGH, discount: 0.1, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Sport Hardwaren'},
    {id: 12974, vat: VAT_HIGH, discount: 0.1, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Tuin'},
    {id: 13155, vat: VAT_HIGH, discount: 0.1, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Klussen'},
    {id: 12748, vat: VAT_HIGH, discount: 0.1, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Dieren'},
    {id: 15670, vat: VAT_HIGH, discount: 0.1, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Fietsen & Accesoires'},
    {id: 15270, vat: VAT_HIGH, discount: 0.1, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Kamperen en Outdoor'},
    {id: 14333, vat: VAT_HIGH, discount: 0.1, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Kerst'},
    {id: 25897, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'School en Kantoor'},
    {id: 14035, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.17, fullName: 'Wonen'},
    {id: 11764, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Koken'},
    {id: 12001, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Huishouden'},
    {id: 12605, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.12, fullName: 'Erotiek'},
    {id: 20639, vat: VAT_HIGH, discount: 0.0, plazaFixedFeePrice: 0.0, plazaVariableFeePercentage: 0.10, fullName: 'Cadeaukaarten'},
    {id: 16799, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Reisbagage en Modeaccessoires'},
    {id: 54136, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 0.0, plazaVariableFeePercentage: 0.10, fullName: 'Drank'},
    {id: 46866, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Sieraden'},
    {id: 46975, vat: VAT_HIGH, discount: 0.125, plazaFixedFeePrice: 1.0, plazaVariableFeePercentage: 0.15, fullName: 'Sieraden en Horloges'},
];

// ---------------------------------------------------------------------------
// URL matching helpers
// Source: packages/application/src/utils/pathchecker.ts
// ---------------------------------------------------------------------------

function matchesUrl(regexp) {
    return window.location.toString().match(regexp)?.[0] !== undefined;
}

function isProductPage() {
    return matchesUrl(/\/(?:p|l|s)\//g);
}

// ---------------------------------------------------------------------------
// Discount calculation
// Source: packages/application/src/packages/employee-discount/employee-discount.ts
// ---------------------------------------------------------------------------

function matchToBestDiscountSet(categoryIds) {
    for (const id of categoryIds) {
        const match = DISCOUNT_SETS.find(d => d.id === id);
        if (match) return match;
    }
    return undefined;
}

// Formula: price - discount% × (price / (1 + VAT)), capped at MAX_DISCOUNT_EUR
function calculateBolDiscount(offerPrice, discountSet) {
    const discountAmount = Math.min((offerPrice / (1 + discountSet.vat)) * discountSet.discount, MAX_DISCOUNT_EUR);
    const newPrice = offerPrice - discountAmount;
    const percentage = ((newPrice - offerPrice) / offerPrice) * 100;
    return {discountAmount, newPrice, newPriceText: newPrice.toFixed(2), percentageText: percentage.toFixed(0)};
}

// Formula: price - discount% × ((price × commissionRate + fixedFee) / (1 + VAT)), capped at MAX_DISCOUNT_EUR
function calculatePlazaDiscount(offerPrice, discountSet) {
    const grossFee = offerPrice * discountSet.plazaVariableFeePercentage + discountSet.plazaFixedFeePrice;
    const discountAmount = Math.min((grossFee / (1 + discountSet.vat)) * discountSet.discount, MAX_DISCOUNT_EUR);
    const newPrice = offerPrice - discountAmount;
    const percentage = ((newPrice - offerPrice) / offerPrice) * 100;
    return {discountAmount, newPrice, newPriceText: newPrice.toFixed(2), percentageText: percentage.toFixed(0)};
}

function computeDiscountPrice(discountSet, offerPrice, retailerId) {
    const isBolRetailer = retailerId === 0;
    const result = isBolRetailer
        ? calculateBolDiscount(offerPrice, discountSet)
        : calculatePlazaDiscount(offerPrice, discountSet);
    return {seller: isBolRetailer ? 'bol' : 'plaza', ...result};
}

// ---------------------------------------------------------------------------
// Page data extraction from React Router internal state
// Source: packages/application/src/packages/employee-discount/employee-discount.ts
// ---------------------------------------------------------------------------

function hasSelectMembership(loaderData) {
    try {
        return Boolean(loaderData.root?.customer?.select);
    } catch {
        return false;
    }
}

function extractProductInfo(product, categoryOverride, hasSelect) {
    if (!product?.bestSellingOffer) return null;

    const cats = categoryOverride ?? product.categories;
    if (!cats) return null;

    try {
        const offer = product.bestSellingOffer;
        const selectAmount = offer?.selectPrice?.price?.amount;
        const priceAmount = hasSelect && selectAmount != null
            ? selectAmount
            : offer?.sellingPrice?.price?.amount;

        return {
            id: product.id,
            title: product.title,
            sellingOfferPrice: parseFloat(priceAmount ?? '0'),
            retailerId: parseInt(offer?.retailer?.id ?? '-1'),
            categories: cats.map(c => parseInt(c.id)),
        };
    } catch (e) {
        console.error('[emp-discount] extractProductInfo:', e);
        return null;
    }
}

function getProductPageData(loaderData, hasSelect) {
    const product = loaderData['routes/product']?.content?.productPageData?.product;
    if (!product) return [];
    return [extractProductInfo(product, undefined, hasSelect)].filter(Boolean);
}

function getListPageData(loaderData, hasSelect) {
    const page = loaderData['routes/searchPage'] ?? loaderData['routes/browsePage'];
    if (!page) return [];

    const breadcrumb = page.metaData?.breadCrumb;
    return page.template.regions[1].slots
        .filter(slot => slot.type === 'ProductItem')
        .map(slot => extractProductInfo(slot.props?.product, breadcrumb, hasSelect))
        .filter(Boolean);
}

function extractPageData() {
    const router = unsafeWindow.__reactRouterDataRouter;
    if (!router) return null;

    const loaderData = router.state.loaderData;
    const hasSelect = hasSelectMembership(loaderData);

    if (matchesUrl(/bol\.com\/\w{2}\/\w{2}\/p/g)) return getProductPageData(loaderData, hasSelect);
    if (matchesUrl(/bol\.com\/\w{2}\/\w{2}\/(?:s|l)/g)) return getListPageData(loaderData, hasSelect);

    return [];
}

function computeAllDiscounts() {
    const products = extractPageData();
    if (!products?.length) return [];

    return products
        .map(product => {
            const discountSet = matchToBestDiscountSet(product.categories);
            if (!discountSet) return null;
            return {product, discountSet, price: computeDiscountPrice(discountSet, product.sellingOfferPrice, product.retailerId)};
        })
        .filter(Boolean);
}

// ---------------------------------------------------------------------------
// UI — simple floating badge, no external dependencies
// ---------------------------------------------------------------------------

const BADGE_ID = 'emp-discount-badge';

function buildBadgeHtml(items) {
    if (items.length === 1) {
        const {product, discountSet, price} = items[0];
        return `
      <div style="font-size:11px;opacity:0.8;margin-bottom:2px">${discountSet.fullName} — ${discountSet.discount * 100}% off excl. VAT</div>
      <div style="font-size:16px;font-weight:bold">% € ${price.newPriceText}</div>
      <div style="font-size:11px;opacity:0.8;margin-top:2px">${price.percentageText}% vs list price</div>
    `;
    }

    const rows = items
        .map(({product, price}) => `<div>€ ${price.newPriceText} — ${product.title.substring(0, 40)}…</div>`)
        .join('');
    return `<div style="font-size:12px;font-weight:bold;margin-bottom:4px">% ${items.length} items with discount</div>${rows}`;
}

function showBadge(items) {
    document.getElementById(BADGE_ID)?.remove();
    if (!items.length) return;

    const badge = document.createElement('div');
    badge.id = BADGE_ID;
    badge.innerHTML = buildBadgeHtml(items);
    Object.assign(badge.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: '260px',
        background: '#0066cc',
        color: 'white',
        padding: '10px 14px',
        borderRadius: '10px',
        fontFamily: 'sans-serif',
        fontSize: '13px',
        zIndex: '999999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        cursor: 'pointer',
        lineHeight: '1.4',
    });
    badge.title = 'Estimated employee discount. Click to dismiss.';
    badge.addEventListener('click', () => badge.remove());
    document.body.appendChild(badge);
}

// ---------------------------------------------------------------------------
// Main — poll until React Router state is populated, then display
// ---------------------------------------------------------------------------

function run() {
    if (!isProductPage()) return;

    const items = computeAllDiscounts();
    showBadge(items);
}

let pollAttempts = 0;
const MAX_POLL_ATTEMPTS = 20;

const poll = setInterval(() => {
    pollAttempts++;
    try {
        run();
    } catch { /* router not ready yet */
    }
    if (pollAttempts >= MAX_POLL_ATTEMPTS) clearInterval(poll);
}, 300);

// Re-run after SPA navigations
window.addEventListener('popstate', () => {
    pollAttempts = 0;
    document.getElementById(BADGE_ID)?.remove();
    setTimeout(run, 500);
});
