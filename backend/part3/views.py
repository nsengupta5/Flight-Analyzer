from flask import jsonify, request
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from . import part3_blueprint as bp

# Get Spark Session
spark = SparkSession.builder.appName('InFlight').getOrCreate()

# Main airline dataframe
airline_df = spark.read.parquet('data/airline.parquet', header=True)
