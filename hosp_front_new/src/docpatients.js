import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function DoctorPatients() {
  const location = useLocation();
  const navigate = useNavigate();

  const doctorId = location.state?.doctorId;
  const doctorName = location.state?.name || "Doctor";

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Fetch all patients of doctor
  const fetchPatients = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:5000/doctor/${doctorId}/patients`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPatients(Array.isArray(data.patients) ? data.patients : []);
    } catch (err) {
      console.error("❌ Error fetching patients:", err);
      setError("Failed to load patients.");
    }
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const goHome = () => {
    navigate("/home/doctor", { state: { id: doctorId, name: doctorName } });
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setAnalysis(null); // reset previous analysis
  };

  // Analyze patient using Flask API (no need to send symptoms)
  const analyzePatient = async () => {
    if (!selectedPatient) return;

    setAnalysis("Analyzing...");
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/analyze_patient/${selectedPatient.id}`,
        { method: "POST" } // no body needed
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.possible_diseases.join(", "));
    } catch (err) {
      console.error(err);
      setAnalysis("Failed to analyze patient.");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      {!doctorId ? (
        <p style={{ color: "red" }}>Error: Doctor ID not provided. Please login again.</p>
      ) : (
        <>
          <h2>Patients handled by Dr. {doctorName}</h2>

          {loading ? (
            <p>Loading patients...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : patients.length === 0 ? (
            <p>No patients found.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "15px",
                cursor: "pointer",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Age</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Bed ID</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    style={{
                      borderBottom: "1px solid #ccc",
                      backgroundColor:
                        selectedPatient?.id === patient.id ? "#e9f3ff" : "white",
                    }}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <td style={{ ...tdStyle, color: "#007bff" }}>{patient.name}</td>
                    <td style={tdStyle}>{patient.age}</td>
                    <td style={tdStyle}>{patient.phone}</td>
                    <td style={tdStyle}>{patient.bed_id || "Not Assigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button onClick={goHome} style={btnBack}>⬅ Back to Home</button>

          {selectedPatient && (
            <div style={detailsCard}>
              <h3>Patient Details</h3>
              <p><strong>Name:</strong> {selectedPatient.name}</p>
              <p><strong>Age:</strong> {selectedPatient.age}</p>
              <p><strong>Phone:</strong> {selectedPatient.phone}</p>
              <p><strong>Bed ID:</strong> {selectedPatient.bed_id || "Not assigned"}</p>

              <h4>Medical History</h4>
              <p>{selectedPatient.medical_history || "No medical history available."}</p>

              <h4>Current Medication</h4>
              <p>{selectedPatient.current_medication || "No current medication."}</p>

              <button onClick={analyzePatient} style={{ ...btnBack, marginTop: "15px" }}>
                🩺 Analyze Patient
              </button>

              {analysis && (
                <div style={{ padding: "10px", backgroundColor: "#fff3cd", borderRadius: "5px", marginTop: "10px" }}>
                  <strong>Bot Suggestion:</strong> {analysis}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Styling
const thStyle = { textAlign: "left", padding: "10px", borderBottom: "2px solid #ccc" };
const tdStyle = { padding: "10px", textAlign: "left" };
const btnBack = {
  marginTop: "20px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  padding: "10px 15px",
  cursor: "pointer",
};
const detailsCard = {
  marginTop: "30px",
  backgroundColor: "#f9f9f9",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

export default DoctorPatients;
