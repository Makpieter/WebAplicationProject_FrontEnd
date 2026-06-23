/**
 * Home Page Controller
 * Renders the home/welcome page of the application
 */

/**
 * Render the home page
 */
function renderHomePage() {
    const appContainer = document.getElementById('app-container');

    appContainer.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body text-center">
                        <h1 class="card-title mb-4">Welcome to DnD Q&A Center!</h1>
                        
                        <p class="card-text">
                            Having some questions about your recent campaign?
                            Are you not sure if a certain action is within the limits?
                            Or maybe your player created the most overpowered character imaginable and you need help?
                            Welcome to the Dundeons & Dragons Q&A Database! Ask your question here, and they shall be answered.
                        </p>
                        
                        <hr>
                        
                        <div class="row mt-4">
                            <div class="col-md-6">
                                <div class="card mb-3 card-hover">
                                    <div class="card-body">
                                        <h5 class="card-title">View Questions</h5>
                                        <p class="card-text">Browse already asked questions</p>
                                        <button class="btn btn-primary" data-action="view-items">
                                            Go to Questions
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="card mb-3 card-hover">
                                    <div class="card-body">
                                        <h5 class="card-title">Create New Question</h5>
                                        <p class="card-text">Question not on the list? Add it!</p>
                                        <button class="btn btn-success" data-action="create-item">
                                            Ask Question
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mt-2">
                            <div class="col-md-12">
                                <div class="card card-hover">
                                    <div class="card-body">
                                        <h5 class="card-title">About This Template</h5>
                                        <p class="card-text">
                                            This site was created to help you find all the questions you might have about your D&D campaign!
                                        </p>
                                        <p>
                                            Key features:
                                        </p>
                                        <ul class="text-start">
                                            <li>Ask and answer questions about your D&D campaign!</li>
                                            <li>Search through our database of questions!</li>
                                            <li>Find other D&D players!</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add event listeners to buttons
    document.querySelector('[data-action="view-items"]').addEventListener('click', () => {
        navigateTo('list');
    });

    document.querySelector('[data-action="create-item"]').addEventListener('click', () => {
        navigateTo('create');
    });
}