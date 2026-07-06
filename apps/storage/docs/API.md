# API Documentation

Complete API reference for the File Storage System.

## Base URL

All API endpoints are prefixed with `/api`:

```
http://localhost:5001/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### JWT Token Requirements

Your JWT token must contain the following claims:

- `iss`: Must be `"tripociate.com"`
- `sub`: Must be an email address
- `email`: Must match `sub`

Example token payload:

```json
{
  "iss": "tripociate.com",
  "sub": "user@example.com",
  "email": "user@example.com"
}
```

---

## Folder Endpoints

### List All Folders

Get a list of all folders.

**Endpoint:** `GET /api/v1/content/folders`

**Authentication:** Required

**Response:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "name": "my-folder",
      "path": "/api/v1/content/folders/my-folder",
      "url": "http://localhost:5001/api/v1/content/folders/my-folder"
    }
  ],
  "message": "Folders retrieved successfully"
}
```

---

### Get Folder Details

Get details about a specific folder including file list.

**Endpoint:** `GET /api/v1/content/folders/:folderName`

**Authentication:** Required

**Parameters:**

- `folderName` (path): Name of the folder

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "name": "my-folder",
    "files": [
      {
        "name": "image_1234567890.jpg",
        "url": "http://localhost:5001/api/v1/content/folders/my-folder/files/image_1234567890.jpg",
        "localUrl": "http://localhost:5001/api/v1/content/folders/my-folder/files/image_1234567890.jpg"
      }
    ],
    "fileCount": 1
  },
  "message": "Folder details retrieved successfully"
}
```

---

### Create Folder

Create a new folder.

**Endpoint:** `POST /api/v1/content/folders`

**Authentication:** Required

**Request Body:**

```json
{
  "folderName": "my-new-folder"
}
```

**Response:**

```json
{
  "statusCode": 201,
  "data": {
    "name": "my-new-folder",
    "path": "/api/v1/content/folders/my-new-folder",
    "url": "http://localhost:5001/api/v1/content/folders/my-new-folder"
  },
  "message": "Folder created successfully"
}
```

---

### Update Folder (Rename)

Rename an existing folder.

**Endpoint:** `PUT /api/v1/content/folders/:folderName`

**Authentication:** Required

**Parameters:**

- `folderName` (path): Current name of the folder

**Request Body:**

```json
{
  "folderName": "new-folder-name"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "name": "new-folder-name",
    "path": "/api/v1/content/folders/new-folder-name",
    "url": "http://localhost:5001/api/v1/content/folders/new-folder-name"
  },
  "message": "Folder renamed successfully"
}
```

---

### Delete Folder

Delete an empty folder.

**Endpoint:** `DELETE /api/v1/content/folders/:folderName`

**Authentication:** Required

**Parameters:**

- `folderName` (path): Name of the folder to delete

**Note:** Folder must be empty to be deleted.

**Response:**

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Folder deleted successfully"
}
```

---

## File Endpoints

### Upload File

Upload a file to a folder.

**Endpoint:** `POST /api/v1/content/files`

**Authentication:** Required

**Request:** `multipart/form-data`

**Form Fields:**

- `file` (required): The file to upload
- `folderName` (optional): Target folder name (defaults to 'root')
- `fileName` (optional): Custom file name (uses original name if not provided)
- `allowedExtensions` (optional): Array of allowed file extensions
- `isConvertToWebp` (optional): Boolean to convert image to WebP
- `quality` (optional): WebP quality (0-100, default: 80)
- `width` (optional): WebP width in pixels
- `height` (optional): WebP height in pixels
- `fit` (optional): WebP fit mode (inside|cover|contain|fill|outside, default: inside)

**Example using cURL:**

```bash
curl -X POST http://localhost:5001/api/v1/content/files \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg" \
  -F "folderName=photos" \
  -F "isConvertToWebp=true" \
  -F "quality=90"
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "url": "http://localhost:5001/api/v1/content/folders/photos/files/image_1234567890.jpg",
    "localUrl": "http://localhost:5001/api/v1/content/folders/photos/files/image_1234567890.jpg"
  },
  "message": "File upload success!"
}
```

---

### List Files in Folder

Get a list of all files in a folder.

**Endpoint:** `GET /api/v1/content/folders/:folderName/files`

**Authentication:** Required

**Parameters:**

- `folderName` (path): Name of the folder

**Response:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "name": "image_1234567890.jpg",
      "url": "http://localhost:5001/api/v1/content/folders/photos/files/image_1234567890.jpg",
      "localUrl": "http://localhost:5001/api/v1/content/folders/photos/files/image_1234567890.jpg"
    }
  ],
  "message": "Files retrieved successfully"
}
```

---

### Get File

Download or view a file.

**Endpoint:** `GET /api/v1/content/folders/:folderName/files/:fileName`

**Authentication:** Not required (public endpoint)

**Parameters:**

- `folderName` (path): Name of the folder
- `fileName` (path): Name of the file

**Query Parameters (for WebP conversion):**

- `webp` (optional): Set to `true` to convert image to WebP
- `quality` (optional): WebP quality (0-100, default: 80)
- `width` (optional): WebP width in pixels
- `height` (optional): WebP height in pixels
- `fit` (optional): WebP fit mode

**Examples:**

Get original file:

```
GET /api/v1/content/folders/photos/files/image.jpg
```

Get WebP version:

```
GET /api/v1/content/folders/photos/files/image.jpg?webp=true&quality=90&width=800
```

**Response:** File stream with appropriate Content-Type header.

---

### Update File (Replace)

Replace an existing file with a new one.

**Endpoint:** `PUT /api/v1/content/folders/:folderName/files/:fileName`

**Authentication:** Required

**Parameters:**

- `folderName` (path): Current folder name
- `fileName` (path): Current file name

**Request:** `multipart/form-data`

**Form Fields:**

- `file` (required): The new file
- `folderName` (optional): New folder name
- `fileName` (optional): New file name
- `allowedExtensions` (optional): Array of allowed extensions
- `isConvertToWebp` (optional): Boolean to convert to WebP
- `quality`, `width`, `height`, `fit` (optional): WebP options

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "url": "http://localhost:5001/api/v1/content/folders/photos/files/new_image_1234567890.jpg",
    "localUrl": "http://localhost:5001/api/v1/content/folders/photos/files/new_image_1234567890.jpg"
  },
  "message": "File replaced successfully"
}
```

---

### Delete File

Delete a file from a folder.

**Endpoint:** `DELETE /api/v1/content/folders/:folderName/files/:fileName`

**Authentication:** Required

**Parameters:**

- `folderName` (path): Name of the folder
- `fileName` (path): Name of the file to delete

**Response:**

```json
{
  "statusCode": 200,
  "data": null,
  "message": "File deleted successfully"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message here"
}
```

### Common Error Codes

- `400`: Bad Request - Invalid input or missing required fields
- `401`: Unauthorized - Missing or invalid JWT token
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error - Server error

---

## Allowed File Extensions

Default allowed extensions:

- Images: `jpeg`, `jpg`, `png`, `webp`, `gif`
- Videos: `mp4`, `webm`
- Documents: `pdf`, `docx`, `doc`

You can specify custom allowed extensions in file upload requests.
