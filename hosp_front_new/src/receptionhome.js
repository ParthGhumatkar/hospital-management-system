import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ReceptionHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || "Receptionist";

  const handleLogout = () => navigate("/");

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>Welcome, {name}!</h1>
      <p>Here you can manage patient appointments, register new patients, and assist doctors.</p>

      {/* Navigate to Register Patient page */}
      <button
        style={buttonStyle}
        onClick={() => navigate("/register-patient")}
      >
        Register Patient
      </button>

      {/* Navigate to Manage Patients page */}
      <button
        style={buttonStyle}
        onClick={() => navigate("/manage-patients")}
      >
        Manage Patients
      </button>

      {/* Navigate to Manage Appointments page */}
      <button
        style={buttonStyle}
        onClick={() => navigate("/manage-appointments")}
      >
        Manage Appointments
      </button>

      {/* Logout */}
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
  backgroundColor: "#e67e22",
  color: "#fff",
  border: "none",
};

export default ReceptionHome;
