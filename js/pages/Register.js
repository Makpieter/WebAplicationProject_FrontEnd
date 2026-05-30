/**
 * Register Page Controller
 * Handles new user registration
 */

function renderRegisterPage() {
    const appContainer = document.getElementById('app-container');

    appContainer.innerHTML = `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h3 class="text-center mb-4">Create Account</h3>

                        <form id="registerForm" novalidate>
                            <div class="mb-3">
                                <label for="reg-username" class="form-label">Username</label>
                                <input type="text" id="reg-username" class="form-control" placeholder="Choose a username" required>
                                <div class="invalid-feedback">Username is required.</div>
                            </div>
                            <div class="mb-3">
                                <label for="reg-password" class="form-label">Password</label>
                                <input type="password" id="reg-password" class="form-control" placeholder="Choose a password" required>
                                <div class="invalid-feedback">Password is required.</div>
                            </div>
                            <div class="mb-4">
                                <label for="reg-password-confirm" class="form-label">Confirm Password</label>
                                <input type="password" id="reg-password-confirm" class="form-control" placeholder="Repeat your password" required>
                                <div class="invalid-feedback">Please confirm your password.</div>
                            </div>

                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-success">Register</button>
                                <button type="button" class="btn btn-link" id="back-to-landing-btn">
                                    ← Back
                                </button>
                            </div>
                        </form>

                        <p id="reg-message" class="text-danger mt-3 text-center"></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('back-to-landing-btn').addEventListener('click', () => navigateTo('landing'));

    document.getElementById('registerForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const form = document.getElementById('registerForm');
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm  = document.getElementById('reg-password-confirm').value;
        const message  = document.getElementById('reg-message');

        // Basic HTML5 validation
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Password match check
        if (password !== confirm) {
            message.textContent = 'Passwords do not match.';
            return;
        }

        // Check if username is already taken (stored in localStorage)
        const users = getRegisteredUsers();
        if (users[username]) {
            message.textContent = 'That username is already taken.';
            return;
        }

        // Save the new user
        users[username] = password;
        localStorage.setItem('registeredUsers', JSON.stringify(users));

        // Go back to landing so they can log in
        showSuccess('Account created! You can now log in.');
        navigateTo('landing');
    });
}

/**
 * Returns the map of registered users from localStorage.
 * @returns {Object} - { username: password, ... }
 */
function getRegisteredUsers() {
    try {
        return JSON.parse(localStorage.getItem('registeredUsers')) || {};
    } catch {
        return {};
    }
}