function renderLoginPage() {
    const appContainer = document.getElementById('app-container');

    appContainer.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h3 class="text-center mb-4">Login</h3>

                        <form id="loginForm">
                            <div class="mb-3">
                                <input type="text" id="username" class="form-control" placeholder="Login" required>
                            </div>
                            <div class="mb-3">
                                <input type="password" id="password" class="form-control" placeholder="Password" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Log in</button>
                        </form>

                        <p id="message" class="text-danger mt-3 text-center"></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("loginForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Hardcoded credentials - replace with real auth when ready
        const correctUsername = "admin";
        const correctPassword = "1234";

        if (username === correctUsername && password === correctPassword) {
            localStorage.setItem("isLoggedIn", "true");
            updateLogoutButton();
            navigateTo("home");
        } else {
            document.getElementById("message").textContent = "Invalid username or password";
        }
    });
}