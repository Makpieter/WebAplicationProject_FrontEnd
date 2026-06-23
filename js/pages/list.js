/**
 * List Page Controller
 * Forum-style questions list — same look as the Example page,
 * but backed by ApiService (localStorage) and includes tag selection.
 */

function renderListPage() {
    const appContainer = document.getElementById('app-container');
    const loggedInUser = localStorage.getItem('loggedInUser') || 'Anonymous';

    appContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-chat-square-text-fill text-primary me-2"></i>Question Forum D&amp;D</h2>
            <div>
                <span class="me-3 text-muted small">Zalogowany jako: <strong>${loggedInUser}</strong></span>
                <button class="btn btn-success" id="add-question-btn">
                    <i class="bi bi-plus-circle"></i> Ask new question
                </button>
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
                        <div id="tags-container">Loading tags...</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header bg-success text-white">
                <h5 class="mb-0">All community questions</h5>
            </div>
            <div class="card-body">
                <div id="items-table-container">
                    <div class="text-center py-5">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p>Getting threads from the inn...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('add-question-btn').addEventListener('click', () => {
        showAddQuestionModal();
    });

    loadItems();
}

function loadItems() {
    ApiService.getAllQuestions()
        .then(questions => {
            renderStatistics(questions);
            renderTagCloud(questions);
            renderQuestionsTable(questions);
        })
        .catch(error => {
            document.getElementById('items-table-container').innerHTML = `
                <div class="alert alert-danger">
                    <h4 class="alert-heading">Błąd ładowania pytań</h4>
                    <p>${error.message}</p>
                    <button class="btn btn-primary mt-2" onclick="loadItems()">Spróbuj ponownie</button>
                </div>
            `;
        });
}

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
                    <div><div class="text-muted small">Wszystkie</div><div class="fw-bold">${total}</div></div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-success text-white rounded p-2 me-2"><i class="bi bi-check2-circle"></i></div>
                    <div><div class="text-muted small">Solved</div><div class="fw-bold">${resolved}</div></div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-warning text-white rounded p-2 me-2"><i class="bi bi-hourglass-split"></i></div>
                    <div><div class="text-muted small">Open</div><div class="fw-bold">${open}</div></div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-info text-white rounded p-2 me-2"><i class="bi bi-tags"></i></div>
                    <div><div class="text-muted small">Tagged</div><div class="fw-bold">${tagged}</div></div>
                </div>
            </div>
        </div>
    `;
}

function renderTagCloud(questions) {
    const tagCounts = {};
    questions.forEach(q => {
        (q.tags || []).forEach(tag => {
            tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
        });
    });

    const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    let html = '<div class="row">';
    if (sorted.length === 0) {
        html += '<div class="col-12 text-muted">No tags to display</div>';
    } else {
        sorted.forEach(([name, count]) => {
            html += `
                <div class="col-md-4 mb-2">
                    <div class="card bg-light">
                        <div class="card-body py-2">
                            <h6 class="mb-0 d-flex justify-content-between align-items-center">
                                <span><i class="bi bi-hash text-muted"></i>${name}</span>
                                <span class="badge bg-secondary rounded-pill">${count}</span>
                            </h6>
                        </div>
                    </div>
                </div>`;
        });
    }
    html += '</div>';
    document.getElementById('tags-container').innerHTML = html;
}

function renderQuestionsTable(questions) {
    const tableContainer = document.getElementById('items-table-container');

    const columns = [
        { field: 'id', title: 'ID', width: '5%' },
        {
            field: 'title',
            title: 'Question subject',
            render: (value) => `<span class="text-primary fw-bold" style="cursor:pointer;">${value}</span>`
        },
        {
            field: 'author',
            title: 'Autor',
            width: '15%',
            render: (author) => {
                if (!author) return '<span class="text-muted">Anonim</span>';
                const badge = author.role === 'MODERATOR' ? 'bg-danger' : 'bg-dark';
                return `<div><strong>${author.username}</strong><br>
                    <span class="badge ${badge} xsmall">${author.role}</span></div>`;
            }
        },
        {
            field: 'tags',
            title: 'Tagi',
            width: '22%',
            render: (tags) => {
                if (!tags || tags.length === 0) return '<span class="text-muted">-</span>';
                return tags.map(t =>
                    `<span class="badge bg-outline-secondary border text-dark me-1 mb-1">
                        <i class="bi bi-tag-fill text-muted me-1"></i>${t.name}
                    </span>`
                ).join('');
            }
        },
        {
            field: 'status',
            title: 'Status',
            width: '12%',
            render: (status) => status === 'RESOLVED'
                ? '<span class="badge bg-success"><i class="bi bi-check-lg me-1"></i>Solved</span>'
                : '<span class="badge bg-warning text-dark"><i class="bi bi-lightning-charge me-1"></i>Open</span>'
        }
    ];

    const table = createTable(questions, {
        columns,
        onView:   (id)           => showQuestionDetailsModal(id),
        onEdit:   (id)           => showEditQuestionModal(id),
        onDelete: (id, question) => confirmDeleteItem(id, question.title)
    });

    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);

    if (questions.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'text-center my-5';
        empty.innerHTML = `
            <i class="bi bi-inbox" style="font-size:3rem;"></i>
            <h4 class="mt-3">Brak pytań</h4>
            <p>Nikt jeszcze nic nie zapytał. Bądź pierwszy!</p>
            <button class="btn btn-success" onclick="showAddQuestionModal()">
                <i class="bi bi-plus-circle"></i> Zadaj pierwsze pytanie
            </button>`;
        tableContainer.appendChild(empty);
    }
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
function showQuestionDetailsModal(id) {
    ApiService.getQuestionById(id)
        .then(question => {
            const tagsHTML = (question.tags || []).length
                ? question.tags.map(t =>
                    `<span class="badge border text-dark me-1">
                        <i class="bi bi-tag-fill text-muted me-1"></i>${t.name}
                    </span>`).join('')
                : '<span class="text-muted">Brak tagów</span>';

            const answerHTML = question.acceptedAnswer
                ? `<div class="card border-success mt-3 bg-light">
                    <div class="card-header bg-success text-white py-1 d-flex justify-content-between">
                        <span><i class="bi bi-patch-check-fill me-1"></i>Zaakceptowana odpowiedź</span>
                        <small>Autor: <strong>${question.acceptedAnswer.author.username}</strong></small>
                    </div>
                    <div class="card-body py-2">
                        <p class="mb-0 font-monospace small">${question.acceptedAnswer.content}</p>
                    </div>
                   </div>`
                : `<div class="alert alert-secondary mt-3">
                    <i class="bi bi-info-circle me-2"></i>Brak zaakceptowanej odpowiedzi.
                   </div>`;

            const content = `
                <div class="row">
                    <div class="col-md-7">
                        <div class="mb-2">
                            <strong>ID:</strong>
                            <span class="badge bg-light text-dark border">${question.id}</span>
                        </div>
                        <div class="mb-2">
                            <strong>Temat:</strong>
                            <h5 class="text-primary mt-1">${question.title}</h5>
                        </div>
                        <div class="mb-2"><strong>Tagi:</strong><br>${tagsHTML}</div>
                    </div>
                    <div class="col-md-5 border-start">
                        <div class="mb-2">
                            <strong>Status:</strong>
                            ${question.status === 'RESOLVED'
                                ? '<span class="badge bg-success">Solved</span>'
                                : '<span class="badge bg-warning text-dark">Open</span>'}
                        </div>
                        <div class="mb-2">
                            <strong>Autor:</strong>
                            <code>${question.author ? question.author.username : 'Nieznany'}</code>
                        </div>
                        <div class="mb-2">
                            <strong>Dodano:</strong>
                            <small class="text-muted">${formatDate(question.createdAt)}</small>
                        </div>
                    </div>
                </div>
                <hr/>
                <strong>Treść:</strong>
                <div class="p-3 bg-light rounded border mt-1 mb-2" style="white-space:pre-wrap;">${question.description}</div>
                ${answerHTML}
            `;

            const modal = createModal({
                title: 'Szczegóły pytania',
                content,
                size: 'large',
                primaryButton: 'Edytuj',
                secondaryButton: 'Close',
                onPrimary: () => { modal.hide(); showEditQuestionModal(id); }
            });
            modal.show();
        })
        .catch(err => showError(`Nie udało się otworzyć pytania: ${err.message}`));
}

// ─── Add modal (with tag checkboxes) ─────────────────────────────────────────
function showAddQuestionModal() {
    ApiService.getAllTags()
        .then(tags => {
            const fields = [
                {
                    id: 'title', name: 'title',
                    label: 'Question subject',
                    type: 'text',
                    placeholder: 'e.g. How does the Fireball spell work in a tight corridor?',
                    required: true
                },
                {
                    id: 'description', name: 'description',
                    label: 'Question content',
                    type: 'textarea',
                    placeholder: 'Opisz swój problem z zasadami, mechaniką lub fabułą...',
                    rows: 4,
                    required: true
                },
                {
                    id: 'status', name: 'status',
                    label: 'Status',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'OPEN',     label: 'Open' },
                        { value: 'RESOLVED', label: 'Solved' }
                    ]
                },
                {
                    id: 'tagIds', name: 'tagIds',
                    label: 'Tagi',
                    type: 'checkbox-group',
                    options: tags.map(t => ({ value: t.id, label: t.name })),
                    emptyText: 'Brak dostępnych tagów.'
                }
            ];

            const form = createForm(fields, {
                id: 'add-question-form',
                submitLabel: 'Opublikuj pytanie',
                initialValues: { status: 'OPEN', tagIds: [] },
                onSubmit: (formData) => {
                    modal.hide();
                    ApiService.createQuestion(formData)
                        .then(() => {
                            showSuccess('Pytanie zostało dodane!');
                            loadItems();
                        })
                        .catch(err => showError(`Błąd: ${err.message}`));
                }
            });

            const modal = createModal({
                title: 'Ask new question',
                content: form,
                size: 'large',
                footer: false
            });
            modal.show();
        })
        .catch(() => showError('Nie udało się załadować tagów.'));
}

// ─── Edit modal (with tag checkboxes) ────────────────────────────────────────
function showEditQuestionModal(id) {
    Promise.all([ApiService.getQuestionById(id), ApiService.getAllTags()])
        .then(([question, tags]) => {
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
                    label: 'Status',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'OPEN',     label: 'Open' },
                        { value: 'RESOLVED', label: 'Solved' }
                    ]
                },
                {
                    id: 'tagIds', name: 'tagIds',
                    label: 'Tagi',
                    type: 'checkbox-group',
                    options: tags.map(t => ({ value: t.id, label: t.name })),
                    emptyText: 'Brak dostępnych tagów.'
                }
            ];

            const form = createForm(fields, {
                id: 'edit-question-form',
                submitLabel: 'Save changes',
                initialValues: {
                    ...question,
                    tagIds: (question.tags || []).map(t => t.id)
                },
                onSubmit: (formData) => {
                    modal.hide();
                    ApiService.updateQuestion(id, formData)
                        .then(() => {
                            showSuccess('Zmiany zapisane!');
                            loadItems();
                        })
                        .catch(err => showError(`Błąd zapisu: ${err.message}`));
                }
            });

            const modal = createModal({
                title: `Edycja pytania #${question.id}`,
                content: form,
                size: 'large',
                footer: false
            });
            modal.show();
        })
        .catch(err => showError(`Nie udało się wczytać pytania: ${err.message}`));
}

// ─── Delete ───────────────────────────────────────────────────────────────────
function confirmDeleteItem(id, title) {
    confirmAction(`Czy na pewno chcesz usunąć: "${title}"?`)
        .then(confirmed => {
            if (!confirmed) return;
            ApiService.deleteQuestion(id)
                .then(() => { showSuccess('Pytanie usunięte.'); loadItems(); })
                .catch(err => showError(`Błąd usuwania: ${err.message}`));
        });
}

// ─── Date formatter ───────────────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleString('pl-PL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return dateStr; }
}