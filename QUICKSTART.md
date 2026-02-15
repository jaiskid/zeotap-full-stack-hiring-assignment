# Incident Tracker - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Backend Dependencies
```bash
cd incident-tracker/backend
npm install
```

### Step 2: Seed the Database
```bash
npm run seed
```
This creates `incidents.db` and populates it with 200 sample incidents.

**Expected output:**
```
Connected to SQLite database
Seeding database with 200 incidents...
✓ Successfully seeded 200 incidents
✓ Database contains 200 incidents
```

### Step 3: Start the Backend Server
```bash
npm run dev
```

**Expected output:**
```
Connected to SQLite database
✓ Server running on http://localhost:3001
✓ API: http://localhost:3001/api/incidents
```

### Step 4: Install Frontend Dependencies
Open a new terminal:
```bash
cd incident-tracker/frontend
npm install
```

### Step 5: Start the Frontend Dev Server
```bash
npm run dev
```

**Expected output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### Step 6: Open in Browser
Visit `http://localhost:3000` in your browser. You should see the Incident Tracker with 200 sample incidents loaded.

## What You Can Do

### Browse Incidents
- **View table** of all incidents with pagination
- **Sort by** any column (Title, Service, Severity, Status, Created)
- **Filter by** Service, Severity, or Status
- **Search** across title, summary, and owner using the search box

### Create Incidents
1. Click **"+ New Incident"** button
2. Fill in the form:
   - Title (required)
   - Service (required)
   - Severity (required)
   - Status (required)
   - Owner (optional)
   - Summary (optional)
3. Click "Create Incident"

### View & Edit Details
1. Click **"View"** button on any incident row
2. Click **"Edit"** button in detail page
3. Modify any field
4. Click **"Save Changes"**

## API Testing

### Test Backend Directly
Use curl or Postman:

```bash
# Get first 10 incidents
curl "http://localhost:3001/api/incidents?page=1&limit=10"

# Filter by service
curl "http://localhost:3001/api/incidents?service=Database"

# Create incident
curl -X POST http://localhost:3001/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Incident",
    "service": "Test Service",
    "severity": "SEV2",
    "status": "OPEN",
    "summary": "This is a test"
  }'

# Get specific incident
curl "http://localhost:3001/api/incidents/{incident-id}"

# Update incident
curl -X PATCH http://localhost:3001/api/incidents/{incident-id} \
  -H "Content-Type: application/json" \
  -d '{"status": "RESOLVED"}'
```

## File Structure

```
incident-tracker/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── server.js       # Express app
│   │   ├── db.js           # Database setup
│   │   ├── routes.js       # API endpoints
│   │   └── seed.js         # Database seed script
│   ├── package.json
│   └── incidents.db        # SQLite database (created after seed)
│
├── frontend/               # React UI
│   ├── src/
│   │   ├── App.jsx         # Main component
│   │   ├── ListPage.jsx    # Incident list
│   │   ├── DetailPage.jsx  # Incident details
│   │   ├── components.jsx  # Reusable components
│   │   ├── api.js          # API client
│   │   ├── index.css       # Styles
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md               # Full documentation
```

## Troubleshooting

### Port Already in Use
If port 3000 or 3001 is already in use:

**Backend (change port):**
```bash
PORT=3002 npm run dev
```

**Frontend (change port in vite.config.js):**
```javascript
server: {
  port: 3001,  // Change this
  proxy: {
    '/api': {
      target: 'http://localhost:3002',  // Match backend port
      changeOrigin: true
    }
  }
}
```

### Database Reset
Delete the database and reseed:
```bash
rm backend/incidents.db
cd backend
npm run seed
```

### CORS Errors
If frontend can't reach backend API:
1. Ensure backend is running on `http://localhost:3001`
2. Check vite.config.js proxy configuration
3. Clear browser cache and reload

### Module Not Found Errors
Reinstall dependencies:
```bash
# Backend
cd backend && rm -rf node_modules && npm install

# Frontend
cd frontend && rm -rf node_modules && npm install
```

## Development Notes

### Hot Reload
- **Backend:** Changes auto-reload with `npm run dev` (nodemon)
- **Frontend:** Changes auto-refresh with Vite

### Adding New Features
See the main README.md for architecture details and future improvements.

### Production Build
```bash
# Frontend
npm run build  # Creates dist/ folder

# Backend - no special build needed, just run directly
node src/server.js
```

## Next Steps

1. **Explore the code** - Read comments in key files
2. **Read the README** - Comprehensive API and design documentation
3. **Modify & experiment** - Try adding features
4. **Deploy** - See README.md production section

## Common Commands

```bash
# Backend
npm run dev          # Start with hot reload
npm run seed        # Populate database
npm start           # Start without hot reload

# Frontend
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

Enjoy building! 🚀
