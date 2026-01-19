/* ===================================
   Matthew Whitham Blog - Main JS
   JSON-based post system
   =================================== */

// Fetch posts from JSON file
async function fetchPosts() {
    try {
        const response = await fetch('posts.json');
        const data = await response.json();
        return data.posts || [];
    } catch (error) {
        console.error('Error loading posts:', error);
        return [];
    }
}

// Format post content (markdown-like to HTML)
function formatContent(content) {
    if (!content) return '';
    
    let html = content;
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Pull quotes (lines starting with >)
    html = html.replace(/^> (.+)$/gm, '</p><p class="pull-quote">"$1"</p><p>');
    
    // Image placeholders [img:url:position:caption]
    html = html.replace(/\[img:([^:]+):([^:]+):?([^\]]*)\]/g, (match, url, position, caption) => {
        const posClass = position === 'left' ? 'floating-left' : 
                        position === 'right' ? 'floating-right' : 'full-width';
        return `</p><div class="post-image-container ${posClass}">
            <img src="${url}" alt="${caption || 'Image'}" class="post-image">
            ${caption ? `<span class="image-caption">${caption}</span>` : ''}
        </div><p>`;
    });
    
    // Paragraphs (split by double newline)
    const paragraphs = html.split('\n\n').filter(p => p.trim());
    html = paragraphs.map((p, i) => {
        // Don't wrap if already contains block elements
        if (p.includes('<p class="pull-quote">') || p.includes('<div class="post-image-container">')) {
            return p;
        }
        // First paragraph gets drop cap
        if (i === 0) {
            return `<p class="drop-cap">${p.replace(/\n/g, ' ')}</p>`;
        }
        return `<p>${p.replace(/\n/g, ' ')}</p>`;
    }).join('\n');
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    return html;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString + 'T12:00:00');
    return {
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'long' }),
        year: date.getFullYear(),
        full: date
    };
}

// Get the most recent post (for homepage)
function getMostRecentPost(posts) {
    if (!posts || posts.length === 0) return null;
    
    // Sort by date descending
    const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0];
}

// Load today's/latest post on homepage
async function loadHomepage() {
    const posts = await fetchPosts();
    const post = getMostRecentPost(posts);
    
    if (!post) {
        document.getElementById('post-title').textContent = 'No posts yet';
        document.getElementById('post-content').innerHTML = '<p>Check back soon for new content.</p>';
        return;
    }
    
    const date = formatDate(post.date);
    
    document.getElementById('post-day').textContent = date.day;
    document.getElementById('post-month').textContent = date.month;
    document.getElementById('post-year').textContent = date.year;
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-content').innerHTML = formatContent(post.content);
    
    // Update page title
    document.title = `${post.title} — Matthew Whitham`;
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the homepage
    if (document.querySelector('.home-container') && !window.location.search.includes('id=')) {
        // Only load homepage if there's no post.js handling it
        if (!document.querySelector('script[src="js/post.js"]')) {
            loadHomepage();
        }
    }
});

// Export for use in other modules
window.BlogUtils = {
    fetchPosts,
    formatContent,
    formatDate,
    getMostRecentPost
};
