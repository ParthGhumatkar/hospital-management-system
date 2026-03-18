import React, { useState, useEffect } from "react";

function PatientMedicineTrack() {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    medicine_id: "",
    quantity: "",
    date_given: "",
  });
// Fetch all patients
const fetchPatients = async () => {
  try {
    const res = await fetch("http://127.0.0.1:5000/patients");
    const data = await res.json();

    // ✅ Handle both array and object with "patients" key
    if (Array.isArray(data)) {
      setPatients(data);
    } else if (data.patients && Array.isArray(data.patients)) {
      setPatients(data.patients);
    } else {
      setPatients([]);
    }
  } catch (error) {
    console.error("Error fetching patients:", error);
    setPatients([]);
  }
};

  // Fetch all medicines
  const fetchMedicines = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/medicines/stock");
      const data = await res.json();
      // Ensure data is an array
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      setMedicines([]);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchMedicines();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/patient_medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setFormData({ patient_id: "", medicine_id: "", quantity: "", date_given: "" });
      } else {
        alert(data.message || "Error assigning medicine");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to assign medicine");
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Assign Medicine to Patient</h2>
      <form onSubmit={handleSubmit}>
        <select
          name="patient_id"
          value={formData.patient_id}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Select Patient</option>
          {Array.isArray(patients) && patients.length > 0 ? (
            patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)
          ) : (
            <option disabled>No patients available</option>
          )}
        </select>

        <select
          name="medicine_id"
          value={formData.medicine_id}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Select Medicine</option>
          {Array.isArray(medicines) && medicines.length > 0 ? (
            medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (Stock: {m.stock_quantity})
              </option>
            ))
          ) : (
            <option disabled>No medicines available</option>
          )}
        </select>

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          max={
            formData.medicine_id
              ? medicines.find((m) => m.id === parseInt(formData.medicine_id))?.stock_quantity || 1
              : 1
          }
          required
          style={inputStyle}
        />

        <input
          type="date"
          name="date_given"
          value={formData.date_given}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Assign Medicine
        </button>
      </form>
    </div>
  );
}

const containerStyle = {
  maxWidth: "500px",
  margin: "50px auto",
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "10px",
  backgroundColor: "#f9f9f9",
};

const inputStyle = { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "5px" };
const buttonStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  backgroundColor: "#8e44ad",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default PatientMedicineTrack;
