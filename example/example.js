/**
 * Forum Questions Page — example.js
 * Handles the full D&D Q&A forum view.
 */

// ─── Module state ─────────────────────────────────────────────────────────────
let allQuestions       = [];   // cache for client-side search
let activeDetailModal  = null; // reference so vote/answer can refresh it

// Always read fresh from localStorage (handles login/logout without reload)
function getUser() {
    const username  = localStorage.getItem('loggedInUser') || 'Guest';
    const role      = localStorage.getItem('userRole')     || 'USER';
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAdmin   = username === 'admin' || role === 'ADMIN';
    const isMod     = role === 'MODERATOR';
    return { username, role, isLoggedIn, isAdmin, isMod, canManageTags: isAdmin || isMod };
}

function fmtDate(str) {
    if (!str) return '—';
    try {
        return new Date(str).toLocaleString('pl-PL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return str; }
}

// ─── Page render ──────────────────────────────────────────────────────────────
function renderExamplePage() {
    const appContainer = document.getElementById('app-container');
    const user = getUser();

    const adminButtons = user.isAdmin ? `
        <button class="btn btn-danger me-2" onclick="navigateTo('admin')">
            <i class="bi bi-shield-lock"></i> Admin Panel
        </button>` : '';

    const modButtons = user.canManageTags && !user.isAdmin ? `
        <button class="btn btn-warning me-2" onclick="navigateTo('admin')">
            <i class="bi bi-tags"></i> Manage Tags
        </button>` : '';

    appContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-chat-square-text-fill text-primary me-2"></i>Question Forum D&D</h2>
            <div>
                ${adminButtons}${modButtons}
                ${user.isLoggedIn ? `
                <button class="btn btn-success" id="add-question-btn">
                    <i class="bi bi-plus-circle"></i> Ask a new question
                </button>` : `
                <span class="text-muted me-2 small">
                    <a href="#" onclick="navigateTo('login')">Log in</a>, to ask a question
                </span>`}
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Forum Statistics</h5>
                    </div>
                    <div class="card-body">
                        <div id="stats-container">Loading statistics...</div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-dark text-white">
                        <h5 class="mb-0">Popular Tags</h5>
                    </div>
                    <div class="card-body">
                        <div id="categories-container">Loading tags...</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header bg-success text-white">
                <h5 class="mb-0">All community questions</h5>
            </div>
            <div class="card-body">
                <!-- Search bar -->
                <div class="row g-2 mb-3 align-items-center">
                    <div class="col-md-5">
                        <input type="text" id="search-text" class="form-control"
                            placeholder="Search by title or author..."
                            oninput="applySearch()">
                    </div>
                    <div class="col-md-5">
                        <select id="search-tag" class="form-select" onchange="applySearch()">
                            <option value="">All tags</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-secondary w-100" onclick="clearSearch()">
                            <i class="bi bi-x-circle me-1"></i>Clear
                        </button>
                    </div>
                </div>
                <div id="products-table-container">
                    <div class="text-center py-5">
                        <div class="spinner-border" role="status"></div>
                        <p class="mt-2">Getting threads from the tavern...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (user.isLoggedIn) {
        document.getElementById('add-question-btn')
            .addEventListener('click', showAddQuestionModal);
    }

    loadExampleData();
}

// ─── Data loading ─────────────────────────────────────────────────────────────
function loadExampleData() {
    Promise.all([MockApiService.getAllItems(), MockApiService.getAllTags()])
        .then(([questions, tags]) => {
            allQuestions = questions;
            renderStatistics(questions);
            renderTagCloud(questions);
            populateTagFilter(tags);
            applySearch();
        })
        .catch(err => showError(`Error loading data: ${err.message}`));
}

function populateTagFilter(tags) {
    const sel = document.getElementById('search-tag');
    if (!sel) return;
    tags.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.name;
        opt.textContent = t.name;
        sel.appendChild(opt);
    });
}

// ─── Search ───────────────────────────────────────────────────────────────────
function applySearch() {
    const text = (document.getElementById('search-text')?.value || '').toLowerCase().trim();
    const tag  = document.getElementById('search-tag')?.value || '';

    let filtered = allQuestions;
    if (text) {
        filtered = filtered.filter(q =>
            q.title.toLowerCase().includes(text) ||
            (q.author && q.author.username.toLowerCase().includes(text))
        );
    }
    if (tag) {
        filtered = filtered.filter(q =>
            q.tags && q.tags.some(t => t.name === tag)
        );
    }
    renderQuestionsTable(filtered);
}

