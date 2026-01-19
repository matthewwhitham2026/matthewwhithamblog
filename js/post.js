/* ===================================
   Single Post Page JavaScript
   Loads specific post from posts.json
   =================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const posts = await window.BlogUtils.fetchPosts();
    loadPost(posts);
});

function loadPost(posts) {
    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        // No ID specified, redirect to homepage
        window.location.href = 'index.html';
        return;
    }
    
    // Find the post
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        document.getElementById('post-title').textContent = 'Post not found';
        document.getElementById('post-content').innerHTML = '<p>Sorry, this post doesn\'t exist. <a href="archive.html">Browse the archive</a> to find what you\'re looking for.</p>';
        document.getElementById('post-nav').style.display = 'none';
        return;
    }
    
    // Display the post
    const date = window.BlogUtils.formatDate(post.date);
    
    document.getElementById('post-day').textContent = date.day;
    document.getElementById('post-month').textContent = date.month;
    document.getElementById('post-year').textContent = date.year;
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-content').innerHTML = window.BlogUtils.formatContent(post.content);
    
    // Update page title
    document.title = `${post.title} — Matthew Whitham`;
    
    // Build navigation
    buildPostNavigation(posts, postId);
}

function buildPostNavigation(posts, currentId) {
    const navContainer = document.getElementById('post-nav');
    if (!navContainer) return;
    
    // Sort posts by date
    const sortedPosts = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Find current post index
    const currentIndex = sortedPosts.findIndex(p => p.id === currentId);
    
    const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;
    
    navContainer.innerHTML = `
        ${prevPost 
            ? `<a href="post.html?id=${prevPost.id}" class="post-nav-link">← ${escapeHtml(truncate(prevPost.title, 30))}</a>` 
            : '<span class="post-nav-link disabled">← Previous</span>'
        }
        <a href="archive.html" class="post-nav-link">Archive</a>
        ${nextPost 
            ? `<a href="post.html?id=${nextPost.id}" class="post-nav-link">${escapeHtml(truncate(nextPost.title, 30))} →</a>` 
            : '<span class="post-nav-link disabled">Next →</span>'
        }
    `;
}

function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
