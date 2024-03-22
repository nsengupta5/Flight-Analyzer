from flask import jsonify, request
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from . import part2_blueprint as bp
from .helper import (
    normalize_value, get_global_min_max_vals, get_metrics_df,
    get_metric_mapping, get_weights, get_performance_result_composite,
    get_performance_result_single
)

# Get Spark Session
spark = SparkSession.builder.appName('AeroSights').getOrCreate()

# Main airline dataframe
airline_df = spark.read.parquet('data/airline.parquet', header=True)

"""
Returns the unique list of airports

Returns:
    JSON response object containing:
        airports (list): The list of airports
"""
@bp.route('/api/get-airports', methods=['GET'])
def get_airports():
    airport_mapping = spark.read.parquet('data/L_AIRPORT_ID.parquet', header=True)
    broadcasted_airport_mapping = F.broadcast(airport_mapping)

    # Join the airline_df with the airport_mapping to get the airport description
    joined_df = (
        airline_df
        .join(broadcasted_airport_mapping, airline_df['OriginAirportID'] == broadcasted_airport_mapping['Code'])
        .select('OriginAirportID', 'Description', 'Origin')
        .distinct()
        .orderBy('Description')
    )

    # Include the abbreviation of the state in the description
    joined_df = joined_df.withColumn('Description', 
                                     F.concat(F.col('Description'),
                                              F.lit(' ('),
                                              F.col('Origin'),
                                              F.lit(')')
                                         )
                                     )

    airport_list = [airport.asDict() for airport in joined_df.collect()]

    result = {'airports': airport_list}
    return jsonify(result)

"""
Returns the performance of a list of given airports

Parameters:
    JSON request object containing:
        airports (list): The list of airports for which to get the performance

Returns:
    JSON response object containing:
        airport_data (list): The performance of the given airports
        error (str): An error message if the airports are not provided
"""
@bp.route('/api/get-airport-performance', methods=['POST'])
def get_airport_score():
    data = request.get_json()
    airports = data.get('airports')
    results = []

    if airports is not None:
        # Filter the airline_df to only include the given airports
        filtered_df = airline_df.filter(airline_df['OriginAirportID'].isin(airports))

        # Get the global min and max values for whole numeric columns
        global_min_max_values = get_global_min_max_vals(filtered_df)

        # Get the metrics dataframe
        metrics_df = get_metrics_df(filtered_df, ['OriginAirportID', 'Origin'])
        collected_data = metrics_df.collect()

        # Get the mapping of metric abbreviations to readable names
        metric_mapping = get_metric_mapping()

        for metric, readable_name in metric_mapping.items():
            metric_map = {"metric": readable_name}
            for row in collected_data:

                # Normalize the value if it is a mean value
                if readable_name.startswith('Mean'):  
                    min_value = global_min_max_values[metric]['min']
                    max_value = global_min_max_values[metric]['max']
                    normalized_value = normalize_value(row[metric], min_value, max_value)
                    score = normalized_value
                else:
                    score = row[metric]

                metric_map[row['Origin']] = score

            results.append(metric_map)
        return jsonify({"airport_data": results})
    else:
        return jsonify({'error': 'No airports provided'})

"""
Returns the performance of the US states

Parameters:
    JSON request object containing:
        year (int): The year for which to get the performance
        metric (str): The metric for which to get the performance

Returns:
    JSON response object containing:
        performance_data (list): The performance of the US states
        error (str): An error message if the year and metric are not provided
"""
@bp.route('/api/get-state-performance', methods=['POST'])
def get_state_performance():
    data = request.get_json()
    year = data.get('year')
    metric = data.get('metric')

    if year is not None and metric is not None:
        filtered_df = airline_df.filter(airline_df['Year'] == year)
        global_min_max_values = get_global_min_max_vals(filtered_df)
        metrics_df = get_metrics_df(filtered_df, ['OriginStateName'])
        collected_data = metrics_df.collect()
        metric_mapping = get_metric_mapping()

        # Get the metric weights for the composite score
        weights = get_weights()

        if metric != 'Composite Score':
            # Get the performance result for a single metric
            result = get_performance_result_single(metric, collected_data, global_min_max_values, metric_mapping)
            if result is None:
                # Handle the case where the metric is not found
                return jsonify({"error": "Not enough information"}), 400
            return jsonify({"performance_data": result})

        # Get the performance result for the composite score
        result = get_performance_result_composite(collected_data, global_min_max_values, metric_mapping, weights)
        return jsonify({"performance_data": result})
    else:
        return jsonify({'error': 'No airports provided'})

