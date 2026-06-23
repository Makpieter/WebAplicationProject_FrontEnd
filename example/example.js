/**
 * Forum Questions Page Controller
 * Handles rendering the D&D Questions forum view using mocked data
 */

/**
 * Render the main forum page
 */
function renderExamplePage() {
    const appContainer = document.getElementById('app-container');

    // Ustawienie struktury forum (Zamiast sklepu - widok pytań)
    appContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-chat-square-text-fill text-primary me-2"></i>Forum Pytań D&D</h2>
            <div>
                <button class="btn btn-success" id="add-question-btn">
                    <i class="bi bi-plus-circle"></i> Zadaj nowe pytanie
                </button>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Statystyki Forum</h5>
                    </div>
                    <div class="card-body">
                        <div id="stats-container">Ładowanie statystyk...</div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-dark text-white">
                        <h5 class="mb-0">Popularne Tagi</h5>
                    </div>
                    <div class="card-body">
                        <div id="categories-container">Ładowanie tagów...</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header bg-success text-white">
                <h5 class="mb-0">Wszystkie pytania społeczności</h5>
            </div>
            <div class="card-body">
                <div id="products-table-container">
                    <div class="text-center py-5">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Ładowanie...</span>
                        </div>
                        <p>Pobieranie wątków z bazy karczmy...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Nasłuchiwanie przycisku dodawania pytania
    document.getElementById('add-question-btn').addEventListener('click', () => {
        showAddQuestionModal();
    });

    // Pobranie danych przy użyciu udawanej bazy (Mocka)
    loadExampleData();
}

/**
 * Load all forum data
 */
function loadExampleData() {
    // Wywołujemy pobieranie pytań (które teraz podstawiliśmy pod getAllItems() w api.js)
    MockApiService.getAllItems()
        .then(questions => {
            renderStatistics(questions);
            renderTags(questions);
            renderQuestionsTable(questions);
        })
        .catch(error => {
            showError(`Błąd ładowania danych: ${error.message}`);
        });
}

/**
 * Render forum statistics based on questions data
 * @param {Object[]} questions - Array of forum questions
 */
