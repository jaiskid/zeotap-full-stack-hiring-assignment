# Incident Tracker - Full Stack Application

A production-ready incident management system built with Node.js/Express backend and React frontend, featuring server-side pagination, filtering, sorting, and real-time incident tracking.

## Table of Contents
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Backend](#backend)
- [Frontend](#frontend)
- [Design Decisions](#design-decisions)
- [Future Improvements](#future-improvements)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run seed  # Populate database with 200 incidents
npm run dev   # Start server on http://localhost:3001
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev   # Start dev server on http://localhost:3000
```

The frontend proxy is configured to forward API requests to the backend.

## Project Structure

```
incident-tracker/
├── backend/
│   ├── src/
│   │   ├── server.js       # Express app initialization
│   │   ├── db.js           # Database connection & helpers
│   │   ├── routes.js       # API route handlers
│   │   └── seed.js         # Database seeding script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx        # React entry point
│   │   ├── App.jsx         # Main app component with routing
│   │   ├── ListPage.jsx    # Incident list with filtering/sorting
│   │   ├── DetailPage.jsx  # Incident detail & edit
│   │   ├── components.jsx  # Reusable UI components
│   │   ├── api.js          # API client functions
│   │   └── index.css       # Tailwind-inspired styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

## API Overview

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### POST /incidents
Create a new incident.

**Request:**
```json
{
  "title": "API Timeout Errors",
  "service": "API Gateway",
  "severity": "SEV2",
  "status": "OPEN",
  "owner": "engineer-1",
  "summary": "Intermittent timeouts detected"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-string",
  "title": "API Timeout Errors",
  "service": "API Gateway",
  "severity": "SEV2",
  "status": "OPEN",
  "owner": "engineer-1",
  "summary": "Intermittent timeouts detected",
  "createdAt": "2024-02-14T10:30:00Z",
  "updatedAt": "2024-02-14T10:30:00Z"
}
```

**Validation:** 
- `title`: required, non-empty string
- `service`: required, non-empty string
- `severity`: required, one of [SEV1, SEV2, SEV3, SEV4]
- `status`: required, one of [OPEN, MITIGATED, RESOLVED]
- `owner`: optional string
- `summary`: optional string

---

#### GET /incidents
Fetch incidents with pagination, filtering, and sorting.

**Query Parameters:**
- `page` (int, default: 1) - Page number for pagination
- `limit` (int, default: 10, max: 100) - Results per page
- `sortBy` (string, default: createdAt) - Field to sort by
- `sortOrder` (string, default: DESC) - ASC or DESC
- `service` (string) - Filter by service name
- `severity` (string) - Filter by severity (SEV1-SEV4)
- `status` (string) - Filter by status (OPEN, MITIGATED, RESOLVED)
- `search` (string) - Full-text search on title, summary, owner

**Example:**
```
GET /incidents?page=2&limit=20&sortBy=severity&sortOrder=ASC&service=Database&status=OPEN
```

**Response:** `200 OK`
```json
{
  "incidents": [
    {
      "id": "uuid",
      "title": "Database Connection Pool Exhausted",
      "service": "Database",
      "severity": "SEV1",
      "status": "OPEN",
      "owner": "engineer-2",
      "summary": "Connection limit reached",
      "createdAt": "2024-02-14T09:00:00Z",
      "updatedAt": "2024-02-14T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---

#### GET /incidents/:id
Fetch a single incident by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "API Timeout Errors",
  "service": "API Gateway",
  "severity": "SEV2",
  "status": "OPEN",
  "owner": "engineer-1",
  "summary": "Intermittent timeouts detected",
  "createdAt": "2024-02-14T10:30:00Z",
  "updatedAt": "2024-02-14T10:30:00Z"
}
```

---

#### PATCH /incidents/:id
Update an incident. Only provided fields are updated.

**Request:**
```json
{
  "status": "MITIGATED",
  "summary": "Temporary workaround deployed"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "API Timeout Errors",
  "service": "API Gateway",
  "severity": "SEV2",
  "status": "MITIGATED",
  "owner": "engineer-1",
  "summary": "Temporary workaround deployed",
  "createdAt": "2024-02-14T10:30:00Z",
  "updatedAt": "2024-02-14T11:15:00Z"
}
```

---

## Backend

### Technology Stack
- **Framework:** Express.js
- **Database:** SQLite (for simplicity and portability)
- **Validation:** Custom validation in routes
- **Environment:** Node.js with ES Modules

### Database Schema
```sql
CREATE TABLE incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  service TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('SEV1', 'SEV2', 'SEV3', 'SEV4')),
  status TEXT NOT NULL CHECK(status IN ('OPEN', 'MITIGATED', 'RESOLVED')),
  owner TEXT,
  summary TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX idx_service ON incidents(service);
CREATE INDEX idx_status ON incidents(status);
CREATE INDEX idx_severity ON incidents(severity);
CREATE INDEX idx_createdAt ON incidents(createdAt);
```

### Key Features
- **Parameterized Queries:** All database queries use parameterized statements to prevent SQL injection
- **Async/Await:** Promise-based database operations with proper error handling
- **Validation:** Input validation on all endpoints with detailed error messages
- **Indexing:** Strategic indices on frequently filtered/sorted columns
- **CORS:** Enabled for frontend integration
- **Error Handling:** Centralized error middleware and try-catch blocks

### Database Operations
The `db.js` module provides async helpers:
- `initializeDatabase()` - Creates tables and indices
- `runAsync(sql, params)` - Execute INSERT/UPDATE/DELETE
- `getAsync(sql, params)` - Fetch single row
- `allAsync(sql, params)` - Fetch multiple rows

### Seeding
```bash
npm run seed
```
Populates the database with 200 realistic incidents using:
- Random service names from a predefined list
- Random severity levels (SEV1-SEV4)
- Random status values (OPEN, MITIGATED, RESOLVED)
- Random dates within the last 90 days
- Realistic titles and summaries

## Frontend

### Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Custom CSS (no framework dependencies)
- **State Management:** React Hooks (useState, useEffect, useCallback)

### Components

#### App (App.jsx)
Main component managing page navigation between list and detail views.

#### ListPage (ListPage.jsx)
- Incident table with sortable columns
- Real-time filtering by service, severity, status
- Debounced search (300ms) across title, summary, owner
- Server-side pagination with customizable page size
- Create incident modal with inline form validation
- Loading and error states

#### DetailPage (DetailPage.jsx)
- View full incident details
- Toggle edit mode with inline form validation
- Update incident with real-time feedback
- Auto-linked back to list with navigation preservation

#### Reusable Components (components.jsx)
- `IncidentList` - Table rendering with sort indicators
- `Pagination` - Numbered pagination with ellipsis
- `CreateIncidentModal` - Modal form for new incidents

### Key Features
- **Debounced Search:** 300ms debounce to avoid excessive API calls
- **Responsive Design:** Mobile-friendly with CSS Grid/Flexbox
- **Loading States:** Visual feedback during data fetching
- **Error Handling:** User-friendly error messages
- **Form Validation:** Client-side validation with error display
- **Accessibility:** Semantic HTML, proper labels, keyboard navigation

### Styling
Custom CSS-in-file (no build-time CSS-in-JS) with CSS custom properties for theming:
- Color palette for severity levels and status badges
- Responsive breakpoints for mobile
- Smooth transitions and hover states
- Dark-friendly color scheme

## Design Decisions

### 1. Database Choice: SQLite
**Decision:** Use SQLite instead of PostgreSQL/MySQL  
**Rationale:**
- Single-file database, no external service dependency
- Perfect for screening assessments and demos
- ACID compliant and suitable for small-to-medium datasets
- Can easily migrate to PostgreSQL with minimal changes

**Tradeoff:** SQLite performance at 1M+ records is lower than dedicated databases. For production, migrate to PostgreSQL.

### 2. Pagination Strategy: Server-Side
**Decision:** Implement pagination on the backend  
**Rationale:**
- Efficient for large datasets (200+ records)
- Reduces payload size
- Enables accurate total count and page calculations
- Standard REST practice

**Implementation:** 
- Calculate `OFFSET = (page - 1) * limit`
- Return total count for UI pagination controls
- Maximum 100 records per page to prevent abuse

### 3. Filtering & Sorting: Server-Side
**Decision:** All filtering and sorting done on backend  
**Rationale:**
- Scales with database size
- Single source of truth for data
- Reduces frontend complexity
- Enables indexing for performance

**Supported Filters:**
- Exact match: service, severity, status
- Full-text search: title, summary, owner (LIKE queries)
- Sortable fields: createdAt, updatedAt, severity, status, service, title

### 4. Validation Strategy: Multi-Layer
**Decision:** Validate on both backend and frontend  
**Rationale:**
- Frontend validation: instant user feedback
- Backend validation: prevent invalid data in database
- Security: never trust client input

**Validation Rules:**
```javascript
title: required, non-empty string
service: required, non-empty string
severity: enum [SEV1, SEV2, SEV3, SEV4]
status: enum [OPEN, MITIGATED, RESOLVED]
owner: optional string
summary: optional string
```

### 5. Search Debouncing: 300ms
**Decision:** Debounce search input with 300ms delay  
**Rationale:**
- Reduces API calls during rapid typing
- Improves perceived performance
- Standard UX pattern for search
- Prevents request storms

### 6. State Management: React Hooks
**Decision:** Use only React Hooks, no external state library  
**Rationale:**
- Simpler codebase for screening assessment
- Built-in to React, no dependencies
- Sufficient for current feature scope
- Easy to migrate to Redux/Zustand if needed

**State Organization:**
- `ListPage`: filters, incidents, pagination
- `DetailPage`: incident data, edit mode, save state
- Components: local UI state only

### 7. Styling: Custom CSS
**Decision:** No Tailwind, styled-components, or CSS-in-JS  
**Rationale:**
- Minimal dependencies
- Explicit and auditable styling
- CSS custom properties for theming
- Responsive with media queries

### 8. Error Handling: Structured
**Decision:** Return detailed error objects with validation details  
**Rationale:**
- Frontend can display field-specific errors
- Helps with debugging
- Better UX than generic error messages

**Example:**
```json
{
  "error": "Validation failed",
  "details": {
    "title": "Title is required and must be a non-empty string",
    "severity": "Severity must be one of: SEV1, SEV2, SEV3, SEV4"
  }
}
```

## Future Improvements

### High Priority (Production-Ready)
1. **Authentication & Authorization**
   - JWT-based auth with secure tokens
   - Role-based access control (viewer, editor, admin)
   - Audit logging of all changes

2. **Database Migration to PostgreSQL**
   - Use Knex.js or Prisma ORM
   - Connection pooling
   - Better concurrent access
   - Advanced indexing strategies

3. **API Response Caching**
   - Redis for incident list caching
   - Cache invalidation on updates
   - Reduce database load

4. **Error Recovery & Resilience**
   - Retry logic with exponential backoff
   - Connection health checks
   - Graceful degradation

5. **Comprehensive Testing**
   - Backend: Jest unit + integration tests
   - Frontend: Vitest + React Testing Library
   - API contract testing
   - E2E tests with Playwright

### Medium Priority (Enhanced Features)
6. **Real-Time Updates**
   - WebSocket/Server-Sent Events
   - Live incident notifications
   - Collaborative editing

7. **Advanced Search & Filtering**
   - Date range filters
   - Complex boolean queries
   - Saved filter presets
   - Export to CSV/PDF

8. **Incident Analytics**
   - Dashboard with trends
   - Mean time to resolution (MTTR)
   - Service health metrics
   - Alert/escalation rules

9. **Bulk Operations**
   - Bulk status updates
   - Bulk delete with confirmation
   - Batch assignments

10. **Data Import/Export**
    - Import incidents from external systems
    - Export audit trail
    - Integration with Slack/PagerDuty

### Lower Priority (Nice-to-Have)
11. **Performance Optimizations**
    - Virtual scrolling for large lists
    - Lazy loading of detail pages
    - Image/asset optimization
    - CDN caching

12. **Advanced UI/UX**
    - Dark mode toggle
    - Customizable dashboard
    - Notification badges
    - Keyboard shortcuts

13. **Observability**
    - Structured logging (Winston/Bunyan)
    - Metrics collection (Prometheus)
    - Distributed tracing
    - Health check endpoints

14. **Documentation**
    - API documentation (Swagger/OpenAPI)
    - Architecture decision records (ADRs)
    - Development guide
    - Deployment guide

## Running in Production

### Backend
```bash
# Use a proper Node process manager like PM2
npm install -g pm2
pm2 start src/server.js --name incident-tracker-api

# Or with environment variables
PORT=3001 NODE_ENV=production pm2 start src/server.js

# Enable auto-restart on system reboot
pm2 startup
pm2 save
```

### Frontend
```bash
# Build optimized production bundle
npm run build

# Serve with a static server
npm install -g serve
serve dist -l 3000
```

### Database Backup
```bash
# Regular backups
cp incidents.db incidents.db.backup-$(date +%Y%m%d-%H%M%S)
```

## Contributing
1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit with descriptive messages
3. Push and create Pull Request
4. Ensure all tests pass

## License
MIT

---

**Build Date:** February 2024  
**Total Estimated Time:** 6-10 hours  
**Status:** Production-Ready (with noted limitations)
