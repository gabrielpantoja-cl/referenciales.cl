# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IMPORTANT**: Referenciales.cl is an open and collaborative database of real estate transactions in Chile, based on data from the Conservador de Bienes Raíces. Its objective is to provide transparency and accessibility to this information for the Chilean real estate market.

Referenciales.cl is a Next.js 15 application for managing real estate appraisal references in Chile. It features:

- **Public API**: Unauthenticated endpoints for external integrations (e.g., pantojapropiedades.cl)
- **Private Dashboard**: Authenticated CRUD operations for real estate references
- **Advanced Statistics Module**: Interactive maps with area selection and comprehensive PDF reports
- **Google OAuth**: Exclusive authentication via Google accounts
- **PostGIS Integration**: Spatial data management with PostgreSQL + PostGIS
- **Real-time Data**: Interactive maps and geolocation features

## Development Commands

### Essential Commands
```bash
# Development server with turbo
npm run dev

# Build application (includes Prisma generation)
npm run build

# Database operations
npm run prisma:generate    # Generate Prisma client
npm run prisma:push       # Apply schema to database
npm run prisma:studio     # Open database browser

# Testing
npm run test              # Run Jest tests
npm run test:watch        # Watch mode
npm run test:api          # Test API endpoints
npm run test:public-api   # Test public API specifically

# Linting and type checking
npm run lint              # ESLint
npx tsc --noEmit         # TypeScript type checking
```

### Database Management
```bash
# Database reset sequence (use carefully)
npm run prisma:reset     # Generate + push schema
npm run seed             # Populate with sample data

# Health checks
npm run api:health       # Basic API health
npm run api:validate     # Validate public API
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: Prisma with spatial data support
- **Authentication**: NextAuth.js v4 (Google OAuth only)
- **UI**: Tailwind CSS with custom components
- **Maps**: React Leaflet with PostGIS geometry
- **Charts**: Recharts for statistical visualizations
- **PDF Generation**: jsPDF + html2canvas for comprehensive reports

### Directory Structure (src/)
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   │   ├── public/     # Public API (no auth required)
│   │   └── auth/       # NextAuth.js routes
│   ├── dashboard/      # Protected pages
│   │   └── estadisticas/ # Advanced Statistics Module
│   └── auth/           # Authentication pages
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   │   ├── estadisticas/ # Statistics module components
│   │   └── mapa/      # Map and chart components
│   ├── features/      # Feature-specific components
│   └── primitives/    # Base UI primitives
├── lib/               # Utilities and configurations
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── middleware.ts      # Route protection and CORS
```

### Import Patterns
Use absolute imports with configured aliases:
```typescript
// ✅ Correct
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/primitives/button'

// ❌ Incorrect
import { authOptions } from '../../../lib/auth.config'
```

## Critical System Components

### Authentication System
- **Provider**: Google OAuth 2.0 only
- **Configuration**: `src/lib/auth.config.ts` (NextAuth v4)
- **Session Strategy**: JWT with 24-hour expiration
- **Protection**: Middleware-based route protection
- **IMPORTANT**: Never modify schema relations from `user` to `User` - breaks NextAuth adapter

### Database Schema (Prisma)
- **User Management**: NextAuth.js compatible schema
- **Spatial Data**: `referenciales` table with PostGIS geometry
- **Relations**: Strict naming conventions required for NextAuth compatibility
- **Migration**: Use `npx prisma db push` for development, migrations for production
- **YOU MUST**: Always validate Chilean property data consistency (ROL, fojas, CBR numbers)
- **IMPORTANT**: Implement Row Level Security (RLS) for sensitive property data

### Public API Architecture
```
/api/public/
├── map-data/       # Geospatial real estate data
├── map-config/     # API metadata and configuration
├── health/         # System health checks
└── docs/          # Interactive API documentation
```

### Middleware Configuration
- **Public Routes**: `/api/public/*`, `/api/auth/*`, static assets
- **Protected Routes**: `/dashboard/*`, `/chatbot/*`, private APIs
- **CORS**: Enabled for public API endpoints (`*` origin)

