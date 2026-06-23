/**
 * Main application script
 * Handles routing and application initialization
 */

// Application state
const appState = {
    currentRoute: 'home',
    params: {},
};

// DOM elements
const appContainer = document.getElementById('app-container');

/**
 * Show or hide the logout button depending on login state
 */
function updateLogoutButton() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
        // Jeśli zalogowany: pokazujemy przycisk jako "Log Out" z czerwonym/ciemnym akcentem
        logoutBtn.textContent = "Log Out";
        logoutBtn.className = "btn btn-outline-danger btn-sm align-middle ms-2"; // możesz dostosować klasy pod Bootstrapa
        logoutBtn.style.display = "inline-block";
    } else {
        // Jeśli gość: zmieniamy tekst na "Log In" i styl na wyróżniający się
        logoutBtn.textContent = "Log In";
        logoutBtn.className = "btn btn-primary btn-sm align-middle ms-2";
        logoutBtn.style.display = "inline-block"; // Robimy go widocznym dla gościa!
    }
}

/**
 * Simple router implementation
 * @param {string} route - Route name to navigate to
 * @param {Object} params - Route parameters
 */
function navigateTo(route, params = {}) {
    appState.currentRoute = route;
    appState.params = params;
    renderCurrentRoute();

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-route') === route) {
            link.classList.add('active');
        }
    });
}

/**
 * Renders the current route content
 */
function renderCurrentRoute() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // NAPRAWIONE: 'home' oraz 'example' są teraz oficjalnie publiczne dla gości
    const publicRoutes = ['landing', 'login', 'register', 'home', 'example'];

    if (!isLoggedIn && !publicRoutes.includes(appState.currentRoute)) {
        appState.currentRoute = 'landing';
        appState.params = {};
    }

    // Show loading indicator
    appContainer.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    // Render content based on route
    try {
        switch (appState.currentRoute) {
            case 'landing':
                renderLandingPage();
                break;
            case 'login':
                renderLoginPage();
                break;
            case 'register':
                renderRegisterPage();
                break;
            case 'home':
                renderHomePage();
                break;
            case 'list':
                renderListPage();
                break;
            case 'details':
                renderDetailsPage(appState.params.id);
                break;
            case 'edit':
                renderEditPage(appState.params.id);
                break;
            case 'create':
                renderEditPage();
                break;
            case 'example':
                if (typeof renderExamplePage === 'function') {
                    renderExamplePage();
                } else {
                    renderNotFoundPage();
                }
                break;
            default:
                renderNotFoundPage();
        }
    } catch (err) {
        console.error('Error rendering route:', appState.currentRoute, err);
        appContainer.innerHTML = `
            <div class="alert alert-danger m-4">
                <strong>Render error:</strong> ${err.message}. Check the browser console for details.
            </div>
        `;
    }
}

/**
 * Fallback page for unknown routes
 */
function renderNotFoundPage() {
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = `
        <div class="row justify-content-center mt-5">
            <div class="col-md-6 text-center">
                <h2>404 — Page Not Found</h2>
                <p class="text-muted">The page you're looking for doesn't exist.</p>
                <button class="btn btn-primary" onclick="navigateTo('home')">Go Home</button>
            </div>
        </div>
    `;
}

/**
 * Shows an error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    Swal.fire({
        title: 'Error!',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

/**
 * Shows a success message
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    Swal.fire({
        title: 'Success!',
        text: message,
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

/**
 * Confirms an action
 * @param {string} message - Confirmation message
 * @returns {Promise} - Resolves to true if confirmed, false otherwise
 */
function confirmAction(message) {
    return Swal.fire({
        title: 'Are you sure?',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then(result => {
        return result.isConfirmed;
    });
}

/**
 * Initialize the application
 */
function initApp() {
    // Bezpieczne wylogowanie z potwierdzeniem SweetAlert
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

            if (isLoggedIn) {
                // Jeśli był zalogowany -> pytamy o wylogowanie
                confirmAction("Czy na pewno chcesz opuścić karczmę i się wylogować?")
                    .then(confirmed => {
                        if (confirmed) {
                            localStorage.removeItem("isLoggedIn");
                            localStorage.removeItem("loggedInUser");
                            localStorage.removeItem("userRole");
                            updateLogoutButton();
                            navigateTo("login");
                        }
                    });
            } else {
                // Jeśli był gościem -> po prostu przekierowujemy do logowania
                navigateTo("login");
            }
        });
    }

    // Show/hide logout button based on current auth state
    updateLogoutButton();

    // Set up navigation event listeners
    document.querySelectorAll('[data-route]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const route = element.getAttribute('data-route');
            navigateTo(route);
        });
    });

    // NAPRAWIONE: Ustalenie trasy startowej bez blokowania gości
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
        navigateTo("landing"); // lub "home", zależy co chcecie pokazać niezalogowanym jako pierwsze
    } else {
        navigateTo("home");
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);