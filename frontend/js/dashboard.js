import api from './api.js?v=5';
import * as UI from './components.js';

let statusChartInstance = null;
let vendorChartInstance = null;
let roleChartInstance = null;
let locationChartInstance = null;

// --- Helpers ---

function safeCount(res) {
    return res?.meta?.total_count ?? res?.meta?.totalCount ?? res?.meta?.total ?? res?.total ?? 0;
}

function genHslColors(n) {
    // Generate distinct colors dynamically
    return Array.from({ length: n }, (_, i) => `hsl(${Math.round((340 / n) * i)}, 70%, 55%)`);
}

function destroyCharts() {
    if (statusChartInstance) { statusChartInstance.destroy(); statusChartInstance = null; }
    if (vendorChartInstance) { vendorChartInstance.destroy(); vendorChartInstance = null; }
    if (roleChartInstance) { roleChartInstance.destroy(); roleChartInstance = null; }
    if (locationChartInstance) { locationChartInstance.destroy(); locationChartInstance = null; }
}

function getCssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
}

// --- Main Render Function ---

export async function renderDashboard(container) {
    // 1. Fetch Data
    try {

        const [totalDevsRes, activeDevsRes, locsRes, vlansRes, chartDataRes, allLocsRes, recentEventsRes, topMetricsRes] = await Promise.all([
            api.getDevices({ limit: 1 }),
            api.getDevices({ limit: 1, status: 'active' }),
            api.getLocations({ limit: 1 }),
            api.getVlans({ limit: 1 }),
            api.getDevices({ limit: 5000 }),
            api.getLocations({ limit: 10000 }),
            api.getEvents({ limit: 5, sort: 'created_at:desc' }),
            api.getMetrics({ limit: 5, sort: 'cpu:desc' })
        ]);

        // 2. Calculate Metrics (Safely)
        const totalDevs = safeCount(totalDevsRes);
        const activeCount = safeCount(activeDevsRes);
        const healthScore = totalDevs > 0 ? Math.round((activeCount / totalDevs) * 100) : 100;

        let healthColor = 'text-success';
        if (healthScore < 90) healthColor = 'text-warning';
        if (healthScore < 75) healthColor = 'text-danger';

        // 3. Render DOM
        const allLocsCount = Array.isArray(allLocsRes?.data) ? allLocsRes.data.length : safeCount(allLocsRes);

        container.innerHTML = `
            <div class="page-header"><h2 class="page-title">Network Overview</h2></div>
            
            <!-- KPI Cards -->
            <div class="grid-dashboard">
                ${UI.renderCard('Total Devices', totalDevs, 'fa-server', 0)}
                ${UI.renderCard('Online Devices', activeCount, 'fa-power-off', 0, 'text-success')}
                ${UI.renderCard('Network Health', healthScore + '%', 'fa-heartbeat', 0, healthColor)}
                ${UI.renderCard('Locations', allLocsCount, 'fa-map-marker-alt')}
            </div>

            <!-- Charts Container -->
            <div class="charts-row">
                <div class="table-panel" style="padding:1.5rem;">
                    <h3 style="margin-bottom:1rem;">Device Status</h3>
                    <div style="position: relative; height:300px; width:100%">
                        <canvas id="chart-status"></canvas>
                    </div>
                </div>
                <div class="table-panel" style="padding:1.5rem;">
                     <h3 style="margin-bottom:1rem;">Vendor Distribution</h3>
                     <div style="position: relative; height:300px; width:100%">
                        <canvas id="chart-vendor"></canvas>
                     </div>
                </div>
            </div>

            <div class="charts-row" style="margin-top:1.5rem;">
                <div class="table-panel" style="padding:1.5rem;">
                    <h3 style="margin-bottom:1rem;">Role Distribution</h3>
                    <div style="position: relative; height:300px; width:100%">
                        <canvas id="chart-role"></canvas>
                    </div>
                </div>
                <div class="table-panel" style="padding:1.5rem;">
                     <h3 style="margin-bottom:1rem;">Top Locations</h3>
                     <div style="position: relative; height:300px; width:100%">
                        <canvas id="chart-location"></canvas>
                     </div>
                </div>
            </div>
            </div>

            <div class="charts-row" style="margin-top:1.5rem;">
                <!-- Recent Alerts Widget -->
                <div class="table-panel" style="padding:1.5rem; flex: 1;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <h3 style="margin:0;">Recent Critical Alerts</h3>
                        <a href="#/alerts" class="btn btn-sm btn-outline">View All</a>
                    </div>
                    <div id="widget-alerts"></div>
                </div>

                <!-- Top CPU Widget -->
                <div class="table-panel" style="padding:1.5rem; flex: 1;">
                    <h3 style="margin-bottom:1rem;">High CPU Devices</h3>
                    <div id="widget-cpu"></div>
                </div>
            </div>
        `;

        // 4. Render Charts & Widgets
        renderCharts(chartDataRes.data, allLocsRes.data);
        renderRecentAlerts(recentEventsRes.data || []);
        renderTopCPU(topMetricsRes.data || [], chartDataRes.data || []);

    } catch (error) {
        console.error("Dashboard Error:", error);
        container.innerHTML = UI.renderEmptyState(`Failed to load dashboard: ${error.message}`);
    }
}

