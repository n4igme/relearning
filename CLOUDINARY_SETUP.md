# Cloudinary Video Hosting Setup Guide

## Overview
Cloudinary integration is now complete for video, image, and document uploads. This guide will help you set up and use the video hosting features.

## What Was Implemented

### Backend Components Created:
1. **src/config/cloudinary.js** - Cloudinary configuration and utility functions
2. **src/middleware/uploadVideo.js** - Multer middleware for file uploads
3. **src/controllers/materialController.js** - Enhanced with 4 new upload functions

### New API Endpoints:

#### 1. Upload Video to Sub-Material
```
POST /api/courses/:courseId/materials/:materialId/submaterials/:subMaterialId/upload-video
```
- **Access**: Private/Mentor, Admin
- **Body**: multipart/form-data with `video` field
- **Formats**: mp4, avi, mov, wmv, flv, mkv, webm, m4v
- **Max Size**: 500MB
- **Returns**: Video URL, duration, format, file size

#### 2. Upload Document/File to Sub-Material
```
POST /api/courses/:courseId/materials/:materialId/submaterials/:subMaterialId/upload-file
```
- **Access**: Private/Mentor, Admin
- **Body**: multipart/form-data with `file` field
- **Formats**: pdf, doc, docx, ppt, pptx, xls, xlsx, txt
- **Max Size**: 50MB
- **Returns**: File URL, format, file size

#### 3. Upload Course Thumbnail
```
POST /api/courses/:courseId/upload-thumbnail
```
- **Access**: Private/Mentor (course creator), Admin
- **Body**: multipart/form-data with `thumbnail` field
- **Formats**: jpeg, jpg, png, gif, webp
- **Max Size**: 10MB
- **Returns**: Image URL, width, height

#### 4. Delete Video from Sub-Material
```
DELETE /api/courses/:courseId/materials/:materialId/submaterials/:subMaterialId/video
```
- **Access**: Private/Mentor, Admin
- **Returns**: Success message

## Setup Instructions

### Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com/
2. Sign up for a free account (25GB storage, 25GB bandwidth/month)
3. After signup, go to your Dashboard
4. Note down:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 2: Install Dependencies
```bash
cd C:\Users\mhx_x\Documents\Project\relearning
npm install cloudinary multer
```

### Step 3: Update Environment Variables
Add the following to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Replace** `your_cloud_name_here`, `your_api_key_here`, and `your_api_secret_here` with your actual Cloudinary credentials from Step 1.

### Step 4: Create Uploads Directory
The upload middleware will automatically create this, but you can manually create it:
```bash
mkdir uploads
```

Add to `.gitignore`:
```
uploads/
```

## How It Works

### Upload Flow:
1. **Frontend**: User selects video file
2. **Multer**: Temporarily saves file to `uploads/` directory
3. **Cloudinary**: File is uploaded to Cloudinary cloud storage
4. **Database**: Cloudinary URL is saved to SubMaterial record
5. **Cleanup**: Temporary file is deleted from `uploads/`

### Storage Structure in Cloudinary:
```
courses/
├── {courseId}/
│   ├── materials/
│   │   ├── submaterial-{id}-{timestamp}.mp4
│   │   └── submaterial-{id}-{timestamp}.mov
│   ├── documents/
│   │   ├── submaterial-{id}-{timestamp}.pdf
│   │   └── submaterial-{id}-{timestamp}.docx
│   └── thumbnail-{timestamp}.jpg
```

## Usage Examples

### Example 1: Upload Video (using cURL)
```bash
curl -X POST \
  http://localhost:5001/api/courses/1/materials/1/submaterials/1/upload-video \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@/path/to/video.mp4"
```

### Example 2: Upload Video (using Postman)
1. Method: POST
2. URL: `http://localhost:5001/api/courses/1/materials/1/submaterials/1/upload-video`
3. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body:
   - Type: form-data
   - Key: `video` (Type: File)
   - Value: Select your video file

### Example 3: Upload Video (using JavaScript/Fetch)
```javascript
const formData = new FormData();
formData.append('video', videoFile); // videoFile is a File object

const response = await fetch(
  `/api/courses/${courseId}/materials/${materialId}/submaterials/${subMaterialId}/upload-video`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }
);

const result = await response.json();
console.log('Video URL:', result.data.video_url);
console.log('Duration:', result.data.duration, 'seconds');
```

## Features

### Video Features:
- ✅ Automatic format conversion
- ✅ Quality optimization
- ✅ Thumbnail generation
- ✅ Duration extraction
- ✅ Automatic cleanup of old videos
- ✅ CDN delivery (fast worldwide)
- ✅ Adaptive bitrate streaming

### Image Features:
- ✅ Automatic resizing (max 1200x675)
- ✅ Format optimization (WebP when supported)
- ✅ Quality optimization
- ✅ CDN delivery

### Security Features:
- ✅ File type validation
- ✅ File size limits
- ✅ Authorization checks
- ✅ Automatic cleanup on errors
- ✅ Temporary file deletion

## Database Changes Required

Make sure your SubMaterial model has these fields:
```javascript
cloudinary_public_id: VARCHAR(255)  // For videos
cloudinary_file_id: VARCHAR(255)     // For documents
```

Make sure your Course model has this field:
```javascript
cloudinary_thumbnail_id: VARCHAR(255) // For course thumbnails
```

These should already exist in your database schema if you ran the PostgreSQL migration.

## Testing

### Test Video Upload:
1. Start your backend server:
   ```bash
   npm start
   ```

2. Login to get a JWT token (as mentor or admin)

3. Create a course, material, and sub-material

4. Upload a video using Postman or cURL

5. Check the response for the Cloudinary URL

6. Verify in Cloudinary Dashboard that the video was uploaded

### Troubleshooting:

#### Error: "Missing credentials"
- Check that you added Cloudinary credentials to `.env`
- Restart your server after adding env variables

#### Error: "File too large"
- Video limit: 500MB
- Image limit: 10MB
- Document limit: 50MB

#### Error: "Upload failed"
- Check your Cloudinary account hasn't exceeded free tier limits (25GB)
- Check that the file format is supported
- Check server logs for detailed error message

## Free Tier Limits

Cloudinary free tier includes:
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Videos**: Up to 500 per month

If you need more, upgrade to:
- **Plus Plan**: $99/month - 100GB storage, 100GB bandwidth
- **Advanced Plan**: $249/month - 200GB storage, 200GB bandwidth

## Next Steps

1. **Frontend Integration**: Build a VideoPlayer component (see next guide)
2. **Progress Tracking**: Integrate with progress tracking system
3. **Email Notifications**: Send email when video upload completes
4. **Analytics**: Track video views and completion rates

## Support

For issues:
- Cloudinary Docs: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com/
