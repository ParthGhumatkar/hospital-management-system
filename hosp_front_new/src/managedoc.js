import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

function ManageDoctors() {
  const location = useLocation();
  const hodDepartment = location.state?.department || "General";

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null); // Track expanded doctor
  const [appointmentsMap, setAppointmentsMap] = useState({}); // Store appointments for each doctor

  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    specialization: "",
    department: hodDepartment,
    phone: ""
  });

  // ---------------- Fetch doctors ----------------
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:5000/hod/doctors?department=${hodDepartment}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors");
    }
    setLoading(false);
  }, [hodDepartment]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // ---------------- Fetch appointments for a doctor ----------------
  const fetchAppointments = async (doctorId) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/appointments/${doctorId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAppointmentsMap(prev => ({ ...prev, [doctorId]: data.appointments || [] }));
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointmentsMap(prev => ({ ...prev, [doctorId]: [] }));
    }
  };

  // ---------------- Edit doctor ----------------
  const handleEdit = (doc) => {
    setForm({
      id: doc.id,
      name: doc.name,
      email: doc.email,
      specialization: doc.specialization,
      department: doc.department,
      phone: doc.phone
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------- Save (Update) doctor ----------------
  const handleSave = async () => {
    if (!form.name || !form.email) return alert("Name and Email required");

    try {
      const res = await fetch(`http://127.0.0.1:5000/doctors/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert(data.message);
      setForm({ id: null, name: "", email: "", specialization: "", department: hodDepartment, phone: "" });
      fetchDoctors();
    } catch (err) {
      console.error("Error updating doctor:", err);
      alert("Failed to update doctor");
    }
  };

  // ---------------- Delete doctor ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/doctors/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert(data.message);
      fetchDoctors();
    } catch (err) {
      console.error("Error deleting doctor:", err);
      alert("Failed to delete doctor");
    }
  };

  return (
    <div style={container}>
      <h2 style={header}>
        🩺 Manage Doctors — <span style={{ color: "#007bff" }}>{hodDepartment}</span>
      </h2>

      {loading ? (
        <p>Loading doctors...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div style={grid}>
          {doctors.map((doc) => (
            <div key={doc.id} style={card}>
              {/* Doctor Name clickable to expand/collapse */}
              <h3
                style={{ color: "#007bff", marginBottom: "5px", cursor: "pointer" }}
                onClick={() => {
                  if (selectedDoctorId === doc.id) {
                    setSelectedDoctorId(null);
                  } else {
                    setSelectedDoctorId(doc.id);
                    fetchAppointments(doc.id); // fetch appointments on expand
                  }
                }}
              >
                {doc.name}
              </h3>
              <p><strong>Department:</strong> {doc.department}</p>

              {/* Expand full details only if selected */}
              {selectedDoctorId === doc.id && (
                <div style={{ marginTop: "10px" }}>
                  <p><strong>Email:</strong> {doc.email}</p>
                  <p><strong>Specialization:</strong> {doc.specialization}</p>
                  <p><strong>Phone:</strong> {doc.phone}</p>

                  <h4 style={{ marginTop: "10px" }}>Appointments:</h4>
                  {appointmentsMap[doc.id]?.length ? (
                    <ul>
                      {appointmentsMap[doc.id].map((appt) => (
                        <li key={appt.id}>
                          {appt.date} {appt.time} — {appt.patient_name} ({appt.status})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No appointments</p>
                  )}

                  <div style={{ marginTop: "10px" }}>
                    <button style={btnEdit} onClick={() => handleEdit(doc)}>Edit</button>
                    <button style={btnDelete} onClick={() => handleDelete(doc.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Update Form */}
      {form.id && (
        <div style={updateCard}>
          <h3>Update Doctor Details</h3>
          <div style={formGrid}>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={input} />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={input} />
            <input placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} style={input} />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={input} />
            <button onClick={handleSave} style={btnSave}>💾 Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- CSS ----------------
const container = { padding: "40px", fontFamily: "Poppins, sans-serif", backgroundColor: "#f4f8fc", minHeight: "100vh" };
const header = { fontSize: "26px", fontWeight: "600", marginBottom: "25px", background: "linear-gradient(90deg, #007bff, #00c6ff)", WebkitBackgroundClip: "text", color: "transparent" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" };
const card = { backgroundColor: "white", borderRadius: "15px", padding: "20px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", transition: "transform 0.2s" };
const updateCard = { marginTop: "40px", backgroundColor: "white", borderRadius: "10px", padding: "25px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" };
const input = { padding: "10px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "14px", width: "100%" };
const formGrid = { display: "flex", flexDirection: "column", gap: "10px" };
const btnEdit = { backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", marginRight: "5px" };
const btnDelete = { backgroundColor: "#ff4d4d", color: "white", border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer" };
const btnSave = { backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "8px", padding: "10px", fontWeight: "bold", cursor: "pointer", marginTop: "5px" };

export default ManageDoctors;
