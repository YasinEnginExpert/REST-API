// State Management using simple Pub/Sub

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    theme: localStorage.getItem('theme') || 'light',

    currentView: 'dashboard',

    // View States
    devices: {
        page: 1,
        limit: 10000, // Fetch all (virtually)
        sort: 'hostname',
        filters: {}
    },
    vlans: { page: 1, limit: 10000 },
    locations: { page: 1, limit: 10000 },
    interfaces: { page: 1, limit: 10000 },

    // Cache for quick loads
    cache: {
        summary: null,
        locations: [],
        vlans: []
    }
};

const store = new Proxy(initialState, {
    set(target, property, value) {
        target[property] = value;
        // Persist specific keys
        if (property === 'theme') {
            localStorage.setItem('theme', value);
            document.documentElement.setAttribute('data-theme', value);
        }
        return true;
    }
});

// Initialize Theme
document.documentElement.setAttribute('data-theme', store.theme);

export default store;
