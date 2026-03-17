from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime, date, time, timedelta
import joblib
import pandas as pd


app = Flask(__name__)
CORS(app)  # allow frontend requests

# ✅ Database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="admin@123",
        database="hospital",
        ssl_disabled=True
    )

# -------------------------------
# Doctor Signup
# -------------------------------
@app.route('/doctor_signup', methods=['POST'])
def doctor_signup():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor()
        query = """
        INSERT INTO doctors (name, email, password, specialization, phone, department)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        values = (data['name'], data['email'], data['password'], data['specialization'], data['phone'], data['department'])
        cursor.execute(query, values)
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Doctor signup successful!"})
    except mysql.connector.Error as e:
        return jsonify({"message": str(e)}), 400

# -------------------------------
# Doctor Login
# -------------------------------
@app.route('/doctor_login', methods=['POST'])
def doctor_login():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        query = "SELECT * FROM doctors WHERE email=%s AND password=%s"
        cursor.execute(query, (data['email'], data['password']))
        user = cursor.fetchone()
        cursor.close()
        db.close()

        if user:
            # ✅ Include doctor ID and name in response
            return jsonify({
                "status": "success",
                "id": user['id'],      # send doctor id
                "name": user['name']   # send doctor name
            })
        else:
            return jsonify({"status": "fail", "message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# -------------------------------
# HOD Signup & Login
# -------------------------------
@app.route('/hod_signup', methods=['POST'])
def hod_signup():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor()
        query = "INSERT INTO hods (name, email, password, phone, department) VALUES (%s,%s,%s,%s,%s)"
        values = (data['name'], data['email'], data['password'], data['phone'], data['department'])
        cursor.execute(query, values)
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "HOD signup successful!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/hod_login', methods=['POST'])
def hod_login():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Check email and password
        cursor.execute(
            "SELECT * FROM hods WHERE email=%s AND password=%s",
            (data['email'], data['password'])
        )
        user = cursor.fetchone()
        cursor.close()
        db.close()

        if user:
            # Return name and department
            return jsonify({
                "message": "Login successful",
                "name": user['name'],
                "department": user['department']  # <-- make sure hods table has department column
            })
        else:
            return jsonify({"message": "Login failed"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------
# Reception Signup & Login
# -------------------------------
@app.route('/reception_signup', methods=['POST'])
def reception_signup():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor()
        query = "INSERT INTO receptions (name,email,password,phone) VALUES (%s,%s,%s,%s)"
        values = (data['name'], data['email'], data['password'], data['phone'])
        cursor.execute(query, values)
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Reception signup successful!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reception_login', methods=['POST'])
def reception_login():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT name FROM receptions WHERE email=%s AND password=%s", (data['email'], data['password']))
        user = cursor.fetchone()
        cursor.close()
        db.close()
        if user:
            return jsonify({"success": True, "name": user['name']})
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#  pharmacist login and signup

@app.route('/pharmacist_signup', methods=['POST'])
def pharmacist_signup():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor()

        query = "INSERT INTO pharmacists (name, email, password, contact) VALUES (%s,%s,%s,%s)"
        values = (data['name'], data['email'], data['password'], data['phone'])
        cursor.execute(query, values)
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Pharmacist signup successful!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- Pharmacist Login ----------------
@app.route('/pharmacist_login', methods=['POST'])
def pharmacist_login():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT id, name FROM pharmacists WHERE email=%s AND password=%s", 
                       (data['email'], data['password']))
        user = cursor.fetchone()
        cursor.close()
        db.close()

        if user:
            return jsonify({"success": True, "id": user['id'], "name": user['name']})
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------------------
# Patient Registration & Bed Management
# -------------------------------
@app.route('/register_patient', methods=['POST'])
def register_patient():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO patients
            (name, age, gender, phone, address, insurance_provider, policy_number, medical_history, current_medication)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data['name'], data['age'], data['gender'], data['phone'], data['address'],
            data['insurance_provider'], data['policy_number'], data['medical_history'], data['current_medication']
        ))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Patient registered successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/patients")
def get_patients():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM patients")
        patients = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify({"patients": patients})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/beds")
def get_beds():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM beds")
        beds = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify(beds)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/assign_bed', methods=['POST'])
def assign_bed():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor()
        patient_id = int(data['patient_id'])
        bed_id = int(data['bed_id'])

        # Update bed status
        cursor.execute("UPDATE beds SET status='Occupied' WHERE bed_id=%s", (bed_id,))
        # Assign bed to patient
        cursor.execute("UPDATE patients SET bed_id=%s WHERE id=%s", (bed_id, patient_id))
        # Insert into patient_bed_assignment
        cursor.execute("INSERT INTO patient_bed_assignment (patient_id, bed_id) VALUES (%s,%s)", (patient_id, bed_id))

        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Bed assigned successfully!"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

# -------------------------------
# Doctors & Appointments for reception
# -------------------------------
@app.route('/doctors')
def get_doctors():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, name, specialization FROM doctors")
        doctors = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify({"doctors": doctors})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/appointments/<int:doctor_id>')
def get_appointments(doctor_id):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        query = """
            SELECT a.id, a.date, a.time, a.status, p.name AS patient_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.doctor_id = %s
            ORDER BY a.date, a.time
        """
        cursor.execute(query, (doctor_id,))
        appointments = cursor.fetchall()

        # Convert date/time to string
        for appt in appointments:
            if isinstance(appt['date'], (date, datetime)):
                appt['date'] = appt['date'].strftime('%Y-%m-%d')
            if isinstance(appt['time'], (time, timedelta)):
                if isinstance(appt['time'], timedelta):
                    total_seconds = int(appt['time'].total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    seconds = total_seconds % 60
                    appt['time'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
                else:
                    appt['time'] = appt['time'].strftime('%H:%M:%S')

        cursor.close()
        db.close()
        return jsonify({"appointments": appointments})
    except Exception as e:
        print("Error fetching appointments:", e)
        return jsonify({"error": str(e)}), 500


@app.route('/appointments', methods=['POST'])
def add_appointment():
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO appointments (doctor_id, patient_id, date, time, status)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['doctor_id'], data['patient_id'], data['date'], data['time'], data.get('status', 'Scheduled')))
        db.commit()
        return jsonify({"message": "Appointment added successfully!"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            UPDATE appointments
            SET date=%s, time=%s, status=%s
            WHERE id=%s
        """, (data['date'], data['time'], data['status'], appointment_id))
        db.commit()
        return jsonify({"message": "Appointment updated successfully!"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM appointments WHERE id=%s", (appointment_id,))
        db.commit()
        return jsonify({"message": "Appointment deleted successfully!"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


# filter doc appointment 

@app.route('/appointments/upcoming/<int:doctor_id>')
def get_upcoming_appointments(doctor_id):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        today = date.today()  # current date

        query = """
        SELECT a.id, p.id AS patient_id, p.name AS patient_name, a.date, a.time, a.status
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE a.doctor_id = %s AND a.status='Scheduled' AND a.date >= %s
        ORDER BY a.date, a.time
        """
        cursor.execute(query, (doctor_id, today))
        appointments = cursor.fetchall()

        # Convert date/time to string for JSON serialization
        for appt in appointments:
            if isinstance(appt['date'], (datetime, date)):
                appt['date'] = appt['date'].strftime('%Y-%m-%d')
            if isinstance(appt['time'], (time, timedelta)):
                if isinstance(appt['time'], timedelta):
                    total_seconds = int(appt['time'].total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    seconds = total_seconds % 60
                    appt['time'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
                else:
                    appt['time'] = appt['time'].strftime('%H:%M:%S')

        cursor.close()
        db.close()
        return jsonify({"appointments": appointments})
    except Exception as e:
        print("ERROR:", e)  # will print the exact exception in console
        return jsonify({"error": str(e)}), 500

@app.route('/doctor/<int:doctor_id>/patients', methods=['GET'])
def get_doctor_patients(doctor_id):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Select distinct patients who have appointments with this doctor
        query = """
        SELECT DISTINCT 
        p.id, 
        p.name, 
        p.age, 
        p.phone,
        p.bed_id,
        p.medical_history,
        p.current_medication
        FROM patients p
        JOIN appointments a ON p.id = a.patient_id
        WHERE a.doctor_id = %s
        """
        cursor.execute(query, (doctor_id,))
        patients = cursor.fetchall()

        cursor.close()
        db.close()
        return jsonify({"patients": patients})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Get doctors for HOD's department --------------------
@app.route('/hod/doctors', methods=['GET'])
def get_doctors_by_hod():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Optionally filter by department
        department = request.args.get('department')  # e.g., ?department=Cardiology
        if department:
            cursor.execute(
                "SELECT id, name, email, specialization, department, phone, created_at "
                "FROM doctors WHERE department=%s",
                (department,)
            )
        else:
            cursor.execute(
                "SELECT id, name, email, specialization, department, phone, created_at "
                "FROM doctors"
            )

        doctors = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify({"doctors": doctors})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Update doctor --------------------
@app.route('/doctors/<int:doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor()

        # Update doctor details: name, email, specialization, department, phone
        cursor.execute("""
            UPDATE doctors
            SET name=%s, email=%s, specialization=%s, department=%s, phone=%s
            WHERE id=%s
        """, (
            data.get('name'),
            data.get('email'),
            data.get('specialization'),
            data.get('department'),
            data.get('phone'),
            doctor_id
        ))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Doctor updated successfully!"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------- Delete doctor --------------------
@app.route('/doctors/<int:doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("DELETE FROM doctors WHERE id=%s", (doctor_id,))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Doctor deleted successfully!"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

# REport Doc performance

@app.route("/doctor_performance", methods=["GET"])
def get_doctor_performance():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Optional query param: month filter
        month = request.args.get("month")  # format: '2025-11'
        if month:
            cursor.execute("""
                SELECT d.id, d.name, d.department, dp.month, dp.total_appointments,
                       dp.completed_appointments, dp.missed_appointments,
                       dp.avg_consultation_time, dp.avg_patient_feedback
                FROM doctor_performance dp
                JOIN doctors d ON dp.doctor_id = d.id
                WHERE dp.month = %s
            """, (month,))
        else:
            cursor.execute("""
                SELECT d.id, d.name, d.department, dp.month, dp.total_appointments,
                       dp.completed_appointments, dp.missed_appointments,
                       dp.avg_consultation_time, dp.avg_patient_feedback
                FROM doctor_performance dp
                JOIN doctors d ON dp.doctor_id = d.id
            """)

        data = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify({"performance": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/doctor_performance/<int:doctor_id>", methods=["GET"])
def get_single_doctor_performance(doctor_id):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT d.id, d.name, d.department, dp.month, dp.total_appointments,
                   dp.completed_appointments, dp.missed_appointments,
                   dp.avg_consultation_time, dp.avg_patient_feedback
            FROM doctor_performance dp
            JOIN doctors d ON dp.doctor_id = d.id
            WHERE d.id = %s
        """, (doctor_id,))
        data = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify({"performance": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Load multi-disease model and encoders

multi_disease_model = joblib.load("multi_disease_model.pkl")
le_gender = joblib.load("le_gender.pkl")

@app.route("/")
def home():
    return "Multi-Disease Prediction API is Running!"

@app.route("/analyze_patient/<int:patient_id>", methods=["POST"])
def analyze_patient(patient_id):
    try:
        # Connect to DB
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Fetch patient vitals and history
        cursor.execute("""
            SELECT age, gender, bmi, temperature, heart_rate, systolic_bp, diastolic_bp, spo2, blood_sugar,
                   fever, cough, fatigue, difficulty_breathing, chest_pain, nausea,
                   history_diabetes, history_hypertension, history_asthma
            FROM patient_vitals
            WHERE patient_id=%s
        """, (patient_id,))
        patient = cursor.fetchone()

        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # Prepare features in the same order as training
        features = [
            patient['age'],
            le_gender.transform([patient['gender']])[0],
            patient['bmi'],
            patient['temperature'],
            patient['heart_rate'],
            patient['systolic_bp'],
            patient['diastolic_bp'],
            patient['spo2'],
            patient['blood_sugar'],
            patient['fever'],
            patient['cough'],
            patient['fatigue'],
            patient['difficulty_breathing'],
            patient['chest_pain'],
            patient['nausea'],
            patient['history_diabetes'],
            patient['history_hypertension'],
            patient['history_asthma']
        ]

        # Predict diseases
        prediction = multi_disease_model.predict([features])[0]

        # Map prediction to disease names
        diseases = ['Flu', 'COVID', 'Pneumonia', 'Asthma', 'Diabetes', 'Hypertension', 'HeartDisease']
        result = [d for d, p in zip(diseases, prediction) if p == 1]

        return jsonify({"possible_diseases": result or ["No disease detected"]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

# medicine backend
#check

@app.route("/medicines/stock", methods=["GET"])
def check_stock():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM medicines")
    medicines = cursor.fetchall()
    return jsonify(medicines)

#reorder

@app.route("/medicines/reorder", methods=["GET"])
def reorder_analysis():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    query = """
        SELECT name, stock_quantity, reorder_level, reorder_quantity
        FROM medicines
        WHERE stock_quantity <= reorder_level
    """
    cursor.execute(query)
    reorder_list = cursor.fetchall()
    return jsonify(reorder_list)
#most used
@app.route("/medicines/usage", methods=["GET"])
def medicine_usage():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    query = """
        SELECT m.name, SUM(pm.quantity) AS total_used
        FROM patient_medicines pm
        JOIN medicines m ON pm.medicine_id = m.id
        GROUP BY m.id
        ORDER BY total_used DESC
    """
    cursor.execute(query)
    usage = cursor.fetchall()
    return jsonify(usage)

#assign medicine to patient 

@app.route("/patient_medicines", methods=["POST"])
def assign_medicine():
    data = request.json
    db = get_db_connection()
    cursor = db.cursor()
    query = """
        INSERT INTO patient_medicines (patient_id, medicine_id, quantity, date_given)
        VALUES (%s, %s, %s, %s)
    """
    cursor.execute(query, (data["patient_id"], data["medicine_id"], data["quantity"], data["date_given"]))
    
    # Update stock quantity
    cursor.execute("UPDATE medicines SET stock_quantity = stock_quantity - %s WHERE id = %s",
                   (data["quantity"], data["medicine_id"]))
    
    db.commit()
    return jsonify({"message": "Medicine assigned and stock updated!"})


#expiry alert 

@app.route("/medicines/expiry", methods=["GET"])
def expiry_alert():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    query = """
        SELECT name, stock_quantity, expiry_date
        FROM medicines
        WHERE expiry_date <= CURDATE() + INTERVAL 30 DAY
        ORDER BY expiry_date ASC
    """
    cursor.execute(query)
    expiring_meds = cursor.fetchall()
    return jsonify(expiring_meds)


if __name__ == "__main__":
    app.run(debug=True)
