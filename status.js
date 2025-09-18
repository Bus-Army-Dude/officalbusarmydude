// status.js (Helios)

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        categoriesContainer: document.getElementById('service-categories-container'),
        analyticsContainer: document.getElementById('analytics-panel-container'),
        timeline: document.getElementById('incidents-timeline'),
        overallStatusText: document.getElementById('overall-status-text'),
        overallStatusCard: document.getElementById('overall-status-card'),
        lastUpdated: document.getElementById('last-updated'),
        heliosSvg: document.getElementById('helios-map-svg')
    };

    let activeAnalyticsPanel = null;
    let charts = {};

    const fetchData = () => {
        fetch('status-data.json?cachebust=' + new Date().getTime())
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(updatePage)
            .catch(console.error);
    };

    const updatePage = (data) => {
        const overallStatus = getOverallStatus(data.services.map(s => s.status));
        elements.overallStatusText.textContent = data.overallStatus;
        elements.overallStatusCard.className = `overall-status-card glass status-${overallStatus}`;
        elements.lastUpdated.textContent = `Last Updated: ${formatTimestamp(data.lastUpdated)}`;
        
        renderHeliosMap(data.services);
        renderIncidents(data.incidents, data.services);
    };

    const getOverallStatus = (statuses) => {
        if (statuses.includes('outage')) return 'outage';
        if (statuses.includes('degraded')) return 'degraded';
        if (statuses.includes('maintenance')) return 'maintenance';
        return 'operational';
    };

    const renderHeliosMap = (services) => {
        const positions = {
            frontend: { x: 50, y: 50 },
            shoutouts: { x: 300, y: 50 },
            merch-api: { x: 300, y: 150 },
            settings-api: { x: 50, y: 150 },
            firebase: { x: 550, y: 100 },
            admin: { x: 300, y: 250 }
        };

        let linksHTML = '';
        services.forEach(service => {
            if (service.dependencies) {
                service.dependencies.forEach(depId => {
                    const depService = services.find(s => s.id === depId);
                    if (depService) {
                        linksHTML += `<path class="service-link status-${service.status} ${service.status === 'operational' ? 'animated' : ''}" d="M ${positions[service.id].x + 100} ${positions[service.id].y + 25} C ${positions[service.id].x + 200} ${positions[service.id].y + 25}, ${positions[depService.id].x - 100} ${positions[depService.id].y + 25}, ${positions[depService.id].x} ${positions[depService.id].y + 25}" />`;
                    }
                });
            }
        });

        const nodesHTML = services.map(service => `
            <g class="service-node status-${service.status}" id="node-${service.id}" transform="translate(${positions[service.id].x}, ${positions[service.id].y})">
                <rect width="200" height="50" rx="8" ry="8" stroke="currentColor" />
                <text x="100" y="30" text-anchor="middle">${service.name}</text>
            </g>
        `).join('');

        elements.heliosSvg.innerHTML = `<g>${linksHTML}</g><g>${nodesHTML}</g>`;
        
        services.forEach(service => {
            document.getElementById(`node-${service.id}`).addEventListener('click', () => showAnalyticsPanel(service, services));
        });
    };

    const showAnalyticsPanel = (service, allServices) => {
        if (activeAnalyticsPanel) activeAnalyticsPanel.style.display = 'none';

        let panel = document.getElementById(`analytics-${service.id}`);
        if (!panel) {
            panel = document.createElement('div');
            panel.id = `analytics-${service.id}`;
            panel.className = 'analytics-panel glass';
            elements.analyticsContainer.appendChild(panel);
        }
        
        panel.innerHTML = `
            <div class="analytics-header">
                <div class="analytics-title status-${service.status}">${service.name}</div>
                <div class="response-time">${service.averageResponseTime > 0 ? service.averageResponseTime + 'ms' : '--'} <span>avg</span></div>
            </div>
            <div class="performance-chart" id="chart-${service.id}"></div>
            ${service.subcomponents ? `
                <h3>Subcomponents</h3>
                <div class="subcomponents-list expanded">
                    ${service.subcomponents.map(sub => `
                        <div class="subcomponent-item">
                            <span>${sub.name}</span>
                            <span class="status-tag status-${sub.status}">${sub.status}</span>
                        </div>`).join('')}
                </div>
            ` : ''}
        `;
        panel.style.display = 'block';
        activeAnalyticsPanel = panel;
        renderChart(service);
    };

    const renderChart = (service) => {
        const chartId = `chart-${service.id}`;
        if (charts[chartId]) charts[chartId].destroy();
        
        const options = {
            chart: { type: 'area', height: 120, sparkline: { enabled: false }, toolbar: { show: false }, background: 'transparent' },
            stroke: { curve: 'smooth', width: 2 },
            fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
            series: [{ name: 'Response Time', data: service.performance_history }],
            tooltip: { theme: 'dark' },
            colors: [getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim()],
            xaxis: { labels: { show: false } },
            yaxis: { labels: { show: false } }
        };
        
        charts[chartId] = new ApexCharts(document.querySelector(`#${chartId}`), options);
        charts[chartId].render();
    };

    const renderIncidents = (incidents, services) => {
        elements.timeline.innerHTML = '';
        const grouped = incidents.reduce((acc, inc) => {
            const date = new Date(inc.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            if (!acc[date]) acc[date] = [];
            acc[date].push(inc);
            return acc;
        }, {});

        for (const date in grouped) {
            const dayGroup = document.createElement('div');
            dayGroup.className = 'incident-day-group';
            const incidentsHTML = grouped[date].map(incident => `
                <div class="incident-item glass severity-${incident.severity || 'info'}">
                    <div class="incident-header">
                        <span class="incident-title">${incident.title}</span>
                        <span class="incident-severity">${incident.severity || 'Update'}</span>
                    </div>
                    ${incident.affected_components ? `<div class="incident-affected">Affected: ${incident.affected_components.map(id => services.find(s => s.id === id).name).join(', ')}</div>` : ''}
                    <div class="incident-updates">
                        ${incident.updates.map(upd => `<p><strong>${upd.timestamp}:</strong> ${upd.description}</p>`).join('')}
                    </div>
                </div>
            `).join('');
            dayGroup.innerHTML = `<h3 class="incident-date">${date}</h3>${incidentsHTML}`;
            elements.timeline.appendChild(dayGroup);
        }
    };
    
    const formatTimestamp = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    fetchData();
    setInterval(fetchData, 60000);
});
