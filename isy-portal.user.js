// ==UserScript==
// @name         ISY Portal - Download Photo
// @namespace    https://github.com/ralbuh/tampermonkey
// @version      1.0.0
// @description  Add a download button to the ISY portal fancybox photo viewer
// @author       Ralbuh
// @downloadURL  https://github.com/ralbuh/tampermonkey/raw/master/isy-portal.user.js
// @updateURL    https://github.com/ralbuh/tampermonkey/raw/master/isy-portal.user.js
// @match        *://*.isy-school.nl/*
// @grant        GM_download
// ==/UserScript==

(function () {
    'use strict';

    let currentSrc = null;
    let currentFilename = null;

    function downloadCurrent() {
        const src = currentSrc || getFallbackSrc();
        if (!src) return;
        const name = currentFilename || src.split('/').pop();
        GM_download({ url: src, name });
    }

    function getFallbackSrc() {
        const img = document.querySelector('.fancybox-slide--current .fancybox-image')
            || document.querySelector('.fancybox-slide--complete .fancybox-image');
        return img ? img.src : null;
    }

    function addDownloadButton() {
        if (document.getElementById('isy-download-btn')) return;
        const buttonsDiv = document.querySelector('.fancybox-buttons');
        if (!buttonsDiv) return;

        const btn = document.createElement('button');
        btn.id = 'isy-download-btn';
        btn.className = 'fancybox-button';
        btn.title = 'Download (D)';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:1em;height:1em;fill:currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>`;
        btn.addEventListener('click', downloadCurrent);
        buttonsDiv.appendChild(btn);
    }

    const observer = new MutationObserver(() => {
        if (document.querySelector('.fancybox-container')) {
            addDownloadButton();
        }
    });
    observer.observe(document.body, { childList: true });

    document.addEventListener('keydown', (e) => {
        if ((e.key === 'd' || e.key === 'D') && document.querySelector('.fancybox-container')) {
            downloadCurrent();
        }
    });

    // Use fancybox events via jQuery to track which slide is active
    function hookFancybox($) {
        $(document).on('afterShow.fb', (e, instance, slide) => {
            currentSrc = slide.src;
            const caption = slide.opts && slide.opts.caption;
            currentFilename = (caption ? caption.trim() : slide.src.split('/').pop().replace(/\.[^.]+$/, '')) + '.jpg';
            addDownloadButton();
        });
    }

    if (typeof jQuery !== 'undefined') {
        hookFancybox(jQuery);
    } else {
        const jqWatcher = setInterval(() => {
            if (typeof jQuery !== 'undefined') {
                clearInterval(jqWatcher);
                hookFancybox(jQuery);
            }
        }, 200);
    }
})();
