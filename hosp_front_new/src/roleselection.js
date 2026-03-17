import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./roleselection.css";

function RoleSelection() {
  const navigate = useNavigate();
  const [view, setView] = useState("home"); // "home" | "hospital"

  const handleStaffRole = (role) => {
    navigate(`/signup/${role}`);
  };

  if (view === "hospital") {
    return (
      <div className="role-selection-page">
        <div className="role-selection-card">
          <div className="role-selection-header">
            <h1>
              <span className="logo">🏥</span> CityCare Hospital
            </h1>
            <p>Select your staff role to continue</p>
          </div>

          <button className="back-btn" onClick={() => setView("home")}>
            ← Back
          </button>

          <div className="role-grid">
            <div className="role-card" onClick={() => handleStaffRole("doctor")}>
              <span className="role-icon">🩺</span>
              <h3>Doctor</h3>
              <p>Manage patients, view appointments and medical records.</p>
            </div>

            <div className="role-card" onClick={() => handleStaffRole("hod")}>
              <span className="role-icon">🏛</span>
              <h3>Head of Department</h3>
              <p>Monitor doctors and department activities.</p>
            </div>

            <div className="role-card" onClick={() => handleStaffRole("reception")}>
              <span className="role-icon">🛎</span>
              <h3>Reception</h3>
              <p>Register patients and manage hospital admissions.</p>
            </div>

            <div className="role-card" onClick={() => handleStaffRole("pharmacist")}>
              <span className="role-icon">💊</span>
              <h3>Pharmacist</h3>
              <p>Track medicine inventory and dispense medicines.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="role-selection-page">
      <div className="role-selection-card role-selection-card--narrow">
        <div className="role-selection-header">
          <h1>
            <span className="logo">🏥</span> CityCare Hospital
          </h1>
          <p>Who are you? Select to continue</p>
        </div>

        <div className="role-grid role-grid--two">
          <div className="role-card role-card--featured" onClick={() => setView("hospital")}>
            <span className="role-icon">🏥</span>
            <h3>Hospital Staff</h3>
            <p>Doctor, HOD, Reception or Pharmacist login.</p>
          </div>

          <div className="role-card role-card--featured" onClick={() => navigate("/login/patient")}>
            <span className="role-icon">🧑‍⚕️</span>
            <h3>Patient</h3>
            <p>Access your appointments, records and health support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;