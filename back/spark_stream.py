from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, when
from pyspark.sql.types import *

import psycopg2
import os

from dotenv import load_dotenv
from datetime import datetime

# ── Load Environment Variables ────────────────────────
load_dotenv()

# ── PostgreSQL Connection ─────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL")

conn = psycopg2.connect(DATABASE_URL)

cursor = conn.cursor()

# ── Spark Session ─────────────────────────────────────
spark = SparkSession.builder \
    .appName("HospitalVitalsStream") \
    .master("local[*]") \
    .config(
        "spark.jars",
        "jars/spark-sql-kafka-0-10_2.12-3.5.1.jar,"
        "jars/kafka-clients-3.5.1.jar,"
        "jars/spark-token-provider-kafka-0-10_2.12-3.5.1.jar,"
        "jars/commons-pool2-2.11.1.jar"
    ) \
    .getOrCreate()

spark.sparkContext.setLogLevel("ERROR")

# ── Schema For Incoming JSON ──────────────────────────
schema = StructType([

    StructField("patient_id", IntegerType(), True),
    StructField("name", StringType(), True),
    StructField("age", IntegerType(), True),
    StructField("bed", StringType(), True),

    StructField("heart_rate", IntegerType(), True),
    StructField("oxygen_level", IntegerType(), True),
    StructField("temperature", FloatType(), True),

    StructField("systolic_bp", IntegerType(), True),
    StructField("diastolic_bp", IntegerType(), True),

    StructField("timestamp", StringType(), True)

])

# ── Read Kafka Stream ─────────────────────────────────
df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "patient_vitals") \
    .option("startingOffsets", "latest") \
    .load()

# ── Convert Kafka Binary → String ─────────────────────
json_df = df.selectExpr(
    "CAST(value AS STRING) as json_data"
)

# ── Parse JSON ────────────────────────────────────────
parsed_df = json_df.select(
    from_json(col("json_data"), schema).alias("data")
)

# ── Flatten JSON ──────────────────────────────────────
final_df = parsed_df.select("data.*")

# ── Add Real-Time Risk Detection ──────────────────────
analytics_df = final_df.withColumn(

    "risk_level",

    when(
        (col("oxygen_level") < 90) |
        (col("heart_rate") > 120) |
        (col("temperature") > 103),
        "CRITICAL"
    )

    .when(
        (col("oxygen_level") < 94) |
        (col("heart_rate") > 100) |
        (col("temperature") > 100),
        "WARNING"
    )

    .otherwise("NORMAL")
)

# ── Save Each Streaming Batch To PostgreSQL ───────────
def save_to_postgres(batch_df, batch_id):

    rows = batch_df.collect()

    for row in rows:

        cursor.execute("""

            INSERT INTO patient_vitals_live (

                patient_id,
                name,
                age,
                bed,

                heart_rate,
                oxygen_level,
                temperature,

                systolic_bp,
                diastolic_bp,

                risk_level,
                timestamp

            )

            VALUES (

                %s,%s,%s,%s,
                %s,%s,%s,
                %s,%s,
                %s,%s

            )

        """, (

            row["patient_id"],
            row["name"],
            row["age"],
            row["bed"],

            row["heart_rate"],
            row["oxygen_level"],
            row["temperature"],

            row["systolic_bp"],
            row["diastolic_bp"],

            row["risk_level"],

            datetime.strptime(
                row["timestamp"],
                "%Y-%m-%d %H:%M:%S"
            )

        ))

    conn.commit()

    print(f"Batch {batch_id} saved to PostgreSQL")

# ── Stream To PostgreSQL ──────────────────────────────
query = analytics_df.writeStream \
    .foreachBatch(save_to_postgres) \
    .outputMode("append") \
    .start()

query.awaitTermination()