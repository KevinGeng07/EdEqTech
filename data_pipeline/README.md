# Data Pipeline

The `data_pipeline` directory contains all scripts and data for processing college information and creating the matching algorithm dataset. This includes data cleaning, exploratory analysis, feature engineering, and visualization.

## Directory Structure

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

## Input Data (`data/`)

Two main datasets are processed:

1. **College Results Data** (`College Results View 2021 Data Dump for Export.xlsx`)
   - Contains comprehensive college information (academic metrics, enrollment, etc.)
   - Source: Educational database

2. **Affordability Gap Data** (`Affordability Gap Data AY2022-23 2.17.25.xlsx`)
   - Financial accessibility metrics for colleges
   - Disaggregated by demographics (race, gender, etc.)

## Python Scripts

### `EDA.py`
Performs exploratory data analysis on raw datasets.

**Key Functions**:
- `process_college_results()` - Cleans and analyzes college data
  - Removes rows/columns with 65%+ null values
  - Generates statistical summaries (25th, 50th, 75th percentiles, mean, std)
  - Outputs cleaned CSV to `exploratory/college_results.csv`

- `process_affordability_gap()` - Processes financial accessibility data
  - Handles missing values using KNN imputation
  - Outputs processed data to `exploratory/affordability_gap.csv`

**Outputs**:
- `exploratory/college_results.csv` - Cleaned college dataset
- `exploratory/college_results_table.txt` - Statistical summary table
- `exploratory/affordability_gap.csv` - Cleaned affordability metrics
- `exploratory/affordability_gap.txt` - Financial statistics table

### `data_construct.py`
Constructs the final dataset for the matching algorithm.

**Key Functions**:
- Data merging and integration
- Feature engineering and scaling
- Final dataset creation for matching algorithm

**Outputs**:
- `final/combined_filtered.csv` - Merged college and affordability data
- `final/processed_table.txt` - Final dataset summary

### `plot_viz.py`
Generates visualizations for insights and presentations.

**Visualizations**:
- `visualizations/tuition_msi_viz.jpg` - Tuition analysis for minority-serving institutions
- `visualizations/degree_race_viz.jpg` - Degree completion rates by race/ethnicity

## Dependencies

```
pip==24.2
numpy==2.3.4
pandas==2.3.3
scikit-learn==1.7.2
tabulate==0.9.0
plotly==6.4.0
kaleido==1.2.0
```

### Key Libraries
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical operations
- **scikit-learn**: KNN imputation for missing values
- **plotly/kaleido**: Interactive and static visualization
- **tabulate**: Formatted table output

## Workflow

1. **Data Preparation**
   ```bash
   python EDA.py        # Clean and analyze raw data
   ```
   - Handles missing values
   - Removes sparse features/rows
   - Generates statistical reports

2. **Data Construction**
   ```bash
   python data_construct.py  # Merge and engineer features
   ```
   - Combines multiple datasets
   - Creates matching algorithm features
   - Produces final dataset

3. **Visualization**
   ```bash
   python plot_viz.py    # Generate insights visualizations
   ```
   - Creates charts for presentation
   - Exports high-quality images

## Output Structure

### Exploratory Outputs (`exploratory/`)
- `college_results.csv` - Cleaned college data with statistics
- `college_results_table.txt` - Human-readable statistical summary
- `college_results_imputed.csv` - Data with imputed missing values
- `affordability_gap.csv` - Processed financial metrics
- `affordability_gap.txt` - Affordability statistics table
- `ag_results_imputed.csv` - Affordability data with imputation

### Final Outputs (`final/`)
- `combined_filtered.csv` - Final dataset for matching algorithm
- `processed_table.txt` - Summary of final dataset

### Visualizations (`visualizations/`)
High-resolution images showing:
- Tuition trends by institution type (MSI focus)
- Degree completion rates disaggregated by race/ethnicity

## Data Cleaning Notes

### Missing Value Handling
- **Initial filtering**: Removes rows/columns with >65% null values
- **Imputation**: KNN (K-Nearest Neighbors) imputation for remaining gaps
- **Preprocessing**: 'NA' strings replaced with np.nan for proper handling

### Feature Selection
Only columns with <65% missing values are retained to ensure data quality.

### Data Quality
- All rows contain some null values initially
- Final dataset is deduplicated and normalized
- Ready for machine learning matching algorithms

## Integration with Application

The final processed datasets (`combined_filtered.csv`) are used by:
- **Backend Server** (`application/server/utils/matching.py`)
- **Matching Algorithm** - Recommends top 3 colleges per student preferences
- **Frontend Display** - Visual scorecards and detailed comparisons

## Running the Pipeline

1. **Setup environment**:
   ```bash
   cd data_pipeline
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   pip install -r requirements.txt
   ```

2. **Execute pipeline**:
   ```bash
   python EDA.py           # ~1-2 minutes
   python data_construct.py # ~30 seconds
   python plot_viz.py      # ~1 minute
   ```

3. **Verify outputs**: Check `exploratory/` and `final/` directories

## Important Notes

- **Data Leakage**: Train/test splits should be created before ML training
- **Reproducibility**: Uses fixed random seeds for consistent results
- **Updates**: Re-run pipeline when source data is updated