function clearSearch() {
    const txt = document.getElementById('search-text');
    const sel = document.getElementById('search-tag');
    if (txt) txt.value = '';
    if (sel) sel.value = '';
    applySearch();
}

// ─── Statistics ───────────────────────────────────────────────────────────────
function renderStatistics(questions) {
    const total    = questions.length;
    const resolved = questions.filter(q => q.status === 'RESOLVED').length;
    const open     = questions.filter(q => q.status === 'OPEN').length;
    const tagged   = questions.filter(q => q.tags && q.tags.length > 0).length;

    document.getElementById('stats-container').innerHTML = `
        <div class="row">
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-primary text-white rounded p-2 me-2"><i class="bi bi-journal-text"></i></div>
                    <div><div class="text-white small">All</div><div class="fw-bold">${total}</div></div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-success text-white rounded p-2 me-2"><i class="bi bi-check2-circle"></i></div>
                    <div><div class="text-white small">Solved</div><div class="fw-bold">${resolved}</div></div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-warning text-white rounded p-2 me-2"><i class="bi bi-hourglass-split"></i></div>
                    <div><div class="text-white small">Open</div><div class="fw-bold">${open}</div></div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-info text-white rounded p-2 me-2"><i class="bi bi-tags"></i></div>
                    <div><div class="text-white small">Tagged</div><div class="fw-bold">${tagged}</div></div>
                </div>
            </div>
        </div>`;
}

// ─── Tag cloud ────────────────────────────────────────────────────────────────
function renderTagCloud(questions) {
    const counts = {};
    questions.forEach(q => (q.tags || []).forEach(t => {
        counts[t.name] = (counts[t.name] || 0) + 1;
    }));
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    let html = '<div class="row">';
    if (!sorted.length) {
        html += '<div class="col-12 text-muted">No tags to display</div>';
    } else {
        sorted.forEach(([name, count]) => {
            html += `
                <div class="col-md-4 mb-3">
                    <div class="card card-hover bg-light">
                        <div class="card-body py-2">
                            <h6 class="mb-0 d-flex justify-content-between align-items-center">
                                <span style="color: var(--text-dark) !important;"><i class="bi bi-hash" style="color: var(--text-dark) !important; margin-right: 4px;"></i>${name}
                                <span class="badge bg-secondary rounded-pill">${count}</span>
                            </h6>
                        </div>
                    </div>
                </div>`;
        });
    }
    html += '</div>';
    document.getElementById('categories-container').innerHTML = html;
}

