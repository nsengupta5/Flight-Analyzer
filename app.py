from flask import Flask, jsonify, request
from flask_cors import CORS
from pyspark.sql import SparkSession
from pyspark.sql.functions import median

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

# Provide the top reasons for flight cancellations for a given year
@app.route('/api/top-cancellation-reason', methods=['POST'])
def cancellation_reasons():
    data = request.get_json()
    year = data.get('year')
    if year is not None:
        airline_df = spark.read.parquet(airline_data, header=True)
        cancellation_df = spark.read.parquet(cancellation_mapping, header=True)

        # Join the airline_df and cancellation_df on the CancellationCode
        joined_df = airline_df.join(cancellation_df, airline_df.CancellationCode == cancellation_df.Code, "inner")

        # Filter the joined_df for the given year
        filtered_df = joined_df.where(joined_df['Year'] == year)

        # Group by the cancellation reason and count the number of cancellations
        cancellation_reasons = filtered_df.groupBy('Description').count().collect()

        # Convert the cancellation reasons to a dictionary
        if cancellation_reasons:
            reasons = {}
            for reason in cancellation_reasons:
                reasons[reason['Description']] = reason['count']

            max_reason = max(reasons, key=reasons.get)
            return jsonify({'top_reason': max_reason})
        else:
            return jsonify({'top_reason': 'Unknown'})
        
    return jsonify({'error': 'Year not provided'})

def replaceStateAbbreviation(airport):
    df = spark.read.parquet('data/L_STATE_ABR_AVIATION.parquet', header=True)
    airport_arr = airport.split(':')
    state = airport_arr[0].split(',')[-1].strip()
    state_full = df.where(df['Code'] == state).select('Description').collect()[0]['Description']
    full_airport = airport_arr[0].replace(state, state_full)

    return full_airport + ': ' + airport_arr[1]

@app.route('/api/most-punctual-airports', methods=['POST'])
def most_punctual_airports():
    most_punctual_airports = []

    data = request.get_json()
    year = data.get('year')
    if year is not None:
        airline_df = spark.read.parquet(airline_data, header=True)
        airport_df = spark.read.parquet('data/L_AIRPORT_ID.parquet', header=True)

        airline_df = airline_df.where(airline_df['Year'] == year)
        medians_df = airline_df.groupBy('OriginAirportID').agg(
            median("DepDelay")).withColumnRenamed(
            "median(DepDelay)", "MedianDepDelay").orderBy(
            "MedianDepDelay", ascending=True).limit(3)
        
        joined_df = medians_df.join(airport_df, medians_df.OriginAirportID == airport_df.Code, "inner")

        # Get the names of the most punctual airports
        airports = joined_df.select('Description').collect()

        for airport in airports:
            airport_full_state = replaceStateAbbreviation(airport['Description'])
            most_punctual_airports.append(airport_full_state)
        
        return jsonify({'most_punctual_airports': most_punctual_airports})
    else:
        return jsonify({'error': 'Year not provided'})

if __name__ == '__main__':
    app.run(debug=True)
