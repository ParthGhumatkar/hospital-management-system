import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RoleSelection from "./roleselection";
import DocSignup from "./docsignup";
import HODSignup from "./hodsignup";
import ReceptionSignup from "./receptionsignup";
import PharmacistSignup from "./pharmacistsignup";

import PatientLogin from "./patientlogin";
import PatientSignup from "./patientsignup";
import PatientHome from "./patienthome";

import DocLogin from "./doclogin";
import HODLogin from "./hodlogin";
import ReceptionLogin from "./receptionlogin";
import PharmacistLogin from "./pharmacistlogin";

import DoctorHome from "./dochome";
import HODHome from "./hodhome";
import ReceptionHome from "./receptionhome";
import PharmacistHome from "./pharmacisthome";

import RegisterPatient from "./patientregistry";
import ManagePatients from "./managepatient";
import ManageAppointments from "./manageappointments";
import BedManagement from "./bedmanagement";

import DoctorAppointments from "./docappointment";
import DoctorPatients from "./docpatients";

import ManageDoctors from "./managedoc";
import DocReport from "./docreport";

import MedicinesStock from "./checkstock";
import MedicinesReorder from "./reorder";
import PatientMedicineTrack from "./patientmedi";
import AssignMedicine from "./assignmedicine";
import AllPatientMedicines from "./allpatientmedicines";
import MedicinesExpiry from "./expiry";

import NirvanaChat from "./nirvanachat";

function NirvanaPlaceholder() {
  return (
    <div style={{ padding: "60px", textAlign: "center", fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: "32px" }}>🧠 Nirvana AI</h2>
      <p style={{ color: "#666", maxWidth: "500px", margin: "16px auto", lineHeight: 1.6 }}>
        Your mental health support companion is coming soon. Talk anonymously,
        track your wellness, and access resources — anytime.
      </p>
      <button
        style={{ marginTop: "20px", padding: "10px 24px", backgroundColor: "#7f77dd", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
        onClick={() => window.history.back()}
      >
        ← Go Back
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />

        {/* Signup routes */}
        <Route path="/signup/doctor" element={<DocSignup />} />
        <Route path="/signup/hod" element={<HODSignup />} />
        <Route path="/signup/reception" element={<ReceptionSignup />} />
        <Route path="/signup/pharmacist" element={<PharmacistSignup />} />
        <Route path="/signup/patient" element={<PatientSignup />} />

        {/* Login routes */}
        <Route path="/login/doctor" element={<DocLogin />} />
        <Route path="/login/hod" element={<HODLogin />} />
        <Route path="/login/reception" element={<ReceptionLogin />} />
        <Route path="/login/pharmacist" element={<PharmacistLogin />} />
        <Route path="/login/patient" element={<PatientLogin />} />

        {/* Dashboard routes */}
        <Route path="/home/doctor" element={<DoctorHome />} />
        <Route path="/home/hod" element={<HODHome />} />
        <Route path="/home/reception" element={<ReceptionHome />} />
        <Route path="/home/patient" element={<PatientHome />} />

        {/* Reception sub-routes */}
        <Route path="/register-patient" element={<RegisterPatient />} />
        <Route path="/manage-patients" element={<ManagePatients />} />
        <Route path="/manage-appointments" element={<ManageAppointments />} />
        <Route path="/bedmanagement" element={<BedManagement />} />

        {/* Doctor sub-routes */}
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />

        {/* HOD sub-routes */}
        <Route path="/hod/manage-doctors" element={<ManageDoctors />} />
        <Route path="/hod/reports" element={<DocReport />} />

        {/* Pharmacist sub-routes */}
        <Route path="/pharmacist/home" element={<PharmacistHome />} />
        <Route path="/pharmacist/medicines-stock" element={<MedicinesStock />} />
        <Route path="/pharmacist/medicines-reorder" element={<MedicinesReorder />} />
        <Route path="/pharmacist/patient-medicine-track" element={<AllPatientMedicines />} />
        <Route path="/pharmacist/assign-medicine" element={<AssignMedicine />} />
        <Route path="/pharmacist/medicines-expiry" element={<MedicinesExpiry />} />

        {/* Patient sub-routes */}
        <Route path="/patient/medicines" element={<PatientMedicineTrack />} />

        {/* Nirvana AI */}
        <Route path="/nirvana"     element={<NirvanaPlaceholder />} />
        <Route path="/nirvanachat" element={<NirvanaChat />} />

        {/* Catch-all: redirect unknown paths back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
