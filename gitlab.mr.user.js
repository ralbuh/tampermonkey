// ==UserScript==
// @name         gitlab merge all merge requests
// @namespace    https://gitlab.bol.io/-/snippets/450
// @version      1.3.2
// @downloadURL  https://gitlab.bol.io/-/snippets/450/raw/main/gitlab.user.js
// @updateURL    https://gitlab.bol.io/-/snippets/450/raw/main/gitlab.user.js
// @description  Add merge all and approve all button for merge request page, will merge/approve everything with gitlab api v4 using csrf-token
// @author       Ralph Boijmans
// @include      *gitlab*merge_requests*
// ==/UserScript==

function mergeAll() {
    if (!confirm("Are you sure you want to merge all listed merge requests?")) {
        return;
    }

    let csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    let baseUrl = window.location.origin + '/';

    let allFetches = [...document.querySelectorAll('li.merge-request .merge-request-title a')].map(link => {
        let splittedUrl = link.href.split('/-/merge_requests/');
        let projectNamespace = splittedUrl[0].replace(baseUrl, '').trim();
        let mergeRequestId = splittedUrl[1];
        let projectPathUri = encodeURIComponent(projectNamespace);

        console.log(`Merging merge request: [/api/v4/projects/${projectPathUri}/merge_requests/${mergeRequestId}/merge]`)

        return fetch(`/api/v4/projects/${projectPathUri}/merge_requests/${mergeRequestId}/merge`, {method: 'PUT', headers: {'X-CSRF-TOKEN': csrfToken}})
            .then(res => res.json())
            .then(mr => {
                console.log(`Merged merge request: [/api/v4/projects/${projectPathUri}/merge_requests/${mergeRequestId}/merge] with description: [${mr.description}]`)
                // console.log(mr)
            })
    })

    Promise.all(allFetches).then(() => {
        alert(`Merged ${allFetches.length} merge requests.`);
        location.reload()
    })
}

function approveAll() {
    if (!confirm("Are you sure you want to approve all listed merge requests?")) {
        return;
    }

    let csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    let baseUrl = window.location.origin + '/';

    let allFetches = [...document.querySelectorAll('li.merge-request .merge-request-title a')].map(link => {
        let splittedUrl = link.href.split('/-/merge_requests/');
        let projectNamespace = splittedUrl[0].replace(baseUrl, '').trim();
        let mergeRequestId = splittedUrl[1];
        let projectPathUri = encodeURIComponent(projectNamespace);

        console.log(`Approve merge request: [/api/v4/projects/${projectPathUri}/merge_requests/${mergeRequestId}/approve]`)

        return fetch(`/api/v4/projects/${projectPathUri}/merge_requests/${mergeRequestId}/approve`, {method: 'POST', headers: {'X-CSRF-TOKEN': csrfToken}})
            .then(res => res.json())
            .then(mr => {
                console.log(`Approved merge request: [/api/v4/projects/${projectPathUri}/merge_requests/${mergeRequestId}/merge] with description: [${mr.description}]`)
                // console.log(mr)
            })
    })

    Promise.all(allFetches).then(() => {
        alert(`Approved ${allFetches.length} merge requests.`);
        location.reload()
    })
}

function updateDescription() {
    let description = prompt("Please enter the new description for the merge requests");
    if (description == null) {
        return;
    }

    let csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    let baseUrl = window.location.origin + '/';

    let allFetches = [...document.querySelectorAll('li.merge-request .merge-request-title a')].map(link => {
        let splittedUrl = link.href.split('/-/merge_requests/');
        let projectNamespace = splittedUrl[0].replace(baseUrl, '').trim();
        let mergeRequestId = splittedUrl[1];
        let projectPathUri = encodeURIComponent(projectNamespace);

        console.log(`Updating merge request: [/api/v4/projects/${projectPathUri}/merge_requests/${mergeRequestId}/merge]`)

        return fetch(`/api/v4/projects/${projectPathUri}/merge_requests/${mergeRequestId}?description=${encodeURIComponent(description)}`, {method: 'PUT', headers: {'X-CSRF-TOKEN': csrfToken}})
            .then(res => res.json())
            .then(mr => {
                console.log(`New title for merge request: [/api/v4/projects/${projectPathUri}/merge_requests/${mergeRequestId}] is: [${mr.description}]`)
                // console.log(mr)
            })
    })

    Promise.all(allFetches).then(() => {
        alert(`Updated title for ${allFetches.length} merge requests.`);
        location.reload()
    })
}

(async () => {
    'use strict';

    const mergeAllButton = `
        <div class="gl-ml-3">
            <a class="btn gl-button btn-confirm merge-all-btn">Merge All</a>
        </div>
    `;
    const approveAllButton = `
        <div class="gl-ml-3">
            <a class="btn gl-button btn-confirm approve-all-btn">Approve All</a>
        </div>
    `;
    const updateAllButton = `
        <div class="gl-ml-3">
            <a class="btn gl-button btn-confirm update-all-btn">Update description for all</a>
        </div>
    `;

    document.querySelector('.filter-dropdown-container').insertAdjacentHTML("afterend", mergeAllButton);
    document.querySelector('.filter-dropdown-container').insertAdjacentHTML("afterend", approveAllButton);
    document.querySelector('.filter-dropdown-container').insertAdjacentHTML("afterend", updateAllButton);
    document.querySelector('.merge-all-btn').onclick = mergeAll;
    document.querySelector('.approve-all-btn').onclick = approveAll;
    document.querySelector('.update-all-btn').onclick = updateDescription;
})();