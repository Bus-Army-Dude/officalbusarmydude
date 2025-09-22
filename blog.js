document.addEventListener('DOMContentLoaded', () => {
    const postsGrid = document.getElementById('posts-grid');
    const featuredContainer = document.getElementById('featured-post-container');
    const categoryFiltersContainer = document.getElementById('category-filters');
    const searchInput = document.getElementById('search-input');
    let allPosts = []; // Store all posts to filter locally

    const db = firebase.firestore();

    // Helper to format dates
    function formatDate(timestamp) {
        if (!timestamp) return 'Date not available';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // Fetch posts from Firebase
    async function fetchPosts() {
        try {
            const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
            if (snapshot.empty) {
                postsGrid.innerHTML = '<p>No posts found.</p>';
                return;
            }

            allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            displayPosts(allPosts);
            populateCategories(allPosts);
            displayFeaturedPost(allPosts);

        } catch (error) {
            console.error("Error fetching posts:", error);
            postsGrid.innerHTML = '<p>Error loading posts. Please try again later.</p>';
        }
    }

    // Display the featured post
    function displayFeaturedPost(posts) {
        const featuredPost = posts.find(post => post.isFeatured);
        if (featuredPost) {
            featuredContainer.innerHTML = `
                <article class="featured-post">
                    <h2>${featuredPost.title}</h2>
                    <div class="post-meta">
                        By ${featuredPost.author} on ${formatDate(featuredPost.createdAt)}
                    </div>
                    <p>${featuredPost.content.substring(0, 200)}...</p>
                    <a href="post.html?id=${featuredPost.id}" class="read-more-btn">Read Full Story <i class="fas fa-arrow-right"></i></a>
                </article>
            `;
        }
    }


    // Display posts in the grid
    function displayPosts(posts) {
        postsGrid.innerHTML = ''; // Clear existing posts
        const postsToDisplay = posts.filter(post => !post.isFeatured); // Don't show featured post in grid

        if (postsToDisplay.length === 0) {
             postsGrid.innerHTML = '<p>No posts match your search or filter.</p>';
        }

        postsToDisplay.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <div class="post-card-content">
                    <span class="post-category">${post.category}</span>
                    <h3>${post.title}</h3>
                    <p class="post-meta">By ${post.author} on ${formatDate(post.createdAt)}</p>
                    <p>${post.content.substring(0, 100)}...</p>
                    <a href="post.html?id=${post.id}" class="read-more-btn">Read More</a>
                </div>
            `;
            postsGrid.appendChild(postCard);
        });
    }

    // Populate category filters
    function populateCategories(posts) {
        const categories = [...new Set(posts.map(post => post.category))];
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = category;
            btn.textContent = category;
            categoryFiltersContainer.appendChild(btn);
        });
    }

    // Handle filtering and search
    function filterAndSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;

        let filteredPosts = allPosts;

        // Filter by category
        if (activeCategory !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.category === activeCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filteredPosts = filteredPosts.filter(post =>
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                post.author.toLowerCase().includes(searchTerm)
            );
        }

        displayPosts(filteredPosts);
    }

    // Event Listeners
    searchInput.addEventListener('input', filterAndSearch);

    categoryFiltersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
            document.querySelector('.category-btn.active').classList.remove('active');
            e.target.classList.add('active');
            filterAndSearch();
        }
    });


    // Initial fetch
    fetchPosts();
});
