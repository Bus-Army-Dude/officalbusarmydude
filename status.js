// status.js (Aura)

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        categoriesContainer: document.getElementById('service-categories-container'),
        timeline: document.getElementById('incidents-timeline'),
        overallStatusText: document.getElementById('overall-status-text'),
        overallStatusCard: document.getElementById('overall-status-card'),
        lastUpdated: document.getElementById('last-updated')
    };

    const fetchData = () => {
        fetch('status-data.json?cachebust=' + new Date().getTime())
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(updatePage)
            .catch(console.error);
    };

    const updatePage = (data) => {
        const allStatuses = data.serviceCategories.flatMap(c => c.services.map(s => s.status));
        const overallStatus = getOverallStatus(allStatuses);

        elements.overallStatusText.textContent = data.overallStatus;
        elements.overallStatusCard.className = `overall-status-card glass status-${overallStatus}`;
        elements.lastUpdated.textContent = `Last Updated: ${formatTimestamp(data.lastUpdated)}`;

        renderServiceCategories(data.serviceCategories);
        renderIncidents(data.incidents);
    };

    const getOverallStatus = (statuses) => {
        if (statuses.includes('outage')) return 'outage';
        if (statuses.includes('degraded')) return 'degraded';
        if (statuses.includes('maintenance')) return 'maintenance';
        return 'operational';
    };

    const renderServiceCategories = (categories) => {
        elements.categoriesContainer.innerHTML = '';
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'service-category';
            const servicesHTML = category.services.map(service => `
                <div class="status-item glass">
                    <div class="status-item-header">
                        <div class="status-item-title status-${service.status}">
                            <svg class="status-svg-indicator" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45"/></svg>
                            ${service.name}
                        </div>
                        <div class="response-time">${service.averageResponseTime > 0 ? service.averageResponseTime + 'ms' : '--'} <span>avg</span></div>
                        <div class="status-tag status-${service.status}">${service.status}</div>
                    </div>
                    <div class="performance-chart" id="chart-${service.name.replace(/\s/g, '')}"></div>
                    ${service.subcomponents ? `
                        <button class="subcomponents-toggle">Show Subcomponents ▼</button>
                        <div class="subcomponents-list">
                            ${service.subcomponents.map(sub => `
                                <div class="subcomponent-item">
                                    <span>${sub.name}</span>
                                    <span class="status-tag status-${sub.status}">${sub.status}</span>
                                </div>`).join('')}
                        </div>
                    ` : ''}
                </div>`).join('');
            
            categoryDiv.innerHTML = `<h2>${category.categoryName}</h2><div class="status-grid">${servicesHTML}</div>`;
            elements.categoriesContainer.appendChild(categoryDiv);

            category.services.forEach(service => renderChart(service));
        });

        document.querySelectorAll('.subcomponents-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const list = toggle.nextElementSibling;
                list.classList.toggle('expanded');
                toggle.textContent = list.classList.contains('expanded') ? 'Hide Subcomponents ▲' : 'Show Subcomponents ▼';
            });
        });
    };

    const renderChart = (service) => {
        const options = {
            chart: { type: 'area', height: 100, sparkline: { enabled: true } },
            stroke: { curve: 'smooth', width: 2 },
            fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
            series: [{ name: 'Response Time', data: service.performance_history }],
            tooltip: { enabled: false },
            colors: [getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim()]
        };
        const chartId = `#chart-${service.name.replace(/\s/g, '')}`;
        if(document.querySelector(chartId)) {
            new ApexCharts(document.querySelector(chartId), options).render();
        }
    };

    const renderIncidents = (incidents) => {
        elements.timeline.innerHTML = '';
        const groupedIncidents = incidents.reduce((acc, incident) => {
            const date = new Date(incident.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            if (!acc[date]) acc[date] = [];
            acc[date].push(incident);
            return acc;
        }, {});

        for (const date in groupedIncidents) {
            const dayGroup = document.createElement('div');
            dayGroup.className = 'incident-day-group';
            const incidentsHTML = groupedIncidents[date].map(incident => `
                <div class="incident-item glass severity-${incident.severity || 'info'}">
                    <div class="incident-header">
                        <span class="incident-title">${incident.title}</span>
                        <span class="incident-severity">${incident.severity || 'Update'}</span>
                    </div>
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
        const now = new Date();
        const diffSeconds = Math.round((now - date) / 1000);
        if (diffSeconds < 60) return `a few seconds ago`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
        return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    fetchData();
    setInterval(fetchData, 60000);
});
