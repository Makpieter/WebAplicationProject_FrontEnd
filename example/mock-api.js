/**
 * Local Storage API Service
 * Acts as a local "database" stored on this computer via localStorage.
 * Bump DB_VERSION to force a full reseed (wipes all data).
 */

const DB_VERSION = 2;

// ─── Default tags ─────────────────────────────────────────────────────────────
const DEFAULT_TAGS = [
    { id: 1,  name: 'Rules',		description: 'Questions about official D&D rules and rulings' },
    { id: 2,  name: 'Combat',		description: 'Tactics, actions, reactions, and combat mechanics' },
    { id: 3,  name: 'Magic',		description: 'Spells, spell slots, concentration, and magic items' },
    { id: 4,  name: 'Character',	description: 'Character creation, classes, subclasses, and backgrounds' },
    { id: 5,  name: 'Races',		description: 'Playable races and their traits' },
    { id: 6,  name: 'Monsters',		description: 'Monster stat blocks, abilities, and lore' },
    { id: 7,  name: 'Worldbuilding',description: 'Setting, lore, and narrative world design' },
    { id: 8,  name: 'DM Advice',	description: 'Guidance and tips for Dungeon Masters' },
    { id: 9,  name: 'Player Advice',description: 'Guidance and tips for players' },
    { id: 10, name: 'Items',		description: 'Weapons, armour, and non-magical equipment' },
    { id: 11, name: 'Magic Items',	description: 'Attunement, identification, and specific magic items' },
    { id: 12, name: 'Feats',		description: 'Feat selection and interactions' },
    { id: 13, name: 'Multiclassing',description: 'Multiclass rules, combinations, and builds' },
    { id: 14, name: 'Skills',		description: 'Skill checks, proficiency, and ability scores' },
    { id: 15, name: 'Exploration',	description: 'Travel, navigation, traps, and environment' },
    { id: 16, name: '5e (2024)',	description: 'D&D 5th Edition (2024 Revision)' },
    { id: 17, name: '5e',        	description: 'D&D 5th Edition (2014)' },
    { id: 18, name: '4e',			description: 'D&D 4th Edition (2008)' },
    { id: 19, name: '3.5e',			description: 'D&D 3.5 Edition (2003)' },
    { id: 20, name: '3e',			description: 'D&D 3rd Edition (2000)' },
    { id: 21, name: '2e',			description: 'Advanced D&D 2nd Edition (1989)' },
    { id: 22, name: 'Adv 1e',		description: 'Advanced D&D 1st Edition' },
    { id: 23, name: '1e',			description: 'Original D&D & Basic D&D (1974-1994)' },
    { id: 24, name: 'Spells',		description: '' },
    { id: 25, name: 'Multiclassing',description: '' },
    { id: 26, name: 'Initiative',	description: '' },
    { id: 27, name: 'PL',			description: '' },
    { id: 28, name: 'ENG',		description: '' }
];

const DEFAULT_QUESTIONS = [
    {
        id: 1,
        title: "Jak obliczyć Klasę Pancerza (AC) dla Barbarzyńcy z wieloklasowością?",
        description: "Mam postać Barbarzyńca 3 / Mnich 2. Czy cechy Obrony bez Pancerza (Unarmored Defense) z obu klas się sumują, czy muszę wybrać jedną?",
        createdAt: "2026-06-20T10:30:00Z", updatedAt: "2026-06-21T14:22:00Z",
        status: "RESOLVED",
        author: { id: 42, username: "MistrzMiecza99", role: "USER" },
        tags: [{ id: 1, name: "Rules" }, { id: 4, name: "Character" }, { id: 13, name: "Multiclassing" }, { id: 27, name: "PL" }],
        votes: { up: 5, down: 1, voters: {} },
        acceptedAnswerId: 1
    },
    {
        id: 2,
        title: "Najlepsze czary 1. poziomu dla Zaklinacza (Sorcerer)?",
        description: "Zaczynam nową kampanię i mam ograniczoną liczbę znanych czarów. Co oprócz Shield warto wziąć do przeżycia na 1. poziomie?",
        createdAt: "2026-06-22T09:45:00Z", updatedAt: "2026-06-22T09:45:00Z",
        status: "OPEN",
        author: { id: 13, username: "FireballEnjoyer", role: "USER" },
        tags: [{ id: 3, name: "Magic" }, { id: 4, name: "Character" }, { id: 9, name: "Player Advice" }, { id: 27, name: "PL" }],
        votes: { up: 3, down: 0, voters: {} },
        acceptedAnswerId: null
    },
    {
        id: 3,
        title: "Problem z balansem Deck of Many Things – co robić?",
        description: "Moi gracze na 5. poziomie znaleźli Talię Wielu Rzeczy i łotr wyciągnął kartę 'Rycerz' oraz 'Pustka'. Kampania mi się rozlatuje. Jak uratować fabułę?",
        createdAt: "2026-06-23T15:00:00Z", updatedAt: "2026-06-23T15:10:00Z",
        status: "OPEN",
        author: { id: 88, username: "SfrustrowanyDM", role: "USER" },
        tags: [{ id: 8, name: "DM Advice" }, { id: 11, name: "Magic Items" }, { id: 27, name: "PL" }],
        votes: { up: 7, down: 2, voters: {} },
        acceptedAnswerId: null
    }
];

