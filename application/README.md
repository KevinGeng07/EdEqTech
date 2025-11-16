# Application

The `application` directory contains both the frontend and backend for the EdEqTech platform - a college matching system that helps underserved students find their ideal college.

## Directory Structure

```
application/
├── frontend/          # Next.js React frontend application
└── server/            # FastAPI Python backend server
```

## Frontend (`frontend/`)

### Overview
Next.js web application built with React, TypeScript, and Tailwind CSS. Provides an interactive user interface for students to input preferences and discover college matches.

### Technology Stack
- **Framework**: Next.js 15.3.3 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI (accordion, dialog, dropdown, tabs, etc.)
- **Charts**: Recharts 2.15.1
- **Forms**: React Hook Form with Zod validation
- **Maps**: Google Maps API (@vis.gl/react-google-maps)
- **AI Integration**: Google Genkit for AI features
- **Backend**: Firebase 11.9.1

### Key Features
- Interactive preference selection (location, race, gender, etc.)
- Real-time college ranking and matching
- Visual scorecards for college recommendations
- Chat interface for detailed school information
- Responsive design for mobile and desktop

### Development
```bash
cd frontend
npm install
npm run dev              # Start dev server on port 9002
npm run build           # Production build
npm run typecheck       # Type checking
npm run lint            # Linting
```

### Configuration Files
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS theme
- `tsconfig.json` - TypeScript settings
- `apphosting.yaml` - Firebase hosting configuration

---

## Server (`server/`)

### Overview
FastAPI backend server that handles college matching logic, geocoding, filtering, and AI-powered recommendations. Connects the frontend to processed college datasets.

### Technology Stack
- **Framework**: FastAPI with Uvicorn
- **Language**: Python
- **CORS**: Enabled for frontend on port 9002

### Key Components
- **`server.py`** - Main FastAPI application
  - `POST /get_ranking` - Returns ranked colleges based on user location and preferences
  - CORS middleware configured for frontend communication

- **`utils/` Directory** - Helper modules:
  - `filter_dataset.py` - Filter colleges by user criteria
  - `geocoding.py` - Convert locations to coordinates
  - `matching.py` - College matching algorithm
  - `chatbot.py` - AI chatbot for college queries
  - `image_scraper.py` - Fetch college images

### Configuration
- **Frontend Port**: 9002
- **Server Port**: 8000
- **Logging**: Configured to `app.log`

### Development
```bash
cd server
# Ensure Python venv is activated
python server.py        # Start FastAPI server on port 8000
```

### API Endpoints

#### POST `/get_ranking`
Retrieves ranked college recommendations based on user criteria.

**Request Format**:
```json
{
  "place_id": "string",
  "k": number,
  "param": {...},
  "major": "string",
  "race": "string"
}
```

**Response**:
```json
{
  "location": {"lat": number, "lng": number},
  "schools": ["school1", "school2", ...],
  "similarities": [0.95, 0.87, ...],
  "schoolImageUrls": ["url1", "url2", ...]
}
```

---

## Communication Flow

1. **Frontend** (Next.js on port 9002)
   - User inputs college preferences
   - Sends requests to backend API

2. **Server** (FastAPI on port 8000)
   - Processes user input
   - Queries data pipeline results
   - Returns ranked colleges with metadata

3. **Data Source**
   - Uses processed college datasets from `data_pipeline/`

---

## Running the Full Application

1. **Start the server**:
   ```bash
   cd application/server
   python server.py
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd application/frontend
   npm run dev
   ```

3. **Access the application**: http://localhost:9002
