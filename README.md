# InFlight: Visualizing & Analyzing Air Traffic Data

## Prerequisites
- Python >= 3.6
- Miniconda or Anaconda
- Node.js >= 12.0.0

## Setup Instructions
1. Clone the repository
2. Create the Conda environment: `conda env create -f environment.yml -n inflight`
3. Navigate to the frontend directory: `cd frontend`
4. Install the frontend dependencies: `npm install`
5. Navigate to the scripts directory in the backend folder: `cd backend/scripts`
6. Activate the Conda environment: `conda activate inflight`
7. Run the script to convert the CSV data to parquet files: `python convert.py`

## Running the Application
1. Navigate to the backend directory: `cd backend` and run the backend server: `python app.py`
2. Navigate to the frontend directory: `cd frontend` and run the frontend server: `npm start`