function renderCharts(devices, locations) {
    const statusCounts = {};
    const vendorCounts = {};
    const roleCounts = {};
    const locationCounts = {};

    const locationNameById = {};
    (locations || []).forEach(l => {
        if (l && l.id) locationNameById[l.id] = l.site_code || l.name || l.id;
    });

    (devices || []).forEach(d => {
        const status = String(d?.status ?? 'unknown').toLowerCase();
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        const vendor = String(d?.vendor ?? 'Unknown').trim() || 'Unknown';
        vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1;

        const role = String(d?.role ?? 'unknown').trim() || 'unknown';
        roleCounts[role] = (roleCounts[role] || 0) + 1;

        const locId = d?.location_id;
        const locName = locId ? (locationNameById[locId] || locId) : 'Unassigned';
        locationCounts[locName] = (locationCounts[locName] || 0) + 1;
    });

    destroyCharts();

    // --- Chart 1: Status (Stable Ordering) ---
    const preferred = ['active', 'maintenance', 'decommissioned', 'unknown'];
    // Labels: Active, Maintenance, ... then any others found sorted alphabetically
    const statusLabels = [
        ...preferred.filter(s => s in statusCounts),
        ...Object.keys(statusCounts).filter(s => !preferred.includes(s)).sort()
    ];

    // Specific colors for known statuses, dynamic for others
    const statusColorMap = {
        'active': '#10b981',        // Green
        'maintenance': '#f59e0b',   // Orange
        'decommissioned': '#ef4444',// Red
        'unknown': '#94a3b8'        // Gray
    };

    const statusColors = statusLabels.map(s => statusColorMap[s] || `hsl(${Math.random() * 360}, 70%, 50%)`);
    const statusValues = statusLabels.map(s => statusCounts[s]);

    // Theme-aware grid color
    const gridColor = getCssVar('--border-color', 'rgba(0,0,0,0.1)');

    statusChartInstance = new Chart(document.getElementById('chart-status'), {
        type: 'bar',
        data: {
            labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
            datasets: [{
                label: 'Device Count',
                data: statusValues,
                backgroundColor: statusColors,
                borderWidth: 0,
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: gridColor } },
                x: { grid: { display: false } }
            }
        }
    });

    // --- Chart 2: Vendor (Top 6 + Others) ---
    const vendorEntries = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1]);
    const topN = 6;
    const top = vendorEntries.slice(0, topN);
    const rest = vendorEntries.slice(topN);

    const vendorLabels = top.map(([k]) => k);
    const vendorValues = top.map(([, v]) => v);
    const othersSum = rest.reduce((sum, [, v]) => sum + v, 0);

    if (othersSum > 0) {
        vendorLabels.push('Others');
        vendorValues.push(othersSum);
    }

    const vendorColors = genHslColors(vendorLabels.length);

    vendorChartInstance = new Chart(document.getElementById('chart-vendor'), {
        type: 'doughnut',
        data: {
            labels: vendorLabels,
            datasets: [{
                data: vendorValues,
                backgroundColor: vendorColors,
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            },
            cutout: '70%',
            onClick: (e, items) => {
                if (items.length > 0) {
                    const idx = items[0].index;
                    const label = vendorLabels[idx];
                    if (label !== 'Others') {
                        UI.showToast(`Filtering by ${label}...`, 'info');
                        // Future: Navigate to devices with filter
                        // window.location.hash = `#/devices?vendor=${label}`;
                    }
                }
            }
        }
    });

    // --- Chart 3: Role Distribution ---
    const roleEntries = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);
    const roleLabels = roleEntries.map(([k]) => k);
    const roleValues = roleEntries.map(([, v]) => v);
    roleChartInstance = new Chart(document.getElementById('chart-role'), {
        type: 'doughnut',
        data: {
            labels: roleLabels,
            datasets: [{
                data: roleValues,
                backgroundColor: genHslColors(roleLabels.length),
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            },
            cutout: '70%'
        }
    });

    // --- Chart 4: Top Locations ---
    const locEntries = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);
    const topLoc = locEntries.slice(0, 8);
    const locLabels = topLoc.map(([k]) => k);
    const locValues = topLoc.map(([, v]) => v);

    locationChartInstance = new Chart(document.getElementById('chart-location'), {
        type: 'bar',
        data: {
            labels: locLabels,
            datasets: [{
                label: 'Devices',
                data: locValues,
                backgroundColor: locLabels.map(() => getCssVar('--accent-primary', '#2563eb')),
                borderWidth: 0,
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: gridColor } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderRecentAlerts(events) {
    const container = document.getElementById('widget-alerts');
    if (!events || events.length === 0) {
        container.innerHTML = '<div class="text-muted">No recent alerts</div>';
        return;
    }

    const html = events.map(e => {
        let color = '#3b82f6';
        if (e.severity === 'critical') color = '#ef4444';
        if (e.severity === 'warning') color = '#f59e0b';

        return `
            <div style="display:flex; align-items:center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; margin-right: 10px;"></div>
                <div style="flex:1;">
                    <div style="font-weight:500; font-size:0.9rem;">${e.message || 'Unknown Event'}</div>
                    <div style="font-size:0.8rem; opacity:0.7;">${new Date(e.created_at).toLocaleString()}</div>
                </div>
                <div style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:${color};">${e.severity}</div>
            </div>
        `;
    }).join('');
    container.innerHTML = html;
}

function renderTopCPU(metrics, devices) {
    const container = document.getElementById('widget-cpu');
    const devMap = {};
    devices.forEach(d => devMap[d.id] = d.hostname);

    if (!metrics || metrics.length === 0) {
        container.innerHTML = '<div class="text-muted">No metrics data</div>';
        return;
    }

    const html = metrics.map(m => {
        const hostname = devMap[m.device_id] || m.device_id || 'Unknown Device';
        const cpu = m.cpu || 0;
        let barColor = '#10b981';
        if (cpu > 50) barColor = '#f59e0b';
        if (cpu > 80) barColor = '#ef4444';

        return `
            <div style="margin-bottom: 0.75rem;">
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:4px;">
                    <span>${hostname}</span>
                    <span style="font-weight:600;">${cpu}%</span>
                </div>
                <div style="height:6px; background:var(--bg-secondary); border-radius:3px; overflow:hidden;">
                    <div style="width:${cpu}%; height:100%; background:${barColor};"></div>
                </div>
            </div>
        `;
    }).join('');
    container.innerHTML = html;
}
