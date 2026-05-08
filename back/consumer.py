from kafka import KafkaConsumer
import json

# ── Kafka Consumer ────────────────────────────────────
consumer = KafkaConsumer(

    'patient_vitals',

    bootstrap_servers='localhost:9092',

    auto_offset_reset='earliest',

    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

print("\n================ RECEIVING LIVE STREAM =================\n")

# ── Continuously Receive Messages ─────────────────────
for message in consumer:

    vitals = message.value

    print(vitals)