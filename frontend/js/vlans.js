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

export async function renderVlans(container) {
    try {
        const data = await api.getVlans(store.vlans);

        container.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">VLANs</h2>
                <div>
                    <button class="btn btn-outline" id="dl-csv-vlans"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
                    <button class="btn btn-primary" id="btn-add-vlan"><i class="fa-solid fa-plus"></i> Add VLAN</button>
                </div>
            </div>
            <div id="vlan-table"></div>
        `;

        const table = UI.createTable('#vlan-table', data.data || [], [
            { title: "ID", field: "vlan_id", sorter: "number", width: 80 },
            { title: "Name", field: "name", headerFilter: "input", formatter: c => escapeHtml(c.getValue()) },
            { title: "Loc ID", field: "location_id", width: 100, formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "Subnet", field: "subnet_cidr", formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "Gateway", field: "gateway_ip", formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "Description", field: "description", formatter: c => escapeHtml(c.getValue() || '-') }
        ], {
            initialSort: [{ column: "vlan_id", dir: "asc" }],
            onRowClick: (e, row) => openVlanDrawer(row.getData().id)
        });

        setTimeout(() => {
            const dlBtn = document.getElementById('dl-csv-vlans');
            if (dlBtn) dlBtn.onclick = () => table && table.download("csv", "vlans.csv");
            const addBtn = document.getElementById('btn-add-vlan');
            if (addBtn) addBtn.onclick = () => openVlanForm();
        }, 0);

        window.openVlanDrawer = openVlanDrawer;
    } catch (error) {
        console.error("Render VLANs Error:", error);
        container.innerHTML = UI.renderEmptyState(`Failed to load VLANs: ${error.message}`);
    }
}

export async function openVlanDrawer(id) {
    try {
        const v = await api.getVlan(id);

        const content = `
            <div style="padding:0.5rem 0;">
                <div class="prop-grid" style="display:grid; grid-template-columns:1fr 2fr; gap:0.75rem;">
                    <div style="font-weight:600; color:var(--text-secondary);">VLAN ID</div><div style="font-family:monospace; font-weight:bold;">${escapeHtml(String(v.vlan_id))}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Name</div><div>${escapeHtml(v.name)}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Location ID</div><div>${escapeHtml(v.location_id || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Subnet</div><div>${escapeHtml(v.subnet_cidr || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Gateway</div><div>${escapeHtml(v.gateway_ip || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Description</div><div>${escapeHtml(v.description || '-')}</div>
                </div>
            </div>
        `;

        const actions = `
            <button class="btn btn-outline" id="btn-edit-vlan"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button class="btn btn-outline" style="border-color:var(--danger); color:var(--danger);" id="btn-delete-vlan"><i class="fa-solid fa-trash"></i> Delete</button>
        `;

        UI.openDrawer('VLAN ' + v.vlan_id + ': ' + escapeHtml(v.name), content, actions);

        document.getElementById('btn-edit-vlan').onclick = () => { UI.closeDrawer(); openVlanForm(v); };
        document.getElementById('btn-delete-vlan').onclick = async () => {
            if (!confirm(`Delete VLAN ${v.vlan_id} "${v.name}"?`)) return;
            try {
                await api.deleteVlan(id);
                UI.showToast('VLAN deleted', 'success');
                UI.closeDrawer();
                renderVlans(document.getElementById('page-container'));
            } catch (e) {
                UI.showToast(e.message, 'error');
            }
        };
    } catch (e) {
        console.error(e);
        UI.showToast('Failed to load VLAN', 'error');
    }
}

async function openVlanForm(vlan = null) {
    const isEdit = !!vlan;
    const title = isEdit ? `Edit VLAN ${vlan.vlan_id}` : 'Add VLAN';

    const formHTML = `
        <form id="vlan-form" style="display:flex; flex-direction:column; gap:1.5rem;">
            <div class="form-group">
                <label>VLAN ID (1-4094) *</label>
                <input type="number" name="vlan_id" class="input" min="1" max="4094" required
                    value="${isEdit ? vlan.vlan_id : ''}" placeholder="100">
            </div>
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" class="input" required value="${isEdit ? escapeHtml(vlan.name) : ''}" placeholder="VLAN-100-Servers">
            </div>
            <div class="form-group">
                <label>Location ID</label>
                <input type="text" name="location_id" class="input" value="${isEdit ? escapeHtml(vlan.location_id || '') : ''}" placeholder="LOC-001">
            </div>
            <div class="form-group">
                <label>Subnet CIDR</label>
                <input type="text" name="subnet_cidr" class="input" value="${isEdit ? escapeHtml(vlan.subnet_cidr || '') : ''}" placeholder="192.168.10.0/24">
            </div>
            <div class="form-group">
                <label>Gateway IP</label>
                <input type="text" name="gateway_ip" class="input" value="${isEdit ? escapeHtml(vlan.gateway_ip || '') : ''}" placeholder="192.168.10.1">
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" name="description" class="input" value="${isEdit ? escapeHtml(vlan.description || '') : ''}" placeholder="Optional">
            </div>
        </form>
    `;

    const actions = `
        <button class="btn btn-outline" onclick="UI.closeDrawer()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-vlan">${isEdit ? 'Update' : 'Create'}</button>
    `;

    UI.openDrawer(title, formHTML, actions);

    document.getElementById('btn-save-vlan').onclick = async () => {
        const form = document.getElementById('vlan-form');
        if (!form.reportValidity()) return;
        const raw = Object.fromEntries(new FormData(form).entries());
        const payload = {
            vlan_id: parseInt(raw.vlan_id, 10),
            name: raw.name,
            location_id: raw.location_id || null,
            subnet_cidr: raw.subnet_cidr || '',
            gateway_ip: raw.gateway_ip || '',
            description: raw.description || ''
        };
        try {
            if (isEdit) {
                await api.updateVlan(vlan.id, payload);
                UI.showToast('VLAN updated', 'success');
            } else {
                await api.createVlan(payload);
                UI.showToast('VLAN created', 'success');
            }
            UI.closeDrawer();
            renderVlans(document.getElementById('page-container'));
        } catch (e) {
            UI.showToast(e.message, 'error');
        }
    };
}
