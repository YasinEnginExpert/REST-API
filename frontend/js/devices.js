import api from './api.js?v=5';
import store from './state.js';
import * as UI from './components.js';

// --- Helpers ---

const escapeHtml = (unsafe) => {
    return String(unsafe ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
};

// --- Main Render Function ---

export async function renderDevices(container) {
    try {
        const data = await api.getDevices(store.devices);

        container.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Devices</h2>
                <div>
                     <button class="btn btn-outline" id="dl-csv"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
                     <button class="btn btn-primary" id="btn-add-device"><i class="fa-solid fa-plus"></i> Add Device</button>
                </div>
            </div>
            <div id="device-table"></div>
        `;

        // Check if Tabulator/dayjs is loaded
        const hasDayjs = typeof dayjs !== 'undefined';

        const table = UI.createTable('#device-table', data.data, [
            {
                title: "Status",
                field: "status",
                formatter: (cell) => {
                    const val = cell.getValue();
                    const cls = val === 'active' ? 'success' : (val === 'maintenance' ? 'warning' : 'danger');
                    return `<span class="badge ${cls}">${escapeHtml(val)}</span>`;
                }
            },
            { title: "Hostname", field: "hostname", headerFilter: "input", formatter: c => escapeHtml(c.getValue()) },
            { title: "IP Address", field: "ip", headerFilter: "input", formatter: c => escapeHtml(c.getValue()) },
            {
                title: "Tags", field: "tags", formatter: (c) => {
                    const tags = c.getValue();
                    if (!tags || !Array.isArray(tags)) return '-';
                    return tags.map(t => `<span class="badge" style="background:var(--accent-light); color:var(--accent-primary); border:1px solid var(--accent-primary); padding:2px 6px; font-size:0.75rem; margin-right:4px;">${escapeHtml(t)}</span>`).join('');
                }
            },
            { title: "Vendor", field: "vendor", headerFilter: "select", headerFilterParams: { values: true }, formatter: c => escapeHtml(c.getValue()) },
            { title: "Model", field: "model", formatter: c => escapeHtml(c.getValue()) },
            { title: "Role", field: "role", headerFilter: "input", formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "Loc", field: "location_id", formatter: c => escapeHtml(c.getValue()) },
            {
                title: "Last Seen",
                field: "last_seen",
                formatter: (c) => (c.getValue() && hasDayjs) ? dayjs(c.getValue()).fromNow() : (c.getValue() || '-')
            }
        ], {
            initialSort: [{ column: "hostname", dir: "asc" }],
            onRowClick: (e, row) => {
                const d = row.getData();
                // Drill down to interfaces instead of opening drawer
                if (window.filterInterfacesByDevice) {
                    window.filterInterfacesByDevice(d.id, d.hostname);
                } else {
                    openDeviceDrawer(d.id); // Fallback
                }
            }
        });

        // Event Listeners for Page Actions
        setTimeout(() => {
            const dlBtn = document.getElementById('dl-csv');
            if (dlBtn) dlBtn.onclick = () => table && table.download("csv", "devices.csv");

            const addBtn = document.getElementById('btn-add-device');
            if (addBtn) addBtn.onclick = () => openDeviceForm();
        }, 0);

    } catch (error) {
        console.error("Render Devices Error:", error);
        container.innerHTML = UI.renderEmptyState(`Failed to load devices: ${error.message}`);
    }
}

// --- Drawer Logic ---

export async function openDeviceDrawer(id) {
    try {
        const device = await api.getDevice(id);
        const safe = {
            hostname: escapeHtml(device.hostname),
            ip: escapeHtml(device.ip),
            status: escapeHtml(device.status),
            vendor: escapeHtml(device.vendor),
            model: escapeHtml(device.model),
            os: escapeHtml(device.os || '-'),
            os_version: escapeHtml(device.os_version || '-'),
            role: escapeHtml(device.role || '-'),
            notes: escapeHtml(device.notes || '-'),
        };

        const statusClass = safe.status === 'active' ? 'success' : (safe.status === 'maintenance' ? 'warning' : 'danger');

        const tabsHTML = `
            <div class="drawer-tabs" style="display:flex; gap:1.5rem; border-bottom:1px solid var(--border-color); margin-bottom:1rem;">
                <button id="tab-btn-overview" class="tab-btn active" style="padding-bottom:0.75rem; border:none; background:none; cursor:pointer; font-weight:600; color:var(--text-primary); border-bottom:2px solid var(--accent-primary);">Overview</button>
                <button id="tab-btn-interfaces" class="tab-btn" style="padding-bottom:0.75rem; border:none; background:none; cursor:pointer; color:var(--text-secondary); border-bottom:2px solid transparent;">Interfaces</button>
            </div>
            
            <!-- Tab Content: Overview -->
            <div id="tab-content-overview">
                <!-- Header Card -->
                <div style="background:var(--bg-body); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div>
                             <span class="badge ${statusClass}" style="font-size:0.85rem; margin-bottom:0.75rem; display:inline-block;">${safe.status.toUpperCase()}</span>
                             <h3 style="font-size:1.75rem; font-weight:700; color:var(--text-primary); margin-bottom:0.25rem;">${safe.hostname}</h3>
                             <div style="font-family:monospace; color:var(--accent-primary); background:var(--accent-light); display:inline-block; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.9rem;">${safe.ip}</div>
                        </div>
                    </div>
                </div>

                <!-- Comprehensive Data Grid -->
                <h4 style="font-size:0.9rem; text-transform:uppercase; color:var(--text-secondary); margin-bottom:0.75rem; font-weight:600; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">Device Inventory Data</h4>
                
                <style>
                    .prop-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 0.75rem; font-size: 0.95rem; }
                    .prop-label { font-weight: 600; color: var(--text-secondary); }
                    .prop-value { color: var(--text-primary); word-break: break-all; }
                    .prop-row { display: contents; }
                    .prop-row:not(:last-child) .prop-label, .prop-row:not(:last-child) .prop-value { border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem; }
                </style>

                <div class="prop-grid">
                    <div class="prop-row"><div class="prop-label">ID</div><div class="prop-value" style="font-family:monospace;">${escapeHtml(device.id)}</div></div>
                    <div class="prop-row"><div class="prop-label">Role</div><div class="prop-value">${safe.role}</div></div>
                    <div class="prop-row"><div class="prop-label">Vendor</div><div class="prop-value">${safe.vendor}</div></div>
                    <div class="prop-row"><div class="prop-label">Model</div><div class="prop-value">${safe.model}</div></div>
                    <div class="prop-row"><div class="prop-label">OS Family</div><div class="prop-value">${safe.os}</div></div>
                    <div class="prop-row"><div class="prop-label">OS Version</div><div class="prop-value">${safe.os_version}</div></div>
                    <div class="prop-row"><div class="prop-label">Serial Number</div><div class="prop-value">${escapeHtml(device.serial_number || '-')}</div></div>
                    <div class="prop-row"><div class="prop-label">Rack Position</div><div class="prop-value">${escapeHtml(device.rack_position || 'Not Rack Mounted')}</div></div>
                    <div class="prop-row"><div class="prop-label">Location ID</div><div class="prop-value">${escapeHtml(device.location_id || '-')}</div></div>
                    <div class="prop-row"><div class="prop-label">Last Last Seen</div><div class="prop-value">${escapeHtml(device.last_seen || '-')}</div></div>
                    <div class="prop-row"><div class="prop-label">Tags</div><div class="prop-value">
                        ${device.tags && Array.isArray(device.tags) ? device.tags.map(t => `<span class="badge" style="background:var(--accent-light); color:var(--accent-primary); border:1px solid var(--accent-primary); padding:2px 6px; font-size:0.75rem; margin-right:4px;">${escapeHtml(t)}</span>`).join('') : '-'}
                    </div></div>
                    <div class="prop-row"><div class="prop-label">Created At</div><div class="prop-value">${device.created_at ? dayjs(device.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}</div></div>
                    <div class="prop-row"><div class="prop-label">Notes</div><div class="prop-value" style="white-space:pre-wrap;">${safe.notes}</div></div>
                </div>
            </div>

            <!-- Tab Content: Interfaces -->
            <div id="tab-content-interfaces" style="display:none;">
                <div id="interfaces-list" style="display:flex; flex-direction:column; gap:0.75rem;">
                    <div style="text-align:center; padding:1rem; color:var(--text-secondary);">Loading interfaces...</div>
                </div>
            </div>
        `;

        const actionsHTML = `
            <button class="btn btn-outline" id="btn-copy-ip"><i class="fa-regular fa-copy"></i> Copy IP</button>
            <button class="btn btn-primary" id="btn-edit"><i class="fa-solid fa-pen-to-square"></i> Edit Device</button>
            <button class="btn btn-outline" id="btn-delete" style="border-color:var(--danger); color:var(--danger);"><i class="fa-solid fa-trash"></i> Delete</button>
        `;

        UI.openDrawer('Device Details', tabsHTML, actionsHTML);

        // --- Attaching Event Listeners (Post-Render) ---

        // 1. Tabs
        const tabBtnOverview = document.getElementById('tab-btn-overview');
        const tabBtnInterfaces = document.getElementById('tab-btn-interfaces');
        const contentOverview = document.getElementById('tab-content-overview');
        const contentInterfaces = document.getElementById('tab-content-interfaces');

        const loadInterfaces = async () => {
            const listContainer = document.getElementById('interfaces-list');
            try {
                const res = await api.getDeviceInterfaces(id);
                const interfaces = Array.isArray(res) ? res : (res.data || []);

                if (interfaces.length === 0) {
                    listContainer.innerHTML = '<div style="text-align:center; padding:1rem; color:var(--text-secondary);">No interfaces found.</div>';
                    return;
                }

                listContainer.innerHTML = interfaces.map(intf => {
                    const status = (intf.status || 'down').toLowerCase();
                    const isUp = status === 'up' || status === 'active';
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-panel);">
                            <div style="display:flex; align-items:center; gap:1rem;">
                                <div style="width:10px; height:10px; border-radius:50%; background:var(--${isUp ? 'success' : 'danger'});"></div>
                                <div>
                                    <div style="font-weight:600; font-family:monospace;">${escapeHtml(intf.name)}</div>
                                    <div style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(intf.ip_address || 'No IP')} / ${escapeHtml(intf.mac_address || 'No MAC')}</div>
                                </div>
                            </div>
                            <span class="badge ${isUp ? 'success' : 'danger'}">${status.toUpperCase()}</span>
                        </div>
                    `;
                }).join('');

            } catch (err) {
                console.error(err);
                listContainer.innerHTML = `<div style="text-align:center; color:var(--danger);"><i class="fa-solid fa-exclamation-circle"></i> Failed to load interfaces</div>`;
            }
        };

        const updateTabUI = (activeTab) => {
            if (activeTab === 'overview') {
                contentOverview.style.display = 'block';
                contentInterfaces.style.display = 'none';
                tabBtnOverview.style.color = 'var(--text-primary)';
                tabBtnOverview.style.borderBottomColor = 'var(--accent-primary)';
                tabBtnInterfaces.style.color = 'var(--text-secondary)';
                tabBtnInterfaces.style.borderBottomColor = 'transparent';
                tabBtnOverview.classList.add('active');
                tabBtnInterfaces.classList.remove('active');
            } else {
                contentOverview.style.display = 'none';
                contentInterfaces.style.display = 'block';
                tabBtnOverview.style.color = 'var(--text-secondary)';
                tabBtnOverview.style.borderBottomColor = 'transparent';
                tabBtnInterfaces.style.color = 'var(--text-primary)';
                tabBtnInterfaces.style.borderBottomColor = 'var(--accent-primary)';
                tabBtnInterfaces.classList.add('active');
                tabBtnOverview.classList.remove('active');

                if (contentInterfaces.dataset.loaded !== 'true') {
                    contentInterfaces.dataset.loaded = 'true';
                    loadInterfaces();
                }
            }
        };

        if (tabBtnOverview) tabBtnOverview.onclick = () => updateTabUI('overview');
        if (tabBtnInterfaces) tabBtnInterfaces.onclick = () => updateTabUI('interfaces');

        // 2. Actions
        const btnCopy = document.getElementById('btn-copy-ip');
        if (btnCopy) btnCopy.onclick = () => {
            if (navigator.clipboard) navigator.clipboard.writeText(device.ip).then(() => UI.showToast('Copied', 'success'));
        };

        const btnEdit = document.getElementById('btn-edit');
        if (btnEdit) btnEdit.onclick = () => openDeviceForm(device);

        const btnDelete = document.getElementById('btn-delete');
        if (btnDelete) btnDelete.onclick = async () => {
            if (confirm(`Are you sure you want to delete ${device.hostname}?`)) {
                try {
                    await api.deleteDevice(id);
                    UI.showToast('Device deleted', 'success');
                    UI.closeDrawer();
                    renderDevices(document.getElementById('page-container'));
                } catch (err) {
                    UI.showToast(err.message, 'error');
                }
            }
        };

    } catch (e) {
        console.error("Drawer Error:", e);
        UI.showToast('Failed to load device details', 'error');
    }
}

