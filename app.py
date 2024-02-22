from flask import Flask, jsonify, request
from flask_cors import CORS
from pyspark.sql import SparkSession

app = Flask(__name__)
CORS(app)

# Initialize Spark Session
spark = SparkSession.builder.appName('AeroSights').getOrCreate()

@app.route('/api/total-flights-range', methods=['POST'])
def total_flights_range():
    total_flights = 0

    data = request.get_json()
    start_date = data.get('start_year')
    end_date = data.get('end_year')
    df = spark.read.parquet('data/airline.parquet', header=True)

    if start_date is not None and end_date is not None:
        for i in range(start_date, end_date + 1):
            df_filtered = df.where(df['Year'] == i)
            total_flights += df_filtered.count()
        return jsonify({'total_flights': total_flights})
    else:
        return jsonify({'error': 'Start and end years not provided'})

@app.route('/api/total-flights-list', methods=['POST'])
def total_flights_list():
    total_flights = 0
    data = request.get_json()
    years = data.get('years')
    if years is not None:
        df = spark.read.parquet('data/airline.parquet', header=True)
        for year in years:
            df_filtered = df.where(df['Year'] == year)
            total_flights += df_filtered.count()
        return jsonify({'total_flights': total_flights})
    else:
        return jsonify({'error': 'Years not provided'})

if __name__ == '__main__':
    app.run(debug=True)
