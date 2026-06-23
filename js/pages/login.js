/**
 * Login Page Controller
 */

function renderLoginPage() {
    const appContainer = document.getElementById('app-container');

    appContainer.innerHTML = `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h3 class="text-center mb-4">Log In</h3>

                        <form id="loginForm">
                            <div class="mb-3">
                                <label for="username" class="form-label">Username</label>
                                <input type="text" id="username" class="form-control" placeholder="Your username" required>
                            </div>
                            <div class="mb-4">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" id="password" class="form-control" placeholder="Your password" required>
                            </div>

                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary">Log In</button>
                                <button type="button" class="btn btn-link" id="back-to-landing-btn">
                                    ← Back
                                </button>
                            </div>
                        </form>

                        <p id="message" class="text-danger mt-3 text-center"></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('back-to-landing-btn').addEventListener('click', () => navigateTo('landing'));

    document.getElementById("loginForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const message  = document.getElementById("message");

        // Sprawdzamy konta wpisane na sztywno pod testy ról
        const isAdmin = (username.toLowerCase() === "admin" || username.toLowerCase() === "makpieter" || username.toLowerCase() === "isari") && password === "1234";
        const isMod   = (username.toLowerCase() === "moderator" || username.toLowerCase() === "miszczignita" || username.toLowerCase() === "saddm") && password === "1234";
        const isPlayer = (username.toLowerCase() === "gracz" || username.toLowerCase() === "wiedzmin") && password === "1234";

        // Sprawdzamy konta z rejestracji użytkownika
        const users = typeof getRegisteredUsers === 'function' ? getRegisteredUsers() : {};
        const isRegistered = users[username] && users[username] === password;

        if (isAdmin || isMod || isPlayer || isRegistered) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loggedInUser", username);

            // Przypisywanie roli do LocalStorage na podstawie loginu
            let role = "USER";

            if (isAdmin) {
                role = "ADMIN";
            } else if (isMod) {
                role = "MODERATOR";
            }

            localStorage.setItem("userRole", role);

            if (typeof updateLogoutButton === 'function') updateLogoutButton();
            navigateTo("home");
        } else {
            message.textContent = "Invalid username or password.";
        }
    });
}