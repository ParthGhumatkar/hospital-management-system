import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function HODHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, department } = location.state;

  const handleLogout = () => navigate("/");

  // Navigate to ManageDoctors page
  const handleManageDoctors = () => {
    navigate("/hod/manage-doctors", { state: { department, name } });
  };

  const handleViewReports = () => {
    navigate("/hod/reports", { state: { department, name } });
  };

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>Welcome, {name} ({department})</h1>
      <p>Here you can manage doctors, view department reports, and handle administrative tasks.</p>

      <button style={buttonStyle} onClick={handleManageDoctors}>Manage Doctors</button>
      <button style={buttonStyle} onClick={handleViewReports}>View Reports</button>
      <button style={buttonStyle} onClick={handleLogout}>Logout</button>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  margin: "10px",
  fontSize: "16px",
  cursor: "pointer",
  borderRadius: "5px",
  backgroundColor: "#16a085",
  color: "#fff",
  border: "none"
};

export default HODHome;
