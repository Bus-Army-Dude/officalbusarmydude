// status.js (Advanced)

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        grid: document.getElementById('status-grid'),
        timeline: document.getElementById('incidents-timeline'),
        overallStatusText: document.getElementById('overall-status-text'),
        overallStatusBadge: document.getElementById('overall-status-badge'),
        lastUpdated: document.getElementById('last-updated')
    };

    if (!elements.grid || !elements.timeline) {
        console.error('Required status page elements not found!');
        return;
    }

    const fetchData = () => {
        fetch('status-data.json?cachebust=' + new Date().getTime()) // Prevent caching
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                updatePage(data);
            })
            .catch(error => {
                handleFetchError(error);
            });
    };

    const updatePage = (data) => {
        updateOverallStatus(data);
        updateServices(data.services);
        updateIncidents(data.incidents);
    };

    const updateOverallStatus = (data) => {
        elements.overallStatusText.textContent = data.overallStatus || 'Status Unavailable';

        const serviceStatuses = data.services.map(s => s.status);
        let overallClass = 'status-operational';
        if (serviceStatuses.includes('outage')) overallClass = 'status-outage';
        else if (serviceStatuses.includes('degraded')) overallClass = 'status-degraded';
        else if (serviceStatuses.includes('maintenance')) overallClass = 'status-maintenance';
        
        elements.overallStatusBadge.className = 'overall-status ' + overallClass;
        elements.lastUpdated.textContent = `Last Updated: ${formatTimestamp(data.lastUpdated)}`;
    };

    const updateServices = (services) => {
        elements.grid.innerHTML = ''; // Clear previous content
        services.forEach(service => {
            const item = document.createElement('div');
            item.className = 'status-item ' + `status-${service.status}`;
            item.innerHTML = `
                <div class="status-item-info">
                    <strong>${service.name}</strong>
                    <p>${service.description}</p>
                </div>
                <div class="status-item-right">
                    <div class="uptime">${service.uptime_90_days || '--'}</div>
                    <div class="uptime-label">90-Day Uptime</div>
                </div>
            `;
            elements.grid.appendChild(item);
        });
    };

    const updateIncidents = (incidents) => {
        elements.timeline.innerHTML = ''; // Clear previous content
        incidents.forEach(incident => {
            const incidentDay = document.createElement('div');
            incidentDay.className = 'incident-day';
            const updatesHTML = incident.updates.map(update => `
                <div class="incident-update">
                    <div class="update-meta">
                        <span class="update-status ${'status-' + update.status}">${update.status}</span>
                        <span class="update-timestamp">${update.timestamp}</span>
                    </div>
                    <p class="update-description">${update.description}</p>
                </div>
            `).join('');

            incidentDay.innerHTML = `
                <p class="incident-date">${new Date(incident.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div class="incident-details">
                    <h3 class="incident-title">${incident.title}</h3>
                    ${updatesHTML}
                </div>
            `;
            elements.timeline.appendChild(incidentDay);
        });
    };
    
    const handleFetchError = (error) => {
        console.error('Could not fetch status data:', error);
        elements.overallStatusText.textContent = 'Could not load status.';
        elements.overallStatusBadge.className = 'overall-status status-outage';
    };

    const formatTimestamp = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffSeconds = Math.round((now - date) / 1000);
        
        if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
        
        return date.toLocaleString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    };

    // Initial load and set interval to auto-refresh every 60 seconds
    fetchData();
    setInterval(fetchData, 60000);
});
