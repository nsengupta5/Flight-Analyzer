from pyspark.sql import SparkSession
from os import listdir
from os.path import isfile, join

data_file = "airline.csv"
parquet_file = "airline.parquet"
supplementary_dir = "SupplementaryCSVs"

# Main airline data
spark = SparkSession.builder.appName("convert").getOrCreate()
# airline_df = spark.read.format("csv").option("header", "true").load("airline.csv")
# airline_df.write.format("parquet").save("./data/airline.parquet")

# Supplementary data
supplementary_files = [f for f in listdir(supplementary_dir) if isfile(join(supplementary_dir, f))]
for file in supplementary_files:
    df = spark.read.format("csv").option("header", "true").load(f"{supplementary_dir}/{file}")
    file = file.split(".")[0]
    df.write.format("parquet").save(f"./data/{file}.parquet")
