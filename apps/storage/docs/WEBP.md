# WebP Conversion Guide

This guide explains how to use WebP image conversion features in the File Storage System.

## Overview

The system supports converting JPEG and PNG images to WebP format either during upload or on-the-fly via query parameters when retrieving images.

## Conversion Methods

### 1. During Upload

When uploading a file, you can convert images to WebP format by setting `isConvertToWebp=true` and providing conversion options.

#### Upload Request Example

```bash
curl -X POST http://localhost:5001/api/v1/content/files \
  -H "Authorization: Bearer <token>" \
  -F "file=@photo.jpg" \
  -F "folderName=photos" \
  -F "isConvertToWebp=true" \
  -F "quality=90" \
  -F "width=1920" \
  -F "height=1080" \
  -F "fit=inside"
```

#### Supported Formats

Only JPEG (`.jpg`, `.jpeg`) and PNG (`.png`) images can be converted to WebP during upload.

#### Upload Parameters

- `isConvertToWebp` (boolean): Enable WebP conversion
- `quality` (integer, 0-100): WebP quality (default: 80)
  - Higher values = better quality but larger file size
  - Lower values = smaller file size but reduced quality
- `width` (integer, optional): Target width in pixels
- `height` (integer, optional): Target height in pixels
- `fit` (string, optional): Image fitting mode (default: `inside`)
  - `inside`: Resize to fit within dimensions while maintaining aspect ratio
  - `cover`: Resize to cover dimensions, may crop
  - `contain`: Resize to contain within dimensions
  - `fill`: Resize to exact dimensions, may distort
  - `outside`: Resize to fill dimensions, may exceed

---

### 2. On-the-Fly Conversion

Convert images to WebP when retrieving them using query parameters.

#### Request Format

```
GET /api/v1/content/folders/:folderName/files/:fileName?webp=true&quality=90&width=800&height=600&fit=inside
```

#### Query Parameters

- `webp` (required): Set to `true` to enable conversion
- `quality` (optional, 0-100): WebP quality (default: 80)
- `width` (optional): Target width in pixels
- `height` (optional): Target height in pixels
- `fit` (optional): Fit mode (default: `inside`)

#### Example Requests

**Basic conversion:**

```
GET /api/v1/content/folders/photos/files/image.jpg?webp=true
```

**With quality:**

```
GET /api/v1/content/folders/photos/files/image.jpg?webp=true&quality=95
```

**With dimensions:**

```
GET /api/v1/content/folders/photos/files/image.jpg?webp=true&width=800&height=600
```

**Full options:**

```
GET /api/v1/content/folders/photos/files/image.jpg?webp=true&quality=90&width=1920&height=1080&fit=cover
```

#### Caching

Converted WebP files are cached. The first request converts the image and saves it, subsequent requests serve the cached version.

---

## Fit Modes Explained

### `inside` (Default)

Resizes the image to fit completely within the specified dimensions while maintaining aspect ratio.

**Use case:** Thumbnails, previews where you want the entire image visible.

```
Original: 2000x1500px
Request: width=800, height=600, fit=inside
Result: 800x600px (fits completely)
```

### `cover`

Resizes the image to cover the entire area, maintaining aspect ratio. May crop parts of the image.

**Use case:** Hero images, banners where you want the area filled.

```
Original: 2000x1500px
Request: width=800, height=600, fit=cover
Result: 800x600px (covers area, may crop)
```

### `contain`

Similar to `inside`, but ensures the image fits entirely within dimensions.

**Use case:** When you need precise dimension control.

### `fill`

Resizes to exact dimensions, may distort the image.

**Use case:** When exact dimensions are required regardless of aspect ratio.

### `outside`

Resizes to fill dimensions, may exceed them while maintaining aspect ratio.

**Use case:** When you want at least the specified dimensions.

---

## Quality Guidelines

Recommended quality settings:

- **High quality** (90-100): For production images, print materials
- **Medium quality** (70-85): For web images, general use (default: 80)
- **Low quality** (50-70): For thumbnails, previews where file size matters

## Best Practices

1. **Use WebP for web images**: WebP format typically provides 25-35% better compression than JPEG/PNG
2. **Cache converted images**: On-the-fly conversion caches results, so first request is slower
3. **Consider dimensions**: Specify width/height for consistent sizing
4. **Quality balance**: Higher quality = larger files, find the right balance for your use case
5. **Progressive enhancement**: Serve original images as fallback, use WebP for modern browsers

---

## Browser Support

WebP is supported in:

- Chrome 23+
- Firefox 65+
- Edge 18+
- Safari 14+
- Opera 12.1+

For older browsers, serve the original JPEG/PNG format.

---

## Examples

### HTML Image Tag

```html
<picture>
  <source srcset="/api/v1/content/folders/photos/files/image.jpg?webp=true" type="image/webp" />
  <img src="/api/v1/content/folders/photos/files/image.jpg" alt="Photo" />
</picture>
```

### JavaScript Fetch

```javascript
const response = await fetch(
  '/api/v1/content/folders/photos/files/image.jpg?webp=true&quality=90&width=800',
);
const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);
```

### Axios Request

```javascript
const response = await axios.get('/api/v1/content/folders/photos/files/image.jpg', {
  params: {
    webp: true,
    quality: 90,
    width: 1920,
    height: 1080,
    fit: 'cover',
  },
  responseType: 'blob',
});
```
