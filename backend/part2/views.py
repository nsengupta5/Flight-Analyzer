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
        .select('OriginAirportID', 'Description', 'Origin')
        .distinct()
        .orderBy('Description')
    )

    # Combine descrption and origin into a single string
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
        metrics_df = get_metrics_df(filtered_df)
        collected_data = metrics_df.collect()
        metric_mapping = get_metric_mapping()

        weights = {
            "Arrival Delay Rate": 0.3,
            "Departure Delay Rate": 0.3,
            "Cancellation Rate": 0.15,
            "Diversion Rate": 0.15,
            "Mean Security Delay": 0.04,
            "Mean Taxi Out": 0.03,
            "Mean Taxi In": 0.03,
        }

        composite_scores = {}
        for metric, readable_name in metric_mapping.items():
            metric_map = {"metric": readable_name}
            for row in collected_data:
                score = 0
                if readable_name.startswith('Mean'):  # Check if it's a mean metric
                    min_value = global_min_max_values[metric]['min']
                    max_value = global_min_max_values[metric]['max']
                    normalized_value = normalize_value(row[metric], min_value, max_value)
                    score = normalized_value
                else:
                    score = row[metric]

                weighted_score = score * weights[readable_name]
                if row['Origin'] not in composite_scores:
                    composite_scores[row['Origin']] = weighted_score
                composite_scores[row['Origin']] += weighted_score
                metric_map[row['Origin']] = score

            results.append(metric_map)

        composite_score_map = {"metric": "Composite Score"}
        for airport, score in composite_scores.items():
            composite_score_map[airport] = score

        print(composite_score_map)
        # results.append({"metric": "Composite Score", **composite_scores})
        return jsonify({"airport_data": results})
    else:
        return jsonify({'error': 'No airports provided'})

def normalize_value(value, min_value, max_value):
    # Avoid division by zero in case min and max are the same
    if min_value == max_value:
        return 0

    return (value - min_value) / (max_value - min_value)

def get_global_min_max_vals(df):
    agg_exprs = [
        F.min('SecurityDelay'), F.max('SecurityDelay'),
        F.min('TaxiOut'), F.max('TaxiOut'),
        F.min('TaxiIn'), F.max('TaxiIn'),
    ]

    agg_results = df.agg(*agg_exprs).collect()[0]
    return {
        'mean_security_delay': {'min': float(agg_results[0]), 'max': float(agg_results[1])},
        'mean_taxi_out': {'min': float(agg_results[2]), 'max': float(agg_results[3])},
        'mean_taxi_in': {'min': float(agg_results[4]), 'max': float(agg_results[5])},
    }

def get_metrics_df(df):
    return df.groupBy('OriginAirportID', 'Origin').agg(
        (F.sum(F.when(F.col('ArrDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('arr_del_rate'),
        (F.sum(F.when(F.col('DepDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('dep_del_rate'),
        (F.sum(F.when(F.col('Cancelled') == 1, 1).otherwise(0)) / F.count('*')).alias('cancellation_rate'),
        (F.sum(F.when(F.col('Diverted') == 1, 1).otherwise(0)) / F.count('*')).alias('diversion_rate'),
        F.avg('SecurityDelay').alias('mean_security_delay'),
        F.avg('TaxiOut').alias('mean_taxi_out'),
        F.avg('TaxiIn').alias('mean_taxi_in'),
    )

def get_metric_mapping():
    return {
        "arr_del_rate": "Arrival Delay Rate",
        "dep_del_rate": "Departure Delay Rate",
        "cancellation_rate": "Cancellation Rate",
        "diversion_rate": "Diversion Rate",
        "mean_security_delay": "Mean Security Delay",
        "mean_taxi_out": "Mean Taxi Out",
        "mean_taxi_in": "Mean Taxi In",
    }

