document.addEventListener('DOMContentLoaded', () => {
    // Set footer year
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- DOM Elements ---
    const blogDataElement = document.getElementById('blog-posts-data');
    const mainContent = document.getElementById('main-content');
    const modal = document.getElementById('post-modal');
    const modalContent = document.getElementById('modal-post-content');
    const modalCloseButton = document.getElementById('modal-close-button');

    // --- Early exit if essential elements are missing ---
    if (!blogDataElement || !mainContent || !modal || !modalContent || !modalCloseButton) {
        console.error("One or more essential blog elements are missing from the DOM.");
        return;
    }
    const posts = JSON.parse(blogDataElement.innerHTML);

    // --- Date Formatting Function ---
    function formatRelativeDate(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const seconds = Math.round((now - date) / 1000);
            if (seconds < 5) return "just now";
            const minutes = Math.round(seconds / 60);
            if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            const hours = Math.round(minutes / 60);
            if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            const days = Math.round(hours / 24);
            if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            console.error("Invalid date format:", dateString);
            return dateString;
        }
    }

    // --- Modal Control Functions ---
    function openModalWithPost(postId) {
        const post = posts.find(p => p.id === postId);
        if (post) {
            modalContent.innerHTML = `
                <header class="blog-header">
                    <h1 class="blog-title">${post.title}</h1>
                    <div class="blog-meta">
                        <img src="${post.authorImage}" alt="Author" class="author-image">
                        By <a href="#" class="author-name">${post.author}</a> | Published <time datetime="${post.date}">${formatRelativeDate(post.date)}</time>
                    </div>
                </header>
                <div class="blog-content">${post.content}</div>`;
            
            modal.classList.add('visible');
            document.body.classList.add('modal-open');
        }
    }

    function closeModal() {
        modal.classList.remove('visible');
        document.body.classList.remove('modal-open');
    }
    
    // --- Render Dashboard ---
    function renderDashboard() {
        let dashboardHTML = '';
        const [featuredPost, ...otherPosts] = posts;

        if (featuredPost) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = featuredPost.content;
            const excerpt = (tempDiv.textContent || "").substring(0, 180) + '...';
            dashboardHTML += `
                <div class="featured-post-card" data-post-id="${featuredPost.id}">
                    <div class="featured-content">
                        <span class="featured-badge">Featured Post</span>
                        <h2>${featuredPost.title}</h2>
                        <p class="post-excerpt">${excerpt}</p>
                        <div class="blog-meta">Published ${formatRelativeDate(featuredPost.date)}</div>
                    </div>
                </div>`;
        }

        if (otherPosts.length > 0) {
            dashboardHTML += '<div class="blog-grid">';
            otherPosts.forEach(post => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = post.content;
                const excerpt = (tempDiv.textContent || "").substring(0, 100) + '...';
                dashboardHTML += `
                    <div class="blog-summary-card" data-post-id="${post.id}">
                        <h3>${post.title}</h3>
                        <p class="post-excerpt">${excerpt}</p>
                        <div class="blog-meta meta-bottom">Published ${formatRelativeDate(post.date)}</div>
                    </div>`;
            });
            dashboardHTML += '</div>';
        }
        mainContent.innerHTML = dashboardHTML || '<p>No posts have been written yet.</p>';
    }

    // --- Event Listeners ---
    mainContent.addEventListener('click', (e) => {
        const card = e.target.closest('[data-post-id]');
        if (card) {
            openModalWithPost(card.dataset.postId);
        }
    });

    modalCloseButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- Initial Load ---
    renderDashboard();
});

