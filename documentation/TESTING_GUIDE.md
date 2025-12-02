# Documentation Hub - Testing Guide

## Server Running
- Local: http://localhost:3001

## Features Implemented

### ✅ 1. Rich Text Editor (Enhanced)
- **Bold, Italic, Headings (H1, H2)**
- **Lists (Bullet & Numbered)**
- **Image Upload → Base64**
  - Click "Image" button → select file → auto uploads to `/api/upload`
  - Stored as data:image/\* base64 URL
  - Renders inline in editor & published pages

- **External Links**
  - Click "Link" button → paste URL
  - Automatically opens in new tab (target="_blank", rel="noopener noreferrer")

- **YouTube Embeds**
  - Click "YouTube" button → paste YouTube URL
  - Extracts video ID from: youtube.com/watch?v=ID or youtu.be/ID
  - Renders as responsive 16:9 iframe

### ✅ 2. Create Page with Rich Content
- Navigate to `/admin/dashboard/apps/[appId]`
- Click "New Page" button
- Fill Title
- Use rich editor for content with images, links, YouTube
- Click "Create Page"

### ✅ 3. Edit Page with Rich Content
- Hover over a page in list → "Edit" (pencil) button
- Modify title and content
- Update images, links, YouTube embeds
- Click "Save Changes"

### ✅ 4. Delete Page
- Hover over a page → "Delete" (trash) button
- Confirm in dialog
- Should remove page from list
- **If not working:** Check browser console for errors in `/api/pages` DELETE call

### ✅ 5. Delete App
- Go to `/admin/dashboard`
- Hover over an app → "Delete" (trash) button
- Confirm in dialog
- Should redirect to dashboard after deletion

### ✅ 6. Public Page Viewing
- Visit `http://localhost:3001/[appSlug]`
- Should see sidebar with pages
- Click page → view rich content
- Base64 images render correctly
- YouTube embeds display responsive
- External links work with new tab

## How to Test Manually

### Test 1: Image Upload (Base64)
1. Create/Edit a page
2. Click "Image" button
3. Select any image file
4. Verify it uploads and appears in editor
5. Publish page
6. Visit public page → image should display

### Test 2: External Links
1. Create/Edit page
2. Click "Link" button
3. Enter: https://google.com
4. View in editor (should be clickable blue text)
5. Publish & visit public page
6. Click link → opens in new tab

### Test 3: YouTube Embed
1. Create/Edit page
2. Click "YouTube" button
3. Paste: https://www.youtube.com/watch?v=dQw4w9WgXcQ
4. Verify iframe appears in editor
5. Publish & visit public page
6. Should display responsive video player

### Test 4: Delete Page
1. Create a test page
2. Hover → click delete trash icon
3. Confirm dialog
4. Page should be removed from list
5. **If fails:** Check console error message

### Test 5: Delete App
1. Go to dashboard
2. Create a test app (if needed)
3. Hover → click delete trash icon
4. Confirm
5. Should redirect to dashboard with app removed

## API Endpoints

- `POST /api/upload` - Upload image → returns base64 data URL
- `POST /api/pages` - Create page
- `PUT /api/pages` - Update page
- `DELETE /api/pages?id=...` - Delete page
- `POST /api/apps` - Create app
- `DELETE /api/apps?id=...` - Delete app

## Troubleshooting

### "Failed to delete page" error
- Check `/api/pages` DELETE response in Network tab
- Ensure page ID is correct
- Check database connection

### Images not uploading
- Check `/api/upload` in Network tab
- Verify file is a valid image
- Check terminal for errors

### YouTube not embedding
- Verify URL format (youtube.com/watch?v=ID or youtu.be/ID)
- Check browser console for parsing errors

### Page not showing content
- Check if content contains valid HTML
- Visit public page and inspect dangerouslySetInnerHTML
