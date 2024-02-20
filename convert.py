from pyspark.sql import SparkSession

data_file = "airline.csv"
parquet_file = "airline.parquet"

spark = SparkSession.builder.appName("convert").getOrCreate()
df = spark.read.format("csv").option("header", "true").load("airline.csv")
df.write.format("parquet").save("airline.parquet")
