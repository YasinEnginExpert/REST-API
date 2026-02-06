import store from './state.js';
import api from './api.js?v=5';
import * as UI from './components.js';

let refreshInterval = null;
let isRefreshPaused = false;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    // initTheme handled by state.js
    initNavigation();
    initGlobalEvents();
    startAutoRefresh();
});

// --- Authentication ---
function initAuth() {
    if (store.token && store.user) {
        showApp();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('auth-layer').style.display = 'flex';
    document.getElementById('app-layer').style.display = 'none';
}

function showApp() {
    document.getElementById('auth-layer').style.display = 'none';
    document.getElementById('app-layer').style.display = 'flex';

    const name = store.user?.username || 'User';
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-role').textContent = (store.user?.role || 'user').toUpperCase();

    const avatar = document.querySelector('.sidebar-footer .avatar');
    if (avatar) avatar.textContent = name.slice(0, 2).toUpperCase();

    loadView('dashboard');
}

// --- Navigation ---
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const view = btn.dataset.view;
            store.currentView = view;
            loadView(view);
        });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        api.logout().catch(() => { }).finally(() => {
            localStorage.clear();
            window.location.reload();
        });
    });
}

async function loadView(view) {
    const container = document.getElementById('page-container');
    container.innerHTML = UI.renderSkeleton();

    document.getElementById('last-updated').textContent = 'Updating...';

    try {
        switch (view) {
            case 'dashboard': await renderDashboard(container); break;
            case 'devices': await renderDevices(container); break;
            case 'vlans': await renderVlans(container); break;
            case 'interfaces': await renderInterfaces(container); break;
            case 'locations': await renderLocations(container); break;
            case 'links': await renderLinks(container); break;
            case 'users': await renderUsers(container); break;
            case 'alerts': await renderAlerts(container); break;
            case 'metrics': await renderMetrics(container); break;
            default: container.innerHTML = UI.renderEmptyState('View under construction');
        }
        updateTime();
    } catch (e) {
        console.error(e);
        container.innerHTML = UI.renderEmptyState(`Error loading view: ${e.message}`);
    }
}

// --- Auto Refresh ---
function startAutoRefresh() {
    updateTime();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        if (!isRefreshPaused && document.visibilityState === 'visible') {
            // Re-load current view silently if possible, or just re-render
            // For now, full re-render is safer for consistency
            if (store.currentView === 'dashboard') loadView('dashboard');
            // We avoid auto-refreshing tables deeply to not reset scroll/sort, 
            // but for dashboard it's fine.
        }
        updateTime();
    }, 30000);
}

function updateTime() {
    const el = document.getElementById('last-updated');
    if (el) {
        el.textContent = 'Updated: ' + dayjs().format('HH:mm:ss');
        el.title = dayjs().fromNow();
    }
}

// --- Views ---

async function renderAlerts(container) {
    const { renderAlerts: fn } = await import('./alerts.js?v=5');
    await fn(container);
}

async function renderMetrics(container) {
    const { renderMetrics: fn } = await import('./metrics.js?v=5');
    await fn(container);
}

async function renderDashboard(container) {
    const { renderDashboard: renderDashboardFn } = await import('./dashboard.js?v=5');
    await renderDashboardFn(container);
}

// 2. Devices (Tabulator)
async function renderDevices(container) {
    const { renderDevices: renderDevicesFn } = await import('./devices.js?v=5');
    await renderDevicesFn(container);
}

// 3. VLANs (Tabulator)
async function renderVlans(container) {
    const { renderVlans: renderVlansFn } = await import('./vlans.js?v=5');
    await renderVlansFn(container);
}

// 4. Interfaces
// 4. Interfaces
async function renderInterfaces(container) {
    window.filterInterfacesByDevice = (deviceId, hostname) => {
        store.interfaces = { limit: 10000, device_id: deviceId };
        store.currentView = 'interfaces';
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        const ifaceBtn = document.querySelector('[data-view="interfaces"]');
        if (ifaceBtn) ifaceBtn.classList.add('active');
        loadView('interfaces');
        UI.showToast(`Filtered Interfaces for: ${hostname}`, 'info');
    };
    const { renderInterfaces: renderInterfacesFn } = await import('./interfaces.js?v=5');
    await renderInterfacesFn(container);
}

// 5. Users
async function renderUsers(container) {
    const { renderUsers: renderUsersFn } = await import('./users.js?v=5');
    await renderUsersFn(container);
}

// 6. Locations
async function renderLocations(container) {
    window.filterDevicesByLocation = (locId, locName) => {
        store.devices = { limit: 1000, sort: 'hostname', location_id: locId };
        store.currentView = 'devices';
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        const devBtn = document.querySelector('[data-view="devices"]');
        if (devBtn) devBtn.classList.add('active');
        loadView('devices');
        UI.showToast(`Filtered by Location: ${locName}`, 'info');
    };
    const { renderLocations: renderLocationsFn } = await import('./locations.js?v=5');
    await renderLocationsFn(container);
}

// 7. Links
async function renderLinks(container) {
    const { renderLinks: renderLinksFn } = await import('./links.js?v=5');
    await renderLinksFn(container);
}

