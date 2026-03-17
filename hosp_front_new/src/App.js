import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

import DoctorAppointments from "./docappointment";
import DoctorPatients from "./docpatients";

import ManageDoctors from "./managedoc";
import DocReport from "./docreport";

import MedicinesStock from "./checkstock";
import MedicinesReorder from "./reorder";
import PatientMedicineTrack from "./patientmedi";
import MedicinesExpiry from "./expiry";

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

        {/* Home/Dashboard routes */}
        <Route path="/home/doctor" element={<DoctorHome />} />
        <Route path="/home/hod" element={<HODHome />} />
        <Route path="/home/reception" element={<ReceptionHome />} />
        <Route path="/register-patient" element={<RegisterPatient />} />
        <Route path="/manage-patients" element={<ManagePatients />} />
        <Route path="/manage-appointments" element={<ManageAppointments />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/hod/manage-doctors" element={<ManageDoctors hodDepartment="Cardiology" />} />
        <Route path="/hod/reports" element={<DocReport />} />
        <Route path="/pharmacist/home" element={<PharmacistHome />} />
        <Route path="/pharmacist/medicines-stock" element={<MedicinesStock />} />
        <Route path="/pharmacist/medicines-reorder" element={<MedicinesReorder />} />
        <Route path="/pharmacist/patient-medicine-track" element={<PatientMedicineTrack />} />
        <Route path="/pharmacist/medicines-expiry" element={<MedicinesExpiry />} />
        <Route path="/home/patient" element={<PatientHome />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;