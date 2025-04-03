document.addEventListener('DOMContentLoaded', function () {
    // Function to open app windows when an app icon is clicked
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    desktopIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            // Get the app window related to this icon
            let appWindow = document.createElement('div');
            appWindow.classList.add('app-window', 'show');
            appWindow.innerHTML = `
                <div class="app-window-header">
                    <span class="app-title">App Window</span>
                    <div class="window-controls">
                        <button class="close-btn">⨉</button>
                        <button class="minimize-btn">—</button>
                        <button class="maximize-btn">□</button>
                    </div>
                </div>
                <div class="app-content">
                    <h1>Welcome to the App Window!</h1>
                    <p>This is a sample app window.</p>
                </div>
            `;
            
            document.body.appendChild(appWindow);

            // Close window functionality
            appWindow.querySelector('.close-btn').addEventListener('click', function () {
                appWindow.remove();
            });

            // Minimize window functionality (Hide the window for now)
            appWindow.querySelector('.minimize-btn').addEventListener('click', function () {
                appWindow.classList.remove('show');
                setTimeout(() => {
                    appWindow.classList.add('show');
                }, 3000); // Simulating a delay before window can be reopened
            });

            // Maximize functionality (just a placeholder here, could add more logic)
            appWindow.querySelector('.maximize-btn').addEventListener('click', function () {
                appWindow.classList.toggle('maximized');
            });
        });
    });

    // Optional: Close all open windows when clicked outside (global close)
    document.body.addEventListener('click', function (e) {
        if (!e.target.closest('.app-window') && !e.target.closest('.desktop-icon')) {
            const allWindows = document.querySelectorAll('.app-window');
            allWindows.forEach(window => {
                window.classList.remove('show');
            });
        }
    });
});
