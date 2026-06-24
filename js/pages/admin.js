/**
 * Admin / Moderator Panel — tag management
 * Accessible to: username === 'admin', role === 'ADMIN', role === 'MODERATOR'
 */
function renderAdminPage() {
    const appContainer = document.getElementById('app-container');
    const user = getUser();

    if (!user.canManageTags) {
        appContainer.innerHTML = `
            <div class="text-center mt-5">
                <i class="bi bi-shield-x text-danger" style="font-size:4rem;"></i>
                <h3 class="mt-3">Access denied</h3>
                <p class="text-muted">This page is available only to administrators and moderators.</p>
                <button class="btn btn-primary" onclick="navigateTo('example')">Return to the Forum</button>
            </div>`;
        return;
    }

    appContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-shield-lock-fill text-danger me-2"></i>Administration Panel</h2>
            <button class="btn btn-secondary" onclick="navigateTo('example')">
                <i class="bi bi-arrow-left me-1"></i>Return to the Forum
            </button>
        </div>

        <div class="row">
            <div class="col-md-5">
                <div class="card border-danger mb-4">
                    <div class="card-header bg-danger text-white">
                        <h5 class="mb-0"><i class="bi bi-tag-fill me-2"></i>Add new tag</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label fw-bold">
                                Tag name <span class="text-danger">*</span>
                            </label>
                            <input type="text" id="new-tag-name" class="form-control"
                                   placeholder="e.g. Adventures, Equipment...">
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Description</label>
                            <textarea id="new-tag-desc" class="form-control" rows="2"
                                      placeholder="A short description of what this tag is about..."></textarea>
                        </div>
                        <button class="btn btn-danger w-100" onclick="submitNewTag()">
                            <i class="bi bi-plus-circle me-1"></i>Add tag
                        </button>
                        <div id="tag-form-msg" class="mt-2"></div>
                    </div>
                </div>
            </div>

            <div class="col-md-7">
                <div class="card">
                    <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="bi bi-tags me-2"></i>All tags</h5>
                        <span class="badge bg-secondary" id="tag-count">...</span>
                    </div>
                    <div class="card-body" id="tags-admin-container">
                        <div class="text-center py-3">
                            <div class="spinner-border spinner-border-sm"></div>
                            <span class="ms-2">Loading tags...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadAdminTags();
}

function loadAdminTags() {
    MockApiService.getAllTags().then(tags => {
        const countEl = document.getElementById('tag-count');
        if (countEl) countEl.textContent = tags.length;

        const container = document.getElementById('tags-admin-container');
        if (!container) return;

        if (!tags.length) {
            container.innerHTML = '<p class="text-light text-center">No tags.</p>';
            return;
        }

        container.innerHTML = '';
        tags.forEach(tag => {
            const row = document.createElement('div');
            row.className = 'd-flex justify-content-between align-items-center border-bottom py-2';
            row.innerHTML = `
                <div>
                    <span class="badge border text-light me-2">
                        <i class="bi bi-tag-fill text-light me-1"></i>${tag.name}
                    </span>
                    <small class="text-light">${tag.description || ''}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger"
                    onclick="adminDeleteTag(${tag.id}, '${tag.name.replace(/'/g, "\\'")}')">
                    <i class="bi bi-trash"></i>
                </button>`;
            container.appendChild(row);
        });
    }).catch(err => showError(`Error loading tags: ${err.message}`));
}

function submitNewTag() {
    const name = document.getElementById('new-tag-name')?.value.trim();
    const desc = document.getElementById('new-tag-desc')?.value.trim();
    const msg  = document.getElementById('tag-form-msg');

    if (!name) {
        msg.innerHTML = '<div class="alert alert-warning py-1">Tag name is required.</div>';
        return;
    }

    MockApiService.addTag({ name, description: desc })
        .then(() => {
            msg.innerHTML = '<div class="alert alert-success py-1">Tag added successfully!</div>';
            document.getElementById('new-tag-name').value = '';
            document.getElementById('new-tag-desc').value = '';
            loadAdminTags();
            setTimeout(() => { if (msg) msg.innerHTML = ''; }, 3000);
        })
        .catch(err => {
            msg.innerHTML = `<div class="alert alert-danger py-1">${err.message}</div>`;
        });
}

function adminDeleteTag(id, name) {
    confirmAction(`Usunąć tag "${name}"? Zostanie usunięty ze wszystkich pytań.`)
        .then(confirmed => {
            if (!confirmed) return;
            MockApiService.deleteTag(id)
                .then(() => {
                    showSuccess(`Tag "${name}" usunięty.`);
                    loadAdminTags();
                })
                .catch(err => showError(`Błąd: ${err.message}`));
        });
}
