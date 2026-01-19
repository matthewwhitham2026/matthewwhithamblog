/* ===================================
   Admin Interface JavaScript
   =================================== */

// Storage keys
const DRAFTS_KEY = 'mw_blog_drafts';
const POSTS_KEY = 'mw_blog_posts';
const SCHEDULED_KEY = 'mw_blog_scheduled';

// State
let uploadedImages = [];
let currentDraftId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

function initAdmin() {
    // Image upload
    const uploadArea = document.getElementById('image-upload');
    const imageInput = document.getElementById('image-input');
    
    uploadArea.addEventListener('click', () => imageInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--forest-green)';
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--bg-elevated)';
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--bg-elevated)';
        handleImageUpload(e.dataTransfer.files);
    });
    imageInput.addEventListener('change', (e) => {
        handleImageUpload(e.target.files);
    });
    
    // Schedule toggle
    const scheduleToggle = document.getElementById('schedule-post');
    const scheduleDatetime = document.getElementById('schedule-datetime');
    const publishBtn = document.getElementById('publish-btn');
    
    scheduleToggle.addEventListener('change', () => {
        scheduleDatetime.style.display = scheduleToggle.checked ? 'flex' : 'none';
        publishBtn.textContent = scheduleToggle.checked ? 'Schedule Post' : 'Publish Now';
    });
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('schedule-date').value = tomorrow.toISOString().split('T')[0];
    
    // Toolbar buttons
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', () => handleToolbarAction(btn.dataset.action));
    });
    
    // Action buttons
    document.getElementById('publish-btn').addEventListener('click', handlePublish);
    document.getElementById('preview-btn').addEventListener('click', handlePreview);
    document.getElementById('save-draft-btn').addEventListener('click', handleSaveDraft);
    
    // Preview modal
    document.getElementById('preview-close').addEventListener('click', () => {
        document.getElementById('preview-modal').classList.remove('active');
    });
    
    // Load existing drafts and scheduled posts
    loadDrafts();
    loadScheduledPosts();
}

// ===================================
// Image Handling
// ===================================

function handleImageUpload(files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageIndex = uploadedImages.length;
            uploadedImages.push({
                src: e.target.result,
                name: file.name,
                caption: ''
            });
            renderUploadedImages();
        };
        reader.readAsDataURL(file);
    });
}

function renderUploadedImages() {
    const container = document.getElementById('uploaded-images');
    container.innerHTML = uploadedImages.map((img, index) => `
        <div class="image-thumbnail">
            <img src="${img.src}" alt="${img.name}">
            <button class="remove-image" onclick="removeImage(${index})">&times;</button>
            <div class="image-code">[img:${index}:right]</div>
        </div>
    `).join('');
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    renderUploadedImages();
}

// ===================================
// Toolbar Actions
// ===================================

