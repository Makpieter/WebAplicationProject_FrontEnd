/**
 * Mock API Service
 * Simulates backend API for demonstration purposes
 */

// Sample data
const mockData = {
    items: [
        {
            id: 1,
            title: "Jak obliczyć Klasę Pancerza (AC) dla Barbarzyńcy z wieloklasowością?",
            description: "Mam postać Barbarzyńca 3 / Mnich 2. Czy cechy Obrony bez Pancerza (Unarmored Defense) z obu klas się sumują, czy muszę wybrać jedną?",
            createdAt: "2026-06-20T10:30:00Z",
            updatedAt: "2026-06-21T14:22:00Z",
            status: "RESOLVED",
            author: { id: 42, username: "MistrzMiecza99", role: "USER" },
            tags: [
                { id: 1, name: "Zasady" },
                { id: 2, name: "Barbarzyńca" },
                { id: 3, name: "Wieloklasowość" }
            ],
            acceptedAnswer: {
                id: 101,
                content: "Niestety nie sumują się. Zgodnie z Player's Handbook (str. 164), jeśli masz już cechę Unarmored Defense z jednej klasy, nie możesz jej zyskać z drugiej.",
                author: { id: 7, username: "DungeonMaster_PL", role: "MODERATOR" }
            }
        },
        {
            id: 2,
            title: "Najlepsze czary 1. poziomu dla Zaklinacza (Sorcerer)?",
            description: "Zaczynam nową kampanię i mam ograniczoną liczbę znanych czarów. Co oprócz Taric (Shield) warto wziąć do przeżycia na 1. poziomie?",
            createdAt: "2026-06-22T09:45:00Z",
            updatedAt: "2026-06-22T09:45:00Z",
            status: "OPEN",
            author: { id: 13, username: "FireballEnjoyer", role: "USER" },
            tags: [
                { id: 4, name: "Zaklinacz" },
                { id: 5, name: "Magia" },
                { id: 6, name: "BudowaniePostaci" }
            ],
            acceptedAnswer: null
        },
        {
            id: 3,
            title: "Problem z balansem Deck of Many Things – co robić?",
            description: "Moi gracze na 5. poziomie znaleźli Talię Wielu Rzeczy i łotr wyciągnął kartę 'Rycerz' oraz 'Pustka'. Kampania mi się rozlatuje. Jak uratować fabułę?",
            createdAt: "2026-06-23T15:00:00Z",
            updatedAt: "2026-06-23T15:10:00Z",
            status: "OPEN",
            author: { id: 88, username: "SfrustrowanyDM", role: "USER" },
            tags: [
                { id: 7, name: "MistrzPodziemi" },
                { id: 8, name: "PrzedmiotyMagiczne" }
            ],
            acceptedAnswer: null
        }
    ]
};

// Helper to simulate network delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to deep clone objects to avoid reference issues
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Helper to simulate random response errors (for demonstration)
function simulateRandomError() {
    // 10% chance of error for demo purposes
    if (Math.random() < 0.1) {
        throw new Error("Simulated server error. Try again!");
    }
}

/**
 * Mock API Service object
 */
const MockApiService = {
    /**
     * Simulated GET request
     * @param {string} endpoint - API endpoint
     * @returns {Promise} - Promise that resolves with response data
     */
    get: async function(endpoint) {
        // Simulate network delay
        await delay(300 + Math.random() * 500);

        // Try to simulate errors occasionally
        try {
            simulateRandomError();

            // Parse endpoint to determine what data to return
            if (endpoint === '/items') {
                return deepClone(mockData.items);
            } else if (endpoint.startsWith('/items/')) {
                const id = parseInt(endpoint.split('/')[2]);
                const item = mockData.items.find(item => item.id === id);

                if (!item) {
                    throw new Error(`Item with ID ${id} not found`);
                }

                return deepClone(item);
            } else {
                throw new Error(`Endpoint ${endpoint} not supported`);
            }
        } catch (error) {
            console.error('Mock API Request Failed:', error);
            throw error;
        }
    },

    /**
     * Simulated POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Data to send
     * @returns {Promise} - Promise that resolves with response data
     */
    post: async function(endpoint, data) {
        // Simulate network delay
        await delay(400 + Math.random() * 600);

        try {
            simulateRandomError();

            if (endpoint === '/questions') {


                return deepClone(mockData.items);
            } else {
                throw new Error(`Endpoint ${endpoint} not supported`);
            }
        } catch (error) {
            console.error('Mock API Request Failed:', error);
            throw error;
        }
    },

    /**
     * Simulated PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Data to send
     * @returns {Promise} - Promise that resolves with response data
     */
    put: async function(endpoint, data) {
        // Simulate network delay
        await delay(350 + Math.random() * 550);

        try {
            simulateRandomError();

            if (endpoint.startsWith('/items/')) {
                const id = parseInt(endpoint.split('/')[2]);
                const itemIndex = mockData.items.findIndex(item => item.id === id);

                if (itemIndex === -1) {
                    throw new Error(`Item with ID ${id} not found`);
                }

                // Update the item
                const updatedItem = {
                    ...data,
                    id: id, // Ensure ID doesn't change
                    createdDate: mockData.items[itemIndex].createdDate, // Preserve created date
                    lastUpdated: new Date().toISOString() // Update last updated date
                };

                mockData.items[itemIndex] = updatedItem;

                return deepClone(updatedItem);
            } else {
                throw new Error(`Endpoint ${endpoint} not supported`);
            }
        } catch (error) {
            console.error('Mock API Request Failed:', error);
            throw error;
        }
    },

    /**
     * Simulated DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise} - Promise that resolves with response data
     */
    delete: async function(endpoint) {
        // Simulate network delay
        await delay(300 + Math.random() * 400);

        try {
            simulateRandomError();

            if (endpoint.startsWith('/items/')) {
                const id = parseInt(endpoint.split('/')[2]);
                const itemIndex = mockData.items.findIndex(item => item.id === id);

                if (itemIndex === -1) {
                    throw new Error(`Item with ID ${id} not found`);
                }

                // Remove the item
                mockData.items.splice(itemIndex, 1);

                return true;
            } else {
                throw new Error(`Endpoint ${endpoint} not supported`);
            }
        } catch (error) {
            console.error('Mock API Request Failed:', error);
            throw error;
        }
    },

    // Specific API operations - Same as ApiService but using mock data

    /**
     * Get all items
     * @returns {Promise} - Promise that resolves with all items
     */
    getAllItems: function() {
        return this.get('/items');
    },

    /**
     * Get item by ID
     * @param {number} id - Item ID
     * @returns {Promise} - Promise that resolves with item data
     */
    getItemById: function(id) {
        return this.get(`/items/${id}`);
    },

    /**
     * Create a new item
     * @param {Object} item - Item data
     * @returns {Promise} - Promise that resolves with created item
     */
    createItem: function(item) {
        return this.post('/items', item);
    },

    /**
     * Update an existing item
     * @param {number} id - Item ID
     * @param {Object} item - Updated item data
     * @returns {Promise} - Promise that resolves with updated item
     */
    updateItem: function(id, item) {
        return this.put(`/items/${id}`, item);
    },

    /**
     * Delete an item
     * @param {number} id - Item ID
     * @returns {Promise} - Promise that resolves when item is deleted
     */
    deleteItem: function(id) {
        return this.delete(`/items/${id}`);
    }
};