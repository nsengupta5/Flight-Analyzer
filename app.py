from flask import Flask, jsonify, request
from flask_cors import CORS
from pyspark.sql import SparkSession

app = Flask(__name__)
CORS(app)

airline_data = 'data/airline.parquet'
cancellation_mapping = 'data/L_CANCELLATION.parquet'

# Initialize Spark Session
spark = SparkSession.builder.appName('AeroSights').getOrCreate()

@app.route('/api/total-flights-range', methods=['POST'])
def total_flights_range():
    total_flights = 0

    data = request.get_json()
    start_date = data.get('start_year')
    end_date = data.get('end_year')
    df = spark.read.parquet(airline_data, header=True)

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
        df = spark.read.parquet(airline_data, header=True)
        for year in years:
            df_filtered = df.where(df['Year'] == year)
            total_flights += df_filtered.count()
        return jsonify({'total_flights': total_flights})
    else:
        return jsonify({'error': 'Years not provided'})

@app.route('/api/flight-timeliness-stats', methods=['POST'])
def flight_timeliness_stats():
    data = request.get_json()
    year = data.get('year')
    df = spark.read.parquet(airline_data, header=True)
    total_flights = df.where(df['Year'] == year).count()
    on_time_flights = df.where((df['Year'] == year) & (df['DepDelay'] == 0)).count()
    delayed_flights = df.where((df['Year'] == year) & (df['DepDelay'] > 0)).count()
    early_flights = total_flights - on_time_flights - delayed_flights
    return jsonify({
        'total_flights': total_flights,
        'on_time_flights': on_time_flights,
        'delayed_flights': delayed_flights,
        'early_flights': early_flights
    })

@app.route('/api/cancellation-reasons', methods=['POST'])
def cancellation_reasons():
    data = request.get_json()
    year = data.get('year')
    if year is not None:
        airline_df = spark.read.parquet(airline_data, header=True)
        cancellation_df = spark.read.parquet(cancellation_mapping, header=True)
    return jsonify({'error': 'Year not provided'})

if __name__ == '__main__':
    app.run(debug=True)
