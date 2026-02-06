import api from './api.js?v=5';
import store from './state.js';
import * as UI from './components.js';

const escapeHtml = (unsafe) => {
    return String(unsafe ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
};

export async function renderLinks(container) {
    try {
        const data = await api.getLinks(store.links || {});

        container.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Topology Links</h2>
                <div>
                    <button class="btn btn-outline" id="dl-csv-links"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
                    <button class="btn btn-primary" id="btn-add-link"><i class="fa-solid fa-plus"></i> Add Link</button>
                </div>
            </div>
            <div id="link-table"></div>
        `;

        const table = UI.createTable('#link-table', data.data || [], [
            { title: "ID", field: "id", visible: false },
            { title: "Created", field: "created_at", visible: false },
            { title: "Interface A", field: "a_interface_id", formatter: c => escapeHtml(c.getValue()) },
            { title: "Interface B", field: "b_interface_id", formatter: c => escapeHtml(c.getValue()) },
            { title: "Discovery", field: "discovery", formatter: c => `<span class="badge badge-${c.getValue() === 'manual' ? 'neutral' : 'info'}">${escapeHtml(c.getValue())}</span>` },
            { title: "Status", field: "status", formatter: c => `<span class="badge badge-${c.getValue() === 'up' ? 'success' : 'danger'}">${escapeHtml(c.getValue())}</span>` },
            { title: "Last Seen", field: "last_seen", formatter: c => escapeHtml(c.getValue() || '-') }
        ], {
            initialSort: [{ column: "created_at", dir: "desc" }],
            onRowClick: (e, row) => openLinkDrawer(row.getData().id)
        });

        setTimeout(() => {
            const dlBtn = document.getElementById('dl-csv-links');
            if (dlBtn) dlBtn.onclick = () => table && table.download("csv", "links.csv");
            const addBtn = document.getElementById('btn-add-link');
            if (addBtn) addBtn.onclick = () => openLinkForm();
        }, 0);

    } catch (error) {
        console.error("Render Links Error:", error);
        container.innerHTML = UI.renderEmptyState(`Failed to load Links: ${error.message}`);
    }
}

export async function openLinkDrawer(id) {
    try {
        const l = await api.getLink(id);

        const content = `
            <div style="padding:0.5rem 0;">
                <div class="prop-grid" style="display:grid; grid-template-columns:1fr 2fr; gap:0.75rem;">
                    <div style="font-weight:600; color:var(--text-secondary);">ID</div><div style="font-family:monospace;">${l.id}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Interface A</div><div>${escapeHtml(l.a_interface_id)}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Interface B</div><div>${escapeHtml(l.b_interface_id)}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Discovery</div><div>${escapeHtml(l.discovery)}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Status</div><div>${escapeHtml(l.status)}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Last Seen</div><div>${escapeHtml(l.last_seen || '-')}</div>
                </div>
            </div>
        `;

        const actions = `
            <button class="btn btn-outline" id="btn-edit-link"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button class="btn btn-outline" style="border-color:var(--danger); color:var(--danger);" id="btn-delete-link"><i class="fa-solid fa-trash"></i> Delete</button>
        `;

        UI.openDrawer('Link Details', content, actions);

        document.getElementById('btn-edit-link').onclick = () => { UI.closeDrawer(); openLinkForm(l); };
        document.getElementById('btn-delete-link').onclick = async () => {
            if (!confirm(`Delete Link?`)) return;
            try {
                await api.deleteLink(id);
                UI.showToast('Link deleted', 'success');
                UI.closeDrawer();
                renderLinks(document.getElementById('page-container'));
            } catch (e) {
                UI.showToast(e.message, 'error');
            }
        };
    } catch (e) {
        console.error(e);
        UI.showToast('Failed to load Link', 'error');
    }
}

async function openLinkForm(link = null) {
    const isEdit = !!link;
    const title = isEdit ? 'Edit Link' : 'Add Link';

    const formHTML = `
        <form id="link-form" style="display:flex; flex-direction:column; gap:1.5rem;">
            <div class="form-group">
                <label>Interface A ID *</label>
                <input type="text" name="a_interface_id" class="input" required value="${isEdit ? escapeHtml(link.a_interface_id) : ''}" ${isEdit ? 'disabled' : ''}>
                <small style="color:var(--text-secondary);">UUID of the first interface</small>
            </div>
            <div class="form-group">
                <label>Interface B ID *</label>
                <input type="text" name="b_interface_id" class="input" required value="${isEdit ? escapeHtml(link.b_interface_id) : ''}" ${isEdit ? 'disabled' : ''}>
                <small style="color:var(--text-secondary);">UUID of the second interface</small>
            </div>
            <div class="form-group">
                <label>Discovery (manual/lldp/cdp)</label>
                <select name="discovery" class="input">
                    <option value="manual" ${link?.discovery === 'manual' ? 'selected' : ''}>Manual</option>
                    <option value="lldp" ${link?.discovery === 'lldp' ? 'selected' : ''}>LLDP</option>
                    <option value="cdp" ${link?.discovery === 'cdp' ? 'selected' : ''}>CDP</option>
                </select>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status" class="input">
                    <option value="up" ${link?.status === 'up' ? 'selected' : ''}>Up</option>
                    <option value="down" ${link?.status === 'down' ? 'selected' : ''}>Down</option>
                </select>
            </div>
        </form>
    `;

    const actions = `
        <button class="btn btn-outline" onclick="UI.closeDrawer()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-link">${isEdit ? 'Update' : 'Create'}</button>
    `;

    UI.openDrawer(title, formHTML, actions);

    document.getElementById('btn-save-link').onclick = async () => {
        const form = document.getElementById('link-form');
        if (!form.reportValidity()) return;
        const raw = Object.fromEntries(new FormData(form).entries());

        try {
            if (isEdit) {
                // Determine what to send for update (only status/discovery usually)
                await api.updateLink(link.id, {
                    discovery: raw.discovery,
                    status: raw.status
                });
                UI.showToast('Link updated', 'success');
            } else {
                await api.createLink(raw);
                UI.showToast('Link created', 'success');
            }
            UI.closeDrawer();
            renderLinks(document.getElementById('page-container'));
        } catch (e) {
            UI.showToast(e.message, 'error');
        }
    };
}
