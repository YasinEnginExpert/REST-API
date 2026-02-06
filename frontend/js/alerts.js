import api from './api.js?v=5';
import * as UI from './components.js';

export async function renderAlerts(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title">Alerts & Events</h2>
            <div class="actions">
                <button class="btn btn-outline" id="refresh-alerts"><i class="fa-solid fa-sync"></i> Refresh</button>
            </div>
        </div>
        <div class="table-panel">
            <div id="alerts-table"></div>
        </div>
    `;

    document.getElementById('refresh-alerts').addEventListener('click', () => loadAlerts());

    await loadAlerts();
}

async function loadAlerts() {
    try {
        const res = await api.getEvents({ limit: 1000 });
        const events = res.data || [];

        UI.createTable('#alerts-table', events, [
            { title: "Severity", field: "severity", formatter: severityFormatter, width: 120 },
            { title: "Type", field: "type", width: 150 },
            { title: "Message", field: "message", minWidth: 300 },
            { title: "Device ID", field: "device_id", width: 150 },
            { title: "Time", field: "created_at", width: 180 },
        ], {
            initialSort: [{ column: "created_at", dir: "desc" }]
        });
    } catch (err) {
        console.error(err);
        document.getElementById('alerts-table').innerHTML = UI.renderEmptyState(`Failed to load alerts: ${err.message}`);
    }
}

function severityFormatter(cell) {
    const val = cell.getValue();
    let color = 'var(--text-primary)';
    let icon = 'fa-info-circle';

    if (val === 'critical' || val === 'error') {
        color = 'var(--danger)';
        icon = 'fa-exclamation-circle';
    } else if (val === 'warning') {
        color = 'var(--warning)';
        icon = 'fa-exclamation-triangle';
    } else if (val === 'info') {
        color = 'var(--info)';
    }

    return `<span style="color:${color}; font-weight:600; text-transform:uppercase; font-size:0.85rem;">
        <i class="fa-solid ${icon}" style="margin-right:6px;"></i>${val}
    </span>`;
}