function renderStatistics(questions) {
    const statsContainer = document.getElementById('stats-container');

    const totalQuestions = questions.length;
    const resolvedQuestions = questions.filter(q => q.status === 'RESOLVED').length;
    const openQuestions = questions.filter(q => q.status === 'OPEN').length;

    // Obliczamy ile pytań posiada przypisane tagi
    const questionsWithTags = questions.filter(q => q.tags && q.tags.length > 0).length;

    statsContainer.innerHTML = `
        <div class="row">
            <div class="col-6 mb-3">
                <div class="d-flex align-items-center">
                    <div class="bg-primary text-white rounded p-2 me-2">
                        <i class="bi bi-journal-text"></i>
                    </div>
                    <div>
                        <div class="text-muted small">Wszystkich</div>
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
                        <div class="text-muted small">Rozwiązane</div>
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
                        <div class="text-muted small">Otwarte</div>
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
                        <div class="text-muted small">Otagowane</div>
                        <div class="fw-bold">${questionsWithTags}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render tags information aggregated from questions
 * @param {Object[]} questions - Array of forum questions
 */
function renderTags(questions) {
    const tagsContainer = document.getElementById('categories-container');

    // Zliczanie wystąpień poszczególnych tagów
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
        tagsHTML += '<div class="col-12 text-muted">Brak tagów do wyświetlenia</div>';
    } else {
        sortedTags.forEach(([tagName, count]) => {
            tagsHTML += `
                <div class="col-md-4 mb-3">
                    <div class="card card-hover bg-light">
                        <div class="card-body py-2">
                            <h6 class="mb-0 d-flex justify-content-between align-items-center">
                                <span><i class="bi bi-hash text-muted"></i>${tagName}</span>
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
 * @param {Object[]} questions - Array of forum questions
 */
function renderQuestionsTable(questions) {
    const tableContainer = document.getElementById('products-table-container');

    // Definiujemy kolumny tabeli idealnie pod encję pytań forum
    const columns = [
        {
            field: 'id',
            title: 'ID',
            width: '5%'
        },
        {
            field: 'title',
            title: 'Temat pytania',
            render: (value) => {
                return `<span class="text-primary fw-bold" style="cursor:pointer;">${value}</span>`;
            }
        },
        {
            field: 'author',
            title: 'Autor / Karczmarz',
            width: '15%',
            render: (author) => {
                if (!author) return '<span class="text-muted">Anonim</span>';
                const badgeColor = author.role === 'MODERATOR' ? 'bg-danger' : 'bg-dark';
                return `<div><strong>${author.username}</strong> <br/><span class="badge ${badgeColor} xsmall">${author.role}</span></div>`;
            }
        },
        {
            field: 'tags',
            title: 'Tagi dyskusji',
            width: '20%',
            render: (tags) => {
                if (!tags || tags.length === 0) return '<span class="text-muted">-</span>';
                return tags.map(t => `<span class="badge bg-outline-secondary border text-dark me-1 mb-1"><i class="bi bi-tag-fill text-muted me-1"></i>${t.name}</span>`).join('');
            }
        },
        {
            field: 'status',
            title: 'Status',
            width: '12%',
            render: (status) => {
                return status === 'RESOLVED' ?
                    '<span class="badge bg-success"><i class="bi bi-check-lg me-1"></i>Rozwiązane</span>' :
                    '<span class="badge bg-warning text-dark"><i class="bi bi-lightning-charge me-1"></i>Otwarte</span>';
            }
        }
    ];

    // Korzystamy z wbudowanego szablonu generowania tabeli w Twoim projekcie
    const table = createTable(questions, {
        columns: columns,
        onView: (id) => {
            showQuestionDetailsModal(id);
        },
        onEdit: (id) => {
            showEditQuestionModal(id);
        },
        onDelete: (id, question) => {
            confirmDeleteQuestion(id, question.title);
        }
    });

    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

/**
 * Show modal with comprehensive question details (with Accepted Answer view)
 * @param {number} id - Question ID
 */
function showQuestionDetailsModal(id) {
    MockApiService.getItemById(id)
        .then(question => {

            // Renderowanie podglądu zaakceptowanej odpowiedzi, jeśli istnieje (Relacja @OneToOne)
            let acceptedAnswerHTML = `
                <div class="alert alert-secondary mt-3">
                    <i class="bi bi-info-circle me-2"></i> Brak zaakceptowanej odpowiedzi dla tego pytania.
                </div>
            `;

            if (question.acceptedAnswer) {
                acceptedAnswerHTML = `
                    <div class="card border-success mt-3 bg-light">
                        <div class="card-header bg-success text-white py-1 d-flex justify-content-between align-items-center">
                            <span><i class="bi bi-patch-check-fill me-1"></i> Zaakceptowana Rozwiązująca Odpowiedź</span>
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
                            <strong>Identyfikator (ID):</strong> <span class="badge bg-light text-dark border">${question.id}</span>
                        </div>
                        <div class="mb-2">
                            <strong>Temat wątku:</strong> <br/> <h5 class="text-primary mt-1">${question.title}</h5>
                        </div>
                    </div>
                    <div class="col-md-5 border-start">
                        <div class="mb-2">
                            <strong>Status wpisu:</strong> ${question.status === 'RESOLVED' ? '<span class="badge bg-success">Rozwiązane</span>' : '<span class="badge bg-warning text-dark">Otwarte</span>'}
                        </div>
                        <div class="mb-2">
                            <strong>Autor wpisu:</strong> <code>${question.author ? question.author.username : 'Nieznany'}</code>
                        </div>
                        <div class="mb-2">
                            <strong>Stworzono:</strong> <small class="text-muted">${formatDate ? formatDate(question.createdAt) : question.createdAt}</small>
                        </div>
                    </div>
                </div>
                <hr class="my-2"/>
                <div class="row">
                    <div class="col-12">
                        <strong>Treść pytania / Opis problemu:</strong>
                        <div class="p-3 bg-light rounded border mt-1 mb-2" style="white-space: pre-wrap;">${question.description}</div>
                    </div>
                </div>
                ${acceptedAnswerHTML}
            `;

            const modal = createModal({
                title: `Szczegóły zapytania forum`,
                content: modalContent,
                size: 'large',
                primaryButton: 'Edytuj treść',
                secondaryButton: 'Zamknij',
                onPrimary: () => {
                    modal.hide();
                    showEditQuestionModal(id);
                }
            });

            modal.show();
        })
        .catch(error => {
            showError(`Nie udało się otworzyć pytania: ${error.message}`);
        });
}

/**
 * Show modal to add a new forum question
 */
function showAddQuestionModal() {
    const fields = [
        {
            id: 'title',
            name: 'title',
            label: 'Temat pytania (D&D)',
            type: 'text',
            placeholder: 'np. Jak działa czar Fireball w ciasnym korytarzu?',
            required: true
        },
        {
            id: 'description',
            name: 'description',
            label: 'Treść pytania (Rozwiń opis)',
            type: 'textarea',
            placeholder: 'Opisz swój problem z zasadami, mechaniką lub fabułą sesji...',
            rows: 4,
            required: true
        },
        {
            id: 'status',
            name: 'status',
            label: 'Status początkowy',
            type: 'select',
            required: true,
            options: [
                { value: 'OPEN', label: 'Otwarte (Oczekuje na odpowiedzi)' },
                { value: 'RESOLVED', label: 'Rozwiązane (Zakończone)' }
            ]
        }
    ];

    const form = createForm(fields, {
        id: 'add-question-form',
        submitLabel: 'Opublikuj na Forum',
        initialValues: {
            status: 'OPEN'
        },
        onSubmit: (formData) => {
            // Doklejamy sztucznego autora i puste tagi na potrzeby makiety sieciowej
            formData.author = { id: 1, username: "ZalogowanyBohater", role: "USER" };
            formData.tags = [{ id: 1, name: "Zasady Ogólne" }];
            formData.acceptedAnswer = null;

            modal.hide();

            // Wywołujemy mockowe zapisanie do tablicy
            MockApiService.createItem(formData)
                .then(() => {
                    showSuccess('Pytanie zostało pomyślnie dodane do bazy karczmy!');
                    loadExampleData();
                })
                .catch(error => {
                    showError(`Nie udało się dodać wpisu: ${error.message}`);
                });
        }
    });

    const modal = createModal({
        title: 'Zadaj nowe pytanie społeczności RPG',
        content: form,
        size: 'large',
        footer: false
    });

    modal.show();
}

/**
 * Show modal to edit an existing forum question
 * @param {number} id - Question ID
 */
function showEditQuestionModal(id) {
    MockApiService.getItemById(id)
        .then(question => {
            const fields = [
                {
                    id: 'title',
                    name: 'title',
                    label: 'Temat pytania',
                    type: 'text',
                    required: true
                },
                {
                    id: 'description',
                    name: 'description',
                    label: 'Treść pytania',
                    type: 'textarea',
                    rows: 4,
                    required: true
                },
                {
                    id: 'status',
                    name: 'status',
                    label: 'Status wątku',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'OPEN', label: 'Otwarte' },
                        { value: 'RESOLVED', label: 'Rozwiązane' }
                    ]
                }
            ];

            const form = createForm(fields, {
                id: 'edit-question-form',
                submitLabel: 'Zapisz zmiany',
                initialValues: question,
                onSubmit: (formData) => {
                    // Zachowujemy oryginalnego autora, tagi i odpowiedzi przy edycji
                    const updatedData = {
                        ...question,
                        title: formData.title,
                        description: formData.description,
                        status: formData.status
                    };

                    modal.hide();

                    MockApiService.updateItem(id, updatedData)
                        .then(() => {
                            showSuccess('Modyfikacja posta zapisana pomyślnie!');
                            loadExampleData();
                        })
                        .catch(error => {
                            showError(`Błąd zapisu modyfikacji: ${error.message}`);
                        });
                }
            });

            const modal = createModal({
                title: `Edycja wątku ID: ${question.id}`,
                content: form,
                size: 'large',
                footer: false
            });

            modal.show();
        })
        .catch(error => {
            showError(`Nie udało się wczytać danych do edycji: ${error.message}`);
        });
}

/**
 * Confirm and delete a forum question
 * @param {number} id - Question ID
 * @param {string} title - Question title
 */
function confirmDeleteQuestion(id, title) {
    confirmAction(`Czy na pewno chcesz bezpowrotnie usunąć wątek: "${title}"?`)
        .then(confirmed => {
            if (confirmed) {
                MockApiService.deleteItem(id)
                    .then(() => {
                        showSuccess('Wątek został pomyślnie usunięty z księgi skarg.');
                        loadExampleData();
                    })
                    .catch(error => {
                        showError(`Nie udało się skasować wpisu: ${error.message}`);
                    });
            }
        });
}