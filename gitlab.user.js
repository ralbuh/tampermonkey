// ==UserScript==
// @name         gitlab utilities
// @namespace    https://gitlab.bol.io/-/snippets/450
// @version      1.5.0
// @downloadURL  https://gitlab.bol.io/-/snippets/450/raw/main/gitlab.user.js
// @updateURL    https://gitlab.bol.io/-/snippets/450/raw/main/gitlab.user.js
// @description  Add merge all and approve all button for merge request page, will merge/approve everything with gitlab api v4 using csrf-token
// @author       Ralph Boijmans
// @include      *gitlab*merge_requests*
// @include      *gitlab*/-/branches/stale*
// ==/UserScript==

function mergeAll() {
    if (!confirm("Are you sure you want to merge all listed merge requests?")) return;

    processing();

    // Extract project path per-link: document.body.dataset.projectId is absent on group-level MR pages
    // and wrong for mixed-project lists. The link href always contains the correct project path.
    let allFetches = [...document.querySelectorAll('li.merge-request a.issue-title-text')].map(link => {
        const [projectPath, mergeRequestId] = link.href.split('/-/merge_requests/');
        const encodedProject = encodeURIComponent(new URL(projectPath).pathname.slice(1));

        console.log(`Merging merge request: [/api/v4/projects/${encodedProject}/merge_requests/${mergeRequestId}/merge]`)

        return fetch(`/api/v4/projects/${encodedProject}/merge_requests/${mergeRequestId}/merge`, {method: 'PUT', headers: {'X-CSRF-TOKEN': csrfToken}})
            .then(res => res.json())
            .then(mr => {
                console.log(`Merged merge request: [/api/v4/projects/${encodedProject}/merge_requests/${mergeRequestId}/merge] with description: [${mr.description}]`)
                // console.log(mr)
            })
    })

    Promise.all(allFetches).then(() => {
        alert(`Merged ${allFetches.length} merge requests.`);
        location.reload()
    })
}

function approveAll() {
    if (!confirm("Are you sure you want to approve all listed merge requests?")) return;

    processing();
    
    // See mergeAll: extract project path per-link, not from document.body.dataset.projectId
    let allFetches = [...document.querySelectorAll('li.merge-request a.issue-title-text')].map(link => {
        const [projectPath, mergeRequestId] = link.href.split('/-/merge_requests/');
        const encodedProject = encodeURIComponent(new URL(projectPath).pathname.slice(1));

        console.log(`Approve merge request: [/api/v4/projects/${encodedProject}/merge_requests/${mergeRequestId}/approve]`)

        return fetch(`/api/v4/projects/${encodedProject}/merge_requests/${mergeRequestId}/approve`, {method: 'POST', headers: {'X-CSRF-TOKEN': csrfToken}})
            .then(res => res.json())
            .then(mr => {
                console.log(`Approved merge request: [/api/v4/projects/${encodedProject}/merge_requests/${mergeRequestId}/merge] with description: [${mr.description}]`)
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
    if (description == null) return;

    processing();

    // See mergeAll: extract project path per-link, not from document.body.dataset.projectId
    let allFetches = [...document.querySelectorAll('li.merge-request a.issue-title-text')].map(link => {
        const [projectPath, mergeRequestId] = link.href.split('/-/merge_requests/');
        const encodedProject = encodeURIComponent(new URL(projectPath).pathname.slice(1));

        console.log(`Updating merge request: [/api/v4/projects/${encodedProject}/merge_requests/${mergeRequestId}]`)

        return fetch(`/api/v4/projects/${encodedProject}/merge_requests/${mergeRequestId}?description=${encodeURIComponent(description)}`, {method: 'PUT', headers: {'X-CSRF-TOKEN': csrfToken}})
            .then(res => res.json())
            .then(mr => {
                console.log(`New title for merge request: [/api/v4/projects/${encodedProject}/merge_requests/${mergeRequestId}] is: [${mr.description}]`)
                // console.log(mr)
            })
    })

    Promise.all(allFetches).then(() => {
        alert(`Updated title for ${allFetches.length} merge requests.`);
        location.reload()
    })
}

async function deleteStaleBranches() {
    const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

    processing();

    let shownBranches = [...document.querySelectorAll('ul.all-branches li.branch-item a.ref-name')].map(link => {
        return link.text.trim()
    });
    console.log('shown branches: ' + shownBranches);

    let branches = []
    branches = await fetch(`/api/v4/projects/${document.body.dataset.projectId}/repository/branches?state=stale&per_page=100&page=1`).then(r => r.json());
    const staleBranches = branches.filter(b => !b.default && !b.protected && new Date(b.commit.committed_date) < oneYearAgo);
    console.log('stale branches: ' + staleBranches.map(sb => sb.name));

    const checks = await Promise.all(staleBranches.map(async b => {
        const encoded = encodeURIComponent(b.name);
        const [merged, closed] = await Promise.all([
            fetch(`/api/v4/projects/${document.body.dataset.projectId}/merge_requests?source_branch=${encoded}&state=merged`).then(r => r.json()),
            fetch(`/api/v4/projects/${document.body.dataset.projectId}/merge_requests?source_branch=${encoded}&state=closed`).then(r => r.json()),
        ]);
        return { branch: b, hasClosedMR: merged.length > 0 || closed.length > 0 };
    }));

    const toDelete = checks.filter(c => c.hasClosedMR).map(c => c.branch);
    console.log('to delete branches: ' + shownBranches);

    document.body.style.removeProperty("opacity");
    document.body.style.removeProperty("cursor");

    if (!toDelete.length) {
        alert("No stale branches with merged/closed MRs found.");
        return;
    }

    const branchList = toDelete.map(b => `- ${b.name} (${b.commit.committed_date.slice(0, 10)})`).join('\n');

    if (!confirm(`Delete ${toDelete.length} stale branches?\n\n${branchList}`)) return;
    processing();

    await Promise.all(toDelete.map(b => {
        console.log(`Deleting branch: ${b.name}`);
        return fetch(`/api/v4/projects/${document.body.dataset.projectId}/repository/branches/${encodeURIComponent(b.name)}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrfToken }
        });
    }));

    alert(`Deleted ${toDelete.length} stale branches.`);
    location.reload();
}

function processing() { 
    document.body.style.opacity = "0.2";
    document.body.style.cursor = 'progress';
}

function done() { document.body.style.removeProperty("opacity") }

const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

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

    if (window.location.pathname.includes('/-/branches/stale')) {
        const deleteStaleBranchesButton = `
            <div class="gl-ml-3">
                <a class="btn gl-button btn-danger delete-stale-branches-btn">Delete stale branches</a>
            </div>
        `;

        document.querySelector('.gl-search-box-by-click').insertAdjacentHTML("afterend", deleteStaleBranchesButton);
        document.querySelector('.delete-stale-branches-btn').onclick = deleteStaleBranches;
        return;
    }

    document.querySelector('.sort-dropdown-container').insertAdjacentHTML("afterend", mergeAllButton);
    document.querySelector('.sort-dropdown-container').insertAdjacentHTML("afterend", approveAllButton);
    document.querySelector('.sort-dropdown-container').insertAdjacentHTML("afterend", updateAllButton);
    document.querySelector('.merge-all-btn').onclick = mergeAll;
    document.querySelector('.approve-all-btn').onclick = approveAll;
    document.querySelector('.update-all-btn').onclick = updateDescription;
})();
