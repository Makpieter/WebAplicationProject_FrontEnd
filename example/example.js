/**
 * Forum Questions Page Controller
 * Handles rendering the D&D Questions forum view using mocked data
 */

let currentQuestions = [];
let currentSortField = null;
let currentSortDirection = 'asc';

/**
 * Render the main forum page
 */
function renderExamplePage() {
    const appContainer = document.getElementById('app-container');

    // POBIERAMY AKTUALNY STAN Z LOCALSTORAGE PRZY KAŻDYM RENDEROWANIU Strony:
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const loggedInRole = localStorage.getItem("userRole") || "USER";

    // 1. Przygotowujemy puste zmienne na dodatkowe opcje
    let adminButtons = '';
    let moderatorButtons = '';
    let addQuestionButton = '';

    // Przyciski generujemy dynamicznie na podstawie AKTUALNEGO stanu sesji
    if (isLoggedIn) {
        // Zielony przycisk TYLKO dla zalogowanych
        addQuestionButton = `
            <button class="btn btn-success" id="add-question-btn">
                <i class="bi bi-plus-circle"></i> Ask new question
            </button>
        `;

        if (loggedInRole === 'ADMIN') {
            adminButtons = `
                <button class="btn btn-danger me-2" id="admin-panel-btn">
                    <i class="bi bi-shield-lock"></i> Panel Administratora
                </button>
            `;
        }

        if (loggedInRole === 'MODERATOR' || loggedInRole === 'ADMIN') {
            moderatorButtons = `
                <button class="btn btn-warning me-2" id="mod-reports-btn">
                    <i class="bi bi-exclamation-triangle"></i> Zgłoszenia postów
                </button>
            `;
        }
    }

    // 2. Składamy strukturę strony
    appContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-chat-square-text-fill text-primary me-2"></i>Question Forum D&D</h2>
          <div>
             ${adminButtons}
             ${moderatorButtons}

             <button class="btn btn-info me-2" id="search-question-btn">
                <i class="bi bi-search"></i> Search
             </button>

             ${addQuestionButton}
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
                <div id="products-table-container">
                    <div class="text-center py-5">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p>Getting threads from the tavern...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 3. Bezpieczne podpięcie zdarzeń – listenery odpalą się tylko, jeśli dany przycisk istnieje w DOM
    if (isLoggedIn && document.getElementById('admin-panel-btn')) {
        document.getElementById('admin-panel-btn').addEventListener('click', () => {
            alert('You enter the secret dungeons of the Oracle database as Administrator!');
        });
    }
    if (isLoggedIn && document.getElementById('mod-reports-btn')) {
        document.getElementById('mod-reports-btn').addEventListener('click', () => {
            alert('Opening a list of reported players breaking the tavern rules...');
        });
    }

    // Listener dla wyszukiwania (dostępny dla każdego)
    document.getElementById('search-question-btn').addEventListener('click', () => {
        showSearchModal();
    });

    // Przycisk dodawania odpali się tylko, gdy użytkownik jest zalogowany (bo tylko wtedy przycisk istnieje w HTML)
    if (isLoggedIn && document.getElementById('add-question-btn')) {
        document.getElementById('add-question-btn').addEventListener('click', () => {
            showAddQuestionModal();
        });
    }

    // Wywołanie ładowania danych z mocka
    loadExampleData();
}

/**
 * Load all forum data
 */
function loadExampleData() {
    MockApiService.getAllItems()
        .then(questions => {
            currentQuestions = [...questions];
            renderStatistics(questions);
            renderTags(questions);
            renderQuestionsTable(questions);
        });
}

