document.addEventListener('DOMContentLoaded', () => {
    // Time update every second
    function updateTime() {
        const timeElement = document.getElementById('time');
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        timeElement.textContent = `${hours}:${minutes} ${ampm}`;
    }

    setInterval(updateTime, 1000); // Update time every second
    updateTime(); // Initial time update

    // Handle Dock and App Window Interaction
    const dockItems = document.querySelectorAll('.dock-item');
    const appWindows = document.querySelectorAll('.app-window');
    
    dockItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const appId = e.target.closest('.dock-item').getAttribute('data-app');
            const appWindow = document.getElementById(`${appId}-window`);
            if (appWindow) {
                appWindow.style.display = 'block';
            }
        });
    });

    // Handle Desktop Icons
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    desktopIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            const appId = e.target.closest('.desktop-icon').getAttribute('data-app');
            const appWindow = document.getElementById(`${appId}-window`);
            if (appWindow) {
                appWindow.style.display = 'block';
            }
        });
    });

    // Close buttons
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const window = e.target.closest('.app-window');
            window.style.display = 'none';
        });
    });

    // Minimize buttons
    const minimizeButtons = document.querySelectorAll('.minimize-btn');
    minimizeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const window = e.target.closest('.app-window');
            window.style.display = 'none';
        });
    });
});
