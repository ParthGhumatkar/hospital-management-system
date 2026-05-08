import psycopg2
import os
import random
import time
import json
from datetime import datetime
from dotenv import load_dotenv
from kafka import KafkaProducer

# ── Load Environment Variables ─────────────────────────
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

# ── PostgreSQL Connection ──────────────────────────────
conn = psycopg2.connect(DATABASE_URL)

cursor = conn.cursor()

# ── Kafka Producer ─────────────────────────────────────
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',

    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# ── Alert Tracking System ──────────────────────────────
alert_tracker = {}

# ── Fetch Admitted Patients Query ──────────────────────
query = """
SELECT 
    p.id,
    p.name,
    p.age,
    b.bed_number
FROM patients p
JOIN beds b
ON p.bed_id = b.id
WHERE b.status = 'Occupied';
"""

# ── Continuous Real-Time Streaming ─────────────────────
while True:

    cursor.execute(query)

    patients = cursor.fetchall()

    print("\n================ LIVE PATIENT VITALS ================\n")

    for patient in patients:

        vitals = {

            "patient_id": patient[0],

            "name": patient[1],

            "age": patient[2],

            "bed": patient[3],

            "heart_rate": random.randint(60, 120),

            "oxygen_level": random.randint(90, 100),

            "temperature": round(random.uniform(97.0, 103.0), 1),

            "systolic_bp": random.randint(100, 140),

            "diastolic_bp": random.randint(70, 95),

            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        # ── Send Vitals To Kafka ──────────────────────
        producer.send("patient_vitals", vitals)

        # ── Print Current Vitals ──────────────────────
        print(vitals)

        # ── Initialize Alert Tracking ─────────────────
        patient_id = vitals["patient_id"]

        if patient_id not in alert_tracker:

            alert_tracker[patient_id] = {

                "high_hr": 0,

                "low_oxygen": 0,

                "high_temp": 0
            }

        # ── Heart Rate Monitoring ─────────────────────
        if vitals["heart_rate"] > 110:

            alert_tracker[patient_id]["high_hr"] += 1

        else:

            alert_tracker[patient_id]["high_hr"] = 0

        # ── Oxygen Monitoring ─────────────────────────
        if vitals["oxygen_level"] < 92:

            alert_tracker[patient_id]["low_oxygen"] += 1

        else:

            alert_tracker[patient_id]["low_oxygen"] = 0

        # ── Temperature Monitoring ────────────────────
        if vitals["temperature"] > 101:

            alert_tracker[patient_id]["high_temp"] += 1

        else:

            alert_tracker[patient_id]["high_temp"] = 0

        # ── Smart Alert Logic ─────────────────────────

        # High Heart Rate Alert
        if alert_tracker[patient_id]["high_hr"] >= 3:

            print(
                f"🚨 CRITICAL ALERT: Persistent High Heart Rate for {vitals['name']}"
            )

        # Low Oxygen Alert
        if alert_tracker[patient_id]["low_oxygen"] >= 2:

            print(
                f"🚨 CRITICAL ALERT: Persistent Low Oxygen for {vitals['name']}"
            )

        # High Fever Alert
        if alert_tracker[patient_id]["high_temp"] >= 3:

            print(
                f"🚨 CRITICAL ALERT: Persistent High Fever for {vitals['name']}"
            )

    # ── Wait Before Next Stream Batch ──────────────────
    time.sleep(5)