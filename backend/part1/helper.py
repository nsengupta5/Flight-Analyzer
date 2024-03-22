from pyspark.sql import SparkSession

spark = SparkSession.builder.appName('InFlight').getOrCreate()

"""
Replace the state abbreviation with the full state name

Parameters:
    airport (str): The airport string containing the state abbreviation

"""
def replaceStateAbbreviation(airport):
    df = spark.read.parquet('data/L_STATE_ABR_AVIATION.parquet', header=True)
    airport_arr = airport.split(':')
    state = airport_arr[0].split(',')[-1].strip()
    state_full = (
        df
        .where(df['Code'] == state)
        .select('Description')
        .collect()[0]['Description']
    )
    full_airport = airport_arr[0].replace(state, state_full)

    return full_airport + ': ' + airport_arr[1]
