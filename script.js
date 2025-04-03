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

    // Making the window draggable
    let currentWindow = null;
    let offsetX, offsetY;

    document.querySelectorAll('.app-window').forEach(window => {
        const header = window.querySelector('.app-window-header');
        header.addEventListener('mousedown', (e) => {
            currentWindow = window;
            offsetX = e.clientX - window.offsetLeft;
            offsetY = e.clientY - window.offsetTop;
            currentWindow.classList.add('grabbing');
            document.addEventListener('mousemove', dragWindow);
            document.addEventListener('mouseup', stopDragWindow);
        });
    });

    function dragWindow(e) {
        if (!currentWindow) return;
        currentWindow.style.left = `${e.clientX - offsetX}px`;
        currentWindow.style.top = `${e.clientY - offsetY}px`;
    }

    function stopDragWindow() {
        currentWindow.classList.remove('grabbing');
        document.removeEventListener('mousemove', dragWindow);
        document.removeEventListener('mouseup', stopDragWindow);
        currentWindow = null;
    }

    // Add resizing functionality
    const resizableWindows = document.querySelectorAll('.app-window.resizable');
    resizableWindows.forEach(window => {
        window.addEventListener('mousedown', (e) => {
            if (e.target === window) {
                const resizeHandle = document.createElement('div');
                resizeHandle.style.position = 'absolute';
                resizeHandle.style.width = '10px';
                resizeHandle.style.height = '10px';
                resizeHandle.style.right = '0';
                resizeHandle.style.bottom = '0';
                resizeHandle.style.cursor = 'se-resize';
                resizeHandle.classList.add('resize-handle');
                window.appendChild(resizeHandle);

                let initialWidth = window.offsetWidth;
                let initialHeight = window.offsetHeight;
                let initialMouseX = e.clientX;
                let initialMouseY = e.clientY;

                const onMouseMove = (moveEvent) => {
                    const dx = moveEvent.clientX - initialMouseX;
                    const dy = moveEvent.clientY - initialMouseY;
                    window.style.width = `${initialWidth + dx}px`;
                    window.style.height = `${initialHeight + dy}px`;
                };

                const onMouseUp = () => {
                    window.removeChild(resizeHandle);
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        });
    });
});
