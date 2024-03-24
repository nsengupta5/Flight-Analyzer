from flask import jsonify 
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from . import part3_blueprint as bp
from .helper import normalize_values, modified_log_scale

# Get Spark Session
spark = SparkSession.builder.appName('InFlight').getOrCreate()

# Main airline dataframe
airline_df = spark.read.parquet('data/airline.parquet', header=True)

"""
Returns the amount of flights taken between airports, with the
top 500 routes by flight count being returned

Returns:
    JSON response object containing:
        routes (dict): The list of routes
"""
@bp.route('/api/get-routes', methods=['GET'])
def get_routes():
   # Read the airport mapping
    airport_mapping = spark.read.parquet('data/L_AIRPORT_ID.parquet')
    
    # Adjusted to include 'OriginStateFips' as 'group', and filter out null 'group' values
    airport_nodes_df = (
        airline_df
        .join(airport_mapping, airline_df['OriginAirportID'] == airport_mapping['Code'], 'left')
        .select('Origin', 'Description', 'OriginStateFips')
        .distinct()
        .withColumnRenamed('Origin', 'id')
        .withColumnRenamed('Description', 'name')
        .withColumnRenamed('OriginStateFips', 'group')
        .filter(F.col('group').isNotNull())
        .orderBy('name')
    )

    routes_df = (
        airline_df
        .groupBy('Origin', 'Dest')
        .agg(F.count('*').alias('value'))
        .withColumnRenamed('Origin', 'source')
        .withColumnRenamed('Dest', 'target')
        .orderBy('value', ascending=False)
        .limit(500)
    )

    routes_list = [route.asDict() for route in routes_df.collect()]
    routes_list = normalize_values(routes_list, 'value', factor=10)

    unique_airport_ids_in_links = set()
    for route in routes_list:
        unique_airport_ids_in_links.add(route['source'])
        unique_airport_ids_in_links.add(route['target'])

    # Filter the airport_nodes_df to only include airports that are present in the links
    filtered_airports_df = airport_nodes_df.filter(
        F.col('id').isin(unique_airport_ids_in_links)
    )

    # Now collect the nodes list after ensuring it only contains airports present in the links
    filtered_airports_list = [airport.asDict() for airport in filtered_airports_df.collect()]

    result = {'nodes': filtered_airports_list, 'links': routes_list}

    return jsonify({"routes": result})

"""
Returns the flight density of each state for each year

Returns:
    JSON response object containing:
        timelapseData (dict): The flight density of each state for each year
"""
@bp.route('/api/get-timelapse-data', methods=['GET'])
def get_timelapse_data():
      # Group by Year and OriginState, and count flights
    state_year_flight_count = (
        airline_df
        .groupBy('Year', 'OriginStateName')
        .agg(F.count('*').alias('value'))
        .orderBy('Year', 'OriginStateName')
        .filter(F.col('OriginStateName').isNotNull())
    )

    # Collect data into a list of dictionaries
    state_year_flight_count_list = [row.asDict() for row in state_year_flight_count.collect()]

    # Initialize the result dictionary
    timelapseData = {}
    min_max_values = {}

    # Populate the result dictionary with the structured data
    for item in state_year_flight_count_list:
        year = item['Year']
        state = item['OriginStateName']
        raw_value = item['value']
        value = modified_log_scale(item['value'])

        if year not in min_max_values:
            min_max_values[year] = {'min': raw_value, 'max': raw_value}

        min_max_values[year]['min'] = min(min_max_values[year]['min'], raw_value)
        min_max_values[year]['max'] = max(min_max_values[year]['max'], raw_value)
        
        # If the year is not already in the result, add it
        if year not in timelapseData:
            timelapseData[year] = {}
        
        # Add the state and its flight count value to the specific year in the result
        timelapseData[year][state] = value

    result = {'timelapseData': timelapseData}
    result['min_max_values'] = min_max_values
    return jsonify(result)
