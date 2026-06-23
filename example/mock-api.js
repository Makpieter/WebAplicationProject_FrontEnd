/**
 * Local Storage API Service
 * Acts as a local "database" stored on this computer via localStorage.
 * No backend or internet connection needed.
 *
 * Uses a 'dbVersion' key so seed data is loaded exactly once,
 * even if localStorage already has empty arrays from a previous run.
 */

const DB_VERSION = 2; // bump this number to force a reseed

// ─── Default tags ─────────────────────────────────────────────────────────────
const DEFAULT_TAGS = [
    { id: 1,  name: 'Rules',         description: 'Questions about official D&D rules and rulings' },
    { id: 2,  name: 'Combat',        description: 'Tactics, actions, reactions, and combat mechanics' },
    { id: 3,  name: 'Magic',         description: 'Spells, spell slots, concentration, and magic items' },
    { id: 4,  name: 'Character',     description: 'Character creation, classes, subclasses, and backgrounds' },
    { id: 5,  name: 'Races',         description: 'Playable races and their traits' },
    { id: 6,  name: 'Monsters',      description: 'Monster stat blocks, abilities, and lore' },
    { id: 7,  name: 'Worldbuilding', description: 'Setting, lore, and narrative world design' },
    { id: 8,  name: 'DM Advice',     description: 'Guidance and tips for Dungeon Masters' },
    { id: 9,  name: 'Player Advice', description: 'Guidance and tips for players' },
    { id: 10, name: 'Items',         description: 'Weapons, armour, and non-magical equipment' },
    { id: 11, name: 'Magic Items',   description: 'Attunement, identification, and specific magic items' },
    { id: 12, name: 'Feats',         description: 'Feat selection and interactions' },
    { id: 13, name: 'Multiclassing', description: 'Multiclass rules, combinations, and builds' },
    { id: 14, name: 'Skills',        description: 'Skill checks, proficiency, and ability scores' },
    { id: 15, name: 'Exploration',   description: 'Travel, navigation, traps, and environment' }
];

// ─── Seed questions ───────────────────────────────────────────────────────────
const DEFAULT_QUESTIONS = [
    {
        id: 1,
        title: "Jak obliczyć Klasę Pancerza (AC) dla Barbarzyńcy z wieloklasowością?",
        description: "Mam postać Barbarzyńca 3 / Mnich 2. Czy cechy Obrony bez Pancerza (Unarmored Defense) z obu klas się sumują, czy muszę wybrać jedną?",
        createdAt: "2026-06-20T10:30:00Z",
        updatedAt: "2026-06-21T14:22:00Z",
        status: "RESOLVED",
        author: { id: 42, username: "MistrzMiecza99", role: "USER" },
        tags: [
            { id: 1,  name: "Rules" },
            { id: 4,  name: "Character" },
            { id: 13, name: "Multiclassing" }
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
        description: "Zaczynam nową kampanię i mam ograniczoną liczbę znanych czarów. Co oprócz Shield warto wziąć do przeżycia na 1. poziomie?",
        createdAt: "2026-06-22T09:45:00Z",
        updatedAt: "2026-06-22T09:45:00Z",
        status: "OPEN",
        author: { id: 13, username: "FireballEnjoyer", role: "USER" },
        tags: [
            { id: 3,  name: "Magic" },
            { id: 4,  name: "Character" },
            { id: 9,  name: "Player Advice" }
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
            { id: 8,  name: "DM Advice" },
            { id: 11, name: "Magic Items" }
        ],
        acceptedAnswer: null
    }
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
const DB = {
    get(key)        { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

// ─── Seed: runs only once per DB_VERSION ─────────────────────────────────────
// If you ever want to reset all data and re-seed, bump DB_VERSION above.
(function seed() {
    if (DB.get('dbVersion') === DB_VERSION) return; // already seeded this version
    DB.set('tags',           DEFAULT_TAGS);
    DB.set('questions',      DEFAULT_QUESTIONS);
    DB.set('nextQuestionId', 4);
    DB.set('dbVersion',      DB_VERSION);
})();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function tick() { return new Promise(r => setTimeout(r, 30)); }

function resolveTagIds(tagIds) {
    const allTags = DB.get('tags') || [];
    return (tagIds || [])
        .map(id => allTags.find(t => t.id === Number(id)))
        .filter(Boolean);
}

function currentUser() {
    const username = localStorage.getItem('loggedInUser') || 'Anonymous';
    return { id: 1, username, role: 'USER' };
}

// ─── MockApiService ───────────────────────────────────────────────────────────
const MockApiService = {

    // Tags
    getAllTags: async function() {
        await tick();
        return DB.get('tags') || [];
    },

    // Questions
    getAllQuestions: async function() {
        await tick();
        return DB.get('questions') || [];
    },

    getQuestionById: async function(id) {
        await tick();
        const q = (DB.get('questions') || []).find(q => q.id === Number(id));
        if (!q) throw new Error(`Question not found: ${id}`);
        return q;
    },

    /**
     * Accepts both formats:
     *   A) { title, description, tagIds: number[], authorId?, status }  ← from edit.js
     *   B) { title, description, status, tags: [...], author: {...} }   ← from modal
     * Author is always overridden with the currently logged-in user.
     */
    createQuestion: async function(data) {
        await tick();
        const questions = DB.get('questions') || [];
        const nextId    = DB.get('nextQuestionId') || 4;
        const now       = new Date().toISOString();

        const tags   = data.tagIds ? resolveTagIds(data.tagIds) : (data.tags || []);
        const author = currentUser(); // always use logged-in user

        const newQuestion = {
            id:             nextId,
            title:          data.title,
            description:    data.description,
            tags:           tags,
            status:         data.status || 'OPEN',
            author:         author,
            acceptedAnswer: data.acceptedAnswer || null,
            createdAt:      now,
            updatedAt:      now
        };

        questions.push(newQuestion);
        DB.set('questions', questions);
        DB.set('nextQuestionId', nextId + 1);
        return newQuestion;
    },

    updateQuestion: async function(id, data) {
        await tick();
        const questions = DB.get('questions') || [];
        const index = questions.findIndex(q => q.id === Number(id));
        if (index === -1) throw new Error(`Question not found: ${id}`);

        const tags = data.tagIds
            ? resolveTagIds(data.tagIds)
            : (data.tags || questions[index].tags);

        questions[index] = {
            ...questions[index],
            title:       data.title,
            description: data.description,
            tags:        tags,
            status:      data.status || questions[index].status,
            updatedAt:   new Date().toISOString()
        };

        DB.set('questions', questions);
        return questions[index];
    },

    deleteQuestion: async function(id) {
        await tick();
        const questions = DB.get('questions') || [];
        const index = questions.findIndex(q => q.id === Number(id));
        if (index === -1) throw new Error(`Question not found: ${id}`);
        questions.splice(index, 1);
        DB.set('questions', questions);
        return true;
    },

    // Aliases so example.js keeps working unchanged
    getAllItems:  function()      { return this.getAllQuestions(); },
    getItemById: function(id)    { return this.getQuestionById(id); },
    createItem:  function(data)  { return this.createQuestion(data); },
    updateItem:  function(id, d) { return this.updateQuestion(id, d); },
    deleteItem:  function(id)    { return this.deleteQuestion(id); }
};