// --- Form Logic (Add/Edit) ---

async function openDeviceForm(device = null) {
    const isEdit = !!device;
    const title = isEdit ? `Edit Device: ${device.hostname}` : 'Add New Device';

    let locations = [];
    try {
        const locRes = await api.getLocations({ limit: 10000 });
        locations = locRes.data || [];
    } catch (e) { console.error("Failed to load locations for form", e); }

    const formHTML = `
        <form id="device-form" style="display:flex; flex-direction:column; gap:1.5rem; padding-bottom:2rem;">
            <div class="form-group">
                <label>Hostname *</label>
                <input type="text" name="hostname" class="input" required value="${isEdit ? escapeHtml(device.hostname) : ''}" placeholder="e.g. switch-core-01">
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>IP Address *</label>
                    <input type="text" name="ip" class="input" required value="${isEdit ? escapeHtml(device.ip) : ''}" placeholder="192.168.1.1">
                </div>
                <div class="form-group">
                    <label>Status *</label>
                    <select name="status" class="input">
                        <option value="active" ${isEdit && device.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="maintenance" ${isEdit && device.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="offline" ${isEdit && device.status === 'offline' ? 'selected' : ''}>Offline</option>
                    </select>
                </div>
            </div>
            <div class="grid-2">
                 <div class="form-group">
                    <label>Vendor *</label>
                    <input type="text" name="vendor" class="input" required value="${isEdit ? escapeHtml(device.vendor) : ''}" placeholder="Cisco">
                </div>
                 <div class="form-group">
                    <label>Model *</label>
                    <input type="text" name="model" class="input" required value="${isEdit ? escapeHtml(device.model) : ''}" placeholder="Catalyst 9300">
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>OS Family</label>
                    <input type="text" name="os" class="input" value="${isEdit ? escapeHtml(device.os || '') : ''}" placeholder="IOS-XE">
                </div>
                 <div class="form-group">
                    <label>OS Version</label>
                    <input type="text" name="os_version" class="input" value="${isEdit ? escapeHtml(device.os_version || '') : ''}" placeholder="17.3.1">
                </div>
            </div>
            <div class="form-group">
                <label>Role</label>
                <input type="text" name="role" class="input" value="${isEdit ? escapeHtml(device.role || '') : ''}" placeholder="Core, Access, Distribution">
            </div>
            <div class="form-group">
                <label>Tags (Comma separated)</label>
                <input type="text" name="tags" class="input" value="${isEdit && device.tags ? escapeHtml(device.tags.join(', ')) : ''}" placeholder="core, firewall, london">
            </div>
             <div class="form-group">
                <label>Location</label>
                <select name="location_id" class="input">
                    <option value="">Select Location...</option>
                    ${locations.map(l => `<option value="${l.id}" ${isEdit && device.location_id === l.id ? 'selected' : ''}>${escapeHtml(l.name)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" class="input" style="height:80px; resize:vertical;">${isEdit ? escapeHtml(device.notes || '') : ''}</textarea>
            </div>
        </form>
    `;

    const actionsHTML = `
        <button class="btn btn-outline" onclick="UI.closeDrawer()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-device">${isEdit ? 'Update Device' : 'Create Device'}</button>
    `;

    UI.openDrawer(title, formHTML, actionsHTML);

    document.getElementById('btn-save-device').onclick = async () => {
        const form = document.getElementById('device-form');
        if (!form.reportValidity()) return;

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        // Convert tags string to array
        if (payload.tags) {
            payload.tags = payload.tags.split(',').map(t => t.trim()).filter(t => t !== '');
        } else {
            payload.tags = [];
        }

        try {
            if (isEdit) {
                await api.updateDevice(device.id, payload);
                UI.showToast('Device updated successfully', 'success');
            } else {
                await api.createDevice(payload);
                UI.showToast('Device created successfully', 'success');
            }
            UI.closeDrawer();
            renderDevices(document.getElementById('page-container'));
        } catch (error) {
            console.error(error);
            UI.showToast(error.message || 'Operation failed', 'error');
        }
    };
}
