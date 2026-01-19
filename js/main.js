/* ===================================
   Matthew Whitham Blog - Main JS
   =================================== */

// Constants
const STORAGE_KEY = 'mw_blog_posts';
const SCHEDULED_KEY = 'mw_blog_scheduled';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeSite();
});

function initializeSite() {
    // Check for scheduled posts that need to be published
    checkScheduledPosts();
    
    // Load today's post on homepage
    if (document.querySelector('.home-container')) {
        loadTodaysPost();
    }
    
    // Add smooth animations on scroll
    initScrollAnimations();
}

// ===================================
// Post Management
// ===================================

function getPosts() {
    const posts = localStorage.getItem(STORAGE_KEY);
    return posts ? JSON.parse(posts) : {};
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function getScheduledPosts() {
    const scheduled = localStorage.getItem(SCHEDULED_KEY);
    return scheduled ? JSON.parse(scheduled) : [];
}

function saveScheduledPosts(scheduled) {
    localStorage.setItem(SCHEDULED_KEY, JSON.stringify(scheduled));
}

function checkScheduledPosts() {
    const scheduled = getScheduledPosts();
    const now = new Date();
    const posts = getPosts();
    
    const remaining = [];
    
    scheduled.forEach(post => {
        const publishDate = new Date(post.scheduledFor);
        if (publishDate <= now) {
            // Publish this post
            const dateKey = formatDateKey(publishDate);
            posts[dateKey] = {
                title: post.title,
                content: post.content,
                images: post.images || [],
                publishedAt: publishDate.toISOString()
            };
        } else {
            remaining.push(post);
        }
    });
    
    savePosts(posts);
    saveScheduledPosts(remaining);
}

function loadTodaysPost() {
    const posts = getPosts();
    const today = formatDateKey(new Date());
    const yesterday = formatDateKey(new Date(Date.now() - 86400000));
    
    let post = posts[today] || posts[yesterday];
    let displayDate = posts[today] ? new Date() : new Date(Date.now() - 86400000);
    
    if (!post) {
        // Show placeholder content (already in HTML)
        return;
    }
    
    // Update the page with the post
    const dayEl = document.getElementById('post-day');
    const monthEl = document.getElementById('post-month');
    const yearEl = document.getElementById('post-year');
    const titleEl = document.getElementById('post-title');
    const contentEl = document.getElementById('post-content');
    
    if (dayEl) dayEl.textContent = displayDate.getDate();
    if (monthEl) monthEl.textContent = displayDate.toLocaleDateString('en-US', { month: 'long' });
    if (yearEl) yearEl.textContent = displayDate.getFullYear();
    if (titleEl) titleEl.textContent = post.title;
    if (contentEl) contentEl.innerHTML = formatPostContent(post.content, post.images);
}

function formatPostContent(content, images = []) {
    // Convert markdown-style formatting to HTML
    let html = content;
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Pull quotes (lines starting with >)
    html = html.replace(/^> (.+)$/gm, '<p class="pull-quote">"$1"</p>');
    
    // Paragraphs
    const paragraphs = html.split('\n\n').filter(p => p.trim());
    html = paragraphs.map((p, i) => {
        if (p.startsWith('<p class="pull-quote">')) return p;
        if (i === 0) return `<p class="drop-cap">${p}</p>`;
        return `<p>${p}</p>`;
    }).join('\n');
    
    // Replace image placeholders [img:0:left], [img:1:right], [img:2:full]
    html = html.replace(/\[img:(\d+):(\w+)\]/g, (match, index, position) => {
        const img = images[parseInt(index)];
        if (!img) return '';
        
        const posClass = position === 'left' ? 'floating-left' : 
                        position === 'right' ? 'floating-right' : 'full-width';
        
        return `<div class="post-image-container ${posClass}">
            <img src="${img.src}" alt="${img.caption || 'Image'}" class="post-image">
            ${img.caption ? `<span class="image-caption">${img.caption}</span>` : ''}
        </div>`;
    });
    
    return html;
}

function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

// ===================================
// Scroll Animations
// ===================================

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe archive cards
    document.querySelectorAll('.archive-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
    
    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
        .archive-card.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// ===================================
// Utility Functions
// ===================================

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Export for use in other modules
window.BlogUtils = {
    getPosts,
    savePosts,
    getScheduledPosts,
    saveScheduledPosts,
    formatPostContent,
    formatDateKey,
    showToast
};
