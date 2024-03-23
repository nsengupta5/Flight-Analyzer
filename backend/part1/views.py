from flask import jsonify, request
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from . import part1_blueprint as bp
from .helper import replaceStateAbbreviation

# Get Spark Session
spark = SparkSession.builder.appName('InFlight').getOrCreate()

# Main airline dataframe
airline_df = spark.read.parquet('data/airline.parquet', header=True)

"""
Returns the total number of flights for a given year

Parameters:
    JSON request object containing:
        year (int): The year for which to get the total number of flights

Returns:
    JSON response object containing:
        total_flights (int): The total number of flights for the given year
        error (str): An error message if the year is not provided
"""
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

"""
Returns the total number of flights for a given range of years

Parameters:
    JSON request object containing:
        start_year (int): The start year for the range
        end_year (int): The end year for the range

Returns:
    JSON response object containing:
        total_flights (int): The total number of flights for the given range of years
        error (str): An error message if the start and end years are not provided
"""
@bp.route('/api/total-flights-range', methods=['POST'])
def total_flights_range():
    total_flights = 0

    data = request.get_json()
    start_date = data.get('start_year')
    end_date = data.get('end_year')

    if start_date is not None and end_date is not None:
        # Get the total number of flights for the given range of years
        total_flights = (
            airline_df
            .filter(airline_df['Year'] >= start_date)
            .filter(airline_df['Year'] <= end_date)
            .count()
        )
        return jsonify({'total_flights': total_flights})
    else:
        return jsonify({'error': 'Start and end years not provided'})

"""
Returns the total number of flights for a given list of years

Parameters:
    JSON request object containing:
        years (list): A list of years for which to get the total number of flights

Returns:
    JSON response object containing:
        total_flights (int): The total number of flights for the given list of years
        error (str): An error message if the years are not provided
"""
@bp.route('/api/total-flights-list', methods=['POST'])
def total_flights_list():
    total_flights = 0
    data = request.get_json()
    years = data.get('years')
    if years is not None:
        # Get the total number of flights for the given list of years
        total_flights = (
            airline_df
            .filter(airline_df['Year'].isin(years))
            .count()
        )
        return jsonify({'total_flights': total_flights})
    else:
        return jsonify({'error': 'Years not provided'})

"""
Returns the number of on-time, delayed, early, and unknown flights for a given year

Parameters:
    JSON request object containing:
        year (int): The year for which to get the flight timeliness stats

Returns:
    JSON response object containing:
        total_flights (int): The total number of flights for the given year
        on_time_flights (int): The number of on-time flights for the given year
        delayed_flights (int): The number of delayed flights for the given year
        early_flights (int): The number of early flights for the given year
        unknown_flights (int): The number of unknown flights for the given year
        error (str): An error message if the year is not provided
"""
@bp.route('/api/flight-timeliness-stats', methods=['POST'])
def flight_timeliness_stats():
    data = request.get_json()
    year = data.get('year')
    total_flights = airline_df.where(airline_df['Year'] == year).count()

    # Get the number of on-time, delayed, and early flights for the given year
    on_time_flights = (
        airline_df
        .where((airline_df['Year'] == year) & (airline_df['DepDelay'] == 0))
        .count()
    )
    delayed_flights = (
        airline_df
        .where((airline_df['Year'] == year) & (airline_df['DepDelay'] > 0))
        .count()
    )
    early_flights = (
        airline_df
        .where((airline_df['Year'] == year) & (airline_df['DepDelay'] < 0))
        .count()
    )
    
    known_flights = on_time_flights + delayed_flights + early_flights

    # Get the number of unknown flights by subtracting the known flights from 
    # the total flights
    unknown_flights = total_flights - known_flights
    return jsonify({
        'total_flights': total_flights,
        'on_time_flights': on_time_flights,
        'delayed_flights': delayed_flights,
        'early_flights': early_flights,
        'unknown_flights': unknown_flights
    })

