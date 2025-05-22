from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, desc
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.regression import LinearRegression
from pyspark.ml.evaluation import RegressionEvaluator

# Crear sesión Spark
spark = SparkSession.builder.appName("AnalisisPopularidadYPrediccion").getOrCreate()

# Leer CSV desde ruta compartida
df = spark.read.option("header", "true").csv("/vagrant/product_info.csv")

# Convertir columnas numéricas
df = df.withColumn("rating", col("rating").cast("float")) \
       .withColumn("loves_count", col("loves_count").cast("int")) \
       .withColumn("reviews", col("reviews").cast("int")) \
       .withColumn("price_usd", col("price_usd").cast("float")) \
       .withColumn("value_price_usd", col("value_price_usd").cast("float")) \
       .withColumn("sale_price_usd", col("sale_price_usd").cast("float")) \
       .withColumn("child_count", col("child_count").cast("int")) \
       .withColumn("child_max_price", col("child_max_price").cast("float")) \
       .withColumn("child_min_price", col("child_min_price").cast("float")) \
       .withColumn("limited_edition", col("limited_edition").cast("int")) \
       .withColumn("new", col("new").cast("int")) \
       .withColumn("online_only", col("online_only").cast("int")) \
       .withColumn("out_of_stock", col("out_of_stock").cast("int")) \
       .withColumn("sephora_exclusive", col("sephora_exclusive").cast("int"))

# ---- Parte 1: Análisis descriptivo ----

# Ranking de popularidad basado en rating, loves_count y reviews
ranking_popularidad = df.groupBy("product_id", "product_name") \
    .agg(
        avg("rating").alias("avg_rating"),
        avg("loves_count").alias("avg_loves"),
        avg("reviews").alias("avg_reviews")
    ) \
    .orderBy(desc("avg_rating"), desc("avg_loves"))

ranking_popularidad.show(10)

# Análisis de relación precio-popularidad
relacion_precio_popularidad = df.groupBy("child_min_price") \
    .agg(
        avg("rating").alias("avg_rating"),
        avg("reviews").alias("avg_reviews")
    ) \
    .orderBy("child_min_price")

relacion_precio_popularidad.show(10)

# Correlación entre precio y rating
correlacion = df.stat.corr("child_min_price", "rating")
print(f"Correlación entre precio mínimo y rating: {correlacion}")

# Guardar resultados en rutas compartidas accesibles desde ambos nodos
ranking_popularidad.coalesce(1).write.mode("overwrite").csv("/vagrant/results/ranking_popularidad", header=True)
relacion_precio_popularidad.coalesce(1).write.mode("overwrite").csv("/vagrant/results/relacion_precio_popularidad", header=True)

