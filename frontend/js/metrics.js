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
        const res = await api.getMetrics({ limit: 1000 });
        const metrics = res.data || [];

        UI.createTable('#metrics-table', metrics, [
            { title: "Device ID", field: "device_id", width: 160 },
            { title: "CPU %", field: "cpu", width: 110, formatter: percentFormatter },
            { title: "Memory %", field: "memory", width: 120, formatter: percentFormatter },
            { title: "Temp (C)", field: "temp", width: 120, formatter: tempFormatter },
            { title: "Uptime", field: "uptime_seconds", width: 140, formatter: uptimeFormatter },
            { title: "Timestamp", field: "ts", width: 180, formatter: tsFormatter },
        ], {
            initialSort: [{ column: "ts", dir: "desc" }]
        });
    } catch (err) {
        console.error(err);
        document.getElementById('metrics-table').innerHTML = UI.renderEmptyState(`Failed to load metrics: ${err.message}`);
    }
}

function percentFormatter(cell) {
    const val = cell.getValue();
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    if (Number.isNaN(num)) return '-';

    let color = 'var(--text-primary)';
    if (num >= 80) color = 'var(--danger)';
    else if (num >= 60) color = 'var(--warning)';
    else color = 'var(--success)';

    return `<span style="color:${color}; font-weight:600;">${num.toFixed(1)}%</span>`;
}

function tempFormatter(cell) {
    const val = cell.getValue();
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    if (Number.isNaN(num)) return '-';

    let color = 'var(--text-primary)';
    if (num >= 85) color = 'var(--danger)';
    else if (num >= 75) color = 'var(--warning)';

    return `<span style="color:${color}; font-weight:600;">${num.toFixed(1)}°C</span>`;
}

function uptimeFormatter(cell) {
    const val = cell.getValue();
    if (val === null || val === undefined || val === '') return '-';
    const seconds = Math.max(0, Number(val));
    if (Number.isNaN(seconds)) return '-';

    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function tsFormatter(cell) {
    const val = cell.getValue();
    if (!val) return '-';
    if (typeof dayjs !== 'undefined') return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
    return new Date(val).toLocaleString();
}