// ─── Questions table ──────────────────────────────────────────────────────────
function renderQuestionsTable(questions) {
    const tableContainer = document.getElementById('products-table-container');

    const columns = [
        { field: 'id', title: 'ID', width: '5%' },
        {
            field: 'title', title: 'Question subject',
            //sortable: true,
            render: v => `<span class="text-primary fw-bold" style="cursor:pointer;">${v}</span>`
        },
        {
            field: 'author', title: 'Author', width: '15%',
            //sortable: true,
            render: author => {
                if (!author) return '<span class="text-muted">Anonim</span>';
                const badge = author.role === 'MODERATOR' ? 'bg-danger' :
                              author.role === 'ADMIN'     ? 'bg-danger' : 'bg-dark';
                return `<div><strong>${author.username}</strong><br>
                    <span class="badge ${badge} xsmall">${author.role}</span></div>`;
            }
        },
        {
            field: 'tags', title: 'Tags', width: '20%',
            //sortable: true,
            render: tags => {
                if (!tags || !tags.length) return '<span class="text-muted">-</span>';
                return tags.map(t =>
                    `<span class="badge bg-outline-secondary border text-vlight me-1 mb-1">
                        <i class="bi bi-tag-fill text-vlight me-1"></i>${t.name}
                    </span>`).join('');
            }
        },
        {
            field: 'votes', title: 'Votes', width: '8%',
            render: votes => {
                const v = votes || { up: 0, down: 0 };
                return `<span class="text-success me-1">▲${v.up}</span><span class="text-danger">▼${v.down}</span>`;
            }
        },
        {
            field: 'status', title: 'Status', width: '12%',
            //sortable: true,
            render: status => status === 'RESOLVED'
                ? '<span class="badge bg-success"><i class="bi bi-check-lg me-1"></i>Solved</span>'
                : '<span class="badge bg-warning text-dark"><i class="bi bi-lightning-charge me-1"></i>Open</span>'
        },
        {
            // Custom actions — edit/delete only for owner or admin/mod
            field: 'id', title: 'Actions', width: '15%',
            render: (id, item) => {
                const user    = getUser();
                const isOwner = item.author && item.author.username === user.username;
                const canEdit = isOwner || user.isAdmin || user.isMod;
                const safe    = (item.title || '').replace(/'/g, "\\'").replace(/`/g, '\\`');
                let html = `<button class="btn btn-sm btn-info me-1 mb-1"
                    onclick="showQuestionDetailsModal(${id})">
                    <i class="bi bi-eye"></i> Check
                </button>`;
                if (canEdit) {
                    html += `
                    <button class="btn btn-sm btn-warning me-1 mb-1"
                        onclick="showEditQuestionModal(${id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger mb-1"
                        onclick="confirmDeleteQuestion(${id}, '${safe}')">
                        <i class="bi bi-trash"></i>
                    </button>`;
                }
                return html;
            }
        }
    ];

    const table = createTable(questions, {
        columns,
        actions: { view: false, edit: false, delete: false }
    });

    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);

    if (!questions.length) {
        tableContainer.insertAdjacentHTML('beforeend', `
            <div class="text-center my-4 text-muted">
                <i class="bi bi-inbox" style="font-size:2rem;opacity:0.4"></i>
                <p class="mt-2">No questions matched your search.</p>
            </div>`);
    }
}

// ─── Detail modal (question + answers + voting) ───────────────────────────────

function sortQuestions(field) {
    if (currentSortField === field) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortField = field;
        currentSortDirection = 'asc';
    }

    const sorted = [...currentQuestions];

    sorted.sort((a, b) => {
        let valueA;
        let valueB;

        switch (field) {
            case 'id': valueA = a.id; valueB = b.id; break;
            case 'title': valueA = a.title || ''; valueB = b.title || ''; break;
            case 'author': valueA = a.author?.username || ''; valueB = b.author?.username || ''; break;
            case 'status': valueA = a.status || ''; valueB = b.status || ''; break;
            case 'tags': valueA = a.tags?.length || 0; valueB = b.tags?.length || 0; break;
            default: return 0;
        }

        if (typeof valueA === 'string') {
            const result = valueA.localeCompare(valueB);
            return currentSortDirection === 'asc' ? result : -result;
        }

        return currentSortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    });

    currentQuestions = sorted;
    renderQuestionsTable(sorted);
}

function showQuestionDetailsModal(id) {
    // Create the modal shell first, fill content async
    activeDetailModal = createModal({
        title: 'Question details',
        content: '<div class="text-center py-4"><div class="spinner-border"></div><p class="mt-2">Loading...</p></div>',
        size: 'large',
        footer: false
    });
    activeDetailModal.show();
    refreshDetailModal(id);
}

function refreshDetailModal(id) {
    Promise.all([
        MockApiService.getItemById(id),
        MockApiService.getAnswersForQuestion(id)
    ])
    .then(([question, answers]) => {
        if (activeDetailModal) {
            activeDetailModal.setContent(buildDetailContent(question, answers));
            activeDetailModal.setTitle(`Question #${question.id}`);
        }
    })
    .catch(err => {
        if (activeDetailModal)
            activeDetailModal.setContent(`<div class="alert alert-danger">${err.message}</div>`);
    });
}

