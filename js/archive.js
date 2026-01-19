/* ===================================
   Archive Page JavaScript
   Loads posts from posts.json
   =================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const posts = await window.BlogUtils.fetchPosts();
    loadArchive(posts);
});

function loadArchive(posts) {
    const archiveContent = document.getElementById('archive-content');
    
    if (!archiveContent) return;
    
    if (!posts || posts.length === 0) {
        archiveContent.innerHTML = '<p class="empty-archive">No posts yet. Check back soon!</p>';
        return;
    }
    
    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Group posts by month
    const monthGroups = {};
    
    sortedPosts.forEach(post => {
        const date = new Date(post.date + 'T12:00:00');
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        if (!monthGroups[monthKey]) {
            monthGroups[monthKey] = {
                name: monthName,
                posts: []
            };
        }
        
        monthGroups[monthKey].posts.push({
            ...post,
            dateObj: date
        });
    });
    
    // Render archive
    archiveContent.innerHTML = '';
    
    Object.keys(monthGroups).sort().reverse().forEach(monthKey => {
        const group = monthGroups[monthKey];
        
        const section = document.createElement('section');
        section.className = 'archive-month';
        
        section.innerHTML = `
            <h2 class="month-header">${group.name}</h2>
            <div class="archive-posts">
                ${group.posts.map(post => `
                    <a href="post.html?id=${post.id}" class="archive-card">
                        <span class="card-date">${post.dateObj.getDate()}</span>
                        <h3 class="card-title">${escapeHtml(post.title)}</h3>
                        <p class="card-preview">${getPreview(post.content)}</p>
                    </a>
                `).join('')}
            </div>
        `;
        
        archiveContent.appendChild(section);
    });
    
    // Initialize scroll animations
    initArchiveAnimations();
}

function getPreview(content, maxLength = 120) {
    if (!content) return '';
    
    // Strip formatting and get plain text
    let text = content
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/^> /gm, '')
        .replace(/\[img:[^\]]+\]/g, '')
        .replace(/\n/g, ' ')
        .trim();
    
    if (text.length > maxLength) {
        text = text.substring(0, maxLength).trim() + '...';
    }
    
    return escapeHtml(text);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initArchiveAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 50);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
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
        .empty-archive {
            text-align: center;
            color: var(--text-muted);
            font-style: italic;
            padding: var(--space-xl) 0;
        }
    `;
    document.head.appendChild(style);
}
