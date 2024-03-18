from flask import jsonify, request
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from . import part1_blueprint as bp

airline_data = 'data/airline.parquet'
cancellation_mapping = 'data/L_CANCELLATION.parquet'

# Get Spark Session
spark = SparkSession.builder.appName('AeroSights').getOrCreate()

# Main airline dataframe
airline_df = spark.read.parquet(airline_data, header=True)

@bp.route('/api/total-flights-year', methods=['POST'])
def total_flights_year():
    total_flights = 0

    data = request.get_json()
    year = data.get('year')

    if year is not None:
        total_flights = airline_df.filter(airline_df['Year'] == year).count()
        return jsonify({'total_flights': total_flights})
    else:
        return jsonify({'error': 'Year not provided'})

@bp.route('/api/total-flights-range', methods=['POST'])
def total_flights_range():
    total_flights = 0

    data = request.get_json()
    start_date = data.get('start_year')
    end_date = data.get('end_year')

    if start_date is not None and end_date is not None:
        total_flights = airline_df.filter(airline_df['Year'] >= start_date).filter(airline_df['Year'] <= end_date).count()
        return jsonify({'total_flights': total_flights})
    else:
        return jsonify({'error': 'Start and end years not provided'})

@bp.route('/api/total-flights-list', methods=['POST'])
def total_flights_list():
    total_flights = 0
    data = request.get_json()
    years = data.get('years')
    if years is not None:
        total_flights = airline_df.filter(airline_df['Year'].isin(years)).count()
        return jsonify({'total_flights': total_flights})
    else:
        return jsonify({'error': 'Years not provided'})

@bp.route('/api/flight-timeliness-stats', methods=['POST'])
def flight_timeliness_stats():
    data = request.get_json()
    year = data.get('year')
    total_flights = airline_df.where(airline_df['Year'] == year).count()
    on_time_flights = airline_df.where((airline_df['Year'] == year) & (airline_df['DepDelay'] == 0)).count()
    delayed_flights = airline_df.where((airline_df['Year'] == year) & (airline_df['DepDelay'] > 0)).count()
    early_flights = airline_df.where((airline_df['Year'] == year) & (airline_df['DepDelay'] < 0)).count()
    unknown_flights = total_flights - (on_time_flights + delayed_flights + early_flights)
    return jsonify({
        'total_flights': total_flights,
        'on_time_flights': on_time_flights,
        'delayed_flights': delayed_flights,
        'early_flights': early_flights,
        'unknown_flights': unknown_flights
    })

# Provide the top reasons for flight cancellations for a given year
@bp.route('/api/top-cancellation-reason', methods=['POST'])
def cancellation_reasons():
    data = request.get_json()
    year = data.get('year')
    if year is not None:
        cancellation_df = spark.read.parquet(cancellation_mapping, header=True)

        # Join the airline_df and cancellation_df on the CancellationCode
        joined_df = airline_df.join(cancellation_df, airline_df.CancellationCode == cancellation_df.Code, "inner")

        # Filter the joined_df for the given year
        filtered_df = joined_df.where(joined_df['Year'] == year)

        # Group by the cancellation reason and count the number of cancellations
        cancellation_reasons = (
            filtered_df.groupBy('Description')
            .count()
            .orderBy('count', ascending=False)
            .limit(1)
            .collect()
        )

        # Convert the cancellation reasons to a dictionary
        if cancellation_reasons:
            max_reason = cancellation_reasons[0]['Description']
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

@bp.route('/api/most-punctual-airports', methods=['POST'])
def most_punctual_airports():
    most_punctual_airports = []

    data = request.get_json()
    year = data.get('year')
    if year is not None:
        airport_df = spark.read.parquet('data/L_AIRPORT_ID.parquet', header=True)
        airline_df_by_year = airline_df.where(airline_df['Year'] == year)
        medians_df = airline_df_by_year.groupBy('OriginAirportID').agg(
            F.median("DepDelay")).withColumnRenamed(
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

@bp.route('/api/worst-performing-airlines', methods=['GET'])
def worst_performing_airlines():
    airline_mapping = spark.read.parquet('data/L_AIRLINE_ID.parquet', header=True)

    reporting_airlines = airline_df.groupBy('DOT_ID_Reporting_Airline').agg(
        (F.sum(F.when(F.col('DepDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('PercentageDepDelayedFlights'),
        (F.sum(F.when(F.col('ArrDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('PercentageArrDelayedFlights'),
        (F.sum(F.when(F.col('Cancelled') == 1, 1).otherwise(0)) / F.count('*')).alias('PercentageCancelledFlights')
    )

    performance_df = reporting_airlines.withColumn(
        "CompositePercentage",
        (F.col("PercentageDepDelayedFlights") + F.col("PercentageArrDelayedFlights") + F.col("PercentageCancelledFlights")) / 3
    ).orderBy("CompositePercentage", ascending=False).limit(3)

    # Get the names of the worst perfoming airlines
    airlines = performance_df.join(F.broadcast(airline_mapping),
                                   performance_df.DOT_ID_Reporting_Airline == airline_mapping.Code,
                                   'inner').select('Description').collect()

    # Get the top 3 worst perfoming airlines
    worst_perfoming_airlines = [airline['Description'] for airline in airlines]
    return jsonify({'worst_performing_airlines': worst_perfoming_airlines})
