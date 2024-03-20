from flask import jsonify, request
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
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

    # TODO Figure out the other data
    if airports is not None:
        filtered_df = airline_df.filter(airline_df['OriginAirportID'].isin(airports))

        metrics_df = filtered_df.groupBy('OriginAirportID', 'Origin').agg(
            (F.sum(F.when(F.col('ArrDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('arr_del_rate'),
            (F.sum(F.when(F.col('DepDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('dep_del_rate'),
            (F.sum(F.when(F.col('Cancelled') == 1, 1).otherwise(0)) / F.count('*')).alias('cancellation_rate'),
            (F.sum(F.when(F.col('Diverted') == 1, 1).otherwise(0)) / F.count('*')).alias('diversion_rate'),
            # F.median('SecurityDelay').alias('median_security_delay'),
            # F.median('TaxiOut').alias('median_taxi_out'),
            # F.median('TaxiIn').alias('median_taxi_in'),
        )

        # # List of columns to scale
        # columns_to_scale = [
        #     'median_security_delay', 
        #     'median_taxi_out', 'median_taxi_in'
        # ]

        # # Apply the Min-Max scaler
        # metrics_df_scaled = min_max_scaler(metrics_df, columns_to_scale)

        collected_data = metrics_df.collect()

        metric_mapping = {
            "arr_del_rate": "Arrival Delay Rate",
            "dep_del_rate": "Departure Delay Rate",
            "cancellation_rate": "Cancellation Rate",
            "diversion_rate": "Diversion Rate",
            # "median_security_delay": "Median Security Delay",
            # "median_taxi_out": "Median Taxi Out",
            # "median_taxi_in": "Median Taxi In",
        }

        # Initialize a dictionary for each metric
        for metric, readable_name in metric_mapping.items():
            metric_map = {"metric": readable_name}
            for row in collected_data:
                metric_map[row['Origin']] = row[metric]
            results.append(metric_map)

        return jsonify({"airport_data": results})
    else:
        return jsonify({'error': 'No airports provided'})

def min_max_scaler(df, cols_to_scale):
    for col in cols_to_scale:
        # Find the minimum and maximum values of the column
        min_col, max_col = df.select(F.min(col), F.max(col)).first()

        # Avoid division by zero
        if max_col != min_col:
            # Apply the Min-Max scaling formula
            df = df.withColumn(col, (F.col(col) - min_col) / (max_col - min_col))
        else:
            # In case max and min are the same, set all values to 1
            df = df.withColumn(col, F.lit(1.0))
    return df
