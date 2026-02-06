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

export async function renderInterfaces(container) {
    try {
        const data = await api.getInterfaces(store.interfaces);

        container.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Interfaces</h2>
                <div>
                    <button class="btn btn-outline" id="dl-csv-interfaces"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
                    <button class="btn btn-primary" id="btn-add-interface"><i class="fa-solid fa-plus"></i> Add Interface</button>
                </div>
            </div>
            <div id="interface-table"></div>
        `;

        const table = UI.createTable('#interface-table', data.data || [], [
            {
                title: "Status",
                field: "status",
                formatter: (cell) => {
                    const val = (cell.getValue() || 'down').toLowerCase();
                    const cls = (val === 'up' || val === 'active') ? 'success' : 'danger';
                    return `<span class="badge ${cls}">${escapeHtml(val.toUpperCase())}</span>`;
                }
            },
            { title: "Mode", field: "mode", formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "MTU", field: "mtu", formatter: c => c.getValue() || '-' },
            { title: "Name", field: "name", headerFilter: "input", formatter: c => escapeHtml(c.getValue()) },
            { title: "IP Address", field: "ip_address", headerFilter: "input", formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "MAC Address", field: "mac_address", headerFilter: "input", formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "Device ID", field: "device_id", headerFilter: "input", formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "Speed", field: "speed", formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "Type", field: "type", formatter: c => escapeHtml(c.getValue() || '-') }
        ], {
            onRowClick: (e, row) => openInterfaceDrawer(row.getData().id)
        });

        setTimeout(() => {
            const dlBtn = document.getElementById('dl-csv-interfaces');
            if (dlBtn) dlBtn.onclick = () => table && table.download("csv", "interfaces.csv");
            const addBtn = document.getElementById('btn-add-interface');
            if (addBtn) addBtn.onclick = () => openInterfaceForm();
        }, 0);
    } catch (error) {
        console.error("Render Interfaces Error:", error);
        container.innerHTML = UI.renderEmptyState(`Failed to load interfaces: ${error.message}`);
    }
}

export async function openInterfaceDrawer(id) {
    try {
        const intf = await api.getInterface(id);
        const status = (intf.status || 'down').toLowerCase();
        const isUp = status === 'up' || status === 'active';

        const content = `
            <div style="padding:0.5rem 0;">
                <div class="prop-grid" style="display:grid; grid-template-columns:1fr 2fr; gap:0.75rem;">
                    <div style="font-weight:600; color:var(--text-secondary);">Name</div><div style="font-family:monospace;">${escapeHtml(intf.name)}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Status</div><div><span class="badge ${isUp ? 'success' : 'danger'}">${escapeHtml((intf.status || 'down').toUpperCase())}</span></div>
                    <div style="font-weight:600; color:var(--text-secondary);">Admin Status</div><div>${escapeHtml(intf.admin_status || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Oper Status</div><div>${escapeHtml(intf.oper_status || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">IP</div><div>${escapeHtml(intf.ip_address || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">MAC</div><div>${escapeHtml(intf.mac_address || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Device ID</div><div>${escapeHtml(intf.device_id)}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Speed</div><div>${escapeHtml(intf.speed || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Speed (Mbps)</div><div>${intf.speed_mbps || '-'}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Type</div><div>${escapeHtml(intf.type || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Mode</div><div>${escapeHtml(intf.mode || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">MTU</div><div>${intf.mtu || '-'}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">IfIndex</div><div>${intf.ifindex || '-'}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Description</div><div>${escapeHtml(intf.description || '-')}</div>
                </div>
            </div>
        `;

        const actions = `
            <button class="btn btn-outline" id="btn-edit-interface"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button class="btn btn-outline" style="border-color:var(--danger); color:var(--danger);" id="btn-delete-interface"><i class="fa-solid fa-trash"></i> Delete</button>
        `;

        UI.openDrawer('Interface: ' + escapeHtml(intf.name), content, actions);

        document.getElementById('btn-edit-interface').onclick = () => { UI.closeDrawer(); openInterfaceForm(intf); };
        document.getElementById('btn-delete-interface').onclick = async () => {
            if (!confirm(`Delete interface "${intf.name}"?`)) return;
            try {
                await api.deleteInterface(id);
                UI.showToast('Interface deleted', 'success');
                UI.closeDrawer();
                renderInterfaces(document.getElementById('page-container'));
            } catch (e) {
                UI.showToast(e.message, 'error');
            }
        };
    } catch (e) {
        console.error(e);
        UI.showToast('Failed to load interface', 'error');
    }
}

async function openInterfaceForm(intf = null) {
    const isEdit = !!intf;
    const title = isEdit ? `Edit: ${intf.name}` : 'Add Interface';

    let devices = [];
    try {
        const res = await api.getDevices({ limit: 5000 });
        devices = res.data || [];
    } catch (e) { console.error('Failed to load devices', e); }

    const formHTML = `
        <form id="interface-form" style="display:flex; flex-direction:column; gap:1.5rem;">
            <div class="form-group">
                <label>Device *</label>
                <select name="device_id" class="input" required>
                    <option value="">Select device...</option>
                    ${devices.map(d => `<option value="${d.id}" ${isEdit && intf.device_id === d.id ? 'selected' : ''}>${escapeHtml(d.hostname)} (${escapeHtml(d.ip)})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" class="input" required value="${isEdit ? escapeHtml(intf.name) : ''}" placeholder="GigabitEthernet0/1">
            </div>
            <div class="form-group">
                <label>Type *</label>
                <input type="text" name="type" class="input" required value="${isEdit ? escapeHtml(intf.type || '') : 'ethernet'}" placeholder="ethernet">
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>IP Address</label>
                    <input type="text" name="ip_address" class="input" value="${isEdit ? escapeHtml(intf.ip_address || '') : ''}" placeholder="192.168.1.1">
                </div>
                <div class="form-group">
                    <label>MAC Address</label>
                    <input type="text" name="mac_address" class="input" value="${isEdit ? escapeHtml(intf.mac_address || '') : ''}" placeholder="aa:bb:cc:dd:ee:ff">
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Admin Status</label>
                    <input type="text" name="admin_status" class="input" value="${isEdit ? escapeHtml(intf.admin_status || '') : ''}" placeholder="up/down">
                </div>
                <div class="form-group">
                    <label>Oper Status</label>
                    <input type="text" name="oper_status" class="input" value="${isEdit ? escapeHtml(intf.oper_status || '') : ''}" placeholder="up/down">
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>MTU</label>
                    <input type="number" name="mtu" class="input" value="${isEdit ? intf.mtu || '' : '1500'}" placeholder="1500">
                </div>
                <div class="form-group">
                    <label>Mode</label>
                    <input type="text" name="mode" class="input" value="${isEdit ? escapeHtml(intf.mode || '') : ''}" placeholder="access, trunk, routed">
                </div>
                <div class="form-group">
                    <label>IfIndex</label>
                    <input type="number" name="ifindex" class="input" value="${isEdit ? intf.ifindex || '' : ''}" placeholder="1">
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Speed (Display)</label>
                    <input type="text" name="speed" class="input" value="${isEdit ? escapeHtml(intf.speed || '') : ''}" placeholder="1G">
                </div>
                <div class="form-group">
                    <label>Speed (Mbps)</label>
                    <input type="number" name="speed_mbps" class="input" value="${isEdit ? intf.speed_mbps || '' : ''}" placeholder="1000">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" class="input">
                        <option value="up" ${isEdit && (intf.status || '').toLowerCase() === 'up' ? 'selected' : ''}>Up</option>
                        <option value="down" ${!isEdit || (intf.status || '').toLowerCase() === 'down' ? 'selected' : ''}>Down</option>
                        <option value="administratively down" ${isEdit && (intf.status || '').toLowerCase() === 'administratively down' ? 'selected' : ''}>Administratively Down</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" name="description" class="input" value="${isEdit ? escapeHtml(intf.description || '') : ''}" placeholder="Optional">
            </div>
        </form>
    `;

    const actions = `
        <button class="btn btn-outline" onclick="UI.closeDrawer()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-interface">${isEdit ? 'Update' : 'Create'}</button>
    `;

    UI.openDrawer(title, formHTML, actions);

    document.getElementById('btn-save-interface').onclick = async () => {
        const form = document.getElementById('interface-form');
        if (!form.reportValidity()) return;
        const formData = new FormData(form);
        // explicit conversion for numbers
        const raw = Object.fromEntries(formData.entries());
        const payload = {
            ...raw,
            mtu: raw.mtu ? parseInt(raw.mtu) : undefined,
            ifindex: raw.ifindex ? parseInt(raw.ifindex) : undefined,
            speed_mbps: raw.speed_mbps ? parseInt(raw.speed_mbps) : undefined
        };
        try {
            if (isEdit) {
                await api.updateInterface(intf.id, payload);
                UI.showToast('Interface updated', 'success');
            } else {
                await api.createInterface(payload);
                UI.showToast('Interface created', 'success');
            }
            UI.closeDrawer();
            renderInterfaces(document.getElementById('page-container'));
        } catch (e) {
            UI.showToast(e.message, 'error');
        }
    };
}
