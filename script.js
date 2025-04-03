// script.js

document.addEventListener('DOMContentLoaded', function () {

  // Toggle Window Visibility (Dock and Desktop Icons)
  const toggleWindow = (appId) => {
    const window = document.getElementById(`${appId}-window`);
    if (window.style.display === "none" || window.style.display === "") {
      window.style.display = "block";
    } else {
      window.style.display = "none";
    }
  };

  // Dock Item Click Handlers (Opening corresponding windows)
  const dockItems = document.querySelectorAll('.dock-item');
  dockItems.forEach(item => {
    item.addEventListener('click', () => {
      const appId = item.getAttribute('data-app');
      toggleWindow(appId);
    });
  });

  // Desktop Icon Click Handlers (Opening corresponding windows)
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  desktopIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const appId = icon.getAttribute('data-app');
      toggleWindow(appId);
    });
  });

  // Make Windows Draggable
  const makeDraggable = (windowElement) => {
    const header = windowElement.querySelector('.app-window-header');
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - windowElement.offsetLeft;
      offsetY = e.clientY - windowElement.offsetTop;
      windowElement.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        windowElement.style.left = `${e.clientX - offsetX}px`;
        windowElement.style.top = `${e.clientY - offsetY}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      windowElement.style.cursor = 'grab';
    });
  };

  // Apply Draggable functionality to all app windows
  const appWindows = document.querySelectorAll('.app-window');
  appWindows.forEach(window => {
    makeDraggable(window);
  });

  // Minimize Windows
  const minimizeWindow = (appId) => {
    const window = document.getElementById(`${appId}-window`);
    window.classList.add('minimized');
    window.style.display = 'none';
  };

  // Restore Minimized Window
  const restoreWindow = (appId) => {
    const window = document.getElementById(`${appId}-window`);
    window.classList.remove('minimized');
    window.style.display = 'block';
  };

  // Add minimize/restore functionality (You can add minimize buttons on each window header later)
  const addWindowControls = () => {
    const windowHeaders = document.querySelectorAll('.app-window-header');
    windowHeaders.forEach(header => {
      // Add Minimize button (You can customize with your design)
      const minimizeBtn = document.createElement('span');
      minimizeBtn.textContent = '_';
      minimizeBtn.style.cursor = 'pointer';
      minimizeBtn.style.marginLeft = '10px';
      minimizeBtn.style.fontSize = '18px';
      minimizeBtn.addEventListener('click', () => {
        const appId = header.closest('.app-window').id.replace('-window', '');
        minimizeWindow(appId);
      });
      header.appendChild(minimizeBtn);
    });
  };

  addWindowControls();

});
