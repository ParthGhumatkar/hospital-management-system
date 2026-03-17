import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function PatientSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/patient_signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate("/login/patient");
      } else {
        alert(data.message || "Signup failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error signing up!");
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
      <h2 style={{ textAlign: "center", color: "#2e86de" }}>Patient Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={inputStyle} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={inputStyle} />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={inputStyle} />
        <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={inputStyle} />
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required style={inputStyle} />
        <select name="gender" value={formData.gender} onChange={handleChange} required style={inputStyle}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" style={buttonStyle}>Sign Up</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Already have an account?{" "}
        <span style={{ color: "#2e86de", cursor: "pointer" }} onClick={() => navigate("/login/patient")}>
          Login here
        </span>
      </p>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "5px", boxSizing: "border-box", border: "1px solid #ccc", fontSize: "14px" };
const buttonStyle = { width: "100%", padding: "10px", marginTop: "10px", backgroundColor: "#2e86de", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "15px" };

export default PatientSignup;