from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, count, desc, when
import os
import shutil
import glob

# Crear sesión Spark
spark = SparkSession.builder.appName("AnalisisSkincare").getOrCreate()

# Leer CSV
df = spark.read.option("header", "true").option("delimiter", ";").csv("/root/proyecto/spark-analisis/product_info.csv")

# Conversión de columnas a tipos adecuados
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

# =========================
# CONSULTAS Y MÉTRICAS
# =========================

# 1. 📊 Top 10 productos más populares según rating y loves
ranking_popularidad = df.select("product_id", "product_name", "rating", "loves_count", "reviews") \
                        .orderBy(desc("rating"), desc("loves_count"))
print("\n📊 Top 10 productos por popularidad:")
ranking_popularidad.show(10, truncate=False)

# 2. 📈 Relación entre precio y popularidad (rating y reviews promedios por precio)
relacion_precio_popularidad = df.groupBy("price_usd") \
    .agg(avg("rating").alias("avg_rating"), avg("reviews").alias("avg_reviews")) \
    .orderBy("price_usd")
print("\n📈 Relación entre precio y popularidad:")
relacion_precio_popularidad.show(10, truncate=False)

# 3. 💸 Distribución por rangos de precios
segmentos_precio = df.withColumn("price_segment",
    when(col("price_usd") < 25, "<$25")
    .when((col("price_usd") >= 25) & (col("price_usd") < 75), "$25-75")
    .when((col("price_usd") >= 75) & (col("price_usd") < 150), "$75-150")
    .otherwise(">$150")
).groupBy("price_segment") \
 .agg(count("*").alias("count_products")) \
 .orderBy("price_segment")
print("\n💸 Productos por segmento de precio:")
segmentos_precio.show(truncate=False)

# 4. 📦 Estado del stock (en stock vs agotado)
stock_status = df.groupBy("out_of_stock") \
                 .agg(count("*").alias("count_products")) \
                 .orderBy("out_of_stock")
print("\n📦 Estado de inventario:")
stock_status.show(truncate=False)

# 5. 📉 Correlación entre precio y rating
correlacion = df.stat.corr("price_usd", "rating")
print(f"\n📉 Correlación entre precio (USD) y rating: {correlacion:.4f}")

# 6. 🆕 Cantidad de productos nuevos vs no nuevos
nuevos = df.groupBy("new").agg(count("*").alias("count_products")).orderBy("new")
print("\n🆕 Productos nuevos vs no nuevos:")
nuevos.show()

# 7. 🌐 Disponibilidad exclusiva online
exclusivo_online = df.groupBy("online_only").agg(count("*").alias("count_products")).orderBy("online_only")
print("\n🌐 Productos disponibles solo online vs en tienda:")
exclusivo_online.show()

# 8. 🌟 Distribución por categoría principal
por_categoria = df.groupBy("primary_category").agg(count("*").alias("count_products")).orderBy(desc("count_products"))
print("\n🌟 Distribución por categoría principal:")
por_categoria.show(10, truncate=False)

# 9. 🏷 Marcas con más productos
top_marcas = df.groupBy("brand_name").agg(count("*").alias("count_products")).orderBy(desc("count_products"))
print("\n🏷 Marcas con más productos:")
top_marcas.show(10, truncate=False)

# 10. 🎯 Productos exclusivos de Sephora
exclusivos = df.groupBy("sephora_exclusive").agg(count("*").alias("count_products")).orderBy("sephora_exclusive")
print("\n🎯 Productos exclusivos de Sephora:")
exclusivos.show()

# =========================
# EXPORTAR RESULTADOS A CSV
# =========================

def exportar_df(df_resultado, carpeta_destino):
    path = f"/root/results/{carpeta_destino}"
    df_resultado.coalesce(1).write.mode("overwrite").option("header", True).csv(path)
    print(f"[✅] Exportado a: {path}")

# Exportaciones (sin nombre de archivo adicional, para que funcione con Dash)
exportar_df(ranking_popularidad, "ranking_popularidad")
exportar_df(relacion_precio_popularidad, "relacion_precio_popularidad")
exportar_df(segmentos_precio, "price_segment_analysis")
exportar_df(stock_status, "stock_analysis")
exportar_df(nuevos, "new_products")
exportar_df(exclusivo_online, "online_only_analysis")
exportar_df(por_categoria, "category_distribution")
exportar_df(top_marcas, "top_brands")
exportar_df(exclusivos, "sephora_exclusives")
