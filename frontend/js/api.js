import store from './state.js';
import { showToast } from './components.js';

const BASE_URL = window.location.protocol + '//' + window.location.hostname + ':3000';

function normalizeParams(params) {
    const p = { ...(params || {}) };

    if (p.filters && typeof p.filters === 'object' && !Array.isArray(p.filters)) {
        Object.assign(p, p.filters);
        delete p.filters;
    }

    if (p.sort && !p.sortby) {
        p.sortby = `${p.sort}:asc`;
        delete p.sort;
    }

    return p;
}

async function request(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (store.token) {
        headers['Authorization'] = `Bearer ${store.token}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            handleLogout();
            throw new Error('Session expired');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || response.statusText);
        }

        if (response.status === 204) return null;

        return await response.json();
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

export default {
    get: (url) => request(url, { method: 'GET' }),
    post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (url) => request(url, { method: 'DELETE' }),

    getDevices: (params) => {
        const q = new URLSearchParams(normalizeParams(params)).toString();
        return request(`/devices?${q}`);
    },
    getDevice: (id) => request(`/devices/${id}`),
    createDevice: (data) => request('/devices', { method: 'POST', body: JSON.stringify(data) }),
    updateDevice: (id, data) => request(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDevice: (id) => request(`/devices/${id}`, { method: 'DELETE' }),
    getDeviceInterfaces: (id) => request(`/devices/${id}/interfaces`),
    getInterfaceCount: (id) => request(`/devices/${id}/interfacecount`),

    getInterfaces: (params) => {
        const q = new URLSearchParams(normalizeParams(params)).toString();
        return request(`/interfaces?${q}`);
    },
    getInterface: (id) => request(`/interfaces/${id}`),
    createInterface: (data) => request('/interfaces', { method: 'POST', body: JSON.stringify(data) }),
    updateInterface: (id, data) => request(`/interfaces/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteInterface: (id) => request(`/interfaces/${id}`, { method: 'DELETE' }),

    getLocations: (params) => {
        const q = new URLSearchParams(normalizeParams(params)).toString();
        return request(`/locations?${q}`);
    },
    getLocation: (id) => request(`/locations/${id}`),
    createLocation: (data) => request('/locations', { method: 'POST', body: JSON.stringify(data) }),
    updateLocation: (id, data) => request(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLocation: (id) => request(`/locations/${id}`, { method: 'DELETE' }),
    getDevicesByLocation: (id) => request(`/locations/${id}/devices`),
    getLocationDeviceCount: (id) => request(`/locations/${id}/devicescount`),

    getVlans: (params) => {
        const q = new URLSearchParams(normalizeParams(params)).toString();
        return request(`/vlans?${q}`);
    },
    getVlan: (id) => request(`/vlans/${id}`),
    createVlan: (data) => request('/vlans', { method: 'POST', body: JSON.stringify(data) }),
    updateVlan: (id, data) => request(`/vlans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteVlan: (id) => request(`/vlans/${id}`, { method: 'DELETE' }),

    getUsers: (params) => {
        const q = new URLSearchParams(normalizeParams(params)).toString();
        return request(`/users?${q}`);
    },
    getUser: (id) => request(`/users/${id}`),
    createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
    updatePassword: (id, data) => request(`/users/${id}/password`, { method: 'PUT', body: JSON.stringify(data) }),
    forgotPassword: (email) => request('/users/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (code, data) => request(`/users/reset-password/${code}`, { method: 'POST', body: JSON.stringify(data) }),

    getLinks: (params) => {
        const q = new URLSearchParams(normalizeParams(params)).toString();
        return request(`/links?${q}`);
    },
    getLink: (id) => request(`/links/${id}`),
    createLink: (data) => request('/links', { method: 'POST', body: JSON.stringify(data) }),
    updateLink: (id, data) => request(`/links/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLink: (id) => request(`/links/${id}`, { method: 'DELETE' }),

    getEvents: (params) => {
        const q = new URLSearchParams(normalizeParams(params)).toString();
        return request(`/events?${q}`);
    },
    createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),

    getMetrics: (params) => {
        const q = new URLSearchParams(normalizeParams(params)).toString();
        return request(`/metrics?${q}`);
    },
    getLatestDeviceMetrics: (id) => request(`/devices/${id}/metrics/latest`),

    login: (username, password) => request('/users/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    }),
    logout: () => request('/users/logout', { method: 'POST' })
};
