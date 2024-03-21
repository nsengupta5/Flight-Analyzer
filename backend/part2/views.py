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

@bp.route('/api/get-airports', methods=['GET'])
def get_airports():
    airport_mapping = spark.read.parquet('data/L_AIRPORT_ID.parquet', header=True)
    broadcasted_airport_mapping = F.broadcast(airport_mapping)
    joined_df = (
        airline_df
        .join(broadcasted_airport_mapping, airline_df['OriginAirportID'] == broadcasted_airport_mapping['Code'])
        .select('OriginAirportID', 'Description', 'Origin')
        .distinct()
        .orderBy('Description')
    )

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

@bp.route('/api/get-airport-performance', methods=['POST'])
def get_airport_score():
    data = request.get_json()
    airports = data.get('airports')
    results = []

    if airports is not None:
        filtered_df = airline_df.filter(airline_df['OriginAirportID'].isin(airports))
        global_min_max_values = get_global_min_max_vals(filtered_df)
        metrics_df = get_metrics_df(filtered_df, ['OriginAirportID', 'Origin'])
        collected_data = metrics_df.collect()
        metric_mapping = get_metric_mapping()

        for metric, readable_name in metric_mapping.items():
            metric_map = {"metric": readable_name}
            for row in collected_data:
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
        weights = get_weights()

        if metric != 'Composite Score':
            result = get_performance_result_single(metric, collected_data, global_min_max_values, metric_mapping)
            if result is None:
                return jsonify({"error": "Not enough information"}), 400
            return jsonify({"performance_data": result})

        result = get_performance_result_composite(collected_data, global_min_max_values, metric_mapping, weights)
        return jsonify({"performance_data": result})
    else:
        return jsonify({'error': 'No airports provided'})