function handleToolbarAction(action) {
    const textarea = document.getElementById('post-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    let insertion = '';
    let cursorOffset = 0;
    
    switch (action) {
        case 'bold':
            insertion = `**${selected || 'bold text'}**`;
            cursorOffset = selected ? 0 : -2;
            break;
        case 'italic':
            insertion = `*${selected || 'italic text'}*`;
            cursorOffset = selected ? 0 : -1;
            break;
        case 'quote':
            insertion = `\n\n> ${selected || 'Your quote here'}\n\n`;
            cursorOffset = selected ? 0 : -3;
            break;
        case 'dropcap':
            showToast('The first paragraph automatically gets a drop cap!');
            return;
        case 'image-left':
            insertion = `[img:0:left]`;
            showToast('Image will float left. Change the number to match your image.');
            break;
        case 'image-right':
            insertion = `[img:0:right]`;
            showToast('Image will float right. Change the number to match your image.');
            break;
        case 'image-full':
            insertion = `[img:0:full]`;
            showToast('Image will be full width. Change the number to match your image.');
            break;
    }
    
    // Insert the text
    textarea.value = text.substring(0, start) + insertion + text.substring(end);
    
    // Set cursor position
    const newPos = start + insertion.length + cursorOffset;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
}

// ===================================
// Publishing
// ===================================

function handlePublish() {
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    
    if (!title || !content) {
        showToast('Please add a title and content', true);
        return;
    }
    
    const isScheduled = document.getElementById('schedule-post').checked;
    
    if (isScheduled) {
        schedulePost(title, content);
    } else {
        publishNow(title, content);
    }
}

function publishNow(title, content) {
    const posts = JSON.parse(localStorage.getItem(POSTS_KEY) || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    posts[today] = {
        title: title,
        content: content,
        images: [...uploadedImages],
        publishedAt: new Date().toISOString()
    };
    
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    
    // Clear the form
    clearForm();
    
    // Remove draft if editing one
    if (currentDraftId) {
        removeDraft(currentDraftId);
        currentDraftId = null;
    }
    
    showToast('Post published successfully!');
}

function schedulePost(title, content) {
    const date = document.getElementById('schedule-date').value;
    const time = document.getElementById('schedule-time').value;
    
    if (!date) {
        showToast('Please select a date', true);
        return;
    }
    
    // Create EST timestamp (approximate - doesn't handle DST perfectly)
    const scheduledFor = new Date(`${date}T${time}:00-05:00`).toISOString();
    
    const scheduled = JSON.parse(localStorage.getItem(SCHEDULED_KEY) || '[]');
    
    scheduled.push({
        id: Date.now().toString(),
        title: title,
        content: content,
        images: [...uploadedImages],
        scheduledFor: scheduledFor,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem(SCHEDULED_KEY, JSON.stringify(scheduled));
    
    // Clear the form
    clearForm();
    
    // Remove draft if editing one
    if (currentDraftId) {
        removeDraft(currentDraftId);
        currentDraftId = null;
    }
    
    showToast('Post scheduled!');
    loadScheduledPosts();
}

// ===================================
// Drafts
// ===================================

function handleSaveDraft() {
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    
    if (!title && !content) {
        showToast('Nothing to save', true);
        return;
    }
    
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    
    if (currentDraftId) {
        // Update existing draft
        const index = drafts.findIndex(d => d.id === currentDraftId);
        if (index !== -1) {
            drafts[index] = {
                ...drafts[index],
                title: title || 'Untitled',
                content: content,
                images: [...uploadedImages],
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new draft
        const draft = {
            id: Date.now().toString(),
            title: title || 'Untitled',
            content: content,
            images: [...uploadedImages],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        drafts.push(draft);
        currentDraftId = draft.id;
    }
    
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    showToast('Draft saved');
    loadDrafts();
}

function loadDrafts() {
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    const container = document.getElementById('drafts-list');
    
    if (drafts.length === 0) {
        container.innerHTML = '<p class="empty-state">No drafts yet</p>';
        return;
    }
    
    container.innerHTML = drafts.map(draft => `
        <div class="draft-item" data-id="${draft.id}">
            <div class="draft-info">
                <h3 class="draft-title">${escapeHtml(draft.title)}</h3>
                <span class="draft-date">Last edited: ${formatDate(draft.updatedAt)}</span>
            </div>
            <div class="draft-actions">
                <button class="action-btn" onclick="editDraft('${draft.id}')">Edit</button>
                <button class="action-btn delete" onclick="deleteDraft('${draft.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function editDraft(id) {
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    const draft = drafts.find(d => d.id === id);
    
    if (!draft) return;
    
    document.getElementById('post-title').value = draft.title;
    document.getElementById('post-content').value = draft.content;
    uploadedImages = draft.images || [];
    renderUploadedImages();
    
    currentDraftId = id;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Draft loaded');
}

function deleteDraft(id) {
    if (!confirm('Delete this draft?')) return;
    
    removeDraft(id);
    showToast('Draft deleted');
}

function removeDraft(id) {
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    const filtered = drafts.filter(d => d.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
    loadDrafts();
}

// ===================================
// Scheduled Posts
// ===================================

function loadScheduledPosts() {
    const scheduled = JSON.parse(localStorage.getItem(SCHEDULED_KEY) || '[]');
    const container = document.getElementById('scheduled-list');
    
    if (scheduled.length === 0) {
        container.innerHTML = '<p class="empty-state">No scheduled posts</p>';
        return;
    }
    
    // Sort by scheduled date
    scheduled.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
    
    container.innerHTML = scheduled.map(post => `
        <div class="scheduled-item" data-id="${post.id}">
            <div class="scheduled-info">
                <h3 class="scheduled-title">${escapeHtml(post.title)}</h3>
                <span class="scheduled-date">Created: ${formatDate(post.createdAt)}</span>
            </div>
            <span class="scheduled-time">Publishes: ${formatDateTime(post.scheduledFor)}</span>
            <div class="scheduled-actions">
                <button class="action-btn" onclick="editScheduled('${post.id}')">Edit</button>
                <button class="action-btn delete" onclick="deleteScheduled('${post.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function editScheduled(id) {
    const scheduled = JSON.parse(localStorage.getItem(SCHEDULED_KEY) || '[]');
    const post = scheduled.find(p => p.id === id);
    
    if (!post) return;
    
    // Load into form
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-content').value = post.content;
    uploadedImages = post.images || [];
    renderUploadedImages();
    
    // Set schedule
    document.getElementById('schedule-post').checked = true;
    document.getElementById('schedule-datetime').style.display = 'flex';
    document.getElementById('publish-btn').textContent = 'Schedule Post';
    
    const scheduleDate = new Date(post.scheduledFor);
    document.getElementById('schedule-date').value = scheduleDate.toISOString().split('T')[0];
    document.getElementById('schedule-time').value = scheduleDate.toTimeString().slice(0, 5);
    
    // Remove the scheduled post (will be re-added on save)
    deleteScheduled(id, true);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Scheduled post loaded for editing');
}

function deleteScheduled(id, silent = false) {
    if (!silent && !confirm('Delete this scheduled post?')) return;
    
    const scheduled = JSON.parse(localStorage.getItem(SCHEDULED_KEY) || '[]');
    const filtered = scheduled.filter(p => p.id !== id);
    localStorage.setItem(SCHEDULED_KEY, JSON.stringify(filtered));
    loadScheduledPosts();
    
    if (!silent) showToast('Scheduled post deleted');
}

// ===================================
// Preview
// ===================================

function handlePreview() {
    const title = document.getElementById('post-title').value.trim() || 'Untitled';
    const content = document.getElementById('post-content').value.trim() || 'No content yet...';
    
    const previewFrame = document.getElementById('preview-frame');
    const today = new Date();
    
    // Format content
    let formattedContent = content;
    
    // Bold
    formattedContent = formattedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formattedContent = formattedContent.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Pull quotes
    formattedContent = formattedContent.replace(/^> (.+)$/gm, '<p class="pull-quote">"$1"</p>');
    
    // Images
    formattedContent = formattedContent.replace(/\[img:(\d+):(\w+)\]/g, (match, index, position) => {
        const img = uploadedImages[parseInt(index)];
        if (!img) return '<span style="color: var(--text-muted);">[Image not found]</span>';
        
        const posClass = position === 'left' ? 'floating-left' : 
                        position === 'right' ? 'floating-right' : 'full-width';
        
        return `<div class="post-image-container ${posClass}">
            <img src="${img.src}" alt="Preview" class="post-image">
        </div>`;
    });
    
    // Paragraphs
    const paragraphs = formattedContent.split('\n\n').filter(p => p.trim());
    formattedContent = paragraphs.map((p, i) => {
        if (p.startsWith('<p class="pull-quote">')) return p;
        if (p.startsWith('<div class="post-image-container">')) return p;
        if (i === 0) return `<p class="drop-cap">${p}</p>`;
        return `<p>${p}</p>`;
    }).join('\n');
    
    previewFrame.innerHTML = `
        <header class="post-header">
            <div class="date-display">
                <span class="date-day">${today.getDate()}</span>
                <div class="date-meta">
                    <span class="date-month">${today.toLocaleDateString('en-US', { month: 'long' })}</span>
                    <span class="date-year">${today.getFullYear()}</span>
                </div>
            </div>
            <h1 class="post-title">${escapeHtml(title)}</h1>
        </header>
        <article class="post-content">
            ${formattedContent}
        </article>
    `;
    
    document.getElementById('preview-modal').classList.add('active');
}

// ===================================
// Utilities
// ===================================

function clearForm() {
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    uploadedImages = [];
    renderUploadedImages();
    document.getElementById('schedule-post').checked = false;
    document.getElementById('schedule-datetime').style.display = 'none';
    document.getElementById('publish-btn').textContent = 'Publish Now';
    currentDraftId = null;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, isError = false) {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