"""
Returns the top cancellation reason for a given year

Parameters:
    JSON request object containing:
        year (int): The year for which to get the top cancellation reason

Returns:
    JSON response object containing:
        top_reason (str): The top cancellation reason for the given year
        error (str): An error message if the year is not provided
"""
@bp.route('/api/top-cancellation-reason', methods=['POST'])
def cancellation_reasons():
    data = request.get_json()
    year = data.get('year')
    if year is not None:
        cancellation_df = spark.read.parquet('data/L_CANCELLATION.parquet', header=True)

        # Join the airline_df and cancellation_df on the CancellationCode
        joined_df = (
            airline_df
            .join(cancellation_df, airline_df.CancellationCode == cancellation_df.Code, "inner")
        )

        filtered_df = joined_df.where(joined_df['Year'] == year)

        # Get the top cancellation reason for the given year
        cancellation_reasons = (
            filtered_df.groupBy('Description')
            .count()
            .orderBy('count', ascending=False)
            .limit(1)
            .collect()
        )

        if cancellation_reasons:
            max_reason = cancellation_reasons[0]['Description']
            return jsonify({'top_reason': max_reason})
        else:
            return jsonify({'top_reason': 'Unknown'})

    return jsonify({'error': 'Year not provided'})

"""
Returns the most punctual airports for a given year

Parameters:
    JSON request object containing:
        year (int): The year for which to get the most punctual airports

Returns:
    JSON response object containing:
        most_punctual_airports (list): The list of most punctual airports for the given year
        error (str): An error message if the year is not provided
"""
@bp.route('/api/most-punctual-airports', methods=['POST'])
def most_punctual_airports():
    most_punctual_airports = []

    data = request.get_json()
    year = data.get('year')
    if year is not None:
        airport_df = spark.read.parquet('data/L_AIRPORT_ID.parquet', header=True)
        airline_df_by_year = airline_df.where(airline_df['Year'] == year)

        # Get the most punctual airports for the given year
        medians_df = airline_df_by_year.groupBy('OriginAirportID').agg(
            F.median("DepDelay")).withColumnRenamed(
                "median(DepDelay)", "MedianDepDelay").orderBy(
                    "MedianDepDelay", ascending=True).limit(3)

        # Join the medians_df and airport_df on the OriginAirportID
        joined_df = (
            medians_df
            .join(airport_df, medians_df.OriginAirportID == airport_df.Code, "inner")
        )

        airports = joined_df.select('Description').collect()

        for airport in airports:
            # Replace the state abbreviation with the full state name
            airport_full_state = replaceStateAbbreviation(airport['Description'])
            most_punctual_airports.append(airport_full_state)

        return jsonify({'most_punctual_airports': most_punctual_airports})
    else:
        return jsonify({'error': 'Year not provided'})

"""
Returns the three worst performing airlines

Returns:
    JSON response object containing:
        worst_performing_airlines (list): The list of the three worst performing airlines
"""
@bp.route('/api/worst-performing-airlines', methods=['GET'])
def worst_performing_airlines():
    airline_mapping = spark.read.parquet('data/L_AIRLINE_ID.parquet', header=True)

    twentieth_century_df = airline_df.where(airline_df['Year'] < 2000)

    # Get the percentage of delayed and cancelled flights for each reporting airline
    reporting_airlines = twentieth_century_df.groupBy('DOT_ID_Reporting_Airline').agg(
        (F.sum(F.when(F.col('DepDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('PercentageDepDelayedFlights'),
        (F.sum(F.when(F.col('ArrDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('PercentageArrDelayedFlights'),
        (F.sum(F.when(F.col('Cancelled') == 1, 1).otherwise(0)) / F.count('*')).alias('PercentageCancelledFlights')
    )

    performance_df = reporting_airlines.withColumn(
        "CompositePercentage",
        (F.col("PercentageDepDelayedFlights") + F.col("PercentageArrDelayedFlights") + F.col("PercentageCancelledFlights")) / 3
    ).orderBy("CompositePercentage", ascending=False).limit(3)

    airlines = performance_df.join(F.broadcast(airline_mapping),
                                   performance_df.DOT_ID_Reporting_Airline == airline_mapping.Code,
                                   'inner').select('Description').collect()

    worst_perfoming_airlines = [airline['Description'] for airline in airlines]
    return jsonify({'worst_performing_airlines': worst_perfoming_airlines})
