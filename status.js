// status.js (Quantum)

document.addEventListener('DOMContentLoaded', () => {
    // --- ApexCharts Global Options ---
    const chartOptions = {
        chart: { type: 'area', sparkline: { enabled: true } },
        stroke: { curve: 'straight', width: 2 },
        fill: { opacity: 0.3 },
        yaxis: { min: 0 },
        colors: [getComputedStyle(document.documentElement).getPropertyValue('--glow-color').trim()]
    };

    // --- Main Logic ---
    const fetchData = () => {
        fetch('status-data.json?cachebust=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                updatePage(data);
                initGlobe(data.globalNetwork);
            });
    };

    const updatePage = (data) => {
        document.getElementById('overall-status-text').textContent = data.overallStatus;
        document.getElementById('last-updated').textContent = `Last Sync: ${new Date(data.lastUpdated).toLocaleString()}`;
        
        const categoriesContainer = document.getElementById('service-categories-container');
        categoriesContainer.innerHTML = '';
        data.serviceCategories.forEach(cat => {
            const catDiv = document.createElement('div');
            catDiv.className = 'service-category';
            const servicesHTML = cat.services.map(s => `
                <div class="status-item status-${s.status}">
                    <div class="status-item-info">
                        <strong>${s.name}</strong>
                    </div>
                    <div class="status-metric">
                        <div class="value">${s.latency > 0 ? s.latency + 'ms' : '--'}</div>
                        <div class="label">Latency</div>
                    </div>
                    <div class="status-metric">
                        <div class="value">${s.uptime_90_days}</div>
                        <div class="label">90d Uptime</div>
                    </div>
                    <div id="chart-${s.name.replace(/\s/g, '')}" class="sparkline"></div>
                </div>
            `).join('');
            catDiv.innerHTML = `<h3>[${cat.categoryName}]</h3>${servicesHTML}`;
            categoriesContainer.appendChild(catDiv);
            
            // Render charts after elements are in the DOM
            cat.services.forEach(s => {
                new ApexCharts(document.querySelector(`#chart-${s.name.replace(/\s/g, '')}`), {
                    ...chartOptions,
                    series: [{ data: s.performance_history }]
                }).render();
            });
        });
        
        const incidentsContainer = document.getElementById('incidents-timeline');
        incidentsContainer.innerHTML = data.incidents.map((inc, i) => `
            <div class="incident-item">
                <div class="incident-header">
                    <h4 class="incident-title">${inc.title}</h4>
                    <span>${inc.date}</span>
                </div>
                <div class="incident-body ${i === 0 ? 'expanded' : ''}">
                    ${inc.updates.map(upd => `
                        <div class="update-item">
                            <div class="update-meta"><strong>${upd.status}</strong> - <span>${upd.timestamp}</span></div>
                            <p>${upd.description}</p>
                        </div>`).join('')}
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.incident-header').forEach(h => h.addEventListener('click', () => h.nextElementSibling.classList.toggle('expanded')));
    };

    // --- Globe Visualization ---
    const initGlobe = (networkData) => {
        const canvas = document.getElementById('globe-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ffc3, wireframe: true });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        
        networkData.forEach(node => {
            const dotGeometry = new THREE.SphereGeometry(0.02, 16, 16);
            const color = node.status === 'operational' ? 0x2ecc71 : node.status === 'degraded' ? 0xffd700 : 0xff4444;
            const dotMaterial = new THREE.MeshBasicMaterial({ color });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);

            const [lat, lon] = node.coords;
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            dot.position.set(
                -(Math.sin(phi) * Math.cos(theta)),
                Math.cos(phi),
                Math.sin(phi) * Math.sin(theta)
            );
            sphere.add(dot);
        });

        camera.position.z = 2;

        const animate = () => {
            requestAnimationFrame(animate);
            sphere.rotation.y += 0.002;
            renderer.render(scene, camera);
        };
        animate();
    };

    fetchData();
    setInterval(fetchData, 60000);
});