function buildDetailContent(question, answers) {
    const user      = getUser();
    const isOwner   = question.author && question.author.username === user.username;
    const canEdit   = isOwner || user.isAdmin || user.isMod;
    const qVotes    = question.votes || { up: 0, down: 0, voters: {} };
    const userQVote = qVotes.voters[user.username] || '';

    // Tags
    const tagsHTML = (question.tags || []).map(t =>
        `<span class="badge border text-dark me-1">
            <i class="bi bi-tag-fill text-muted me-1"></i>${t.name}
        </span>`).join('') || '<span class="text-muted">No tags</span>';

    // Question vote buttons
    const qVoteHTML = user.isLoggedIn ? `
        <button class="btn btn-sm ${userQVote === 'up' ? 'btn-success' : 'btn-outline-success'} me-1"
            onclick="voteQuestion(${question.id}, 'up')">
            <i class="bi bi-hand-thumbs-up"></i> ${qVotes.up}
        </button>
        <button class="btn btn-sm ${userQVote === 'down' ? 'btn-danger' : 'btn-outline-danger'}"
            onclick="voteQuestion(${question.id}, 'down')">
            <i class="bi bi-hand-thumbs-down"></i> ${qVotes.down}
        </button>` :
        `<span class="text-muted small">▲ ${qVotes.up} &nbsp; ▼ ${qVotes.down}</span>`;

    // Edit/Delete buttons (owner or mod/admin only)
    const ownerActionsHTML = canEdit ? `
        <div class="d-flex gap-2 mb-3">
            <button class="btn btn-sm btn-warning"
                onclick="activeDetailModal && activeDetailModal.hide(); showEditQuestionModal(${question.id});">
                <i class="bi bi-pencil me-1"></i>Edit question
            </button>
            <button class="btn btn-sm btn-danger"
                onclick="activeDetailModal && activeDetailModal.hide(); confirmDeleteQuestion(${question.id}, '${(question.title||'').replace(/'/g,"\\'")}');">
                <i class="bi bi-trash me-1"></i>Delete question
            </button>
        </div>` : '';

    // Answers
    let answersHTML = '';
    if (!answers.length) {
        answersHTML = `
            <div class="text-center py-3 text-muted">
                <i class="bi bi-chat-dots" style="font-size:2rem;opacity:0.3"></i>
                <p class="mt-2 mb-0">No replies. Be first!</p>
            </div>`;
    } else {
        // Sort: accepted first, then by upvotes descending
        const sorted = [...answers].sort((a, b) => {
            if (a.id === question.acceptedAnswerId) return -1;
            if (b.id === question.acceptedAnswerId) return 1;
            return (b.votes?.up || 0) - (a.votes?.up || 0);
        });

        sorted.forEach(a => {
            const av         = a.votes || { up: 0, down: 0, voters: {} };
            const userAVote  = av.voters[user.username] || '';
            const isAccepted = a.id === question.acceptedAnswerId;

            const aVoteHTML = user.isLoggedIn ? `
                <button class="btn btn-sm ${userAVote === 'up' ? 'btn-success' : 'btn-outline-success'} me-1"
                    onclick="voteAnswer(${a.id}, ${question.id}, 'up')">
                    <i class="bi bi-hand-thumbs-up"></i> ${av.up}
                </button>
                <button class="btn btn-sm ${userAVote === 'down' ? 'btn-danger' : 'btn-outline-danger'}"
                    onclick="voteAnswer(${a.id}, ${question.id}, 'down')">
                    <i class="bi bi-hand-thumbs-down"></i> ${av.down}
                </button>` :
                `<span class="text-muted small">▲ ${av.up} &nbsp; ▼ ${av.down}</span>`;

            // Accept button — only question owner, only when not yet accepted, only if OPEN
            const acceptHTML = (isOwner && !isAccepted && question.status !== 'RESOLVED') ? `
                <button class="btn btn-sm btn-outline-success ms-2"
                    onclick="acceptAnswer(${question.id}, ${a.id})"
                    title="Zaakceptuj tę odpowiedź jako rozwiązanie">
                    <i class="bi bi-patch-check"></i> Accept
                </button>` : '';

            answersHTML += `
                <div class="card mb-2 ${isAccepted ? 'border-success border-2' : ''}">
                    ${isAccepted ? `
                    <div class="card-header bg-success text-white py-1 small">
                        <i class="bi bi-patch-check-fill me-1"></i>Accepted answer
                    </div>` : ''}
                    <div class="card-body py-2 bg-light">
                        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div>
                                <strong>${a.author ? a.author.username : 'Anonim'}</strong>
                                <span class="text-muted small ms-2">${fmtDate(a.createdAt)}</span>
                            </div>
                            <div class="d-flex align-items-center flex-wrap gap-1">
                                ${aVoteHTML}${acceptHTML}
                            </div>
                        </div>
                        <div class="mt-2 p-2 bg-light rounded" style="white-space:pre-wrap;">${a.content}</div>
                    </div>
                </div>`;
        });
    }

    // Add answer form
    const addAnswerHTML = user.isLoggedIn ? `
        <div class="mt-3">
            <label class="form-label fw-bold">Your answer:</label>
            <textarea id="new-answer-text" class="form-control mb-2" rows="3"
                placeholder="Write your answer..."></textarea>
            <button class="btn btn-primary" onclick="addAnswerToQuestion(${question.id})">
                <i class="bi bi-send me-1"></i>Post a reply
            </button>
        </div>` :
        `<div class="alert alert-secondary mt-3 text-center">
            <a href="#" onclick="navigateTo('login')">Log in</a> to post a reply.
         </div>`;

    return `
        <div class="row mb-3">
            <div class="col-md-7">
                <div class="mb-2">
                    <strong>Topic:</strong>
                    <h5 class="text-primary mt-1">${question.title}</h5>
                </div>
                <div class="mb-2"><strong>Tags:</strong><br><div class="mt-1">${tagsHTML}</div></div>
            </div>
            <div class="col-md-5 border-start">
                <div class="mb-2"><strong>Status:</strong>
                    ${question.status === 'RESOLVED'
                        ? '<span class="badge bg-success">Solved</span>'
                        : '<span class="badge bg-warning text-dark">Open</span>'}
                </div>
                <div class="mb-2"><strong>Author:</strong>
                    <code>${question.author ? question.author.username : 'Unknown'}</code>
                </div>
                <div class="mb-2"><strong>Date:</strong>
                    <small class="text-muted">${fmtDate(question.createdAt)}</small>
                </div>
                <div class="mb-2"><strong>Votes:</strong> ${qVoteHTML}</div>
            </div>
        </div>
        <hr class="my-2"/>
        <strong>Question content:</strong>
        <div class="p-3 bg-light rounded border mt-1 mb-3" style="white-space:pre-wrap;">${question.description}</div>
        ${ownerActionsHTML}
        <h6 class="border-bottom pb-2 mt-2">
            <i class="bi bi-chat-dots me-1"></i>Answers (${answers.length})
        </h6>
        ${answersHTML}
        <hr class="my-2"/>
        ${addAnswerHTML}
    `;
}

