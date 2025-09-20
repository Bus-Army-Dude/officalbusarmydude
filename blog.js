document.addEventListener('DOMContentLoaded', () => {
    // Set footer year
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- DOM Elements ---
    const blogDataElement = document.getElementById('blog-posts-data');
    const mainContent = document.getElementById('main-content');
    const modal = document.getElementById('post-modal');
    const modalContainer = modal.querySelector('.modal-content-container');
    const modalContent = document.getElementById('modal-post-content');
    const modalCloseButton = document.getElementById('modal-close-button');

    if (!blogDataElement || !mainContent || !modal) {
        console.error("Essential blog elements are missing.");
        return;
    }
    const posts = JSON.parse(blogDataElement.innerHTML);

    // --- Helper Functions ---
    function formatRelativeDate(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const seconds = Math.round((now - date) / 1000);
            const minutes = Math.round(seconds / 60);
            const hours = Math.round(minutes / 60);
            const days = Math.round(hours / 24);
            if (seconds < 60) return `Just now`;
            if (minutes < 60) return `${minutes} min ago`;
            if (hours < 24) return `${hours} hr ago`;
            if (days < 7) return `${days} days ago`;
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) { return dateString; }
    }

    function calculateReadingTime(content) {
        const text = content.replace(/<[^>]+>/g, ''); // Strip HTML tags
        const wordsPerMinute = 200;
        const wordCount = text.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    }

    // --- Modal Logic ---
    let progressBar;
    function openModalWithPost(postId) {
        const post = posts.find(p => p.id === postId);
        if (post) {
            // Create and prepend progress bar
            const progressBarHTML = `<div class="reading-progress-bar"><div class="bar"></div></div>`;
            modalContainer.insertAdjacentHTML('afterbegin', progressBarHTML);
            progressBar = modalContainer.querySelector('.reading-progress-bar .bar');

            modalContent.innerHTML = `
                <header class="blog-header">
                    <h1 class="blog-title">${post.title}</h1>
                    <div class="blog-meta">
                        <img src="${post.authorImage}" alt="Author" class="author-image">
                        <div>
                            <span class="author-name">${post.author}</span><br>
                            <span>${formatRelativeDate(post.date)} · ${calculateReadingTime(post.content)}</span>
                        </div>
                    </div>
                </header>
                <div class="blog-content">${post.content}</div>`;
            
            modal.classList.add('visible');
            document.body.classList.add('modal-open');
            
            modalContainer.addEventListener('scroll', updateReadingProgress);
        }
    }

    function closeModal() {
        modal.classList.remove('visible');
        document.body.classList.remove('modal-open');
        modalContainer.removeEventListener('scroll', updateReadingProgress);
        // Remove progress bar to clean up
        const barElement = modalContainer.querySelector('.reading-progress-bar');
        if(barElement) barElement.remove();
    }
    
    function updateReadingProgress() {
        if (!progressBar) return;
        const scrollableHeight = modalContainer.scrollHeight - modalContainer.clientHeight;
        const scrollTop = modalContainer.scrollTop;
        const progress = (scrollTop / scrollableHeight) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // --- Render Dashboard ---
    function renderDashboard() {
        if (posts.length === 0) {
            mainContent.innerHTML = '<p>No posts yet. Stay tuned!</p>';
            return;
        }

        const cardsHTML = posts.map(post => `
            <div class="blog-card" data-post-id="${post.id}">
                <div class="card-image-container" style="background-image: url('${post.image}')"></div>
                <div class="card-content">
                    <span class="card-category">${post.category}</span>
                    <h2 class="card-title">${post.title}</h2>
                    <div class="card-meta">
                        <span>${formatRelativeDate(post.date)} · ${calculateReadingTime(post.content)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        mainContent.innerHTML = cardsHTML;
    }

    // --- Event Listeners ---
    mainContent.addEventListener('click', (e) => {
        const card = e.target.closest('.blog-card');
        if (card) {
            openModalWithPost(card.dataset.postId);
        }
    });

    modalCloseButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            closeModal();
        }
    });

    // --- Initial Load ---
    renderDashboard();
});

