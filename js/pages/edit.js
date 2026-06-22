/**
 * Edit Page Controller
 * Handles creating a new question or editing an existing one
 */

/**
 * Render the edit page
 * @param {number} id - Question ID to edit (null for create mode)
 */
function renderEditPage(id) {
    const appContainer = document.getElementById('app-container');
    const isCreateMode = !id;

    // Set initial page structure
    appContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>${isCreateMode ? 'Ask New Question' : 'Edit Question'}</h2>
            <button class="btn btn-secondary" id="back-btn">
                <i class="bi bi-arrow-left"></i> Back
            </button>
        </div>
        
        <div id="edit-form-container">
            ${isCreateMode ? '' : `
                <div class="text-center my-5">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading question...</p>
                </div>
            `}
        </div>
    `;

    // Add event listener to back button
    document.getElementById('back-btn').addEventListener('click', () => {
        navigateTo(isCreateMode ? 'list' : 'details', isCreateMode ? {} : { id });
    });

    if (isCreateMode) {
        // Create mode - load available tags, then render empty form
        loadTagsAndRenderForm(null);
    } else {
        // Edit mode - load question and tags in parallel
        loadItemForEdit(id);
    }
}

/**
 * Load the list of available tags, then render the form
 * @param {Object|null} item - Question data (null in create mode)
 */
function loadTagsAndRenderForm(item) {
    ApiService.getAllTags()
        .then(tags => {
            renderItemForm(item, tags);
        })
        .catch(error => {
            console.error('Failed to load tags:', error);
            // Don't block question creation just because tags failed to load
            renderItemForm(item, []);
        });
}

/**
 * Load question data for editing
 * @param {number} id - Question ID to load
 */
function loadItemForEdit(id) {
    const formContainer = document.getElementById('edit-form-container');

    ApiService.getQuestionById(id)
        .then(item => {
            loadTagsAndRenderForm(item);
        })
        .catch(error => {
            formContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error Loading Question</h4>
                    <p>${error.message}</p>
                    <hr>
                    <p class="mb-0">The question may not exist or there could be a connection issue.</p>
                    <button class="btn btn-primary mt-3" id="retry-load-btn">
                        Retry
                    </button>
                </div>
            `;

            document.getElementById('retry-load-btn').addEventListener('click', () => {
                loadItemForEdit(id);
            });
        });
}

/**
 * Render the question form
 * @param {Object|null} item - Question data (null in create mode)
 * @param {Object[]} tags   - All available tags from the backend
 */
function renderItemForm(item = null, tags = []) {
    const formContainer = document.getElementById('edit-form-container');
    const isCreateMode = !item;

    const fields = [
        {
            id: 'title',
            name: 'title',
            label: 'Title',
            type: 'text',
            placeholder: 'Enter a short version of your question',
            required: true,
            invalidFeedback: 'Title is required'
        },
        {
            id: 'description',
            name: 'description',
            label: 'Description',
            type: 'textarea',
            required: true,
            placeholder: 'Describe your problem in detail',
            rows: 4
        },
        {
            id: 'tags',
            name: 'tagIds',
            label: 'Tags',
            type: 'checkbox-group',
            options: tags.map(tag => ({ value: tag.id, label: tag.name })),
            emptyText: 'No tags available yet.'
        }
    ];

    // In edit mode, the backend returns item.tags as Tag objects; translate to ids
    // so the checkbox-group can pre-check the right boxes.
    const initialValues = item
        ? { ...item, tagIds: (item.tags || []).map(t => t.id) }
        : { tagIds: [] };

    const form = createForm(fields, {
        id: 'item-form',
        submitLabel: isCreateMode ? 'Post Question' : 'Save Changes',
        initialValues: initialValues,
        onSubmit: (formData) => handleFormSubmit(formData, isCreateMode ? null : item.id),
        onCancel: () => {
            navigateTo(isCreateMode ? 'list' : 'details', isCreateMode ? {} : { id: item.id });
        }
    });

    formContainer.innerHTML = '';

    const formCard = document.createElement('div');
    formCard.className = 'card';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.appendChild(form);

    formCard.appendChild(cardBody);
    formContainer.appendChild(formCard);
}

/**
 * Handle form submission
 * @param {Object} formData - Collected form values
 * @param {number|null} id  - Question ID (null in create mode)
 */
function handleFormSubmit(formData, id) {
    const isCreateMode = !id;

    // Build the payload that QuestionDTO expects
    const questionPayload = {
        title: formData.title,
        description: formData.description,
        tagIds: Array.isArray(formData.tagIds) ? formData.tagIds : [],
        status: 'OPEN',
        // TODO: replace with the actual logged-in user's id once auth is wired up
        authorId: 1
    };

    // Show loading state on the submit button
    const submitButton = document.querySelector('#item-form button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        ${isCreateMode ? 'Posting...' : 'Saving...'}
    `;

    const apiPromise = isCreateMode
        ? ApiService.createQuestion(questionPayload)
        : ApiService.updateQuestion(id, questionPayload);

    apiPromise
        .then(savedQuestion => {
            showSuccess(`Question ${isCreateMode ? 'posted' : 'updated'} successfully`);
            navigateTo('details', { id: savedQuestion.id });
        })
        .catch(error => {
            showError(`Failed to ${isCreateMode ? 'post' : 'update'} question: ${error.message}`);
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        });
}