## Common Workflows

### Adding New Real Estate References
1. Use protected dashboard at `/dashboard/referenciales/create`
2. CSV bulk upload available via `/dashboard/referenciales` page
3. Automatic geocoding via Google Maps API
4. PostGIS geometry automatically generated

### Database Schema Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run prisma:push` (development) or create migration (production)
3. **CRITICAL**: Maintain lowercase relation names (`user`, not `User`) for NextAuth compatibility
4. Run `npm run prisma:generate` to update client

### Testing Public API
```bash
# Automated testing
npm run test:public-api

# Manual testing
curl "http://localhost:3000/api/public/map-data?comuna=santiago&limit=5"
curl "http://localhost:3000/api/public/health?stats=true"
```

### Using Advanced Statistics Module
1. Access module at `/dashboard/estadisticas`
2. Navigate and search locations on interactive map
3. Use circle tool to select areas for analysis
4. Review real-time statistics and multiple chart types
5. Generate comprehensive PDF reports for CBR review

**Key Features:**
- **Interactive Map**: Circle selection with PostGIS spatial queries
- **Real-time Analytics**: 6 different chart types (scatter, trends, histograms)
- **Always-visible Statistics**: Price metrics, surface analysis, market trends
- **Comprehensive PDF Reports**: 3-page format optimized for property registry review
- **CBR Integration**: Complete field listing (fojas, número, año, CBR, ROL, etc.)

**PDF Report Structure:**
- Page 1: Executive summary and main chart (portrait)
- Page 2: Complete property table for CBR review (landscape)
- Page 3: Additional information and field explanations (portrait)

For detailed documentation, see `docs/ADVANCED_STATISTICS_MODULE_GUIDE.md`

## Environment Variables

### Required Variables
```env
POSTGRES_PRISMA_URL=postgresql://user:pass@host:port/db?schema=public
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://referenciales.cl
NEXTAUTH_SECRET=your_secure_random_secret
```

### Google OAuth Setup
- Authorized redirect URIs must include:
  - `https://referenciales.cl/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`

## Troubleshooting

### Authentication Issues
- Check `docs/AUTHENTICATION_GUIDE.md` for comprehensive debugging
- Verify Google Cloud Console redirect URIs match exactly
- Ensure all environment variables are set correctly
- Check middleware isn't blocking auth routes

### Database Connection Issues
```bash
# Verify database connection
npx prisma studio

# Reset database schema
npm run prisma:reset
```

### Build/Type Errors
```bash
# Clean and regenerate
npx prisma generate
rm -rf .next
npm run dev
```

### Public API CORS Issues
- Public API has CORS enabled for all origins
- Verify middleware configuration in `src/middleware.ts`
- Check API routes are under `/api/public/` path

## Security Considerations

- **Public API**: No authentication required, but excludes sensitive data
- **Rate Limiting**: Not currently implemented (consider for production)
- **Data Sanitization**: All public API responses exclude personal information
- **CSP Headers**: Configured in `next.config.js` for security
- **Input Validation**: All API endpoints validate query parameters
- **IMPORTANT**: Follow OWASP guidelines for SQL injection, XSS, and CSRF prevention
- **YOU MUST**: Regular security audits for Chilean property data protection
- **Compliance**: Adhere to Chilean data protection laws for property information

## References

- **Authentication**: `docs/AUTHENTICATION_GUIDE.md` - Comprehensive auth debugging guide
- **Public API**: `docs/PUBLIC_API_GUIDE.md` - Complete API integration guide  
- **Advanced Statistics**: `docs/ADVANCED_STATISTICS_MODULE_GUIDE.md` - Complete statistics module documentation
- **Development**: `docs/DEVELOPMENT_GUIDE.md` - Development patterns and conventions
- **Database Schema**: `docs/DATABASE_SCHEMA_GUIDE.md` - Schema structure and relationships