// ─── Voting ───────────────────────────────────────────────────────────────────
function voteQuestion(id, direction) {
    if (!getUser().isLoggedIn) { showError('You must be logged in to vote.'); return; }
    MockApiService.voteQuestion(id, direction)
        .then(() => refreshDetailModal(id))
        .catch(err => showError(err.message));
}

function voteAnswer(answerId, questionId, direction) {
    if (!getUser().isLoggedIn) { showError('You must be logged in to vote.'); return; }
    MockApiService.voteAnswer(answerId, direction)
        .then(() => refreshDetailModal(questionId))
        .catch(err => showError(err.message));
}

// ─── Add answer ───────────────────────────────────────────────────────────────
function addAnswerToQuestion(questionId) {
    const textarea = document.getElementById('new-answer-text');
    const content  = (textarea?.value || '').trim();
    if (!content) { showError('The answer cannot be empty.'); return; }

    const btn = textarea.nextElementSibling;
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Posting...'; }

    MockApiService.addAnswer(questionId, content)
        .then(() => {
            showSuccess('Reply published!');
            refreshDetailModal(questionId);
            loadExampleData(); // refresh answer count in stats
        })
        .catch(err => {
            showError(`Error: ${err.message}`);
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-send me-1"></i>Post a reply'; }
        });
}

// ─── Accept answer ────────────────────────────────────────────────────────────
function acceptAnswer(questionId, answerId) {
    MockApiService.acceptAnswer(questionId, answerId)
        .then(() => {
            showSuccess('Answer accepted! Question marked as solved.');
            refreshDetailModal(questionId);
            loadExampleData();
        })
        .catch(err => showError(err.message));
}

