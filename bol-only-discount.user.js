// ==UserScript==
// @name         Bol Employee Discount
// @namespace    https://github.com/ralbuh/tampermonkey
// @version      1.1.2
// @description  Shows estimated employee discount price and adds bol-only products filter on bol.com
// @author       ralbuh
// @updateURL    https://github.com/ralbuh/tampermonkey/raw/master/bol-only-discount.user.js
// @match        *://www.bol.com/*
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
    return matchesUrl(/\/[pls]\//g);
}

function isListPage() {
    return matchesUrl(/\/(?:s|l|ra|b)\//g) || matchesUrl(/bol\.com\/\w{2}\/\w{2}\/(?:s|l|ra|b)/g);
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
    const page = loaderData['routes/searchPage']
        ?? loaderData['routes/search/searchPage']
        ?? loaderData['routes/browsePage']
        ?? loaderData['routes/browse/browsePage'];
    if (!page) return [];

    const breadcrumb = page.metaData?.breadCrumb;

    // Check template slots first (if structured as template.regions)
    const productItemsFromSlots = page.template?.regions
        ?.flatMap(region => region.slots ?? [])
        ?.filter(slot => slot.type === 'ProductItem')
        ?.map(slot => extractProductInfo(slot.props?.product, breadcrumb, hasSelect))
        ?.filter(Boolean);

    if (productItemsFromSlots?.length) return productItemsFromSlots;

    // Fallback: direct products array on search/browse loaderData
    if (Array.isArray(page.products)) {
        return page.products
            .map(p => extractProductInfo(p, breadcrumb, hasSelect))
            .filter(Boolean);
    }

    return [];
}

function extractPageData() {
    const router = unsafeWindow.__reactRouterDataRouter;
    if (!router) return null;

    const loaderData = router.state.loaderData;
    const hasSelect = hasSelectMembership(loaderData);

    if (matchesUrl(/bol\.com\/\w{2}\/\w{2}\/p/g)) return getProductPageData(loaderData, hasSelect);
    if (matchesUrl(/bol\.com\/\w{2}\/\w{2}\/[sl]/g)) return getListPageData(loaderData, hasSelect);

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
// Bol-only products filter
// ---------------------------------------------------------------------------

const FILTER_BTN_ID = 'bol-only-filter-btn';
const SELLER_BOL = 'bol';
const SELLER_BOL_RETOURDEALS = 'retourdeals';
const SELLER_BOLCOM = 'bol.com';
const SELLER_BOLCOM_RETOURDEALS = 'bol.com retourdeals';

function isSoldByBol(sellerText) {
    const text = sellerText.toLowerCase().trim();
    return text.endsWith(SELLER_BOLCOM)
        || text.endsWith(SELLER_BOLCOM_RETOURDEALS)
        || text.endsWith(SELLER_BOL)
        || (text.includes(SELLER_BOL) && text.includes(SELLER_BOL_RETOURDEALS));
}

function findProductContainer(element) {
    return element.closest('li.product-item--row')
        || element.closest('[data-bltgi*="ProductList_Middle"]:not([data-bltgi*="banner"])')
        || element.closest('.\\@container')
        || element.parentElement;
}

function removeNonBol() {
    let removedCount = 0;

    // Strategy 1: Find by React Router loaderData product retailer ID (retailerId === 0 is Bol)
    try {
        const router = unsafeWindow.__reactRouterDataRouter;
        const loaderData = router?.state?.loaderData;
        const page = loaderData?.['routes/search/searchPage']
            ?? loaderData?.['routes/searchPage']
            ?? loaderData?.['routes/browse/browsePage']
            ?? loaderData?.['routes/browsePage'];

        const products = page?.products;
        if (Array.isArray(products) && products.length > 0) {
            products.forEach(p => {
                const retailerId = parseInt(p.bestSellingOffer?.retailer?.id ?? '-1');
                if (retailerId !== 0 && p.id) {
                    const el = document.getElementById(p.id)
                        || document.querySelector(`[id="${p.id}"]`)
                        || document.querySelector(`a[href*="${p.id}"]`);
                    if (el) {
                        const container = findProductContainer(el);
                        if (container) {
                            container.remove();
                            removedCount++;
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.error('[bol-only] router state filtering failed:', e);
    }

    // Strategy 2: DOM-based selector fallback for classic / Polaris lists
    // 1. Classic product rows
    document.querySelectorAll('li.product-item--row').forEach(item => {
        const seller = item.querySelector('div.product-seller');
        if (seller && !isSoldByBol(seller.textContent.trim())) {
            item.remove();
            removedCount++;
        }
    });

    // 2. Polaris/flex product cards
    document.querySelectorAll('[data-bltgi*="ProductList_Middle"]:not([data-bltgi*="banner"])').forEach(item => {
        const seller = item.querySelector('.mt-4');
        if (seller && !isSoldByBol(seller.textContent.trim())) {
            item.remove();
            removedCount++;
        }
    });

    // 3. New Tailwind / container product cards: check for "Verkoop door" texts
    document.querySelectorAll('.\\@container').forEach(item => {
        const text = item.textContent || '';
        if (text.includes('Verkoop door') || text.includes('verkoop door:')) {
            const sellerMatch = text.match(/verkoop door[:\s]*([^\n\r.]+)/i);
            if (sellerMatch && !isSoldByBol(sellerMatch[1])) {
                item.remove();
                removedCount++;
            }
        }
    });

    // Also remove sponsored ad banners in product lists
    document.querySelectorAll('div.col-span-2.md\\:col-span-3').forEach(item => {
        if (item.textContent.includes('Gesponsord')) {
            item.remove();
        }
    });

    const btn = document.getElementById(FILTER_BTN_ID);
    if (btn) {
        btn.textContent = 'Non-Bol filtered';
        btn.style.opacity = '0.6';
        btn.style.pointerEvents = 'none';
    }
}

function injectFilterButton() {
    if (!isListPage() || document.getElementById(FILTER_BTN_ID)) return;

    const btn = document.createElement('div');
    btn.id = FILTER_BTN_ID;
    btn.textContent = 'Only Bol own products';
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        border: '2px solid #0000a4',
        borderRadius: '10px',
        padding: '10px 14px',
        background: '#0000a4',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        zIndex: '999998',
        boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        transition: 'all 0.15s ease',
    });

    btn.addEventListener('mouseenter', () => {
        btn.style.background = '#00007a';
        btn.style.borderColor = '#00007a';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.background = '#0000a4';
        btn.style.borderColor = '#0000a4';
    });
    btn.addEventListener('click', removeNonBol);

    document.body.appendChild(btn);
}

// ---------------------------------------------------------------------------
// UI — simple floating badge, no external dependencies
// ---------------------------------------------------------------------------

const BADGE_ID = 'emp-discount-badge';

function buildBadgeHtml(items) {
    if (items.length === 1) {
        const {discountSet, price} = items[0];
        return `
      <div style="font-size:11px;opacity:0.8;margin-bottom:2px">${discountSet.fullName} — ${discountSet.discount * 100}% off excl. VAT</div>
      <div style="font-size:16px;font-weight:bold">€ ${price.newPriceText}</div>
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

    // Position above the filter button if present
    const hasFilterBtn = Boolean(document.getElementById(FILTER_BTN_ID));
    const bottomOffset = hasFilterBtn ? '70px' : '20px';

    Object.assign(badge.style, {
        position: 'fixed',
        bottom: bottomOffset,
        right: '20px',
        maxWidth: '260px',
        border: '2px solid #0000a4',
        borderRadius: '10px',
        padding: '10px 14px',
        background: '#0000a4',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontSize: '13px',
        lineHeight: '1.4',
        cursor: 'pointer',
        zIndex: '999999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        transition: 'all 0.15s ease',
    });
    badge.title = 'Estimated employee discount. Click to dismiss.';
    badge.addEventListener('mouseenter', () => {
        badge.style.background = '#00007a';
        badge.style.borderColor = '#00007a';
    });
    badge.addEventListener('mouseleave', () => {
        badge.style.background = '#0000a4';
        badge.style.borderColor = '#0000a4';
    });
    badge.addEventListener('click', () => badge.remove());
    document.body.appendChild(badge);
}

// ---------------------------------------------------------------------------
// Main — poll until React Router state is populated, then display
// ---------------------------------------------------------------------------

function run() {
    injectFilterButton();

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
    document.getElementById(FILTER_BTN_ID)?.remove();
    setTimeout(run, 500);
});