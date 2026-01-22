# Matthew Whitham — Personal Blog

A dark, witchy, contemporary art gallery-style blog for daily creative writing and art.

## How to Add a New Post

Open `posts.json` and add a new entry to the `posts` array:

```json
{
  "id": "2026-01-20",
  "date": "2026-01-20",
  "title": "Your Post Title Here",
  "content": "Your post content here.\n\nUse two line breaks for new paragraphs.\n\n> This becomes a pull quote.\n\nYou can use **bold** and *italic* text."
}
```

### Important:
- **id**: Use the date format `YYYY-MM-DD` (this must be unique)
- **date**: Same format `YYYY-MM-DD`
- **title**: Your post title
- **content**: Your post text (see formatting guide below)

### Formatting Guide

| What you want | What you type |
|---------------|---------------|
| New paragraph | `\n\n` (blank line) |
| **Bold text** | `**bold text**` |
| *Italic text* | `*italic text*` |
| Pull quote | `> Your quote here` |
| Image | `[img:images/photo.jpg:right:Caption here]` |

### Image Positions
- `left` — floats left, text wraps around
- `right` — floats right, text wraps around  
- `full` — full width, no text wrap

### Example Post

```json
{
  "id": "2026-01-20",
  "date": "2026-01-20",
  "title": "Morning Light",
  "content": "The first paragraph always gets a fancy drop cap automatically.\n\nThis is a second paragraph. You can use **bold** and *italic* formatting.\n\n> This is a centered pull quote for emphasis.\n\nAnd then continue writing more paragraphs.\n\n[img:images/morning.jpg:right:Morning sunshine]\n\nText will wrap around the image nicely."
}
```

## File Structure





