/**
 * Profile Page — matches example.js visual style
 */
function renderProfilePage() {
    const appContainer = document.getElementById('app-container');
    const user = getUser(); // reuse helper from example.js

    appContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-person-circle text-primary me-2"></i>My Profile</h2>
            <button class="btn btn-secondary" onclick="navigateTo('example')">
                <i class="bi bi-arrow-left me-1"></i>Return to the Forum
            </button>
        </div>

        <div class="row mb-4">
            <!-- Left: identity card -->
            <div class="col-md-4">
                <div class="card mb-3">
                    <div class="card-body text-center py-4">
                        <div class="rounded-circle bg-primary text-white d-inline-flex
                             align-items-center justify-content-center mb-3"
                             style="width:80px;height:80px;font-size:2.2rem;">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <h4 class="mb-1">${user.username}</h4>
                        ${user.isAdmin
                            ? '<span class="badge bg-danger">Administrator</span>'
                            : user.isMod
                            ? '<span class="badge bg-warning text-dark">Moderator</span>'
                            : '<span class="badge bg-secondary">User</span>'}
                        <hr/>
                        <div id="profile-stats" class="text-muted small">
                            <div class="spinner-border spinner-border-sm"></div>
                        </div>
                    </div>
                </div>

                ${user.canManageTags ? `
                <div class="card border-danger">
                    <div class="card-body text-center">
                        <p class="text-light small mb-2">You have permission to manage tags.</p>
                        <button class="btn btn-danger w-100" onclick="navigateTo('admin')">
                            <i class="bi bi-shield-lock-fill me-1"></i>Administration Panel
                        </button>
                    </div>
                </div>` : ''}
            </div>

            <!-- Right: history -->
            <div class="col-md-8">
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="bi bi-question-circle me-2"></i>My questions</h5>
                    </div>
                    <div class="card-body" id="my-questions-container">
                        <div class="text-center py-3">
                            <div class="spinner-border spinner-border-sm"></div>
                            <span class="ms-2">Loading questions...</span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0"><i class="bi bi-chat-dots me-2"></i>My answers</h5>
                    </div>
                    <div class="card-body" id="my-answers-container">
                        <div class="text-center py-3">
                            <div class="spinner-border spinner-border-sm"></div>
                            <span class="ms-2">Loading answers...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadProfileData(user.username);
}

function loadProfileData(username) {
    Promise.all([
        MockApiService.getAllItems(),
        MockApiService.getAllItems().then(qs =>
            Promise.all(qs.map(q => MockApiService.getAnswersForQuestion(q.id)))
                   .then(allAnswers => allAnswers.flat())
        )
    ])
    .then(([questions, answers]) => {
        const myQuestions = questions.filter(q => q.author && q.author.username === username);
        const myAnswers   = answers.filter(a => a.author && a.author.username === username);

        renderProfileStats(myQuestions, myAnswers);
        renderMyQuestions(myQuestions);
        renderMyAnswers(myAnswers, questions);
    })
    .catch(err => {
        document.getElementById('my-questions-container').innerHTML =
            `<div class="alert alert-danger">Błąd: ${err.message}</div>`;
    });
}

function renderProfileStats(questions, answers) {
    const resolved = questions.filter(q => q.status === 'RESOLVED').length;
    const totalVotesReceived = questions.reduce((s, q) => s + (q.votes?.up || 0), 0)
                             + answers.reduce((s, a) => s + (a.votes?.up || 0), 0);

    document.getElementById('profile-stats').innerHTML = `
        <div class="row text-center">
            <div class="col-4">
                <div class="fw-bold fs-5 text-primary">${questions.length}</div>
                <div class="text-primary">Questions</div>
            </div>
            <div class="col-4">
                <div class="fw-bold fs-5 text-success">${answers.length}</div>
                <div class="text-success">Answers</div>
            </div>
            <div class="col-4">
                <div class="fw-bold fs-5 text-warning">${totalVotesReceived}</div>
                <div class="text-warning">Votes ▲</div>
            </div>
        </div>
        <div class="mt-2 text-center text-light">
            <small>${resolved} of ${questions.length} questions solved</small>
        </div>
    `;
}

function renderMyQuestions(questions) {
    const container = document.getElementById('my-questions-container');
    if (!questions.length) {
        container.innerHTML = `
            <div class="text-center py-3 text-light">
                <i class="bi bi-inbox" style="font-size:2rem;opacity:0.3"></i>
                <p class="mt-2 mb-2">You haven't asked any questions yet.</p>
                <button class="btn btn-success btn-sm" onclick="navigateTo('example')">
                    <i class="bi bi-plus-circle me-1"></i>Ask your first question
                </button>
            </div>`;
        return;
    }

    container.innerHTML = '';
    questions.forEach(q => {
        const tagsHTML = (q.tags || []).map(t =>
            `<span class="badge border text-light me-1">
                <i class="bi bi-tag-fill text-light me-1"></i>${t.name}
            </span>`).join('');

        const statusBadge = q.status === 'RESOLVED'
            ? '<span class="badge bg-success">Solved</span>'
            : '<span class="badge bg-warning text-dark">Open</span>';

        const votes = q.votes || { up: 0, down: 0 };

        const card = document.createElement('div');
        card.className = 'card mb-2';
        card.innerHTML = `
            <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1 me-2" style="cursor:pointer"
                         onclick="navigateTo('example'); setTimeout(() => showQuestionDetailsModal(${q.id}), 300)">
                        <div class="fw-bold text-primary">${q.title}</div>
                        <div class="mt-1">${tagsHTML || '<span class="text-muted small">no tags</span>'}</div>
                        <small class="text-light">▲ ${votes.up} votes</small>
                    </div>
                    <div class="text-end text-nowrap">
                        ${statusBadge}
                    </div>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

function renderMyAnswers(answers, allQuestions) {
    const container = document.getElementById('my-answers-container');
    if (!answers.length) {
        container.innerHTML = `
            <div class="text-center py-3 text-light">
                <i class="bi bi-chat-dots" style="font-size:2rem;opacity:0.3"></i>
                <p class="mt-2 mb-0">You haven't answered any questions yet.</p>
            </div>`;
        return;
    }

    container.innerHTML = '';
    answers.forEach(a => {
        const parentQ   = allQuestions.find(q => q.id === a.questionId);
        const votes     = a.votes || { up: 0, down: 0 };
        const isAccepted = parentQ && parentQ.acceptedAnswerId === a.id;

        const card = document.createElement('div');
        card.className = `card mb-2 ${isAccepted ? 'border-success' : ''}`;
        card.innerHTML = `
            <div class="card-body py-2">
                ${isAccepted ? '<div class="text-success small mb-1"><i class="bi bi-patch-check-fill me-1"></i>Zaakceptowana odpowiedź</div>' : ''}
                <div class="text-light small mb-1">
                    In question: <strong style="cursor:pointer" class="text-primary"
                        onclick="navigateTo('example'); setTimeout(() => showQuestionDetailsModal(${a.questionId}), 300)">
                        ${parentQ ? parentQ.title : '#' + a.questionId}
                    </strong>
                </div>
                <div class="p-2 bg-light rounded text-dark" style="white-space:pre-wrap;font-size:.9em;">${a.content}</div>
                <div class="mt-1">
                    <small class="text-success">▲ ${votes.up}</small>
                    <small class="text-danger ms-2">▼ ${votes.down}</small>
                    <small class="text-light ms-3">${fmtDate(a.createdAt)}</small>
                </div>
            </div>`;
        container.appendChild(card);
    });
}
