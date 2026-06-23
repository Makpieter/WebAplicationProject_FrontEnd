/**
 * Landing Page Controller
 * Entry point — lets the user choose between logging in or registering
 */

function renderLandingPage() {
    const appContainer = document.getElementById('app-container');

    appContainer.innerHTML = `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4">
                <div class="card shadow-sm">
                    <div class="card-body text-center py-5">
                        <h2 class="mb-2">DnD Q&A Center</h2>
                        <p class="text-vlight mb-5">Welcome! Please log in or create an account to continue.</p>

                        <div class="d-grid gap-3">
                            <button class="btn btn-primary btn-lg" id="go-login-btn">
                                <i class="bi bi-box-arrow-in-right"></i> Log In
                            </button>
                            <button class="btn btn-outline-secondary btn-lg" id="go-register-btn">
                                <i class="bi bi-person-plus"></i> Register
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('go-login-btn').addEventListener('click', () => navigateTo('login'));
    document.getElementById('go-register-btn').addEventListener('click', () => navigateTo('register'));
}