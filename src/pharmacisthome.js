import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function PharmacistHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name } = location.state || { name: "Pharmacist" }; // default name if state missing

  const handleLogout = () => navigate("/");

  const handleCheckStock = () => {
    navigate("/pharmacist/medicines-stock", { state: { name } });
  };

  const handleReorder = () => {
    navigate("/pharmacist/medicines-reorder", { state: { name } });
  };

  const handlePatientMedicineTrack = () => {
    navigate("/pharmacist/patient-medicine-track", { state: { name } });
  };

  const handleExpiryAlerts = () => {
    navigate("/pharmacist/medicines-expiry", { state: { name } });
  };

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>Welcome, {name}</h1>
      <p>Manage medicines, track patient prescriptions, and check expiry alerts.</p>

      <button style={buttonStyle} onClick={handleCheckStock}>Check Medicine Stock</button>
      <button style={buttonStyle} onClick={handleReorder}>Reorder Medicines</button>
      <button style={buttonStyle} onClick={handlePatientMedicineTrack}>Patient Medicine Track</button>
      <button style={buttonStyle} onClick={handleExpiryAlerts}>Expiry Alerts</button>
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
  backgroundColor: "#8e44ad",
  color: "#fff",
  border: "none"
};

export default PharmacistHome;
