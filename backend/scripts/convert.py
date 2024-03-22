from pyspark.sql import SparkSession
from os import listdir
from os.path import isfile, join

# Data directories
source_data_dir = "/cs/datasets/CS5052/P1/"
supplementary_dir = f"{source_data_dir}/SupplementaryCSVs"
local_data_dir = "../data"

# Data files
data_file = f"{source_data_dir}/airline.csv"
parquet_file = f"{local_data_dir}/airline.parquet"

# Main airline data
spark = SparkSession.builder \
    .appName("convert") \
    .config("spark.driver.memory", "4g") \
    .config("spark.executor.memory", "4g") \
    .getOrCreate()
airline_df = spark.read.format("csv").option("header", "true").load(data_file)
airline_df.write.format("parquet").save(parquet_file)

# Supplementary data
supplementary_files = [f for f in listdir(supplementary_dir) if isfile(join(supplementary_dir, f))]
for file in supplementary_files:
    df = spark.read.format("csv").option("header", "true").load(f"{supplementary_dir}/{file}")
    file = file.split(".")[0]
    df.write.format("parquet").save(f"{local_data_dir}/{file}.parquet")
