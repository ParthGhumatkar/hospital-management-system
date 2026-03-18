import React, { useEffect, useState, useCallback } from "react";
import {useLocation, useNavigate } from "react-router-dom";


function DoctorAppointments() {
  const location = useLocation();
  const doctorId = location.state?.doctorId;  
  const navigate = useNavigate(); 
  const doctorName = location.state?.name || "Doctor";

  console.log("📌 Doctor ID:", doctorId);
  console.log("📌 Doctor Name:", doctorName);


  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ❌ Hooks must always be called unconditionally
  const fetchUpcomingAppointments = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:5000/appointments/upcoming/${doctorId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    } catch (err) {
      console.error("Error fetching upcoming appointments:", err);
      setError("Failed to load appointments.");
      setAppointments([]);
    }
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, [fetchUpcomingAppointments]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert(`Appointment marked as ${status}`);
      fetchUpcomingAppointments();
    } catch (err) {
      console.error("Error updating appointment:", err);
      alert("Failed to update appointment");
    }
  };

  const goHome = () => {
    navigate("/home/doctor", { state: { name: doctorName, doctorId } });
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      {!doctorId ? (
        <p style={{ color: "red" }}>Error: Doctor ID not provided. Please login again.</p>
      ) : (
        <>
          <h2>Appointments for Dr. {doctorName}</h2>

          {loading ? (
            <p>Loading appointments...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : appointments.length === 0 ? (
            <p>No upcoming appointments found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th style={thStyle}>Patient</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt.id} style={{ borderBottom: "1px solid #ccc" }}>
                    <td style={tdStyle}>{appt.patient_name}</td>
                    <td style={tdStyle}>{appt.date}</td>
                    <td style={tdStyle}>{appt.time}</td>
                    <td style={tdStyle}>{appt.status}</td>
                    <td style={tdStyle}>
                      <button onClick={() => updateStatus(appt.id, "Completed")} style={btnComplete}>✅ Complete</button>
                      <button onClick={() => updateStatus(appt.id, "Cancelled")} style={btnCancel}>❌ Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button onClick={goHome} style={btnBack}>⬅ Back to Home</button>
        </>
      )}
    </div>
  );
}

// Styling
const thStyle = { textAlign: "left", padding: "10px", borderBottom: "2px solid #ccc" };
const tdStyle = { padding: "10px", textAlign: "left" };
const btnComplete = { backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", padding: "6px 10px", cursor: "pointer", marginRight: "8px" };
const btnCancel = { backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", padding: "6px 10px", cursor: "pointer" };
const btnBack = { marginTop: "20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", padding: "10px 15px", cursor: "pointer" };

export default DoctorAppointments;
