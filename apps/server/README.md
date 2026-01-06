# Question Hive Server

A comprehensive Go backend for the Question Hive platform - an educational question paper generation system.

## 🚀 **Features**

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Question Management**: CRUD operations for questions with rich metadata
- **Academic Structure**: Support for Exams → Subjects → Chapters hierarchy
- **Question Papers**: Create and manage question papers (coming soon)
- **Multi-tenancy**: Institution-based data isolation
- **RESTful API**: Well-structured REST endpoints with proper HTTP status codes
- **Database**: Supabase PostgreSQL (accessed via GORM here; schema & migrations owned by Drizzle in `packages/db`)
- **Validation**: Input validation using struct tags and go-playground/validator
- Structured for scalability

## Getting Started

### Prerequisites

- Go 1.21 or higher
- Make sure your frontend is running on `http://localhost:3000`

### Installation

1. Navigate to the server directory:
   ```bash
   cd apps/server
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure database (Supabase only):
   Set `DATABASE_URL=postgres://<user>:<pass>@db.<ref>.supabase.co:5432/postgres` (pooled or direct). Ensure it includes `sslmode=require` if not already present. All schema changes & migrations are applied via Drizzle (TypeScript) – this Go service does not run AutoMigrate.

5. Run the development server:
   ```bash
   go run main.go
   ```

   Or using npm/bun scripts:
   ```bash
   bun run dev
   ```

The server will start on `http://localhost:8080`

### Available Endpoints

- `GET /health` - Health check
- `GET /api/v1/ping` - Simple ping endpoint

### Build for Production

```bash
go build -o bin/server main.go
```

Then run:
```bash
./bin/server
```

## Project Structure

```
apps/server/
├── main.go          # Main application entry point
├── go.mod           # Go module file
├── .env.example     # Environment variables template
├── .gitignore       # Git ignore file
└── README.md        # This file
```

## Environment Variables

- `PORT` - Server port (default: 8080)
- `GIN_MODE` - Gin mode (debug/release)
- `CORS_ORIGINS` - Allowed CORS origins
- `DATABASE_URL` - Supabase Postgres connection string (required)

## Development

The server is configured to work seamlessly with the Next.js frontend in `apps/web`. CORS is pre-configured to allow requests from `http://localhost:3000`.
