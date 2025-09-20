import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCIZ0fri5V1E2si1xXpBPQQJqj1F_KuuG0",
    authDomain: "busarmydudewebsite.firebaseapp.com",
    projectId: "busarmydudewebsite",
    storageBucket: "busarmydudewebsite.firebasestorage.app",
    messagingSenderId: "42980404680",
    appId: "1:42980404680:web:f4f1e54789902a4295e4fd",
    measurementId: "G-DQPH8YL789"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const blogPostsCollectionRef = collection(db, "blog_posts");

// --- Function to load all posts for the dashboard ---
async function loadBlogDashboard() {
    const dashboardContainer = document.querySelector('.blog-dashboard-list');
    if (!dashboardContainer) return;

    dashboardContainer.innerHTML = '<p>Loading posts...</p>';
    try {
        const q = query(blogPostsCollectionRef, where("isPublished", "==", true), orderBy("publishedDate", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            dashboardContainer.innerHTML = '<p>No posts have been published yet.</p>';
            return;
        }

        dashboardContainer.innerHTML = '';
        querySnapshot.forEach(doc => {
            const post = doc.data();
            const postCard = document.createElement('a');
            postCard.className = 'blog-summary-card';
            postCard.href = `blog-post.html?id=${doc.id}`; // Link to the single post page

            // Create a sanitized excerpt
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = post.content;
            const textContent = tempDiv.textContent || tempDiv.innerText || "";
            const excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');

            postCard.innerHTML = `
                <h2>${post.title}</h2>
                <p class="blog-meta">By ${post.author} on ${post.publishedDate.toDate().toLocaleDateString()}</p>
                <div class="post-excerpt">${excerpt}</div>
            `;
            dashboardContainer.appendChild(postCard);
        });
    } catch (error) {
        console.error("Error loading blog posts for dashboard:", error);
        dashboardContainer.innerHTML = '<p class="error">Could not load posts. Please try again later.</p>';
    }
}

// --- Function to load a single post ---
async function loadSingleBlogPost() {
    const postContainer = document.querySelector('.blog-post');
    if (!postContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postContainer.innerHTML = '<p class="error">No post ID provided. <a href="blog.html">Return to blog list</a>.</p>';
        return;
    }

    try {
        const docRef = doc(db, "blog_posts", postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().isPublished) {
            const post = docSnap.data();
            // Update page title
            document.title = `${post.title} - Your Blog`;

            // Populate the template
            postContainer.querySelector('.blog-title').textContent = post.title;
            postContainer.querySelector('.author-name').textContent = post.author;
            const timeEl = postContainer.querySelector('time');
            const postDate = post.publishedDate.toDate();
            timeEl.textContent = postDate.toLocaleDateString();
            timeEl.setAttribute('datetime', postDate.toISOString().split('T')[0]);

            // Use innerHTML to render HTML content from the admin panel
            postContainer.querySelector('.blog-content').innerHTML = post.content;
        } else {
            postContainer.innerHTML = '<p class="error">This post could not be found or is not published. <a href="blog.html">Return to blog list</a>.</p>';
        }
    } catch (error) {
        console.error("Error loading single blog post:", error);
        postContainer.innerHTML = '<p class="error">There was an error loading this post.</p>';
    }
}


// --- Main Logic ---
// Checks which page we are on and runs the correct function.
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.blog-dashboard-list')) {
        loadBlogDashboard();
    } else if (document.querySelector('.blog-post')) {
        loadSingleBlogPost();
    }
});
