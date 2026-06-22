/**
 * Form Component
 * Creates dynamic forms with validation
 */

/**
 * Create a form with fields and submit handler
 * @param {Object[]} fields - Array of field configurations
 * @param {Object} options - Form options
 * @returns {HTMLElement} - Form element
 */
function createForm(fields, options) {
    const defaultOptions = {
        id: 'dynamic-form',
        submitLabel: 'Save',
        cancelLabel: 'Cancel',
        showCancel: true,
        onSubmit: null,
        onCancel: null,
        initialValues: {}
    };

    // Merge default options with provided options
    const formOptions = { ...defaultOptions, ...options };

    // Create form element
    const form = document.createElement('form');
    form.id = formOptions.id;
    form.className = 'needs-validation';
    form.noValidate = true;

    // Add fields
    fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'mb-3';

        // Label
        const label = document.createElement('label');
        label.htmlFor = field.id;
        label.className = field.required ? 'form-label required-field' : 'form-label';
        label.textContent = field.label;
        formGroup.appendChild(label);

        // Input field
        let inputElement;

        switch (field.type) {
            case 'textarea':
                inputElement = document.createElement('textarea');
                inputElement.rows = field.rows || 3;
                break;

            case 'select':
                inputElement = document.createElement('select');

                // Add options
                if (field.options) {
                    field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.label;
                        inputElement.appendChild(optionElement);
                    });
                }
                break;

            case 'checkbox':
                const checkboxDiv = document.createElement('div');
                checkboxDiv.className = 'form-check';

                inputElement = document.createElement('input');
                inputElement.type = 'checkbox';
                inputElement.className = 'form-check-input';

                const checkboxLabel = document.createElement('label');
                checkboxLabel.className = 'form-check-label';
                checkboxLabel.htmlFor = field.id;
                checkboxLabel.textContent = field.checkboxLabel || field.label;

                checkboxDiv.appendChild(inputElement);
                checkboxDiv.appendChild(checkboxLabel);
                formGroup.appendChild(checkboxDiv);
                break;

            case 'checkbox-group': {
                // Renders one checkbox per option (e.g. tags). Zero, one, or many
                // can be checked. Collected as an array of values on submit.
                const groupDiv = document.createElement('div');
                groupDiv.id = field.id;
                groupDiv.className = 'checkbox-group';

                const options = field.options || [];
                const initial = formOptions.initialValues[field.name || field.id];
                // initial may be an array of raw values (ids) or of objects with an id
                const initialValues = Array.isArray(initial)
                    ? initial.map(v => (v && typeof v === 'object') ? v.id : v).map(String)
                    : [];

                if (options.length === 0 && field.emptyText) {
                    const emptyMsg = document.createElement('div');
                    emptyMsg.className = 'text-muted small';
                    emptyMsg.textContent = field.emptyText;
                    groupDiv.appendChild(emptyMsg);
                }

                options.forEach(option => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'form-check form-check-inline';

                    const optionCheckbox = document.createElement('input');
                    optionCheckbox.type = 'checkbox';
                    optionCheckbox.className = 'form-check-input';
                    optionCheckbox.id = `${field.id}-${option.value}`;
                    optionCheckbox.name = field.name || field.id;
                    optionCheckbox.value = option.value;
                    optionCheckbox.checked = initialValues.includes(String(option.value));

                    const optionLabel = document.createElement('label');
                    optionLabel.className = 'form-check-label';
                    optionLabel.htmlFor = optionCheckbox.id;
                    optionLabel.textContent = option.label;

                    optionDiv.appendChild(optionCheckbox);
                    optionDiv.appendChild(optionLabel);
                    groupDiv.appendChild(optionDiv);
                });

                formGroup.appendChild(groupDiv);
                // No single inputElement for this type - skip the common-attribute block below.
                inputElement = null;
                break;
            }

            default:
                inputElement = document.createElement('input');
                inputElement.type = field.type || 'text';
        }

        // Set common attributes
        if (inputElement) {
            inputElement.id = field.id;
            inputElement.name = field.name || field.id;
            inputElement.className = field.type === 'checkbox' ? 'form-check-input' : 'form-control';

            if (field.placeholder) {
                inputElement.placeholder = field.placeholder;
            }

            if (field.required) {
                inputElement.required = true;
            }

            // Set initial value if provided
            if (formOptions.initialValues[field.name || field.id] !== undefined) {
                if (field.type === 'checkbox') {
                    inputElement.checked = formOptions.initialValues[field.name || field.id];
                } else {
                    inputElement.value = formOptions.initialValues[field.name || field.id];
                }
            }

            // Add any additional attributes
            if (field.attributes) {
                Object.keys(field.attributes).forEach(attr => {
                    inputElement.setAttribute(attr, field.attributes[attr]);
                });
            }

            // Add to form group if not already added (checkbox case)
            if (field.type !== 'checkbox') {
                formGroup.appendChild(inputElement);
            }
        }

        // Add validation feedback
        if (field.required) {
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = field.invalidFeedback || 'This field is required.';
            formGroup.appendChild(feedback);
        }

        // Add help text if provided
        if (field.helpText) {
            const helpText = document.createElement('div');
            helpText.className = 'form-text text-muted';
            helpText.textContent = field.helpText;
            formGroup.appendChild(helpText);
        }

        form.appendChild(formGroup);
    });

    // Form buttons
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'd-flex gap-2 mt-4';

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn btn-primary';
    submitButton.textContent = formOptions.submitLabel;
    buttonGroup.appendChild(submitButton);

    // Cancel button
    if (formOptions.showCancel) {
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn btn-secondary';
        cancelButton.textContent = formOptions.cancelLabel;
        cancelButton.onclick = (e) => {
            e.preventDefault();
            if (formOptions.onCancel) {
                formOptions.onCancel();
            }
        };
        buttonGroup.appendChild(cancelButton);
    }

    form.appendChild(buttonGroup);

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Check validity
        if (form.checkValidity() === false) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        // Collect form data
        const formData = {};

        fields.forEach(field => {
            const fieldName = field.name || field.id;

            if (field.type === 'checkbox-group') {
                const checkedBoxes = document.querySelectorAll(
                    `#${field.id} input[type="checkbox"]:checked`
                );
                formData[fieldName] = Array.from(checkedBoxes).map(cb => Number(cb.value));
                return;
            }

            const element = document.getElementById(field.id);

            if (element) {
                if (field.type === 'checkbox') {
                    formData[fieldName] = element.checked;
                } else {
                    formData[fieldName] = element.value;
                }
            }
        });

        // Call submit handler
        if (formOptions.onSubmit) {
            formOptions.onSubmit(formData);
        }
    });

    return form;
}