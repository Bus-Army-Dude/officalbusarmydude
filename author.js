// We can't use the full displayShoutouts.js, so we need a minimal setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Use the same Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCIZ0fri5V1E2si1xXpBPQQJqj1F_KuuG0", // Replace with your actual API key
    authDomain: "busarmydudewebsite.firebaseapp.com",
    projectId: "busarmydudewebsite",
    storageBucket: "busarmydudewebsite.firebasestorage.app",
    messagingSenderId: "42980404680",
    appId: "1:42980404680:web:f4f1e54789902a4295e4fd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to format time (copied from displayShoutouts.js)
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

    const params = new URLSearchParams(window.location.search);
    const authorName = params.get('name');

    if (!authorName) {
        titleElement.textContent = "Author Not Found";
        postsGrid.innerHTML = '<p>No author was specified in the URL.</p>';
        return;
    }

    // Set the page title with the author's name
    const pageTitle = `Posts by ${authorName}`;
    titleElement.textContent = pageTitle;
    document.title = pageTitle;

    async function fetchPostsByAuthor() {
        postsGrid.innerHTML = `<p>Loading posts by ${authorName}...</p>`;
        try {
            const postsRef = collection(db, 'posts');
            // Query for posts where the 'author' field matches the name from the URL
            const authorQuery = query(postsRef, where("author", "==", authorName), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(authorQuery);

            if (snapshot.empty) {
                postsGrid.innerHTML = `<p>No posts found for this author.</p>`;
                return;
            }

            postsGrid.innerHTML = ''; // Clear loading message
            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                const postCard = document.createElement('div');
                postCard.className = 'post-card';
                // We use the same card structure as the main blog page
                postCard.innerHTML = `
                    <div class="post-card-content">
                        <span class="post-category">${post.category}</span>
                        <h3>${post.title}</h3>
                        <div class="post-meta">
                             <span class="post-time">${formatRelativeTime(post.createdAt, post.updatedAt)}</span>
                        </div>
                        <p>${post.content.substring(0, 100)}...</p>
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
