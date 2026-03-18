from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from datetime import datetime, date, time, timedelta
import joblib
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get("DATABASE_URL")


# ── DB Connection ──────────────────────────────────────────────────────────────
def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


# ── Date/Time Serialization Helper ────────────────────────────────────────────
def serialize_row(row):
    if row is None:
        return None
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, datetime):
            d[k] = v.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(v, date):
            d[k] = v.strftime('%Y-%m-%d')
        elif isinstance(v, time):
            d[k] = v.strftime('%H:%M:%S')
        elif isinstance(v, timedelta):
            total = int(v.total_seconds())
            h, m, s = total // 3600, (total % 3600) // 60, total % 60
            d[k] = f"{h:02d}:{m:02d}:{s:02d}"
    return d


def serialize_rows(rows):
    return [serialize_row(r) for r in rows]


# ── Password Helpers ───────────────────────────────────────────────────────────
def hash_password(plain):
    return bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(plain, hashed):
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


# ── Doctor Signup ──────────────────────────────────────────────────────────────
@app.route('/doctor_signup', methods=['POST'])
def doctor_signup():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO doctors (name, email, password, specialization, phone, department) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (data['name'], data['email'], hash_password(data['password']),
             data['specialization'], data['phone'], data['department'])
        )
        db.commit()
        return jsonify({"message": "Doctor signup successful!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"message": str(e)}), 400
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Doctor Login ───────────────────────────────────────────────────────────────
@app.route('/doctor_login', methods=['POST'])
def doctor_login():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM doctors WHERE email=%s", (data['email'],))
        user = cursor.fetchone()
        if user and check_password(data['password'], user['password']):
            return jsonify({"status": "success", "id": user['id'], "name": user['name']})
        return jsonify({"status": "fail", "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── HOD Signup ─────────────────────────────────────────────────────────────────
@app.route('/hod_signup', methods=['POST'])
def hod_signup():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO hod (name, email, password, phone, department) VALUES (%s,%s,%s,%s,%s)",
            (data['name'], data['email'], hash_password(data['password']),
             data['phone'], data['department'])
        )
        db.commit()
        return jsonify({"message": "HOD signup successful!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── HOD Login ──────────────────────────────────────────────────────────────────
@app.route('/hod_login', methods=['POST'])
def hod_login():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM hod WHERE email=%s", (data['email'],))
        user = cursor.fetchone()
        if user and check_password(data['password'], user['password']):
            return jsonify({
                "status": "success",
                "id": user['id'],
                "name": user['name'],
                "department": user['department']
            })
        return jsonify({"status": "fail", "message": "Login failed"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Reception Signup ───────────────────────────────────────────────────────────
@app.route('/reception_signup', methods=['POST'])
def reception_signup():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO receptionists (name,email,password,phone) VALUES (%s,%s,%s,%s)",
            (data['name'], data['email'], hash_password(data['password']), data['phone'])
        )
        db.commit()
        return jsonify({"message": "Reception signup successful!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Reception Login ────────────────────────────────────────────────────────────
@app.route('/reception_login', methods=['POST'])
def reception_login():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT name, password FROM receptionists WHERE email=%s", (data['email'],)
        )
        user = cursor.fetchone()
        if user and check_password(data['password'], user['password']):
            return jsonify({"success": True, "name": user['name']})
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Pharmacist Signup ──────────────────────────────────────────────────────────
@app.route('/pharmacist_signup', methods=['POST'])
def pharmacist_signup():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO pharmacists (name, email, password, contact) VALUES (%s,%s,%s,%s)",
            (data['name'], data['email'], hash_password(data['password']), data['phone'])
        )
        db.commit()
        return jsonify({"message": "Pharmacist signup successful!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Pharmacist Login ───────────────────────────────────────────────────────────
@app.route('/pharmacist_login', methods=['POST'])
def pharmacist_login():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT id, name, password FROM pharmacists WHERE email=%s", (data['email'],)
        )
        user = cursor.fetchone()
        if user and check_password(data['password'], user['password']):
            return jsonify({"success": True, "id": user['id'], "name": user['name']})
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Register Patient ───────────────────────────────────────────────────────────
@app.route('/register_patient', methods=['POST'])
def register_patient():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO patients
            (name, age, gender, phone, address, insurance_provider,
             policy_number, medical_history, current_medication)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data['name'], data['age'], data['gender'], data['phone'], data['address'],
            data.get('insurance_provider', ''), data.get('policy_number', ''),
            data.get('medical_history', ''), data.get('current_medication', '')
        ))
        db.commit()
        return jsonify({"message": "Patient registered successfully"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Get All Patients ───────────────────────────────────────────────────────────
@app.route("/patients")
def get_patients():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM patients")
        patients = serialize_rows(cursor.fetchall())
        return jsonify({"patients": patients})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Update Patient ─────────────────────────────────────────────────────────────
@app.route('/update_patient/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            UPDATE patients
            SET name=%s, age=%s, gender=%s, phone=%s, address=%s,
                insurance_provider=%s, policy_number=%s,
                medical_history=%s, current_medication=%s
            WHERE id=%s
        """, (
            data.get('name'), data.get('age'), data.get('gender'),
            data.get('phone'), data.get('address'),
            data.get('insurance_provider'), data.get('policy_number'),
            data.get('medical_history'), data.get('current_medication'),
            patient_id
        ))
        db.commit()
        return jsonify({"message": "Patient updated successfully!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Delete Patient ─────────────────────────────────────────────────────────────
@app.route('/delete_patient/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM patients WHERE id=%s", (patient_id,))
        db.commit()
        return jsonify({"message": "Patient deleted successfully!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Get Beds (with occupying patient name) ─────────────────────────────────────
@app.route("/beds")
def get_beds():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT b.id, b.bed_number, b.status,
                   p.name AS patient_name
            FROM beds b
            LEFT JOIN patients p ON b.id = p.bed_id
            ORDER BY b.bed_number
        """)
        beds = serialize_rows(cursor.fetchall())
        print("Beds being returned:", [(b['id'], b['bed_number']) for b in beds])
        return jsonify(beds)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Get Unassigned Patients (no bed yet) ───────────────────────────────────────
@app.route("/patients_unassigned")
def get_unassigned_patients():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT id, name FROM patients WHERE bed_id IS NULL ORDER BY name"
        )
        patients = [dict(r) for r in cursor.fetchall()]
        return jsonify({"patients": patients})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Assign Bed (new clean endpoint) ────────────────────────────────────────────
@app.route('/beds/assign', methods=['POST'])
def beds_assign():
    data = request.get_json()
    print("bed_id received:", data.get('bed_id'))
    print("patient_id received:", data.get('patient_id'))
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        patient_id = int(data['patient_id'])
        bed_id     = int(data['bed_id'])
        print("bed_id after int():", bed_id)
        cursor.execute(
            "UPDATE beds SET status='Occupied' WHERE id=%(bed_id)s",
            {"bed_id": bed_id}
        )
        cursor.execute(
            "UPDATE patients SET bed_id=%(bed_id)s WHERE id=%(patient_id)s",
            {"bed_id": bed_id, "patient_id": patient_id}
        )
        db.commit()
        return jsonify({"message": "Bed assigned successfully", "bed_id": bed_id, "patient_id": patient_id})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Release Bed ────────────────────────────────────────────────────────────────
@app.route('/beds/release', methods=['POST'])
def beds_release():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        bed_id = int(data['bed_id'])
        cursor.execute(
            "UPDATE patients SET bed_id=NULL WHERE bed_id=%s", (bed_id,)
        )
        cursor.execute(
            "UPDATE beds SET status='Available' WHERE id=%s", (bed_id,)
        )
        db.commit()
        return jsonify({"message": "Bed released successfully"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Assign Bed (legacy endpoint kept for backward compat) ──────────────────────
@app.route('/assign_bed', methods=['POST'])
def assign_bed():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        patient_id = int(data['patient_id'])
        bed_id = int(data['bed_id'])
        cursor.execute("UPDATE beds SET status='Occupied' WHERE id=%s", (bed_id,))
        cursor.execute("UPDATE patients SET bed_id=%s WHERE id=%s", (bed_id, patient_id))
        cursor.execute(
            "INSERT INTO patient_bed_assignment (patient_id, bed_id) VALUES (%s,%s)",
            (patient_id, bed_id)
        )
        db.commit()
        return jsonify({"message": "Bed assigned successfully!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Get Doctors ────────────────────────────────────────────────────────────────
@app.route('/doctors')
def get_doctors():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT id, name, specialization FROM doctors")
        doctors = [dict(r) for r in cursor.fetchall()]
        return jsonify({"doctors": doctors})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Get Appointments for Doctor ────────────────────────────────────────────────
# NOTE: includes patient_id in SELECT so reception edit works correctly
@app.route('/appointments/<int:doctor_id>')
def get_appointments(doctor_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT a.id, a.patient_id, a.date, a.time, a.status,
                   p.name AS patient_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.doctor_id = %s
            ORDER BY a.date, a.time
        """, (doctor_id,))
        appointments = serialize_rows(cursor.fetchall())
        return jsonify({"appointments": appointments})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Add Appointment ────────────────────────────────────────────────────────────
@app.route('/appointments', methods=['POST'])
def add_appointment():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO appointments (doctor_id, patient_id, date, time, status)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data['doctor_id'], data['patient_id'], data['date'],
            data['time'], data.get('status', 'Scheduled')
        ))
        db.commit()
        return jsonify({"message": "Appointment added successfully!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Update Appointment ─────────────────────────────────────────────────────────
@app.route('/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            UPDATE appointments SET date=%s, time=%s, status=%s WHERE id=%s
        """, (data['date'], data['time'], data['status'], appointment_id))
        db.commit()
        return jsonify({"message": "Appointment updated successfully!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Delete Appointment ─────────────────────────────────────────────────────────
@app.route('/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM appointments WHERE id=%s", (appointment_id,))
        db.commit()
        return jsonify({"message": "Appointment deleted successfully!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Get Upcoming Appointments for Doctor ──────────────────────────────────────
@app.route('/appointments/upcoming/<int:doctor_id>')
def get_upcoming_appointments(doctor_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        today = date.today()
        cursor.execute("""
            SELECT a.id, p.id AS patient_id, p.name AS patient_name,
                   a.date, a.time, a.status
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.doctor_id = %s AND a.status='Scheduled' AND a.date >= %s
            ORDER BY a.date, a.time
        """, (doctor_id, today))
        appointments = serialize_rows(cursor.fetchall())
        return jsonify({"appointments": appointments})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Get Doctor's Patients ──────────────────────────────────────────────────────
@app.route('/doctor/<int:doctor_id>/patients', methods=['GET'])
def get_doctor_patients(doctor_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT DISTINCT p.id, p.name, p.age, p.phone, p.bed_id,
                            p.medical_history, p.current_medication
            FROM patients p
            JOIN appointments a ON p.id = a.patient_id
            WHERE a.doctor_id = %s
        """, (doctor_id,))
        patients = [dict(r) for r in cursor.fetchall()]
        return jsonify({"patients": patients})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Doctor Patient Count (distinct patients with any appointment) ──────────────
@app.route('/doctor/<int:doctor_id>/patient_count', methods=['GET'])
def get_doctor_patient_count(doctor_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(
            "SELECT COUNT(DISTINCT a.patient_id) FROM appointments a WHERE a.doctor_id = %s",
            (doctor_id,)
        )
        count = cursor.fetchone()[0]
        return jsonify({"count": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Get Doctors for HOD's Department ──────────────────────────────────────────
# Accepts ?hod_id=<id> (preferred — looks up department server-side) or
# ?department=<name> (fallback when hod_id is unavailable).
@app.route('/hod/doctors', methods=['GET'])
def get_doctors_by_hod():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        hod_id     = request.args.get('hod_id')
        department = request.args.get('department')

        if hod_id:
            cursor.execute("SELECT department FROM hod WHERE id = %s", (hod_id,))
            row = cursor.fetchone()
            if not row:
                return jsonify({"error": "HOD not found"}), 404
            department = row['department']

        if department:
            cursor.execute(
                "SELECT id, name, email, specialization, phone, department "
                "FROM doctors "
                "WHERE department = %s "
                "ORDER BY name",
                (department,)
            )
        else:
            cursor.execute(
                "SELECT id, name, email, specialization, phone, department "
                "FROM doctors "
                "ORDER BY department, name"
            )

        doctors = [dict(r) for r in cursor.fetchall()]
        return jsonify({"doctors": doctors})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── HOD Performance Reports ────────────────────────────────────────────────────
# Accepts ?hod_id=<id> (required) and optional ?month=<YYYY-MM-DD>.
# Resolves the HOD's department from the hod table, then returns
# doctor_performance rows only for doctors in that department.
@app.route('/hod/reports', methods=['GET'])
def get_hod_reports():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        hod_id = request.args.get('hod_id')
        month  = request.args.get('month')

        if not hod_id:
            return jsonify({"error": "hod_id is required"}), 400

        cursor.execute("SELECT department FROM hod WHERE id = %s", (hod_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "HOD not found"}), 404
        department = row['department']

        if month:
            cursor.execute("""
                SELECT dp.id, dp.doctor_id, d.name, d.department, dp.month,
                       dp.total      AS total_appointments,
                       dp.completed  AS completed_appointments,
                       dp.missed     AS missed_appointments,
                       dp.avg_consultation_time,
                       dp.avg_patient_feedback
                FROM doctor_performance dp
                JOIN doctors d ON dp.doctor_id = d.id
                WHERE d.department = %s AND dp.month = %s
                ORDER BY dp.month DESC, d.name
            """, (department, month))
        else:
            cursor.execute("""
                SELECT dp.id, dp.doctor_id, d.name, d.department, dp.month,
                       dp.total      AS total_appointments,
                       dp.completed  AS completed_appointments,
                       dp.missed     AS missed_appointments,
                       dp.avg_consultation_time,
                       dp.avg_patient_feedback
                FROM doctor_performance dp
                JOIN doctors d ON dp.doctor_id = d.id
                WHERE d.department = %s
                ORDER BY dp.month DESC, d.name
            """, (department,))

        reports = serialize_rows(cursor.fetchall())
        return jsonify({"reports": reports})
    except Exception as e:
        print("ERROR /hod/reports:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Update Doctor ──────────────────────────────────────────────────────────────
@app.route('/doctors/<int:doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            UPDATE doctors
            SET name=%s, email=%s, specialization=%s, department=%s, phone=%s
            WHERE id=%s
        """, (
            data.get('name'), data.get('email'), data.get('specialization'),
            data.get('department'), data.get('phone'), doctor_id
        ))
        db.commit()
        return jsonify({"message": "Doctor updated successfully!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Delete Doctor ──────────────────────────────────────────────────────────────
@app.route('/doctors/<int:doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM doctors WHERE id=%s", (doctor_id,))
        db.commit()
        return jsonify({"message": "Doctor deleted successfully!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Doctor Performance ─────────────────────────────────────────────────────────
@app.route("/doctor_performance", methods=["GET"])
def get_doctor_performance():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        month = request.args.get("month")
        if month:
            cursor.execute("""
                SELECT dp.doctor_id, d.id, d.name, d.department, dp.month,
                       dp.total      AS total_appointments,
                       dp.completed  AS completed_appointments,
                       dp.missed     AS missed_appointments,
                       dp.avg_consultation_time,
                       dp.avg_patient_feedback
                FROM doctor_performance dp
                JOIN doctors d ON dp.doctor_id = d.id
                WHERE dp.month = %s
                ORDER BY dp.month DESC, d.name
            """, (month,))
        else:
            cursor.execute("""
                SELECT dp.doctor_id, d.id, d.name, d.department, dp.month,
                       dp.total      AS total_appointments,
                       dp.completed  AS completed_appointments,
                       dp.missed     AS missed_appointments,
                       dp.avg_consultation_time,
                       dp.avg_patient_feedback
                FROM doctor_performance dp
                JOIN doctors d ON dp.doctor_id = d.id
                ORDER BY dp.month DESC, d.name
            """)
        data = serialize_rows(cursor.fetchall())
        return jsonify({"performance": data})
    except Exception as e:
        print("ERROR /doctor_performance:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


@app.route("/doctor_performance/<int:doctor_id>", methods=["GET"])
def get_single_doctor_performance(doctor_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT d.id, d.name, d.department, dp.month,
                   dp.total      AS total_appointments,
                   dp.completed  AS completed_appointments,
                   dp.missed     AS missed_appointments,
                   dp.avg_consultation_time,
                   dp.avg_patient_feedback
            FROM doctor_performance dp
            JOIN doctors d ON dp.doctor_id = d.id
            WHERE d.id = %s
        """, (doctor_id,))
        data = serialize_rows(cursor.fetchall())
        return jsonify({"performance": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Load ML Model ──────────────────────────────────────────────────────────────
multi_disease_model = joblib.load("multi_disease_model.pkl")
le_gender = joblib.load("le_gender.pkl")


@app.route("/")
def home():
    return "CityCare Hospital API is Running!"


# ── Analyze Patient ────────────────────────────────────────────────────────────
@app.route("/analyze_patient/<int:patient_id>", methods=["POST"])
def analyze_patient(patient_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT age, gender, bmi, temperature, heart_rate,
                   systolic_bp, diastolic_bp, spo2, blood_sugar,
                   fever, cough, fatigue, difficulty_breathing,
                   chest_pain, nausea, history_diabetes,
                   history_hypertension, history_asthma
            FROM patient_vitals
            WHERE patient_id=%s
        """, (patient_id,))
        patient = cursor.fetchone()
        if not patient:
            return jsonify({"error": "Patient vitals not found. Please add vitals first."}), 404
        features = [
            patient['age'],
            le_gender.transform([patient['gender']])[0],
            patient['bmi'], patient['temperature'], patient['heart_rate'],
            patient['systolic_bp'], patient['diastolic_bp'], patient['spo2'],
            patient['blood_sugar'], patient['fever'], patient['cough'],
            patient['fatigue'], patient['difficulty_breathing'],
            patient['chest_pain'], patient['nausea'],
            patient['history_diabetes'], patient['history_hypertension'],
            patient['history_asthma']
        ]
        prediction = multi_disease_model.predict([features])[0]
        diseases = ['Flu', 'COVID', 'Pneumonia', 'Asthma',
                    'Diabetes', 'Hypertension', 'HeartDisease']
        result = [d for d, p in zip(diseases, prediction) if p == 1]
        return jsonify({"possible_diseases": result or ["No disease detected"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Insert / Update Patient Vitals ─────────────────────────────────────────────
@app.route("/patient_vitals", methods=["POST"])
def add_patient_vitals():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO patient_vitals (
                patient_id, age, gender, bmi, temperature, heart_rate,
                systolic_bp, diastolic_bp, spo2, blood_sugar,
                fever, cough, fatigue, difficulty_breathing,
                chest_pain, nausea, history_diabetes,
                history_hypertension, history_asthma
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (patient_id) DO UPDATE SET
                age=EXCLUDED.age, gender=EXCLUDED.gender, bmi=EXCLUDED.bmi,
                temperature=EXCLUDED.temperature, heart_rate=EXCLUDED.heart_rate,
                systolic_bp=EXCLUDED.systolic_bp, diastolic_bp=EXCLUDED.diastolic_bp,
                spo2=EXCLUDED.spo2, blood_sugar=EXCLUDED.blood_sugar,
                fever=EXCLUDED.fever, cough=EXCLUDED.cough, fatigue=EXCLUDED.fatigue,
                difficulty_breathing=EXCLUDED.difficulty_breathing,
                chest_pain=EXCLUDED.chest_pain, nausea=EXCLUDED.nausea,
                history_diabetes=EXCLUDED.history_diabetes,
                history_hypertension=EXCLUDED.history_hypertension,
                history_asthma=EXCLUDED.history_asthma
        """, (
            data['patient_id'], data['age'], data['gender'], data['bmi'],
            data['temperature'], data['heart_rate'], data['systolic_bp'],
            data['diastolic_bp'], data['spo2'], data['blood_sugar'],
            data['fever'], data['cough'], data['fatigue'],
            data['difficulty_breathing'], data['chest_pain'], data['nausea'],
            data['history_diabetes'], data['history_hypertension'], data['history_asthma']
        ))
        db.commit()
        return jsonify({"message": "Patient vitals saved successfully!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Medicine Stock ─────────────────────────────────────────────────────────────
@app.route("/medicines/stock", methods=["GET"])
def check_stock():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM medicines")
        medicines = [dict(r) for r in cursor.fetchall()]
        return jsonify(medicines)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Medicine Reorder ───────────────────────────────────────────────────────────
@app.route("/medicines/reorder", methods=["GET"])
def reorder_analysis():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT id, name, stock_quantity, reorder_level
            FROM medicines
            WHERE stock_quantity <= reorder_level
            ORDER BY stock_quantity ASC
        """)
        reorder_list = [dict(r) for r in cursor.fetchall()]
        return jsonify(reorder_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Medicine Usage ─────────────────────────────────────────────────────────────
@app.route("/medicines/usage", methods=["GET"])
def medicine_usage():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT m.name, SUM(pm.quantity) AS total_used
            FROM patient_medicines pm
            JOIN medicines m ON pm.medicine_id = m.id
            GROUP BY m.id, m.name
            ORDER BY total_used DESC
        """)
        usage = [dict(r) for r in cursor.fetchall()]
        return jsonify(usage)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Get Medicines for a Patient ────────────────────────────────────────────────
# ── All Patient Medicines (pharmacist view) ────────────────────────────────────
@app.route("/all_patient_medicines", methods=["GET"])
def get_all_patient_medicines():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT p.name AS patient_name,
                   m.name AS medicine_name,
                   pm.quantity,
                   pm.date_given
            FROM patient_medicines pm
            JOIN medicines m ON pm.medicine_id = m.id
            JOIN patients  p ON pm.patient_id  = p.id
            ORDER BY p.name, pm.date_given DESC
        """)
        records = serialize_rows(cursor.fetchall())
        return jsonify(records)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


@app.route("/patient_medicines/<int:patient_id>", methods=["GET"])
def get_patient_medicines(patient_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT pm.id, m.name AS medicine_name, pm.quantity, pm.date_given
            FROM patient_medicines pm
            JOIN medicines m ON pm.medicine_id = m.id
            WHERE pm.patient_id = %s
            ORDER BY pm.date_given DESC, pm.id DESC
        """, (patient_id,))
        records = serialize_rows(cursor.fetchall())
        return jsonify({"medicines": records})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Assign Medicine to Patient ─────────────────────────────────────────────────
@app.route("/patient_medicines", methods=["POST"])
def assign_medicine():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute(
            "SELECT stock_quantity FROM medicines WHERE id=%s", (data['medicine_id'],)
        )
        med = cursor.fetchone()
        if not med:
            return jsonify({"error": "Medicine not found"}), 404
        if int(data['quantity']) > med['stock_quantity']:
            return jsonify({
                "error": f"Insufficient stock. Available: {med['stock_quantity']}"
            }), 400

        cursor.execute("""
            INSERT INTO patient_medicines (patient_id, medicine_id, quantity, date_given)
            VALUES (%s, %s, %s, %s)
        """, (data['patient_id'], data['medicine_id'], data['quantity'], data['date_given']))

        cursor.execute(
            "UPDATE medicines SET stock_quantity = stock_quantity - %s WHERE id = %s",
            (data['quantity'], data['medicine_id'])
        )
        db.commit()
        return jsonify({"message": "Medicine assigned and stock updated!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Record Medicine Reorder ────────────────────────────────────────────────────
@app.route("/medicines/order", methods=["POST"])
def record_medicine_order():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        medicine_ids = data.get('medicine_ids', [])
        if not medicine_ids:
            return jsonify({"error": "No medicine IDs provided"}), 400
        for mid in medicine_ids:
            cursor.execute("""
                INSERT INTO medicine_orders (medicine_id, ordered_at)
                VALUES (%s, NOW())
                ON CONFLICT DO NOTHING
            """, (mid,))
        db.commit()
        return jsonify({"message": f"Order recorded for {len(medicine_ids)} medicine(s)"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Medicine Expiry — PostgreSQL syntax ───────────────────────────────────────
@app.route("/medicines/expiry", methods=["GET"])
def expiry_alert():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT name, stock_quantity, expiry_date
            FROM medicines
            WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days'
            ORDER BY expiry_date ASC
        """)
        expiring_meds = serialize_rows(cursor.fetchall())
        return jsonify(expiring_meds)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Patient Signup ─────────────────────────────────────────────────────────────
# Inserts into patient_accounts (self-service portal accounts).
# The patients table is populated separately by reception when the patient
# visits in person.  The two records are linked later by name + phone.
@app.route('/patient_signup', methods=['POST'])
def patient_signup():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO patient_accounts (name, email, password, phone, age, gender)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data['name'], data['email'], hash_password(data['password']),
            data['phone'], data['age'], data['gender']
        ))
        db.commit()
        return jsonify({"message": "Patient signup successful!"})
    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"message": str(e)}), 400
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Patient Login ──────────────────────────────────────────────────────────────
# Reads from patient_accounts (self-service portal accounts).
@app.route('/patient_login', methods=['POST'])
def patient_login():
    data = request.get_json()
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT * FROM patient_accounts WHERE email=%s", (data['email'],)
        )
        user = cursor.fetchone()
        if user and check_password(data['password'], user['password']):
            return jsonify({"status": "success", "id": user['id'], "name": user['name']})
        return jsonify({"status": "fail", "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Patient Profile ─────────────────────────────────────────────────────────────
# patient_id = patient_accounts.id  (the self-service portal account id).
# Queries patient_accounts for portal credentials (name, email, phone, age, gender).
@app.route('/patient_profile/<int:patient_id>', methods=['GET'])
def patient_profile(patient_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT id, name, email, phone, age, gender
            FROM patient_accounts
            WHERE id = %s
        """, (patient_id,))
        profile = cursor.fetchone()
        return jsonify({"profile": dict(profile) if profile else None})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ── Patient Appointments ───────────────────────────────────────────────────────
# account_id = patient_accounts.id (what patient_login returns).
# Resolves the matching patients.id via phone number, then queries appointments.
# appointments.patient_id references patients.id (reception record), NOT
# patient_accounts.id, so the resolution step is mandatory.
@app.route('/patient_appointments/<int:account_id>', methods=['GET'])
def patient_appointments(account_id):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Resolve portal account → reception-created patient record via phone
        cursor.execute(
            "SELECT phone FROM patient_accounts WHERE id = %s", (account_id,)
        )
        account = cursor.fetchone()
        if not account:
            return jsonify({"appointments": []})

        cursor.execute(
            "SELECT id FROM patients WHERE phone = %s LIMIT 1",
            (account['phone'],)
        )
        patient = cursor.fetchone()
        if not patient:
            return jsonify({"appointments": []})

        patient_id = patient['id']
        cursor.execute("""
            SELECT a.id, a.date, a.time, a.status,
                   d.name AS doctor_name, d.specialization
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.patient_id = %s
            ORDER BY a.date DESC, a.time DESC
        """, (patient_id,))
        appointments = serialize_rows(cursor.fetchall())
        return jsonify({"appointments": appointments})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


if __name__ == "__main__":
    app.run(debug=True)
