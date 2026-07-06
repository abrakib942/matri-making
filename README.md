# Custom Boilerplate - Turborepo Monorepo

A production-ready monorepo boilerplate for dynamic website development with essential functionalities like user management, file storage, backend API, admin panel, and public website.

## Structure

```
custom-dynamic-website-boilerplate-monorepo/
├── apps/
│   ├── storage/       # Express File Storage Service (Port 5001) - Runs First
│   ├── api/           # NestJS Backend API (Port 5002)
│   ├── admin/         # Next.js Admin/Back Office (Port 5003)
│   └── web/           # Next.js Public Website (Port 5004)
├── packages/
│   ├── eslint-config/      # Shared ESLint configuration
│   ├── typescript-config/  # Shared TypeScript configurations
│   └── prettier-config/    # Shared Prettier configuration
├── scripts/deploy/    # PM2 deploy scripts (start, stop, restart)
├── turbo.json
└── package.json
```

## Applications

### 1. Storage (`apps/storage`) - Runs First

- **Framework**: Express.js
- **Port**: 5001
- **Features**: File upload, storage, WebP conversion, JWT authentication

### 2. API (`apps/api`)

- **Framework**: NestJS
- **Database**: PostgreSQL (Prisma ORM)
- **Port**: 5002
- **Features**: User management, authentication, authorization, role-based access control
- **Swagger**: Available at `http://localhost:5002/api/docs`
- **Health Check**: Available at `http://localhost:5002/health`

### 3. Admin (`apps/admin`)

- **Framework**: Next.js 15
- **Port**: 5003
- **Features**: Back office/admin panel for managing users, roles, permissions

### 4. Web (`apps/web`)

- **Framework**: Next.js 15
- **Port**: 5004
- **Features**: Public website starter - can be used for landing pages, e-commerce, etc.

## Getting Started

### Prerequisites

- Node.js >= 24.11.1 (required for ESM support)
- pnpm >= 8.0.0
- PostgreSQL (for API)
- Redis (for API queues)
- PM2 (installed per app via `pnpm install`; used for production)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd custom-dynamic-website-boilerplate-monorepo
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables for each app:

#### Storage (`apps/storage/.env`)

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ATTACHMENT_FOLDER_PATH=./external/uploads
LOG_DIR_PATH=./external/logs
PUBLIC_URL=http://127.0.0.1:5001
LOCAL_URL=http://localhost:5001
```

#### API (`apps/api/.env`)

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=5002
POSTGRES_DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REDIS_DATABASE_HOST=localhost
REDIS_DATABASE_PORT=6379
MONGO_DATABASE_URL=mongodb://localhost:27017/dbname
MONGO_DATABASE_USERNAME=
MONGO_DATABASE_PASSWORD=
MONGO_DATABASE_AUTHSOURCE=admin
CORS_ORIGINS=http://localhost:5004,http://localhost:5003
```

#### Admin (`apps/admin/.env`)

```env
NODE_ENV=development
PORT=5003
HOST=0.0.0.0
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002
```

#### Web (`apps/web/.env`)

```env
NODE_ENV=development
PORT=5004
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002
```

4. Set up the database (for API):

```bash
pnpm db:migrate:dev
pnpm db:seed
```

## Development

### Run all apps in development mode (storage runs first, then api, then admin/web):

```bash
pnpm dev
```

### Run specific app individually (recommended for cleaner logs):

```bash
pnpm dev:storage    # Run Storage only (Port 5001) - Runs first
pnpm dev:api        # Run API only (Port 5002)
pnpm dev:admin      # Run Admin only (Port 5003)
pnpm dev:web        # Run Web only (Port 5004)
```

### Alternative: Run specific app using filter:

```bash
pnpm --filter @repo/api dev
pnpm --filter @repo/admin dev
pnpm --filter @repo/web dev
pnpm --filter @repo/storage dev
```

### Build all apps:

```bash
pnpm build
```

### Lint all apps:

```bash
pnpm lint
```

### Type check all apps:

```bash
pnpm type-check
```

## Database Management (API)

### Development migrations:

```bash
pnpm db:migrate:dev
```

### Production migrations:

```bash
pnpm db:migrate:prod
```

### Seed database:

```bash
pnpm db:seed
```

### Open Prisma Studio:

```bash
pnpm db:studio
```

## API Documentation

### Swagger UI

Once the API is running, access the Swagger documentation at:

```
http://localhost:5002/api/docs
```

The Swagger UI provides:

- Interactive API documentation
- Try-it-out functionality for all endpoints
- JWT authentication support
- Request/response schemas

### Health Check Endpoints

#### Full Health Check

```bash
GET /health
```

Returns comprehensive health status including:

- Database connectivity
- Memory usage (heap and RSS)
- Disk storage

#### Simple Ping

```bash
GET /health/ping
```

Returns a simple pong response to verify the API is running.

## Production Deployment (PM2)

Each app has its own `ecosystem.config.cjs` with `cwd` set to the app directory so `.env` loads correctly. Deploy from the monorepo root using the bash scripts (or npm aliases).

### Deployment checklist