function showSearchModal() {
    Promise.all([
        MockApiService.getAllItems(),
        ApiService.getAllTags()
    ])
        .then(([questions, tags]) => {

            const fields = [
                { id: 'question', name: 'question', label: 'Question', type: 'text' },
                { id: 'author', name: 'author', label: 'Author', type: 'text' },
                {
                    id: 'tags',
                    name: 'tagIds',
                    label: 'Tags',
                    type: 'checkbox-group',
                    options: tags.map(tag => ({ value: tag.id, label: tag.name }))
                }
            ];

            const form = createForm(fields, {
                id: 'search-form',
                submitLabel: 'Search',
                initialValues: { tagIds: [] },
                onSubmit: (formData) => {
                    let filtered = [...questions];

                    if (formData.question?.trim()) {
                        const phrase = formData.question.toLowerCase();
                        filtered = filtered.filter(q =>
                            q.title?.toLowerCase().includes(phrase) ||
                            q.description?.toLowerCase().includes(phrase)
                        );
                    }

                    if (formData.author?.trim()) {
                        const author = formData.author.toLowerCase();
                        filtered = filtered.filter(q =>
                            q.author?.username?.toLowerCase().includes(author)
                        );
                    }

                    if (formData.tagIds?.length) {
                        filtered = filtered.filter(question => {
                            const questionTagIds = (question.tags || []).map(tag => tag.id);
                            return formData.tagIds.every(tagId => questionTagIds.includes(tagId));
                        });
                    }

                    renderQuestionsTable(filtered);
                    modal.hide();
                    showSuccess(`Found ${filtered.length} matching questions`);
                }
            });

            form.classList.add('search-theme');

            const modal = createModal({
                title: 'Search Questions',
                content: form,
                size: 'large',
                footer: false
            });

            modal.show();
        })
        .catch(error => {
            showError(error.message);
        });
}

/**
 * Render forum statistics based on questions data
 */
function renderStatistics(questions) {
    const statsContainer = document.getElementById('stats-container');

    const totalQuestions = questions.length;
    const resolvedQuestions = questions.filter(q => q.status === 'RESOLVED').length;
    const openQuestions = questions.filter(q => q.status === 'OPEN').length;
    const questionsWithTags = questions.filter(q => q.tags && q.tags.length > 0).length;

    statsContainer.innerHTML = `
        <div class="row">
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-primary text-white rounded p-2 me-2">
                        <i class="bi bi-journal-text"></i>
                    </div>
                    <div>
                        <div class="text-white small">Wszystkie</div>
                        <div class="fw-bold">${totalQuestions}</div>
                    </div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-success text-white rounded p-2 me-2">
                        <i class="bi bi-check2-circle"></i>
                    </div>
                    <div>
                        <div class="text-white small">Solved</div>
                        <div class="fw-bold">${resolvedQuestions}</div>
                    </div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-warning text-white rounded p-2 me-2">
                        <i class="bi bi-hourglass-split"></i>
                    </div>
                    <div>
                        <div class="text-white small">Open</div>
                        <div class="fw-bold">${openQuestions}</div>
                    </div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-info text-white rounded p-2 me-2">
                        <i class="bi bi-tags"></i>
                    </div>
                    <div>
                        <div class="text-white small">Tagged</div>
                        <div class="fw-bold">${questionsWithTags}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render tags information aggregated from questions
 */
function renderTags(questions) {
    const tagsContainer = document.getElementById('categories-container');

    const tagCounts = {};
    questions.forEach(q => {
        if (q.tags && Array.isArray(q.tags)) {
            q.tags.forEach(tag => {
                if (!tagCounts[tag.name]) {
                    tagCounts[tag.name] = 0;
                }
                tagCounts[tag.name]++;
            });
        }
    });

    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    let tagsHTML = '<div class="row">';
    if (sortedTags.length === 0) {
        tagsHTML += '<div class="col-12 text-muted">No tags to display</div>';
    } else {
        sortedTags.forEach(([tagName, count]) => {
            tagsHTML += `
                <div class="col-md-4 mb-3">
                    <div class="card card-hover bg-light">
                        <div class="card-body py-2">
                            <h6 class="mb-0 d-flex justify-content-between align-items-center">
                                <span class="text-muted"><i class="bi bi-hash text-muted"></i>${tagName}</span>
                                <span class="badge bg-secondary rounded-pill">${count}</span>
                            </h6>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    tagsHTML += '</div>';
    tagsContainer.innerHTML = tagsHTML;
}

/**
 * Render questions table matching the Question.java backend fields
 */
