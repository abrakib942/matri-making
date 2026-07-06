# Node Express Dynamic Storage

A modern file storage system built with Express.js, featuring folder-based organization, JWT authentication, WebP image conversion, and a beautiful Handlebars UI with Tailwind CSS.

## Features

- 📁 **Folder Management**: Create, read, update, and delete folders
- 📄 **File Management**: Upload, download, update, and delete files
- 🖼️ **WebP Conversion**: Convert images to WebP format with configurable quality and dimensions
- 🔐 **JWT Authentication**: Secure API access with JSON Web Tokens
- 🎨 **Modern UI**: Beautiful web interface built with Handlebars and Tailwind CSS
- 📊 **API & UI**: Both RESTful API endpoints and web UI for file management
- ✅ **Environment Validation**: Type-safe environment variable validation using Zod
- 📝 **Comprehensive Logging**: Winston-based logging with daily rotation

## Prerequisites

- Node.js >= 24.11.1
- pnpm >= 8.0.0 (from monorepo root)

## Installation

From the monorepo root:

```bash
pnpm install
```

3. Create a `.env` file in the root directory:

```env
NODE_ENV=development
HOST=localhost
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-here
ATTACHMENT_FOLDER_PATH=./attachments
PUBLIC_URL=http://localhost:5001
LOCAL_URL=http://localhost:5001
LOG_DIR_PATH=./logs
```

4. Create necessary directories:

```bash
mkdir -p attachments logs
```

## Running the Application

### Development Mode

```bash
pnpm dev:storage
# or from this app directory
pnpm dev
```

The server will start on `http://localhost:5001` (or the port specified in `.env`).

### Production Mode (PM2)

Build and start with PM2 from this app directory (loads `apps/storage/.env` via `ecosystem.config.cjs`):

```bash
pnpm build
pnpm pm2:start
```

Or deploy all apps from the monorepo root: `./scripts/deploy/start.sh` or `pnpm deploy:start`.

## Usage

### Web UI

1. Open your browser and navigate to `http://localhost:5001`
2. You'll need to authenticate with a JWT token (see API documentation)
3. Use the UI to:
   - Create and manage folders
   - Upload files to folders
   - View and delete files
   - Convert images to WebP format

### API Endpoints

See [API Documentation](./docs/API.md) for complete API reference.

## Project Structure

```
node-express-dynamic-storage/
├── src/
│   ├── config/
│   │   └── winston.js          # Winston logger configuration
│   ├── middlewares/
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── validation.js        # Joi validation schemas
│   │   └── validationMiddleware.js
│   ├── routes/
│   │   ├── file/               # File management routes
│   │   ├── folder/            # Folder management routes
│   │   └── ui/                # UI routes (Handlebars views)
│   ├── services/
│   │   ├── file.js            # File service logic
│   │   └── folder.js          # Folder service logic
│   ├── utils/
│   │   ├── env.mjs            # Environment validation (Zod)
│   │   ├── env.js             # Environment variables export
│   │   ├── jwt.js             # JWT utilities
│   │   ├── file.js            # File utility functions
│   │   ├── logger.js          # Logger utilities
│   │   ├── response.js        # Response helpers
│   │   └── constants.js       # Constants
│   ├── views/                 # Handlebars templates
│   │   ├── layouts/
│   │   ├── partials/
│   │   └── *.hbs
│   └── index.js              # Application entry point
├── docs/
│   ├── API.md                 # API documentation
│   └── WEBP.md               # WebP conversion guide
├── public/                   # Static files
├── attachments/              # File storage directory
├── logs/                     # Log files
└── package.json
```

## Environment Variables

All environment variables are validated on startup using Zod. Required variables:

- `NODE_ENV`: Environment (development|production|test)
- `JWT_SECRET`: Secret key for JWT token signing (required)
- `ATTACHMENT_FOLDER_PATH`: Path to store uploaded files (required)
- `LOG_DIR_PATH`: Path for log files (required)
- `PORT`: Server port (optional, defaults to 5001)
- `HOST`: Server host (optional)
- `PUBLIC_URL`: Public URL for file access (optional)
- `LOCAL_URL`: Local URL for file access (optional)

## Authentication

The API uses JWT authentication. Tokens must include:

- `iss`: Issuer (must be 'tripociate.com')
- `sub`: Subject (email address)
- `email`: Email address (must match `sub`)

See [API Documentation](./docs/API.md) for details on authentication.

## WebP Conversion

Images can be converted to WebP format with configurable options:

- Quality (0-100)
- Width (pixels)
- Height (pixels)
- Fit mode (inside, cover, contain, fill, outside)

See [WebP Documentation](./docs/WEBP.md) for details.

## Development

### Code Formatting

```bash
yarn format
```

### Running Tests

```bash
yarn test
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
