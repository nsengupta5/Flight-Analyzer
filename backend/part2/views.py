from flask import jsonify, request
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window
from . import part2_blueprint as bp

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
        .select('OriginAirportID', 'Description')
        .distinct()
        .orderBy('Description')
    )

    airport_list = [airport.asDict() for airport in joined_df.collect()]

    result = {'airports': airport_list}
    return jsonify(result)

@bp.route('/api/get-airport-performance', methods=['POST'])
def get_airport_score():
    data = request.get_json()
    airports = data.get('airports')
    results = []

    global_min_max_values = {
        'mean_security_delay': {
            'min': float(airline_df.agg(F.min('SecurityDelay')).collect()[0][0]),
            'max': float(airline_df.agg(F.max('SecurityDelay')).collect()[0][0]),
        },
        'mean_taxi_out': {
            'min': float(airline_df.agg(F.min('TaxiOut')).collect()[0][0]),
            'max': float(airline_df.agg(F.max('TaxiOut')).collect()[0][0]),
        },
        'mean_taxi_in': {
            'min': float(airline_df.agg(F.min('TaxiIn')).collect()[0][0]),
            'max': float(airline_df.agg(F.max('TaxiIn')).collect()[0][0]),
        },
        'total_flights': {
            'min': float(airline_df.groupBy('OriginAirportID').count().agg(F.min('count')).collect()[0][0]),
            'max': float(airline_df.groupBy('OriginAirportID').count().agg(F.max('count')).collect()[0][0]),
        }
    }

    # TODO Figure out the other data
    if airports is not None:
        filtered_df = airline_df.filter(airline_df['OriginAirportID'].isin(airports))

        metrics_df = filtered_df.groupBy('OriginAirportID', 'Origin').agg(
            (F.sum(F.when(F.col('ArrDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('arr_del_rate'),
            (F.sum(F.when(F.col('DepDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('dep_del_rate'),
            (F.sum(F.when(F.col('Cancelled') == 1, 1).otherwise(0)) / F.count('*')).alias('cancellation_rate'),
            (F.sum(F.when(F.col('Diverted') == 1, 1).otherwise(0)) / F.count('*')).alias('diversion_rate'),
            F.avg('SecurityDelay').alias('mean_security_delay'),
            F.avg('TaxiOut').alias('mean_taxi_out'),
            F.avg('TaxiIn').alias('mean_taxi_in'),
        )

        collected_data = metrics_df.collect()

        metric_mapping = {
            "arr_del_rate": "Arrival Delay Rate",
            "dep_del_rate": "Departure Delay Rate",
            "cancellation_rate": "Cancellation Rate",
            "diversion_rate": "Diversion Rate",
            "mean_security_delay": "Mean Security Delay",
            "mean_taxi_out": "Mean Taxi Out",
            "mean_taxi_in": "Mean Taxi In",
        }

        for metric, readable_name in metric_mapping.items():
            metric_map = {"metric": readable_name}
            for row in collected_data:
                if readable_name.startswith('Mean'):  # Check if it's a mean metric
                    min_value = global_min_max_values[metric]['min']
                    max_value = global_min_max_values[metric]['max']
                    normalized_value = normalize_value(row[metric], min_value, max_value)
                    metric_map[row['Origin']] = normalized_value
                else:
                    metric_map[row['Origin']] = row[metric]  # Use the original value for percentage metrics
            results.append(metric_map)

        return jsonify({"airport_data": results})
    else:
        return jsonify({'error': 'No airports provided'})

def normalize_value(value, min_value, max_value):
    """
    Normalize a value using Min-Max normalization.
    """
    # Avoid division by zero in case min and max are the same
    if min_value == max_value:
        return 0

    return (value - min_value) / (max_value - min_value)