function renderQuestionsTable(questions) {
    const tableContainer = document.getElementById('products-table-container');

    // POBIERAMY ŚWIEŻE DANE Z SESJI BEZPOŚREDNIO PRZY BUDOWANIU TABELI:
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const loggedInRole = localStorage.getItem("userRole") || "USER";

    const columns = [
        { field: 'id', title: 'ID', width: '5%', sortable: true },
        {
            field: 'title',
            title: 'Question subject',
            sortable: true,
            render: (value) => `<span class="text-light fw-bold" style="cursor:pointer;">${value}</span>`
        },
        {
            field: 'author',
            title: 'Author / Sojourner',
            sortable: true,
            width: '15%',
            render: (author) => {
                if (!author) return '<span class="text-light">Anonim</span>';
                const badgeColor = author.role === 'MODERATOR' ? 'bg-danger' : 'bg-dark';
                return `<div><strong>${author.username}</strong> <br/><span class="badge ${badgeColor} xsmall">${author.role}</span></div>`;
            }
        },
        {
            field: 'tags',
            title: 'Discussion tags',
            sortable: true,
            width: '20%',
            render: (tags) => {
                if (!tags || tags.length === 0) return '<span class="text-light">-</span>';
                return tags.map(t => `<span class="badge bg-outline-secondary border text-light me-1 mb-1"><i class="bi bi-tag-fill text-light me-1"></i>${t.name}</span>`).join('');
            }
        },
        {
            field: 'status',
            title: 'Status',
            sortable: true,
            width: '12%',
            render: (status) => {
                return status === 'RESOLVED' ?
                    '<span class="badge bg-success"><i class="bi bi-check-lg me-1"></i>Solved</span>' :
                    '<span class="badge bg-warning text-dark"><i class="bi bi-lightning-charge me-1"></i>Open</span>';
            }
        }
    ];

    const tableOptions = {
        columns,
        onSort: (field) => { sortQuestions(field); },
        onView: (id) => { showQuestionDetailsModal(id); }
    };

    // AKCJE TABELI: Przypisujemy przyciski na podstawie świeżo pobranej roli z localStorage!
    if (isLoggedIn) {
        if (loggedInRole === 'ADMIN' || loggedInRole === 'MODERATOR') {
            tableOptions.onEdit = (id) => showEditQuestionModal(id);
        }
        if (loggedInRole === 'ADMIN') {
            tableOptions.onDelete = (id, question) => confirmDeleteQuestion(id, question.title);
        }
    }

    const table = createTable(questions, tableOptions);
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

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

/**
 * Show modal with comprehensive question details
 */
function showQuestionDetailsModal(id) {
    MockApiService.getItemById(id)
        .then(question => {
            let acceptedAnswerHTML = `
                <div class="alert alert-secondary mt-3">
                    <i class="bi bi-info-circle me-2"></i> There is no accepted answer for this question.
                </div>
            `;

            if (question.acceptedAnswer) {
                acceptedAnswerHTML = `
                    <div class="card border-success mt-3 bg-light">
                        <div class="card-header bg-success text-white py-1 d-flex justify-content-between align-items-center">
                            <span><i class="bi bi-patch-check-fill me-1"></i> Accepted Resolving Answer</span>
                            <small>Autor: <strong>${question.acceptedAnswer.author.username}</strong></small>
                        </div>
                        <div class="card-body py-2">
                            <p class="mb-0 card-text font-monospace small">${question.acceptedAnswer.content}</p>
                        </div>
                    </div>
                `;
            }

            const modalContent = `
                <div class="row">
                    <div class="col-md-7">
                        <div class="mb-2">
                            <strong>ID:</strong> <span class="badge bg-light text-dark border">${question.id}</span>
                        </div>
                        <div class="mb-2">
                            <strong>Thread subject:</strong> <br/> <h5 class="text-primary mt-1">${question.title}</h5>
                        </div>
                    </div>
                    <div class="col-md-5 border-start">
                        <div class="mb-2">
                            <strong>Post status:</strong> ${question.status === 'RESOLVED' ? '<span class="badge bg-success">Solved</span>' : '<span class="badge bg-warning text-dark">Open</span>'}
                        </div>
                        <div class="mb-2">
                            <strong>Post author:</strong> <code>${question.author ? question.author.username : 'Unknown'}</code>
                        </div>
                        <div class="mb-2">
                            <strong>Created:</strong> <small class="text-muted">${typeof formatDate === 'function' ? formatDate(question.createdAt) : question.createdAt}</small>
                        </div>
                    </div>
                </div>
                <hr class="my-2"/>
                <div class="row">
                    <div class="col-12">
                        <strong>Question content / Problem description:</strong>
                        <div class="p-3 bg-light rounded border mt-1 mb-2" style="white-space: pre-wrap;">${question.description}</div>
                    </div>
                </div>
                ${acceptedAnswerHTML}
            `;

            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const loggedInRole = localStorage.getItem("userRole") || "USER";
            const showEditBtn = isLoggedIn && (loggedInRole === 'ADMIN' || loggedInRole === 'MODERATOR');

            const modal = createModal({
                title: `Forum inquiry details`,
                content: modalContent,
                size: 'large',
                primaryButton: showEditBtn ? 'Edit content' : null,
                secondaryButton: 'Close',
                onPrimary: () => {
                    modal.hide();
                    showEditQuestionModal(id);
                }
            });

            modal.show();
        })
        .catch(error => {
            showError(`Failed to open question: ${error.message}`);
        });
}

/**
 * Show modal to add a new forum question
 */
function showAddQuestionModal() {
    ApiService.getAllTags()
        .then(tags => { buildAndShowModal(tags); })
        .catch(error => {
            console.error('Failed to load tags:', error);
            buildAndShowModal([]);
        });

    function buildAndShowModal(tagsList) {
        const fields = [
            { id: 'title', name: 'title', label: 'Question subject (D&D)', type: 'text', placeholder: 'e.g. How does the Fireball spell work in a tight corridor?', required: true },
            { id: 'description', name: 'description', label: 'Question text (Expand description)', type: 'textarea', placeholder: 'Describe your issue with the rules, mechanics, or plot of the session...', rows: 4, required: true },
            { id: 'status', name: 'status', label: 'Initial status', type: 'select', required: true, options: [{ value: 'OPEN', label: 'Open (Waiting for responses)' }, { value: 'RESOLVED', label: 'Resolved (Solved)' }] },
            { id: 'tags', name: 'tagIds', label: 'Tags', type: 'checkbox-group', options: tagsList.map(tag => ({ value: tag.id, label: tag.name })), emptyText: 'No tags available yet.' }
        ];

        const form = createForm(fields, {
            id: 'add-question-form',
            submitLabel: 'Post on the Forum',
            initialValues: { status: 'OPEN', tagIds: [] },
            onSubmit: (formData) => {
                formData.author = {
                    id: 1,
                    username: localStorage.getItem("loggedInUser") || "ZalogowanyBohater",
                    role: localStorage.getItem("userRole") || "USER"
                };
                formData.acceptedAnswer = null;

                const selectedIds = formData.tagIds || [];
                formData.tags = tagsList.filter(tag => selectedIds.includes(tag.id));

                delete formData.tagIds;
                modal.hide();

                MockApiService.createItem(formData)
                    .then(() => {
                        showSuccess('The question has been successfully added to the inn database!');
                        loadExampleData();
                    })
                    .catch(error => { showError(`Failed to add entry: ${error.message}`); });
            }
        });

        const modal = createModal({ title: 'Ask new question to the RPG community', content: form, size: 'large', footer: false });
        modal.show();
    }
}

/**
 * Show modal to edit an existing forum question
 */
function showEditQuestionModal(id) {
    MockApiService.getItemById(id)
        .then(question => {
            const fields = [
                { id: 'title', name: 'title', label: 'Question subject', type: 'text', required: true },
                { id: 'description', name: 'description', label: 'Question content', type: 'textarea', rows: 4, required: true },
                { id: 'status', name: 'status', label: 'Thread status', type: 'select', required: true, options: [{ value: 'OPEN', label: 'Open' }, { value: 'RESOLVED', label: 'Solved' }] }
            ];

            const form = createForm(fields, {
                id: 'edit-question-form',
                submitLabel: 'Save changes',
                initialValues: question,
                onSubmit: (formData) => {
                    const updatedData = {
                        ...question,
                        title: formData.title,
                        description: formData.description,
                        status: formData.status
                    };

                    modal.hide();

                    MockApiService.updateItem(id, updatedData)
                        .then(() => {
                            showSuccess('Post modification saved successfully!');
                            loadExampleData();
                        })
                        .catch(error => { showError(`Error saving modifications: ${error.message}`); });
                }
            });

            const modal = createModal({ title: `Edit thread ID: ${question.id}`, content: form, size: 'large', footer: false });
            modal.show();
        })
        .catch(error => { showError(`Failed to load data for editing: ${error.message}`); });
}

/**
 * Confirm and delete a forum question
 */
function confirmDeleteQuestion(id, title) {
    confirmAction(`Are you sure you want to permanently delete the thread: "${title}"?`)
        .then(confirmed => {
            if (confirmed) {
                MockApiService.deleteItem(id)
                    .then(() => {
                        showSuccess('The thread has been successfully removed from the complaint book.');
                        loadExampleData();
                    })
                    .catch(error => { showError(`Failed to delete entry: ${error.message}`); });
            }
        });
}