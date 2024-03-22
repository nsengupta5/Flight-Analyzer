import numpy as np
from pyspark.sql import functions as F
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName('InFlight').getOrCreate()