// ─── Add question modal ───────────────────────────────────────────────────────
function showAddQuestionModal() {
    MockApiService.getAllTags().then(tags => {
        const fields = [
            {
                id: 'title', name: 'title',
                label: 'Temat pytania (D&D)',
                type: 'text',
                placeholder: 'np. Jak działa czar Fireball w ciasnym korytarzu?',
                required: true
            },
            {
                id: 'description', name: 'description',
                label: 'Treść pytania (Rozwiń opis)',
                type: 'textarea',
                placeholder: 'Opisz swój problem z zasadami, mechaniką lub fabułą sesji...',
                rows: 4,
                required: true
            },
            {
                id: 'status', name: 'status',
                label: 'Status początkowy',
                type: 'select',
                required: true,
                options: [
                    { value: 'OPEN',     label: 'Otwarte (Oczekuje na odpowiedzi)' },
                    { value: 'RESOLVED', label: 'Rozwiązane (Zakończone)' }
                ]
            },
            {
                id: 'tagIds', name: 'tagIds',
                label: 'Tags',
                type: 'checkbox-group',
                options: tags.map(t => ({ value: t.id, label: t.name })),
                emptyText: 'Brak tagów — administrator może je dodać.'
            }
        ];

        const form = createForm(fields, {
            id: 'add-question-form',
            submitLabel: 'Publish on Forum',
            initialValues: { status: 'OPEN', tagIds: [] },
            onSubmit: formData => {
                modal.hide();
                MockApiService.createItem(formData)
                    .then(() => {
                        showSuccess('The question has been successfully added to the inn database!');
                        loadExampleData();
                    })
                    .catch(err => showError(`Failed to add entry: ${err.message}`));
            }
        });

        const modal = createModal({
            title: 'Ask a new question to the RPG community',
            content: form,
            size: 'large',
            footer: false
        });
        modal.show();
    }).catch(() => showError('Failed to load tags.'));
}

// ─── Edit question modal (owner/admin only) ───────────────────────────────────
function showEditQuestionModal(id) {
    Promise.all([MockApiService.getItemById(id), MockApiService.getAllTags()])
        .then(([question, tags]) => {
            const user    = getUser();
            const isOwner = question.author && question.author.username === user.username;
            if (!isOwner && !user.isAdmin && !user.isMod) {
                showError('You can only edit your own questions.');
                return;
            }

            const fields = [
                {
                    id: 'title', name: 'title',
                    label: 'Question subject',
                    type: 'text', required: true
                },
                {
                    id: 'description', name: 'description',
                    label: 'Question content',
                    type: 'textarea', rows: 4, required: true
                },
                {
                    id: 'status', name: 'status',
                    label: 'Thread status',
                    type: 'select', required: true,
                    options: [
                        { value: 'OPEN',     label: 'Open' },
                        { value: 'RESOLVED', label: 'Solved' }
                    ]
                },
                {
                    id: 'tagIds', name: 'tagIds',
                    label: 'Tags',
                    type: 'checkbox-group',
                    options: tags.map(t => ({ value: t.id, label: t.name })),
                    emptyText: 'No tags.'
                }
            ];

            const form = createForm(fields, {
                id: 'edit-question-form',
                submitLabel: 'Save changes',
                initialValues: {
                    ...question,
                    tagIds: (question.tags || []).map(t => t.id)
                },
                onSubmit: formData => {
                    modal.hide();
                    MockApiService.updateItem(id, { ...question, ...formData })
                        .then(() => {
                            showSuccess('Post modification saved successfully!');
                            loadExampleData();
                        })
                        .catch(err => showError(`Błąd zapisu modyfikacji: ${err.message}`));
                }
            });

            const modal = createModal({
                title: `Edit thread ID: ${question.id}`,
                content: form,
                size: 'large',
                footer: false
            });
            modal.show();
        })
        .catch(err => showError(`Error saving modification: ${err.message}`));
}

// ─── Delete ───────────────────────────────────────────────────────────────────
function confirmDeleteQuestion(id, title) {
    confirmAction(`Are you sure you want to permanently delete the thread: "${title}"?`)
        .then(confirmed => {
            if (!confirmed) return;
            MockApiService.deleteItem(id)
                .then(() => {
                    showSuccess('The thread has been successfully removed from the complaint book.');
                    loadExampleData();
                })
                .catch(err => showError(`Failed to delete entry: ${err.message}`));
        });
}
