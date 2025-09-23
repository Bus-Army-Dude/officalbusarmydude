// Import the initialized Firebase database instance from your existing file
import { db } from './firebase-init.js';
import { collection, query, where, getDocs, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Helper function to format time
function formatRelativeTime(createdAt, updatedAt) {
    if (!createdAt) return "Posted (unknown time)";
    const createdDate = createdAt.toDate();
    const now = new Date();
    const diffMs = now - createdDate;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let result = "";
    if (diffMinutes < 60) {
        result = `Posted ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        result = `Posted ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
        result = `Posted on ${createdDate.toLocaleDateString()}`;
    }

    if (updatedAt && updatedAt.toDate() > createdDate) {
        const updatedDate = updatedAt.toDate();
        result += ` (Edited on ${updatedDate.toLocaleDateString()})`;
    }
    return result;
}

document.addEventListener('DOMContentLoaded', () => {
    const postsGrid = document.getElementById('posts-grid');
    const titleElement = document.getElementById('author-page-title');
    const authorPfpHeaderElement = document.getElementById('author-header-pfp');

    const params = new URLSearchParams(window.location.search);
    const authorName = params.get('name');

    if (!authorName) {
        titleElement.textContent = "Author Not Found";
        postsGrid.innerHTML = '<p>No author was specified in the URL.</p>';
        return;
    }

    const pageTitle = `Posts by ${authorName}`;
    titleElement.textContent = pageTitle;
    document.title = pageTitle;

    async function fetchPostsByAuthor() {
        postsGrid.innerHTML = `<p>Loading posts by ${authorName}...</p>`;
        try {
            const postsRef = collection(db, 'posts');
            const authorQuery = query(postsRef, where("author", "==", authorName), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(authorQuery);

            if (snapshot.empty) {
                postsGrid.innerHTML = `<p>No posts found for this author.</p>`;
                return;
            }

            // Get the author's profile picture from the first post
            const firstPostData = snapshot.docs[0].data();
            const authorPfpUrl = firstPostData.authorPfpUrl || 'images/default-profile.jpg';
            
            // Update the header PFP
            if(authorPfpHeaderElement) {
                authorPfpHeaderElement.src = authorPfpUrl;
                authorPfpHeaderElement.alt = authorName;
            }

            postsGrid.innerHTML = ''; // Clear loading message

            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                const postCard = document.createElement('div');
                postCard.className = 'post-card';

                postCard.innerHTML = `
                    <div class="post-card-content">
                        <span class="post-category">${post.category}</span>
                        <h3>${post.title}</h3>
                        <p>${post.content.substring(0, 100)}...</p>
                        <div class="post-meta">
                            <img src="${authorPfpUrl}" class="author-pfp" alt="${authorName}">
                            <div class="author-details">
                                <span class="author-name">${authorName}</span>
                                <span class="post-time">${formatRelativeTime(post.createdAt, post.updatedAt)}</span>
                            </div>
                        </div>
                        <a href="post.html?id=${post.id}" class="read-more-btn">Read More</a>
                    </div>`;
                postsGrid.appendChild(postCard);
            });

        } catch (error) {
            console.error("Error fetching posts by author:", error);
            postsGrid.innerHTML = '<p class="error">Could not load posts. Please check Firestore rules and the console.</p>';
        }
    }

    fetchPostsByAuthor();
});

