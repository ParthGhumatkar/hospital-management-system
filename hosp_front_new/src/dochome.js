import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function DoctorHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const name = location.state?.name || "Doctor";
  const doctorId = location.state?.doctorId; // 🔹 use doctorId

  console.log("📌 Doctor ID:", doctorId);
  console.log("📌 Doctor Name:", name);

  if (!doctorId) {
    console.warn("⚠️ No Doctor ID found — redirecting to login...");
    navigate("/"); // redirect to login if doctorId missing
  }

  const handleLogout = () => navigate("/");

  const handleViewAppointments = () => {
    navigate("/doctor/appointments", { state: { doctorId, name } });
  };

  const handlePatientRecords = () => {
    navigate("/doctor/patients", { state: { doctorId, name } });
  };

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>Welcome, Dr. {name}!</h1>
      <p>Here you can see your appointments, patient records, and manage consultations.</p>

      <button style={buttonStyle} onClick={handleViewAppointments}>
        View Appointments
      </button>
      <button style={buttonStyle} onClick={handlePatientRecords}>
        Patient Records
      </button>
      <button style={buttonStyle} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  margin: "10px",
  fontSize: "16px",
  cursor: "pointer",
  borderRadius: "5px",
  backgroundColor: "#2e86de",
  color: "#fff",
  border: "none",
};

export default DoctorHome;
