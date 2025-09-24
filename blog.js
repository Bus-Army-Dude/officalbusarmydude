// Import the initialized Firebase database instance
import { db } from './firebase-init.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const postsGrid = document.getElementById('posts-grid');
    const featuredContainer = document.getElementById('featured-post-container');
    const categoryFiltersContainer = document.getElementById('category-filters');
    const searchInput = document.getElementById('search-input');
    let allPosts = []; // Store all posts to filter locally

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
            const postsRef = collection(db, 'posts');
            const postsQuery = query(postsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(postsQuery);
            
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
// Display the featured post with the new layout
function displayFeaturedPost(posts) {
    if (!featuredContainer) return;
    const featuredPost = posts.find(post => post.isFeatured);

    if (featuredPost) {
        featuredContainer.style.display = 'block'; // Ensure it's visible
        featuredContainer.innerHTML = `
            <h2 class="section-title">Featured Post</h2>
            <article class="featured-post">
                <img src="${featuredPost.imageUrl || 'images/default-post-image.jpg'}" alt="${featuredPost.title}" class="post-image-featured" onerror="this.style.display='none';">
                <div class="post-content-featured">
                    <h2><a href="post.html?id=${featuredPost.id}">${featuredPost.title}</a></h2>
                    <div class="post-meta">
                        <img src="${featuredPost.authorPfpUrl || 'images/default-profile.jpg'}" alt="${featuredPost.author}" class="author-pfp">
                        <div class="author-details">
                            <span class="author-name"><a href="author.html?name=${encodeURIComponent(featuredPost.author)}">${featuredPost.author}</a></span>
                            <span class="post-timestamps">${formatDate(featuredPost.createdAt)}</span>
                        </div>
                    </div>
                    <p>${getShortContent(featuredPost.content, 200)}...</p>
                    <a href="post.html?id=${featuredPost.id}" class="read-more-btn">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `;
    } else {
        featuredContainer.style.display = 'none'; // Hide if no featured post
    }
}

    // Display all other posts with the new layout
function displayPosts(posts) {
    if (!postsContainer) return;
    postsContainer.innerHTML = ''; // Clear existing posts

    // Filter out the featured post so it doesn't appear twice
    const otherPosts = posts.filter(post => !post.isFeatured);

    if (otherPosts.length > 0) {
        otherPosts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'post-item';
            postElement.innerHTML = `
                <img src="${post.imageUrl || 'images/default-post-image.jpg'}" alt="${post.title}" class="post-image" onerror="this.style.display='none';">
                <div class="post-content">
                    <h2><a href="post.html?id=${post.id}">${post.title}</a></h2>
                    <div class="post-meta">
                        <img src="${post.authorPfpUrl || 'images/default-profile.jpg'}" alt="${post.author}" class="author-pfp">
                        <div class="author-details">
                            <span class="author-name"><a href="author.html?name=${encodeURIComponent(post.author)}">${post.author}</a></span>
                            <span class="post-timestamps">${formatDate(post.createdAt)}</span>
                        </div>
                    </div>
                    <p>${getShortContent(post.content, 150)}...</p>
                    <a href="post.html?id=${post.id}" class="read-more-btn">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    } else {
        // Only show this if there are NO posts at all (featured or otherwise)
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p>No posts found.</p>';
        }
    }
}

    // Populate category filters
    function populateCategories(posts) {
        if (!categoryFiltersContainer) return;
        const categories = ['All', ...new Set(posts.map(post => post.category))];
        categoryFiltersContainer.innerHTML = categories.map(category => 
            `<button class="category-btn ${category === 'All' ? 'active' : ''}" data-category="${category}">${category}</button>`
        ).join('');
    }

    // Handle filtering and search
    function filterAndSearch() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const activeCategoryButton = categoryFiltersContainer ? categoryFiltersContainer.querySelector('.category-btn.active') : null;
        const activeCategory = activeCategoryButton ? activeCategoryButton.dataset.category : 'All';

        let filteredPosts = allPosts;

        // Filter by category
        if (activeCategory !== 'All') {
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
    if (searchInput) {
        searchInput.addEventListener('input', filterAndSearch);
    }

    if (categoryFiltersContainer) {
        categoryFiltersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                const currentActive = categoryFiltersContainer.querySelector('.category-btn.active');
                if (currentActive) {
                    currentActive.classList.remove('active');
                }
                e.target.classList.add('active');
                filterAndSearch();
            }
        });
    }

    // Initial fetch
    fetchPosts();
});

