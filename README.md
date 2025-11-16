# EquiMatch: College Matching for Underserved Students

## Project Overview

EquiMatch is a college matching platform designed to help underserved students find their perfect college based on personalized criteria. Students input factors such as location, race, gender, and other preferences. The platform uses an intelligent matching algorithm to recommend the top 3 best-fit colleges, displaying comprehensive visual scorecards and descriptions for each choice.

### Mission
To improve educational equity by empowering underserved students with data-driven college recommendations that consider their unique circumstances and preferences.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Data Pipeline](#data-pipeline)
4. [Application](#application)
5. [Getting Started](#getting-started)
6. [How It Works](#how-it-works)
7. [Key Features](#key-features)

---

## Project Structure

```
EquiMatch/
├── application/               # Frontend and backend application
│   ├── frontend/             # Next.js React web interface
│   ├── server/               # FastAPI backend server
│   └── README.md             # Application documentation
├── data_pipeline/            # Data processing and preparation
│   ├── data/                 # Raw input datasets
│   ├── exploratory/          # EDA outputs
│   ├── final/                # Final processed datasets
│   ├── visualizations/       # Generated charts
│   ├── EDA.py                # Exploratory analysis script
│   ├── data_construct.py     # Data construction script
│   ├── plot_viz.py           # Visualization script
│   ├── requirements.txt       # Python dependencies
│   └── README.md             # Data pipeline documentation
├── Datathon Project.pptx     # Project presentation
└── README.md                 # This file
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15.3.3 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI
- **Charts**: Recharts 2.15.1
- **Forms**: React Hook Form with Zod validation
- **Maps**: Google Maps API
- **AI Integration**: Google Genkit
- **Backend Services**: Firebase 11.9.1

### Backend
- **Framework**: FastAPI with Uvicorn
- **Language**: Python 3
- **CORS**: Middleware configured for frontend
- **Logging**: Application logs to `app.log`

### Data Pipeline
- **Data Processing**: Pandas, NumPy
- **Machine Learning**: scikit-learn (KNN imputation)
- **Visualization**: Plotly, Kaleido
- **Utilities**: Tabulate for formatted output

---

## Data Pipeline

The data pipeline processes college information and creates the dataset used by the matching algorithm.

### Directory Structure

```
data_pipeline/
├── data/                          # Raw input datasets
├── exploratory/                   # EDA outputs and intermediate results
├── final/                         # Final processed datasets
├── visualizations/                # Generated charts and visualizations
├── requirements.txt               # Python dependencies
├── EDA.py                         # Exploratory data analysis
├── data_construct.py              # Data processing and construction
└── plot_viz.py                    # Visualization generation
```

### Input Data

Two main datasets are processed:

1. **College Results Data** (`College Results View 2021 Data Dump for Export.xlsx`)
   - Comprehensive college information (academic metrics, enrollment, etc.)

2. **Affordability Gap Data** (`Affordability Gap Data AY2022-23 2.17.25.xlsx`)
   - Financial accessibility metrics disaggregated by demographics (race, gender, etc.)

### Pipeline Scripts

#### `EDA.py` - Exploratory Data Analysis
Cleans and analyzes raw datasets:
- Removes rows/columns with >65% null values
- Generates statistical summaries
- Creates cleaned datasets for downstream processing

**Key Outputs**:
- `exploratory/college_results.csv` - Cleaned college dataset
- `exploratory/affordability_gap.csv` - Cleaned financial metrics
- Statistical summary tables (`.txt`)

#### `data_construct.py` - Data Construction
Merges and engineers features for the matching algorithm:
- Combines college results and affordability datasets
- Creates normalized features
- Produces final dataset

**Key Outputs**:
- `final/combined_filtered.csv` - Final dataset for matching algorithm
- `final/processed_table.txt` - Dataset summary

#### `plot_viz.py` - Visualization Generation
Creates insights visualizations:
- Tuition analysis by institution type (MSI focus)
- Degree completion rates by race/ethnicity

### Dependencies

```
pip==24.2
numpy==2.3.4
pandas==2.3.3
scikit-learn==1.7.2
tabulate==0.9.0
plotly==6.4.0
kaleido==1.2.0
```

### Running the Data Pipeline

```bash
cd data_pipeline
python -m venv venv
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt

# Execute pipeline
python EDA.py             # Clean and analyze raw data (~1-2 minutes)
python data_construct.py  # Create final dataset (~30 seconds)
python plot_viz.py        # Generate visualizations (~1 minute)
```

### Data Quality

- Missing values handled via KNN imputation
- Feature selection ensures data completeness
- Final dataset is deduplicated and normalized
- Ready for machine learning matching algorithms

---

## Application

The application consists of a modern frontend and a powerful backend API.

### Frontend (`application/frontend/`)

Interactive Next.js web application for college discovery:

**Key Features**:
- Multi-factor preference selection (location, demographics, academic criteria)
- Real-time college ranking and matching
- Visual scorecards with college comparisons
- Chat interface for detailed school information
- Responsive design for mobile and desktop

**Development**:
```bash
cd application/frontend
npm install
npm run dev        # Start dev server on port 9002
npm run build      # Production build
npm run typecheck  # Type checking
npm run lint       # Linting
```

**Configuration Files**:
- `next.config.ts` - Next.js settings
- `tailwind.config.ts` - Tailwind CSS theme
- `tsconfig.json` - TypeScript configuration
- `apphosting.yaml` - Firebase hosting config

### Backend Server (`application/server/`)

FastAPI server handling college matching logic and API requests.

**Key Components**:
- **`server.py`** - Main FastAPI application
  - CORS middleware for frontend communication
  - API endpoint handlers

- **`utils/` Directory** - Helper modules:
  - `filter_dataset.py` - Filter colleges by user criteria
  - `geocoding.py` - Convert locations to coordinates
  - `matching.py` - College matching algorithm
  - `chatbot.py` - AI-powered college chatbot
  - `image_scraper.py` - Fetch college images

**Configuration**:
- Frontend Port: 9002
- Backend Port: 8000
- Logging: `app.log`

**Key API Endpoint**:

`POST /get_ranking` - Retrieve ranked college recommendations

Request:
```json
{
  "place_id": "string",
  "k": number,
  "param": {...},
  "major": "string",
  "race": "string"
}
```

Response:
```json
{
  "location": {"lat": number, "lng": number},
  "schools": ["school1", "school2", "school3"],
  "similarities": [0.95, 0.87, 0.78],
  "schoolImageUrls": ["url1", "url2", "url3"]
}
```

**Development**:
```bash
cd application/server
# Ensure Python venv is activated
python server.py  # Start server on port 8000
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.8+ (for backend and data pipeline)
- npm or yarn (for frontend package management)

### Quick Start

1. **Setup Data Pipeline** (one-time):
   ```bash
   cd data_pipeline
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python EDA.py
   python data_construct.py
   python plot_viz.py
   ```

2. **Start Backend Server** (Terminal 1):
   ```bash
   cd application/server
   python server.py
   ```

3. **Start Frontend** (Terminal 2):
   ```bash
   cd application/frontend
   npm install
   npm run dev
   ```

4. **Access Application**:
   Open http://localhost:9002 in your browser

---

## How It Works

### User Flow

1. **Student Preferences Input**
   - User enters location, demographics, academic interests
   - Frontend sends request to backend API

2. **College Matching**
   - Backend processes user preferences
   - Queries processed college dataset
   - Applies matching algorithm to rank colleges

3. **Results Display**
   - Top 3 colleges returned to frontend
   - Visual scorecards generated for each college
   - Detailed information and comparisons displayed

### Data Flow

```
Raw Data (Excel)
       ↓
[Data Pipeline: EDA.py]
       ↓
Cleaned & Analyzed Data
       ↓
[Data Pipeline: data_construct.py]
       ↓
Final Dataset (combined_filtered.csv)
       ↓
[Backend: matching.py]
       ↓
Ranked Colleges
       ↓
[Frontend: Display Scorecards]
```

---

## Key Features

### Data-Driven Matching
- Uses comprehensive college data across 100+ metrics
- Considers demographic factors and equity metrics
- Includes affordability and accessibility data

### Equity Focus
- Analyzes degree completion rates by race/ethnicity
- Identifies minority-serving institutions (MSIs)
- Highlights tuition affordability metrics

### User-Centric Design
- Multi-factor preference selection
- Transparent matching explanations
- Visual comparison of college options

### Scalability
- Modular architecture (frontend/backend/data)
- RESTful API for easy integration
- Processed dataset enables fast matching

---

## Development Notes

### Data Pipeline
- Train/test splits should be created before ML training
- Re-run pipeline when source data is updated
- Uses fixed random seeds for reproducibility

### Backend
- CORS configured for frontend on port 9002
- Logging enabled for debugging
- Modular utilities for easy testing

### Frontend
- TypeScript for type safety
- Tailwind CSS for consistent styling
- Component-based architecture for reusability

---

## Project Files

- **`README.md`** (root) - This comprehensive documentation
- **`application/README.md`** - Detailed frontend and backend documentation
- **`data_pipeline/README.md`** - Detailed data pipeline documentation
- **`Datathon Project.pptx`** - Project presentation slides

---

## Next Steps / Future Enhancements

- Integrate additional data sources
- Implement user accounts and saved preferences
- Add more detailed college comparison tools
- Enhance AI chatbot capabilities
- Deploy to production environment

---

## Support

For issues or questions, refer to the relevant subdirectory README:
- Frontend/Backend: See `application/README.md`
- Data Processing: See `data_pipeline/README.md`

For detailed contributions and feedback, check the project presentation (`Datathon Project.pptx`).
