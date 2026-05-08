from flask import Flask
from flask_cors import CORS
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get("DATABASE_URL")

# ── PostgreSQL Connection ─────────────────────────────
conn = psycopg2.connect(DATABASE_URL)

cursor = conn.cursor()

# ── Fetch Admitted Patients ───────────────────────────
query = """
SELECT 
    p.id,
    p.name,
    p.age,
    p.gender,
    b.bed_number,
    b.status
FROM patients p
JOIN beds b
ON p.bed_id = b.id
WHERE b.status = 'Occupied'
"""

try:
    cursor.execute(query)

    patients = cursor.fetchall()

    print("\nAdmitted Patients:\n")

    for patient in patients:
        print(patient)

except Exception as e:
    print("Error:", e)

finally:
    cursor.close()
    conn.close()