const DEFAULT_ANSWERS = [
    {
        id: 1, questionId: 1,
        content: "Niestety nie sumują się. Zgodnie z Player's Handbook (str. 164), jeśli masz już cechę Unarmored Defense z jednej klasy, nie możesz jej zyskać z drugiej. Musisz wybrać, której wersji używasz.",
        author: { id: 7, username: "DungeonMaster_PL", role: "MODERATOR" },
        createdAt: "2026-06-21T14:22:00Z",
        votes: { up: 8, down: 0, voters: {} }
    },
    {
        id: 2, questionId: 2,
        content: "Polecam Mage Armor jeśli nie nosisz pancerza, Chromatic Orb dla elastycznego obrażenia, oraz Absorb Elements jako reakcję na żywiołowe ataki.",
        author: { id: 42, username: "MistrzMiecza99", role: "USER" },
        createdAt: "2026-06-22T11:00:00Z",
        votes: { up: 4, down: 1, voters: {} }
    }
];

// ─── Storage helpers ──────────────────────────────────────────────────────────
const DB = {
    get(key)        { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

// ─── Seed once per DB_VERSION ─────────────────────────────────────────────────
(function seed() {
    if (DB.get('dbVersion') === DB_VERSION) return;
    DB.set('tags',            DEFAULT_TAGS);
    DB.set('questions',       DEFAULT_QUESTIONS);
    DB.set('answers',         DEFAULT_ANSWERS);
    DB.set('nextQuestionId',  4);
    DB.set('nextAnswerId',    3);
    DB.set('dbVersion',       DB_VERSION);
})();

function tick() { return new Promise(r => setTimeout(r, 30)); }

function resolveTagIds(tagIds) {
    const allTags = DB.get('tags') || [];
    return (tagIds || []).map(id => allTags.find(t => t.id === Number(id))).filter(Boolean);
}

function currentUser() {
    const username = localStorage.getItem('loggedInUser') || 'Anonymous';
    const isAdmin  = username === 'admin';
    return { id: Date.now(), username, role: isAdmin ? 'ADMIN' : 'USER' };
}

// ─── MockApiService ───────────────────────────────────────────────────────────
const MockApiService = {

    // ── Tags ──────────────────────────────────────────────────────────────────
    getAllTags: async function() {
        await tick();
        return DB.get('tags') || [];
    },

    addTag: async function(tagData) {
        await tick();
        const tags = DB.get('tags') || [];
        if (tags.some(t => t.name.toLowerCase() === tagData.name.toLowerCase()))
            throw new Error('Tag o tej nazwie już istnieje.');
        const newTag = { id: Math.max(0, ...tags.map(t => t.id)) + 1, name: tagData.name, description: tagData.description || '' };
        tags.push(newTag);
        DB.set('tags', tags);
        return newTag;
    },

    deleteTag: async function(id) {
        await tick();
        DB.set('tags', (DB.get('tags') || []).filter(t => t.id !== Number(id)));
        const questions = DB.get('questions') || [];
        questions.forEach(q => { q.tags = (q.tags || []).filter(t => t.id !== Number(id)); });
        DB.set('questions', questions);
        return true;
    },

    // ── Questions ─────────────────────────────────────────────────────────────
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

    createQuestion: async function(data) {
        await tick();
        const questions = DB.get('questions') || [];
        const nextId    = DB.get('nextQuestionId') || 4;
        const tags      = data.tagIds ? resolveTagIds(data.tagIds) : (data.tags || []);
        const now       = new Date().toISOString();
        const newQ = {
            id: nextId, title: data.title, description: data.description,
            tags, status: data.status || 'OPEN',
            author: currentUser(),
            votes: { up: 0, down: 0, voters: {} },
            acceptedAnswerId: null,
            createdAt: now, updatedAt: now
        };
        questions.push(newQ);
        DB.set('questions', questions);
        DB.set('nextQuestionId', nextId + 1);
        return newQ;
    },

    updateQuestion: async function(id, data) {
        await tick();
        const questions = DB.get('questions') || [];
        const idx = questions.findIndex(q => q.id === Number(id));
        if (idx === -1) throw new Error(`Question not found: ${id}`);
        const tags = data.tagIds ? resolveTagIds(data.tagIds) : (data.tags || questions[idx].tags);
        questions[idx] = { ...questions[idx], title: data.title, description: data.description, tags, status: data.status || questions[idx].status, updatedAt: new Date().toISOString() };
        DB.set('questions', questions);
        return questions[idx];
    },

    deleteQuestion: async function(id) {
        await tick();
        const questions = (DB.get('questions') || []).filter(q => q.id !== Number(id));
        DB.set('questions', questions);
        DB.set('answers', (DB.get('answers') || []).filter(a => a.questionId !== Number(id)));
        return true;
    },

    voteQuestion: async function(id, direction) {
        await tick();
        const user      = localStorage.getItem('loggedInUser') || 'Anonymous';
        const questions = DB.get('questions') || [];
        const q         = questions.find(q => q.id === Number(id));
        if (!q) throw new Error('Question not found');
        if (!q.votes) q.votes = { up: 0, down: 0, voters: {} };
        const prev = q.votes.voters[user];
        if (prev === direction) {
            // toggle off
            q.votes[direction]--;
            delete q.votes.voters[user];
        } else {
            if (prev) q.votes[prev]--;          // remove old vote
            q.votes[direction]++;
            q.votes.voters[user] = direction;
        }
        DB.set('questions', questions);
        return q;
    },

    acceptAnswer: async function(questionId, answerId) {
        await tick();
        const questions = DB.get('questions') || [];
        const q = questions.find(q => q.id === Number(questionId));
        if (!q) throw new Error('Question not found');
        q.acceptedAnswerId = Number(answerId);
        q.status = 'RESOLVED';
        DB.set('questions', questions);
        return q;
    },

    // ── Answers ───────────────────────────────────────────────────────────────
    getAnswersForQuestion: async function(questionId) {
        await tick();
        return (DB.get('answers') || []).filter(a => a.questionId === Number(questionId));
    },

    addAnswer: async function(questionId, content) {
        await tick();
        const answers = DB.get('answers') || [];
        const nextId  = DB.get('nextAnswerId') || 1;
        const newA = {
            id: nextId, questionId: Number(questionId), content,
            author: currentUser(),
            createdAt: new Date().toISOString(),
            votes: { up: 0, down: 0, voters: {} }
        };
        answers.push(newA);
        DB.set('answers', answers);
        DB.set('nextAnswerId', nextId + 1);
        return newA;
    },

    voteAnswer: async function(id, direction) {
        await tick();
        const user    = localStorage.getItem('loggedInUser') || 'Anonymous';
        const answers = DB.get('answers') || [];
        const a       = answers.find(a => a.id === Number(id));
        if (!a) throw new Error('Answer not found');
        if (!a.votes) a.votes = { up: 0, down: 0, voters: {} };
        const prev = a.votes.voters[user];
        if (prev === direction) {
            a.votes[direction]--;
            delete a.votes.voters[user];
        } else {
            if (prev) a.votes[prev]--;
            a.votes[direction]++;
            a.votes.voters[user] = direction;
        }
        DB.set('answers', answers);
        return a;
    },

    // ── Aliases (example.js compatibility) ───────────────────────────────────
    getAllItems:  function()      { return this.getAllQuestions(); },
    getItemById: function(id)    { return this.getQuestionById(id); },
    createItem:  function(data)  { return this.createQuestion(data); },
    updateItem:  function(id, d) { return this.updateQuestion(id, d); },
    deleteItem:  function(id)    { return this.deleteQuestion(id); }
};