1. Copy `.env.example` → `.env` in each app (`apps/storage`, `apps/api`, `apps/admin`, `apps/web`)
2. Set production URLs (`NEXT_PUBLIC_*`, `CORS_ORIGINS`, `PUBLIC_URL`, database URLs)
3. Run full deploy and start:

```bash
./scripts/deploy/start.sh
# or
pnpm deploy:start
```

4. Stop all apps (stop + delete from PM2):

```bash
./scripts/deploy/stop.sh
# or
pnpm deploy:stop
```

5. Restart (stop then full start workflow):

```bash
./scripts/deploy/restart.sh
# or
pnpm deploy:restart
```

6. Verify: storage `:5001`, API `:5002` + `/health`, admin `:5003`, web `:5004`

### What `start.sh` does

1. `pnpm install`
2. `pnpm build`
3. `pnpm db:migrate:prod` and `pnpm db:seed` (API)
4. PM2 start in order: storage → api → admin → web

Optional environment flags:

- `SKIP_INSTALL=1` — skip `pnpm install`
- `SKIP_BUILD=1` — skip `pnpm build`
- `SKIP_DB=1` — skip migrate and seed
- `SKIP_DB_SEED=1` — skip seed only (still runs migrate)

### Per-app PM2 (manual)

```bash
pnpm --filter @repo/storage pm2:start
pnpm --filter @repo/api pm2:start
pnpm --filter @repo/admin pm2:start
pnpm --filter @repo/web pm2:start
```

When multiple client projects share one server, use unique PM2 process names per project in each app's `ecosystem.config.cjs` (e.g. `acme-api` instead of `@repo/api`).

## Environment Validation

All apps have environment variable validation that will:

- **Fail fast** if required environment variables are missing
- **Prevent deployment/startup** if validation fails
- **Provide clear error messages** about what's missing

Validation is implemented using:

- **NestJS API**: `class-validator` with `@nestjs/config`
- **Next.js Apps**: `zod` schema validation
- **Express Storage**: `zod` schema validation

## Scripts

### Root Level Scripts

- `pnpm dev` - Run all apps in development mode (storage runs first)
- `pnpm dev:storage` - Run Storage only (Port 5001)
- `pnpm dev:api` - Run API only (Port 5002)
- `pnpm dev:admin` - Run Admin only (Port 5003)
- `pnpm dev:web` - Run Web only (Port 5004)
- `pnpm build` - Build all apps
- `pnpm build:storage` - Build Storage only
- `pnpm build:api` - Build API only
- `pnpm build:admin` - Build Admin only
- `pnpm build:web` - Build Web only
- `pnpm lint` - Lint all apps
- `pnpm lint:fix` - Fix linting issues
- `pnpm type-check` - Type check all apps
- `pnpm format` - Format all code
- `pnpm clean` - Clean all build artifacts
- `pnpm db:migrate:dev` - Run development migrations
- `pnpm db:migrate:prod` - Run production migrations
- `pnpm db:seed` - Seed database
- `pnpm db:studio` - Open Prisma Studio
- `pnpm deploy:start` - Full production deploy + PM2 start (all apps)
- `pnpm deploy:stop` - Stop and remove all apps from PM2
- `pnpm deploy:restart` - Stop then full deploy + start

## Shared Packages

### ESLint Config (`@repo/eslint-config`)

Shared ESLint configurations for:

- Base configuration
- Next.js apps
- NestJS apps
- Node/Express apps

### TypeScript Config (`@repo/typescript-config`)

Shared TypeScript configurations:

- `base.json` - Base configuration
- `nextjs.json` - Next.js configuration
- `nestjs.json` - NestJS configuration
- `node.json` - Node/Express configuration

### Prettier Config (`@repo/prettier-config`)

Shared Prettier configuration for consistent code formatting.

## Module System

This monorepo uses **ESM (ECMAScript Modules)** as the modern module system:

- **All apps** use `"type": "module"` in their `package.json` files
- **TypeScript** is configured with modern module resolution (`NodeNext` for runtime, `bundler` for builds)
- **All imports** use ESM syntax (`import`/`export`) instead of CommonJS (`require`/`module.exports`)
- **Shared packages** (ESLint config, Prettier config) are ESM modules

### Benefits

- Native ESM support in Node.js 24+
- Better tree-shaking and optimization
- Aligns with modern JavaScript standards
- Improved performance and compatibility

### Compatibility

- **NestJS API**: Uses ESM with bundler module resolution for builds
- **Next.js Apps**: Native ESM support (Next.js 15+)
- **Express Storage**: Full ESM support with Node.js 24+

## Best Practices

1. **Environment Variables**: Always use `.env.example` files as templates. Never commit `.env` files.
2. **Database Migrations**: Use `db:migrate:dev` for development and `db:migrate:prod` for production.
3. **Code Quality**: Run `pnpm lint` and `pnpm type-check` before committing.
4. **Shared Configs**: Use shared packages for consistent tooling across apps.
5. **Module System**: Always use ESM `import`/`export` syntax. Avoid CommonJS `require`/`module.exports`.

## License

ISC
