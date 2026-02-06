import api from './api.js?v=5';
import * as UI from './components.js';

export async function renderMetrics(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title">Device Metrics</h2>
            <div class="actions">
                <button class="btn btn-outline" id="refresh-metrics"><i class="fa-solid fa-sync"></i> Refresh</button>
            </div>
        </div>
        <div class="table-panel">
            <div id="metrics-table"></div>
        </div>
    `;

    document.getElementById('refresh-metrics').addEventListener('click', () => loadMetrics());

    await loadMetrics();
}

async function loadMetrics() {
    try {
        const res = await api.getMetrics({ limit: 1000, sort: 'timestamp:desc' });
        const metrics = res.data || [];

        UI.createTable('#metrics-table', metrics, [
            { title: "Device ID", field: "device_id", width: 150 },
            { title: "Metric Type", field: "metric_type", width: 150, formatter: typeFormatter },
            { title: "Value", field: "value", width: 120, formatter: valueFormatter },
            { title: "Unit", field: "unit", width: 100 },
            { title: "Timestamp", field: "timestamp", width: 180 },
        ], {
            initialSort: [{ column: "timestamp", dir: "desc" }]
        });
    } catch (err) {
        console.error(err);
        document.getElementById('metrics-table').innerHTML = UI.renderEmptyState(`Failed to load metrics: ${err.message}`);
    }
}

function typeFormatter(cell) {
    const val = cell.getValue();
    let icon = 'fa-chart-bar';
    if (val === 'cpu_usage') icon = 'fa-microchip';
    if (val === 'memory_usage' || val === 'ram') icon = 'fa-memory';
    if (val === 'temperature') icon = 'fa-thermometer-half';
    if (val === 'availability') icon = 'fa-heartbeat';

    return `<i class="fa-solid ${icon}" style="margin-right:8px; opacity:0.7;"></i>${val}`;
}

function valueFormatter(cell) {
    const val = cell.getValue();
    const row = cell.getData();
    let color = 'var(--text-primary)';

    // Simple threshold checking
    if (row.metric_type === 'cpu_usage' && val > 80) color = 'var(--danger)';
    if (row.metric_type === 'temperature' && val > 75) color = 'var(--warning)';
    if (row.metric_type === 'availability' && val < 100) color = 'var(--danger)';

    return `<span style="color:${color}; font-weight:bold;">${val}</span>`;
}
