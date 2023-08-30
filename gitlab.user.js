// ==UserScript==
// @name         gitlab merge all merge requests
// @namespace    https://github.com/ralbuh/tampermonkey
// @version      1.0.1
// @downloadURL  https://github.com/ralbuh/tampermonkey/raw/master/gitlab.user.js
// @updateURL    https://github.com/ralbuh/tampermonkey/raw/master/gitlab.user.js
// @description  Add merge all button for merge request page, will merge everything with gitlab api v4 using csrf-token
// @author       ralbuh
// @include      *gitlab*merge_requests*
// ==/UserScript==

function mergeAll() {
    let csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    let baseUrl = window.location.origin + '/';

    document.querySelectorAll('li.merge-request .merge-request-title a').forEach(link => {
        let splittedUrl = link.href.split('/-/merge_requests/');
        let projectNamespace = splittedUrl[0].replace(baseUrl, '').trim();
        let mergeRequestID = splittedUrl[1];

        fetch(`/api/v4/projects/${encodeURIComponent(projectNamespace)}`)
            .then(res => res.json())
            .then(project => {
                console.log(`Merging merge request: [/api/v4/projects/${project.id}/merge_requests/${mergeRequestID}/merge] for project: [${project.name_with_namespace}]`)

                fetch(`/api/v4/projects/${project.id}/merge_requests/${mergeRequestID}/merge`, { method: 'PUT', headers: { 'X-CSRF-TOKEN': csrfToken } })
                    .then(res => res.json())
                    .then(mr => {
                        console.log(`Merged merge request: [/api/v4/projects/${project.id}/merge_requests/${mergeRequestID}/merge] with description: [${mr.description}]`)
                        console.log(mr)
                    })
            })
    }
    )
    location.reload();
}


(async () => {
    'use strict';

    const mergeAllButton = `
        <div class="gl-ml-3">
            <a class="btn gl-button btn-confirm merge-all-btn" onclick="mergeAll()">Merge All</a>
        </div>
    `;

    document.querySelector('.filter-dropdown-container').insertAdjacentHTML("afterend", mergeAllButton);
})();
