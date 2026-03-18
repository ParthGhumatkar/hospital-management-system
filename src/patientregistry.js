import React, { useState } from "react";

function PatientRegistry() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    insurance_provider: "",
    policy_number: "",
    medical_history: "",
    current_medication: "",
  });

  // Update state when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/register_patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      alert(data.message || "Patient registered successfully!");
      // Clear form after submission
      setFormData({
        name: "",
        age: "",
        gender: "",
        phone: "",
        address: "",
        insurance_provider: "",
        policy_number: "",
        medical_history: "",
        current_medication: "",
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Error registering patient!");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "#e67e22",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#e67e22" }}>Register Patient</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          style={inputStyle}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          type="text"
          name="insurance_provider"
          placeholder="Insurance Provider"
          value={formData.insurance_provider}
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          type="text"
          name="policy_number"
          placeholder="Policy Number"
          value={formData.policy_number}
          onChange={handleChange}
          style={inputStyle}
        />
        <textarea
          name="medical_history"
          placeholder="Medical History"
          value={formData.medical_history}
          onChange={handleChange}
          style={inputStyle}
        />
        <textarea
          name="current_medication"
          placeholder="Current Medication"
          value={formData.current_medication}
          onChange={handleChange}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Register Patient
        </button>
      </form>
    </div>
  );
}

export default PatientRegistry;
