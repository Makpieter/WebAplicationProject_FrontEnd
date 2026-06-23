/**
 * API Service
 * Currently delegates to MockApiService (localStorage) so the app works
 * fully offline/locally. To switch back to the Spring Boot backend later,
 * replace each method body with the commented-out fetch version below it.
 */

const API_CONFIG = {
    baseUrl: 'http://localhost:8765/api',
    endpoints: {
        items: '/items',
        'admin-actions': '/admin-actions',
        answers: '/answers',
        bookmarks: '/bookmarks',
        categories: '/categories',
        comments: '/comments',
        'moderator-actions': '/moderator-actions',
        questions: '/questions',
        reports: '/reports',
        tags: '/tags',
        users: '/users'
    }
};

const ApiService = {

    // ── Low-level fetch helpers (kept for future backend use) ─────────────────

    get: async function(endpoint) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`);
        if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
        return response.json();
    },

    post: async function(endpoint, data) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
        return response.json();
    },

    put: async function(endpoint, data) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
        return response.json();
    },

    delete: async function(endpoint) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
        return true;
    },

    // ── Tags ──────────────────────────────────────────────────────────────────

    getAllTags: function() {
        return MockApiService.getAllTags();
        // ↑ Switch to backend later: return this.get(API_CONFIG.endpoints.tags);
    },

    // ── Questions ─────────────────────────────────────────────────────────────

    getAllQuestions: function() {
        return MockApiService.getAllQuestions();
        // ↑ Switch to backend later: return this.get(API_CONFIG.endpoints.questions);
    },

    getQuestionById: function(id) {
        return MockApiService.getQuestionById(id);
        // ↑ Switch to backend later: return this.get(`${API_CONFIG.endpoints.questions}/${id}`);
    },

    createQuestion: function(question) {
        return MockApiService.createQuestion(question);
        // ↑ Switch to backend later: return this.post(API_CONFIG.endpoints.questions, question);
    },

    updateQuestion: function(id, question) {
        return MockApiService.updateQuestion(id, question);
        // ↑ Switch to backend later: return this.put(`${API_CONFIG.endpoints.questions}/${id}`, question);
    },

    deleteQuestion: function(id) {
        return MockApiService.deleteQuestion(id);
        // ↑ Switch to backend later: return this.delete(`${API_CONFIG.endpoints.questions}/${id}`);
    },

    // ── Legacy item methods (kept so other pages don't break) ─────────────────

    getAllItems: function() {
        return MockApiService.getAllQuestions();
    },

    getItemById: function(id) {
        return MockApiService.getQuestionById(id);
    },

    createItem: function(item) {
        return MockApiService.createQuestion(item);
    },

    updateItem: function(id, item) {
        return MockApiService.updateQuestion(id, item);
    },

    deleteItem: function(id) {
        return MockApiService.deleteQuestion(id);
    }
};