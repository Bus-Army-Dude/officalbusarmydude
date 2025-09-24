// JavasScript for the blog page (fetching and displaying posts)
document.addEventListener('DOMContentLoaded', function() {
    const postsGrid = document.querySelector('.posts-grid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilters = document.querySelector('.category-filters');
    const featuredPostContainer = document.querySelector('.featured-post-container');

    // Make sure all required elements exist
    if (!postsGrid || !searchInput || !categoryFilters || !featuredPostContainer) {
        console.error("Required elements for blog functionality are missing.");
        return;
    }

    let allPosts = []; // To store all fetched posts

    // Fetch posts from the JSON file
    fetch('https://my-json-server.typicode.com/officalbusarmydude/officalbusarmydude.github.io/posts')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(posts => {
            allPosts = posts;
            displayPosts(posts);
            setupCategoryFilters(posts);
            displayFeaturedPost(posts);
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            postsGrid.innerHTML = '<p>Could not load posts. Please try again later.</p>';
        });

    // Function to display posts in the grid
    function displayPosts(posts) {
        postsGrid.innerHTML = ''; // Clear existing posts
        if (posts.length === 0) {
            postsGrid.innerHTML = '<p>No posts found.</p>';
            return;
        }
        posts.forEach(post => {
            const postCard = document.createElement('article');
            postCard.className = 'post-card';
            
            postCard.innerHTML = `
                ${post.image ? `<div class="post-image-wrapper"><a href="post.html?id=${post.id}"><img src="${post.image}" alt=""></a></div>` : ''}
                <div class="post-card-content">
                    <span class="post-category">${post.category}</span>
                    <h3><a href="post.html?id=${post.id}">${post.title}</a></h3>
                    <p>${post.excerpt}</p>
                    <div class="post-meta">
                        <img src="${post.authorPfp}" alt="${post.author}" class="author-pfp">
                        <div class="author-details">
                            <span class="author-name"><a href="author.html?author=${encodeURIComponent(post.author)}">${post.author}</a></span>
                            <span class="post-timestamps" title="${new Date(post.date).toLocaleString()}">${timeAgo(post.date)}</span>
                        </div>
                    </div>
                </div>
            `;

            postsGrid.appendChild(postCard);
        });
    }

    // Function to display the most recent post as featured
    function displayFeaturedPost(posts) {
        if (posts.length === 0) return;
        
        // Assuming the first post in the fetched list is the newest
        const featuredPost = posts.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        featuredPostContainer.innerHTML = `
            <h2 class="section-title">Featured Post</h2>
            <article class="featured-post">
                <h2><a href="post.html?id=${featuredPost.id}">${featuredPost.title}</a></h2>
                <p>${featuredPost.excerpt}</p>
                <div class="post-meta">
                     <img src="${featuredPost.authorPfp}" alt="${featuredPost.author}" class="author-pfp">
                     <div class="author-details">
                        <span class="author-name"><a href="author.html?author=${encodeURIComponent(featuredPost.author)}">${featuredPost.author}</a></span>
                        <span class="post-timestamps" title="${new Date(featuredPost.date).toLocaleString()}">${timeAgo(featuredPost.date)}</span>
                    </div>
                </div>
                <a href="post.html?id=${featuredPost.id}" class="read-more-btn">Read More <i class="fas fa-arrow-right"></i></a>
            </article>
        `;
    }

    // Setup category filter buttons
    function setupCategoryFilters(posts) {
        const categories = ['All', ...new Set(posts.map(post => post.category))];
        categoryFilters.innerHTML = categories.map(category =>
            `<button class="category-btn ${category === 'All' ? 'active' : ''}" data-category="${category}">${category}</button>`
        ).join('');

        // Add event listeners to category buttons
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', () => {
                const selectedCategory = button.dataset.category;

                // Update active class
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter and display posts
                const filteredPosts = selectedCategory === 'All'
                    ? allPosts
                    : allPosts.filter(post => post.category === selectedCategory);
                displayPosts(filteredPosts);
            });
        });
    }

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredPosts = allPosts.filter(post =>
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm) ||
            post.author.toLowerCase().includes(searchTerm)
        );
        displayPosts(filteredPosts);

        // Reset category filter when searching
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.category-btn[data-category="All"]').classList.add('active');
    });

    // Utility function for time ago format
    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    }
});
