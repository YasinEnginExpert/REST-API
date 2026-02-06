import api from './api.js?v=5';
import * as UI from './components.js';
import store from './state.js';

const escapeHtml = (u) => String(u ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export async function renderUsers(container) {
    try {
        const res = await api.getUsers({ limit: 1000 });
        const users = res.data || [];

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h2 class="page-title">User Management</h2>
                    <p style="color:var(--text-secondary); margin-top:0.25rem;">Manage system access and roles</p>
                </div>
                <button class="btn btn-primary" id="btn-add-user">
                    <i class="fa-solid fa-user-plus"></i> New User
                </button>
            </div>
            <div class="user-grid" id="user-grid"></div>
        `;

        const grid = document.getElementById('user-grid');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        grid.style.gap = '1.5rem';

        if (!users.length) {
            grid.innerHTML = UI.renderEmptyState('No users found');
            document.getElementById('btn-add-user').onclick = openUserForm;
            return;
        }

        grid.innerHTML = users.map(user => {
            const initial = (user.username || 'U').charAt(0).toUpperCase();
            const isMe = store.user?.username === user.username;
            const roleColor = user.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)';
            const safeId = escapeHtml(user.id);
            const safeUsername = escapeHtml(user.username);

            return `
            <div class="user-card" style="background:var(--bg-panel); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; cursor:pointer; transition:transform 0.2s;" data-user-id="${safeId}" title="Click to edit">
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                    <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem;">${initial}</div>
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:1.1rem; color:var(--text-primary);">${safeUsername} ${isMe ? '(You)' : ''}</div>
                        <div style="font-size:0.85rem; color:${roleColor}; border:1px solid ${roleColor}; padding:0.1rem 0.5rem; border-radius:12px; display:inline-block; margin-top:0.25rem; text-transform:uppercase; font-weight:600;">${user.role}</div>
                    </div>
                    ${!isMe ? `<button class="btn-icon-danger" style="background:none; border:none; color:var(--danger); cursor:pointer; padding:0.25rem;" onclick="event.stopPropagation(); window.deleteUser('${safeId}', '${safeUsername}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                </div>
                <div style="border-top:1px solid var(--border-color); padding-top:1rem; font-size:0.85rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.4rem;">
                    ${user.email ? `<div><i class="fa-solid fa-envelope"></i> ${escapeHtml(user.email)}</div>` : ''}
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span>ID: ${safeId.substring(0, 8)}...</span>
                        <div style="display:flex; gap:0.4rem;">
                            ${user.mfa_enabled ? '<span class="badge success" style="font-size:0.65rem;">MFA</span>' : ''}
                            ${user.inactive_status ? '<span class="badge danger" style="font-size:0.65rem;">INACTIVE</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        grid.querySelectorAll('.user-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                openUserForm(card.dataset.userId);
            });
        });

        document.getElementById('btn-add-user').onclick = () => openUserForm();

        window.deleteUser = async (id, name) => {
            if (!confirm(`Permanently delete user "${name}"?`)) return;
            try {
                await api.deleteUser(id);
                UI.showToast(`User ${name} deleted`, 'success');
                renderUsers(container);
            } catch (e) {
                UI.showToast(e.message, 'error');
            }
        };
    } catch (err) {
        console.error('Render Users Error:', err);
        container.innerHTML = UI.renderEmptyState(`Failed to load users: ${err.message}`);
    }
}

async function openUserForm(userId = null) {
    const isEdit = !!userId;
    let user = null;
    if (isEdit) {
        try {
            user = await api.getUser(userId);
        } catch (e) {
            UI.showToast(e.message || 'Failed to load user', 'error');
            return;
        }
    }

    const title = isEdit ? `Edit: ${user.username}` : 'Create New User';

    const formHTML = `
        <form id="user-form" style="display:flex; flex-direction:column; gap:1.5rem;">
            <div class="form-group">
                <label>Username *</label>
                <input type="text" name="username" class="input" required value="${isEdit ? escapeHtml(user.username) : ''}" placeholder="jdoe" ${isEdit ? 'readonly' : ''}>
            </div>
            ${!isEdit ? `
            <div class="form-group">
                <label>Password *</label>
                <input type="password" name="password" class="input" required placeholder="••••••••">
            </div>
            ` : ''}
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" class="input" required value="${isEdit ? escapeHtml(user.email || '') : ''}" placeholder="user@example.com">
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>First name</label>
                    <input type="text" name="first_name" class="input" value="${isEdit ? escapeHtml(user.first_name || '') : ''}" placeholder="John">
                </div>
                <div class="form-group">
                    <label>Last name</label>
                    <input type="text" name="last_name" class="input" value="${isEdit ? escapeHtml(user.last_name || '') : ''}" placeholder="Doe">
                </div>
            </div>
            <div class="form-group">
                <label>Role *</label>
                <select name="role" class="input">
                    <option value="admin" ${(isEdit ? user.role : '') === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="user" ${(isEdit ? user.role : '') === 'user' ? 'selected' : ''}>User</option>
                </select>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; background:var(--bg-panel-dark); padding:1rem; border-radius:var(--radius-md);">
                <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                    <input type="checkbox" name="mfa_enabled" ${isEdit && user.mfa_enabled ? 'checked' : ''}> MFA Enabled
                </label>
                <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                    <input type="checkbox" name="inactive_status" ${isEdit && user.inactive_status ? 'checked' : ''}> Account Inactive
                </label>
            </div>
        </form>
    `;

    const actions = `
        <button class="btn btn-outline" onclick="UI.closeDrawer()">Cancel</button>
        ${isEdit ? `<button class="btn btn-outline" id="btn-change-password"><i class="fa-solid fa-key"></i> Change Password</button>` : ''}
        <button class="btn btn-primary" id="btn-save-user">${isEdit ? 'Update' : 'Create'}</button>
    `;

    UI.openDrawer(title, formHTML, actions);

    if (isEdit) {
        document.getElementById('btn-change-password').onclick = () => {
            UI.closeDrawer();
            openChangePasswordDrawer(userId);
        };
    }

    document.getElementById('btn-save-user').onclick = async () => {
        const form = document.getElementById('user-form');
        if (!form.reportValidity()) return;
        const raw = Object.fromEntries(new FormData(form).entries());
        const payload = {
            username: raw.username,
            email: raw.email,
            first_name: raw.first_name || '',
            last_name: raw.last_name || '',
            role: raw.role,
            mfa_enabled: form.mfa_enabled.checked,
            inactive_status: form.inactive_status.checked
        };
        if (!isEdit) payload.password = raw.password;

        try {
            if (isEdit) {
                await api.updateUser(userId, payload);
                UI.showToast('User updated', 'success');
            } else {
                await api.createUser(payload);
                UI.showToast('User created', 'success');
            }
            UI.closeDrawer();
            renderUsers(document.getElementById('page-container'));
        } catch (e) {
            UI.showToast(e.message, 'error');
        }
    };
}

function openChangePasswordDrawer(userId) {
    const formHTML = `
        <form id="password-form" style="display:flex; flex-direction:column; gap:1.5rem;">
            <p style="color:var(--text-secondary);">Set a new password for this user.</p>
            <div class="form-group">
                <label>New password *</label>
                <input type="password" name="new_password" class="input" required placeholder="••••••••">
            </div>
        </form>
    `;
    const actions = `
        <button class="btn btn-outline" onclick="UI.closeDrawer()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-password">Update Password</button>
    `;
    UI.openDrawer('Change Password', formHTML, actions);

    document.getElementById('btn-save-password').onclick = async () => {
        const form = document.getElementById('password-form');
        if (!form.reportValidity()) return;
        const newPassword = form.new_password.value;
        try {
            await api.updatePassword(userId, { new_password: newPassword });
            UI.showToast('Password updated', 'success');
            UI.closeDrawer();
        } catch (e) {
            UI.showToast(e.message, 'error');
        }
    };
}
