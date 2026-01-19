/* ===================================
   Archive Page JavaScript
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadArchive();
});

function loadArchive() {
    const posts = window.BlogUtils.getPosts();
    const archiveContent = document.getElementById('archive-content');
    
    if (!archiveContent) return;
    
    // Get all post dates and sort them
    const postDates = Object.keys(posts).sort().reverse();
    
    if (postDates.length === 0) {
        // Keep the placeholder content
        return;
    }
    
    // Group posts by month
    const monthGroups = {};
    
    postDates.forEach(dateKey => {
        const date = new Date(dateKey);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        if (!monthGroups[monthKey]) {
            monthGroups[monthKey] = {
                name: monthName,
                posts: []
            };
        }
        
        monthGroups[monthKey].posts.push({
            date: date,
            dateKey: dateKey,
            ...posts[dateKey]
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
                    <a href="posts/${post.dateKey}.html" class="archive-card" data-date="${post.dateKey}">
                        <span class="card-date">${post.date.getDate()}</span>
                        <h3 class="card-title">${escapeHtml(post.title)}</h3>
                        <p class="card-preview">${getPreview(post.content)}</p>
                    </a>
                `).join('')}
            </div>
        `;
        
        archiveContent.appendChild(section);
    });
    
    // Re-initialize scroll animations for new cards
    initArchiveAnimations();
}

function getPreview(content, maxLength = 150) {
    // Strip markdown and get plain text
    let text = content
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/^> /gm, '')
        .replace(/\[img:\d+:\w+\]/g, '')
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
}
