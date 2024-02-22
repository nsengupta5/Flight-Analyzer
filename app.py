from flask import Flask, jsonify, request
from flask_cors import CORS
from pyspark.sql import SparkSession

app = Flask(__name__)
CORS(app)

# Initialize Spark Session
spark = SparkSession.builder.appName('AeroSights').getOrCreate()

@app.route('/api/total-flights-range', methods=['GET'])
def total_flights_range():
    total_flights = 0
    start_date = request.args.get('start_year', type=int)
    end_date = request.args.get('end_year', type=int)
    df = spark.read.parquet('data/airline.parquet', header=True)

    for i in range(start_date, end_date):
        df_filtered = df.where(df['Year'] == i)
        total_flights += df_filtered.count()

    return jsonify({'total_flights': total_flights})

@app.route('/api/total-flights-list', methods=['GET'])

def total_flights_list():
    total_flights = 0
    years = request.args.get('years', type=str)
    if years is not None:
        df = spark.read.parquet('data/airline.parquet', header=True)
        for i in range(years):
            year = int(years[i])
            df_filtered = df.where(df['Year'] == year)
            total_flights += df_filtered.count()

        return jsonify({'total_flights': total_flights})
    else:
        return jsonify({'error': 'Years not provided'})

if __name__ == '__main__':
    app.run(debug=True)
