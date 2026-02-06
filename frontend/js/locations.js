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

export async function renderLocations(container) {
    try {
        const data = await api.getLocations(store.locations || { limit: 10000 });

        container.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Locations</h2>
                <div>
                    <button class="btn btn-outline" id="dl-csv-locations"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
                    <button class="btn btn-primary" id="btn-add-location"><i class="fa-solid fa-plus"></i> Add Location</button>
                </div>
            </div>
            <div id="location-table"></div>
        `;

        const table = UI.createTable('#location-table', data.data || [], [
            { title: "Name", field: "name", headerFilter: "input", formatter: c => escapeHtml(c.getValue()) },
            { title: "Site Code", field: "site_code", headerFilter: "input", formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "City", field: "city", headerFilter: "input", formatter: c => escapeHtml(c.getValue()) },
            { title: "Country", field: "country", headerFilter: "input", formatter: c => escapeHtml(c.getValue()) },
            { title: "Timezone", field: "timezone", formatter: c => escapeHtml(c.getValue() || '-') },
            { title: "Address", field: "address", formatter: c => escapeHtml(c.getValue() || '-') }
        ], {
            initialSort: [{ column: "name", dir: "asc" }],
            onRowClick: (e, row) => openLocationDrawer(row.getData().id)
        });

        setTimeout(() => {
            const dlBtn = document.getElementById('dl-csv-locations');
            if (dlBtn) dlBtn.onclick = () => table && table.download("csv", "locations.csv");
            const addBtn = document.getElementById('btn-add-location');
            if (addBtn) addBtn.onclick = () => openLocationForm();
        }, 0);
    } catch (error) {
        console.error("Render Locations Error:", error);
        container.innerHTML = UI.renderEmptyState(`Failed to load locations: ${error.message}`);
    }
}

export async function openLocationDrawer(id) {
    try {
        const [location, devicesRes] = await Promise.all([
            api.getLocation(id),
            api.getDevicesByLocation(id).catch(() => ({ data: [] }))
        ]);
        const devices = devicesRes?.data ?? (Array.isArray(devicesRes) ? devicesRes : []);

        const content = `
            <div style="padding:0.5rem 0;">
                <div class="prop-grid" style="display:grid; grid-template-columns:1fr 2fr; gap:0.75rem; margin-bottom:1.5rem;">
                    <div style="font-weight:600; color:var(--text-secondary);">Name</div><div>${escapeHtml(location.name)}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Site Code</div><div>${escapeHtml(location.site_code || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">City</div><div>${escapeHtml(location.city)}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Country</div><div>${escapeHtml(location.country)}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Address</div><div>${escapeHtml(location.address || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Timezone</div><div>${escapeHtml(location.timezone || '-')}</div>
                    <div style="font-weight:600; color:var(--text-secondary);">Coordinates</div><div>${location.lat || '-'}, ${location.lon || '-'}</div>
                </div>
                <h4 style="font-size:0.9rem; margin-bottom:0.75rem;">Devices at this location (${devices.length})</h4>
                <div style="max-height:200px; overflow-y:auto;">
                    ${devices.length === 0
                ? '<p style="color:var(--text-secondary);">No devices</p>'
                : devices.map(d => `
                            <div style="padding:0.5rem; border:1px solid var(--border-color); border-radius:4px; margin-bottom:0.5rem; cursor:pointer;" onclick="window.filterDevicesByLocation && window.filterDevicesByLocation('${id}', '${escapeHtml(location.name)}'); UI.closeDrawer();">
                                <strong>${escapeHtml(d.hostname)}</strong> — ${escapeHtml(d.ip || '-')}
                            </div>
                        `).join('')
            }
                </div>
            </div>
        `;

        const actions = `
            <button class="btn btn-outline" id="btn-edit-location"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button class="btn btn-outline" style="border-color:var(--danger); color:var(--danger);" id="btn-delete-location"><i class="fa-solid fa-trash"></i> Delete</button>
        `;

        UI.openDrawer('Location: ' + escapeHtml(location.name), content, actions);

        document.getElementById('btn-edit-location').onclick = () => { UI.closeDrawer(); openLocationForm(location); };
        document.getElementById('btn-delete-location').onclick = async () => {
            if (!confirm(`Delete location "${location.name}"?`)) return;
            try {
                await api.deleteLocation(id);
                UI.showToast('Location deleted', 'success');
                UI.closeDrawer();
                renderLocations(document.getElementById('page-container'));
            } catch (e) {
                UI.showToast(e.message, 'error');
            }
        };
    } catch (e) {
        console.error(e);
        UI.showToast('Failed to load location', 'error');
    }
}

async function openLocationForm(location = null) {
    const isEdit = !!location;
    const title = isEdit ? `Edit: ${location.name}` : 'Add Location';

    const formHTML = `
        <form id="location-form" style="display:flex; flex-direction:column; gap:1.5rem;">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" class="input" required value="${isEdit ? escapeHtml(location.name) : ''}" placeholder="HQ Building A">
            </div>
            <div class="form-group">
                <label>Site Code</label>
                <input type="text" name="site_code" class="input" value="${isEdit ? escapeHtml(location.site_code || '') : ''}" placeholder="IST-HQ-01">
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>City *</label>
                    <input type="text" name="city" class="input" required value="${isEdit ? escapeHtml(location.city) : ''}" placeholder="Istanbul">
                </div>
                <div class="form-group">
                    <label>Country *</label>
                    <input type="text" name="country" class="input" required value="${isEdit ? escapeHtml(location.country) : ''}" placeholder="Turkey">
                </div>
            </div>
            <div class="form-group">
                <label>Address *</label>
                <input type="text" name="address" class="input" required value="${isEdit ? escapeHtml(location.address || '') : ''}" placeholder="Street, number">
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Timezone</label>
                    <input type="text" name="timezone" class="input" value="${isEdit ? escapeHtml(location.timezone || '') : ''}" placeholder="Europe/Istanbul">
                </div>
                 <div class="form-group">
                    <label>Coordinates (Lat, Lon)</label>
                    <div style="display:flex; gap:0.5rem;">
                         <input type="text" name="lat" class="input" value="${isEdit ? location.lat || '' : ''}" placeholder="Lat">
                         <input type="text" name="lon" class="input" value="${isEdit ? location.lon || '' : ''}" placeholder="Lon">
                    </div>
                </div>
            </div>
        </form>
    `;

    const actions = `
        <button class="btn btn-outline" onclick="UI.closeDrawer()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-location">${isEdit ? 'Update' : 'Create'}</button>
    `;

    UI.openDrawer(title, formHTML, actions);

    document.getElementById('btn-save-location').onclick = async () => {
        const form = document.getElementById('location-form');
        if (!form.reportValidity()) return;
        const formData = new FormData(form);
        const raw = Object.fromEntries(formData.entries());
        const payload = {
            ...raw,
            lat: raw.lat ? parseFloat(raw.lat) : undefined,
            lon: raw.lon ? parseFloat(raw.lon) : undefined
        };
        try {
            if (isEdit) {
                await api.updateLocation(location.id, payload);
                UI.showToast('Location updated', 'success');
            } else {
                await api.createLocation(payload);
                UI.showToast('Location created', 'success');
            }
            UI.closeDrawer();
            renderLocations(document.getElementById('page-container'));
        } catch (e) {
            UI.showToast(e.message, 'error');
        }
    };
}
