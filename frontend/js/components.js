// Core UI Composables

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function renderCard(title, value, icon, trend = null, colorClass = '') {
    return `
        <div class="kpi-card">
            <div>
                <div class="kpi-label">${title}</div>
                <div class="kpi-value ${colorClass}">${value}</div>
                ${trend ? `<div style="font-size:0.8rem; color:${trend > 0 ? 'var(--success)' : 'var(--danger)'}; margin-top:0.25rem;">
                    <i class="fa-solid fa-arrow-${trend > 0 ? 'up' : 'down'}"></i> ${Math.abs(trend)}% vs last week
                </div>` : ''}
            </div>
            <div class="kpi-icon"><i class="fa-solid ${icon}"></i></div>
        </div>
    `;
}

// Enterprise Grid using Tabulator
export function createTable(selector, data, columns, options = {}) {
    if (!data || data.length === 0) {
        document.querySelector(selector).innerHTML = renderEmptyState();
        return null;
    }

    if (typeof Tabulator === 'undefined') {
        console.error('Tabulator library not loaded');
        document.querySelector(selector).innerHTML = renderEmptyState('Table library failed to load. Please refresh.');
        return null;
    }

    return new Tabulator(selector, {
        data: data,
        columns: columns,
        layout: "fitColumns",
        responsiveLayout: false,
        pagination: "local",
        paginationSize: 10,
        placeholder: "No Data Available",
        rowClick: options.onRowClick,
        initialSort: options.initialSort || [],
        persistence: { sort: true, filter: true },
        ...options
    });
}

export function renderEmptyState(message = 'No data found') {
    return `
        <div class="empty-state" style="text-align:center; padding:4rem; color:var(--text-secondary);">
            <i class="fa-solid fa-folder-open" style="font-size:3rem; margin-bottom:1rem; opacity:0.3;"></i>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

export function renderSkeleton() {
    return `
        <div class="grid-dashboard">
            <div class="skeleton" style="height:120px;"></div>
            <div class="skeleton" style="height:120px;"></div>
            <div class="skeleton" style="height:120px;"></div>
            <div class="skeleton" style="height:120px;"></div>
        </div>
        <div class="skeleton" style="height:400px; width:100%;"></div>
    `;
}

export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = `var(--${type})`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';

    const safe = escapeHtml(message);
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color:var(--${type})"></i> <span>${safe}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

export function openDrawer(title, contentHTML, actionsHTML = '') {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawer-overlay');
    document.getElementById('drawer-title').textContent = title;

    const contentEl = document.getElementById('drawer-content');
    const actionsEl = document.getElementById('drawer-actions');

    contentEl.innerHTML = contentHTML;

    const hasActions = typeof actionsHTML === 'string' && actionsHTML.trim() !== '';
    actionsEl.innerHTML = hasActions ? actionsHTML : '';
    actionsEl.style.display = hasActions ? 'flex' : 'none';

    contentEl.scrollTop = 0;

    drawer.classList.add('open');
    overlay.classList.add('open');

    const close = () => {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        overlay.removeEventListener('click', close);
        document.removeEventListener('keydown', onEscape);
        window.__drawerClose = null;
    };

    const onEscape = (e) => { if (e.key === 'Escape') close(); };

    overlay.removeEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', onEscape);
    window.__drawerClose = close;
}

export function closeDrawer() {
    if (typeof window.__drawerClose === 'function') {
        window.__drawerClose();
        window.__drawerClose = null;

        const actionsEl = document.getElementById('drawer-actions');
        if (actionsEl) {
            const hasActions = actionsEl.innerHTML && actionsEl.innerHTML.trim() !== '';
            actionsEl.style.display = hasActions ? 'flex' : 'none';
        }
        return;
    }
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('drawer-overlay').classList.remove('open');
}

// Global expose for close button
window.closeDrawer = closeDrawer;
