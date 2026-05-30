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

        // Check hardcoded admin account OR any registered user
        const isAdmin = username === "admin" && password === "1234";
        const users   = getRegisteredUsers();
        const isRegistered = users[username] && users[username] === password;

        if (isAdmin || isRegistered) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loggedInUser", username);
            updateLogoutButton();
            navigateTo("home");
        } else {
            message.textContent = "Invalid username or password.";
        }
    });
}