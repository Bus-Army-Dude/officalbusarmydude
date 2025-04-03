// Example for opening Finder app window
document.getElementById('finder').addEventListener('click', function() {
  let window = document.createElement('div');
  window.classList.add('app-window');
  window.innerHTML = `<h3>Finder</h3><p>File System...</p>`;
  document.getElementById('app-windows').appendChild(window);
  makeDraggable(window);
});

function makeDraggable(window) {
  window.addEventListener('mousedown', function(event) {
    let offsetX = event.clientX - window.getBoundingClientRect().left;
    let offsetY = event.clientY - window.getBoundingClientRect().top;

    function moveAt(e) {
      window.style.left = e.clientX - offsetX + 'px';
      window.style.top = e.clientY - offsetY + 'px';
    }

    document.addEventListener('mousemove', moveAt);

    window.addEventListener('mouseup', function() {
      document.removeEventListener('mousemove', moveAt);
    });
  });
}
