# Matthew Whitham — Personal Blog

A dark, witchy, contemporary art gallery-style blog for daily creative writing and art.

## Features

- **Daily Posts**: Homepage shows today's post (or yesterday's if today isn't published yet)
- **Scheduled Publishing**: Write posts ahead of time and schedule them for midnight EST
- **Archive**: Beautiful timeline view of all past posts organized by month
- **Admin Interface**: Easy-to-use editor with formatting tools
- **Image Support**: Upload images and place them artfully throughout your posts
- **Responsive Design**: Looks great on desktop, tablet, and mobile

## File Structure

```
matthew-whitham-blog/
├── index.html          # Homepage (today's post)
├── archive.html        # Archive of all posts
├── about.html          # About page
├── support.html        # Support/donation page
├── css/
│   ├── style.css       # Main styles
│   └── admin.css       # Admin-specific styles
├── js/
│   ├── main.js         # Main site functionality
│   ├── archive.js      # Archive page functionality
│   └── admin.js        # Admin interface functionality
├── admin/
│   └── index.html      # Admin interface for writing posts
├── posts/              # Individual post pages
│   └── 2026-01-17.html # Example post
└── images/             # Image uploads
    └── placeholder.jpg
```

## Getting Started

### 1. Host on GitHub Pages

1. Create a new repository on GitHub
2. Upload all these files to the repository
3. Go to Settings → Pages
4. Set source to "main" branch
5. Your site will be live at `https://yourusername.github.io/repository-name`

### 2. Connect Your Custom Domain

1. Purchase `matthewwhitham.com` from GoDaddy
2. In GoDaddy DNS settings, add:
   - Type: CNAME
   - Name: www
   - Value: `yourusername.github.io`
   
   And add A records pointing to GitHub's IPs:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153

3. In your GitHub repo, go to Settings → Pages
4. Enter `matthewwhitham.com` in Custom domain
5. Check "Enforce HTTPS"

### 3. Writing Posts

1. Go to `yourdomain.com/admin/` (or `/admin/index.html`)
2. Write your post using the editor
3. Add images by clicking the upload area
4. Insert image codes like `[img:0:right]` in your text
5. Click "Publish Now" or schedule for later

### Formatting Guide

- **Bold**: Wrap text in `**double asterisks**`
- **Italic**: Wrap text in `*single asterisks*`
- **Pull Quote**: Start a line with `> ` 
- **Images**: Use `[img:0:left]`, `[img:0:right]`, or `[img:0:full]`
  - The number matches the image's position in your uploads (starting at 0)

### Scheduled Posts

Posts can be scheduled to publish at any time. The system checks for scheduled posts whenever someone visits the site. For true midnight publishing, you may want to set up a GitHub Action or external service to ping the site at midnight EST.

## Customization

### Colors (in css/style.css)

```css
--forest-green: #2d5a4a;    /* Primary accent */
--forest-light: #3d7a64;    /* Lighter green */
--witchy-purple: #5c4a6e;   /* Secondary accent */
--witchy-light: #7d6891;    /* Lighter purple */
--bg-deep: #0a0b0d;         /* Background */
```

### Fonts

The site uses:
- **Cormorant Garamond** for headings and display text
- **Quicksand** for body text

### Adding Photos to About Page

Replace the placeholder images in `/images/`:
- `about-1.jpg`
- `about-2.jpg`
- `about-3.jpg`

### Support Links

Edit `support.html` and replace `YOUR-VENMO-USERNAME`, `YOUR-CASHAPP-USERNAME`, and `YOUR-PAYPAL-USERNAME` with your actual usernames.

## Technical Notes

- Posts are stored in the browser's localStorage
- Images are stored as base64 data URLs (keep images under 1MB for best performance)
- The site is fully static — no server required
- For a production blog, consider migrating to a proper CMS or static site generator

## Need Help?

Feel free to reach out at matthewdev2026@gmail.com

---

Made with care for daily creative practice.