// --- Drawer Logic ---
// --- Details Drawers (Global Funcs for onclick) ---
window.UI = UI; // Expose to global scope for inline onclicks

window.switchTab = (tab) => {
    // Hide all
    ['overview', 'interfaces'].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if (el) el.style.display = 'none';
    });
    // Show target
    const target = document.getElementById(`tab-${tab}`);
    if (target) target.style.display = 'block';

    // Update Active State (Visual)
    const buttons = document.querySelectorAll('.drawer-tabs button');
    buttons.forEach(btn => {
        btn.style.borderBottom = btn.textContent.toLowerCase().includes(tab) ? '2px solid var(--accent-primary)' : 'none';
        btn.style.fontWeight = btn.textContent.toLowerCase().includes(tab) ? 'bold' : 'normal';
    });
};



// --- Global Events ---
function initGlobalEvents() {
    const loginErrorEl = document.getElementById('login-error');
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (loginErrorEl) loginErrorEl.textContent = '';
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value;
        try {
            const res = await api.login(user, pass);
            store.token = res.token;
            store.user = {
                id: res.user_id,
                username: res.username,
                role: res.role,
                mfa_enabled: res.mfa_enabled
            };
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(store.user));
            showApp();
        } catch (err) {
            if (loginErrorEl) loginErrorEl.textContent = err.message || 'Invalid credentials';
        }
    });
    [document.getElementById('username'), document.getElementById('password')].forEach(el => {
        if (el) el.addEventListener('focus', () => { if (loginErrorEl) loginErrorEl.textContent = ''; });
    });

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            store.theme = store.theme === 'light' ? 'dark' : 'light';
            const icon = document.querySelector('#theme-toggle i');
            if (icon) icon.className = store.theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        });
        // Set initial icon
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = store.theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }


    // Forgot Password Flow
    const forgotLink = document.getElementById('link-forgot-pass');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();

            // Step 1: Request Email
            const formHTML = `
                <form id="forgot-form" style="display:flex; flex-direction:column; gap:1.5rem;">
                    <p style="color:var(--text-secondary);">Enter your email address to receive a password reset code.</p>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" class="input" required placeholder="admin@example.com">
                    </div>
                </form>
            `;
            const actions = `
                <button class="btn btn-outline" onclick="UI.closeDrawer()">Cancel</button>
                <button class="btn btn-primary" id="btn-send-code">Send Code</button>
            `;

            UI.openDrawer('Password Recovery', formHTML, actions);

            document.getElementById('btn-send-code').onclick = async () => {
                const btn = document.getElementById('btn-send-code');
                const form = document.getElementById('forgot-form');
                if (!form.reportValidity()) return;

                const email = form.email.value;
                try {
                    btn.textContent = 'Sending...';
                    btn.disabled = true;
                    await api.forgotPassword(email);

                    // Dev Hint
                    UI.showToast('Code sent! (Check Server Terminal)', 'info');
                    openResetCodeModal();
                } catch (err) {
                    UI.showToast(err.message, 'error');
                    btn.textContent = 'Send Code';
                    btn.disabled = false;
                }
            };
        });
    }
}

function openResetCodeModal() {
    const formHTML = `
        <form id="reset-form" style="display:flex; flex-direction:column; gap:1.5rem;">
            <div style="background:var(--bg-panel); padding:1rem; border-left:4px solid var(--success); border-radius:4px;">
                <p style="color:var(--text-primary); margin-bottom:0.5rem; font-weight:600;">Email Sent!</p>
                <p style="font-size:0.9rem; color:var(--text-secondary); margin:0;">
                    Please check your inbox (or server console) for the 6-digit verification code.
                </p>
            </div>
            <div class="form-group">
                <label>Reset Code</label>
                <input type="text" name="code" class="input" required placeholder="000000" maxlength="6" style="letter-spacing:4px; font-family:monospace; text-align:center; font-size:1.5rem; font-weight:bold; color:var(--accent-primary);">
            </div>
            <div class="form-group">
                <label>New Password</label>
                <input type="password" name="new_password" class="input" required placeholder="New Password">
            </div>
            <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirm_password" class="input" required placeholder="Confirm Password">
            </div>
        </form>
    `;
    const actions = `
        <button class="btn btn-outline" onclick="UI.closeDrawer()">Cancel</button>
        <button class="btn btn-primary" id="btn-reset-pass">Reset Password</button>
    `;

    UI.openDrawer('Enter Verification Code', formHTML, actions);

    document.getElementById('btn-reset-pass').onclick = async () => {
        const btn = document.getElementById('btn-reset-pass');
        const form = document.getElementById('reset-form');
        if (!form.reportValidity()) return;

        const code = form.code.value;
        const payload = {
            new_password: form.new_password.value,
            confirm_password: form.confirm_password.value
        };

        if (payload.new_password !== payload.confirm_password) {
            UI.showToast("Passwords do not match", 'warning');
            return;
        }

        try {
            btn.textContent = 'Verifying...';
            btn.disabled = true;
            await api.resetPassword(code, payload);
            UI.showToast('Password reset successfully! Please login.', 'success');
            UI.closeDrawer();
        } catch (err) {
            UI.showToast(err.message, 'error');
            btn.textContent = 'Reset Password';
            btn.disabled = false;
        }
    }
}
