import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function DoctorSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    phone: "",
    department: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/doctor_signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate("/login/doctor"); // Redirect to login page
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error signing up doctor!");
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
      <h2 style={{ textAlign: "center", color: "#2e86de" }}>Doctor Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={inputStyle} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={inputStyle} />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={inputStyle} />
        <input type="text" name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required style={inputStyle} />
        <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={inputStyle} />
        <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required style={inputStyle} />
        <button type="submit" style={buttonStyle}>Signup</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Already have an account? <span style={{ color: "#2e86de", cursor: "pointer" }} onClick={() => navigate("/login/doctor")}>Login here</span>
      </p>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "5px" };
const buttonStyle = { width: "100%", padding: "10px", marginTop: "10px", backgroundColor: "#2e86de", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };

export default DoctorSignup;
