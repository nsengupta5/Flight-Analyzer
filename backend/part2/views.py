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
    )

    airport_list = [airport.asDict() for airport in joined_df.collect()]

    result = {'airports': airport_list}
    return jsonify(result)

@bp.route('/api/get-airport-score', methods=['POST'])
def get_airport_score():
    data = request.get_json()
    airports = data.get('airports')

    if airports is not None:
        airport_mapping = spark.read.parquet('data/L_AIRPORT_ID.parquet', header=True)
        broadcasted_airport_mapping = F.broadcast(airport_mapping)

        joined_df = airline_df.join(broadcasted_airport_mapping, airline_df['OriginAirportID'] == broadcasted_airport_mapping['Code'])

        filtered_df = joined_df.filter(joined_df['Description'].isin(airports))

    result = {}
    return jsonify(result)
