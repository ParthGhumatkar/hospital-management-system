import React, { useEffect, useState } from "react";

function ManageAppointments() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Form for adding/updating appointment
  const [form, setForm] = useState({
    id: null, // null for new, set for updating
    patient_id: "",
    date: "",
    time: "",
    status: "Scheduled",
  });

  // ---------------------- Fetch doctors ----------------------
  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/doctors");
      const data = await res.json();
      setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
    }
  };

  // ---------------------- Fetch patients ----------------------
  const fetchPatients = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/patients");
      const data = await res.json();
      setPatients(Array.isArray(data.patients) ? data.patients : []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  };

  // ---------------------- Fetch appointments ----------------------
const fetchAppointments = async (doctorId) => {
  console.log("Fetching appointments for doctorId:", doctorId);
  setLoadingAppointments(true);
  try {
    const res = await fetch(`http://127.0.0.1:5000/appointments/${doctorId}`);
    const data = await res.json();
    console.log("Appointments data from backend:", data);
    setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    setAppointments([]);
  }
  setLoadingAppointments(false);
};



  useEffect(() => {
    fetchDoctors();
    fetchPatients();
  }, []);

  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    fetchAppointments(doctor.id);
  };

  // ---------------------- Add or Update appointment ----------------------
  const handleSaveAppointment = async () => {
    if (!selectedDoctor) return alert("Select a doctor first");
    if (!form.patient_id || !form.date || !form.time) return alert("Fill all fields");

    const url = form.id
      ? `http://127.0.0.1:5000/appointments/${form.id}`
      : "http://127.0.0.1:5000/appointments";

    const method = form.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, doctor_id: selectedDoctor.id }),
      });
      const data = await res.json();
      alert(data.message);
      setForm({ id: null, patient_id: "", date: "", time: "", status: "Scheduled" });
      fetchAppointments(selectedDoctor.id);
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Failed to save appointment");
    }
  };

  // ---------------------- Delete appointment ----------------------
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/appointments/${id}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      fetchAppointments(selectedDoctor.id);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment");
    }
  };

  // ---------------------- Edit appointment ----------------------
  const handleEditAppointment = (appt) => {
    setForm({
      id: appt.id,
      patient_id: appt.patient_id,
      date: appt.date,
      time: appt.time,
      status: appt.status,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Appointments</h2>

      <div style={{ display: "flex" }}>
        {/* Doctor list */}
        <div style={{ width: "200px", marginRight: "20px" }}>
          <h3>Doctors</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {doctors.map((doc) => (
              <li
                key={doc.id}
                onClick={() => handleDoctorClick(doc)}
                style={{
                  padding: "10px",
                  marginBottom: "5px",
                  cursor: "pointer",
                  background: selectedDoctor?.id === doc.id ? "#d0f0ff" : "#f0f0f0",
                  borderRadius: "5px",
                }}
              >
                {doc.name} ({doc.specialization})
              </li>
            ))}
          </ul>
        </div>

        {/* Appointments for selected doctor */}
        <div style={{ flex: 1 }}>
          {selectedDoctor ? (
            <div>
              <h3>Appointments for Dr. {selectedDoctor.name}</h3>

              {loadingAppointments ? (
                <p>Loading...</p>
              ) : (
                <>
                  {appointments.length === 0 ? (
                    <p>No appointments scheduled</p>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a) => (
                          <tr key={a.id} style={{ borderBottom: "1px solid #ccc" }}>
                            <td>{a.patient_name}</td>
                            <td>{a.date}</td>
                            <td>{a.time}</td>
                            <td>{a.status}</td>
                            <td>
                              <button onClick={() => handleEditAppointment(a)}>Edit</button>
                              <button onClick={() => handleDeleteAppointment(a.id)} style={{ marginLeft: "5px" }}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Add / Update form */}
                  <h4 style={{ marginTop: "20px" }}>{form.id ? "Update Appointment" : "Add Appointment"}</h4>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <select
                      value={form.patient_id}
                      onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                    >
                      <option value="">Select Patient</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                    />
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button onClick={handleSaveAppointment}>
                      {form.id ? "Update" : "Add"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p>Select a doctor to view appointments</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageAppointments;
