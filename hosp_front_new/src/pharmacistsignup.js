import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function PharmacistSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/pharmacist_signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate("/login/pharmacist"); // Redirect to pharmacist login
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error signing up Pharmacist!");
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Pharmacist Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Signup</button>
      </form>
      <p style={linkStyle}>
        Already have an account? <span onClick={() => navigate("/login/pharmacist")}>Login here</span>
      </p>
    </div>
  );
}

const containerStyle = {
  maxWidth: "450px",
  margin: "50px auto",
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "10px",
  backgroundColor: "#f9f9f9"
};
const titleStyle = { textAlign: "center", color: "#8e44ad" };
const inputStyle = { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "5px" };
const buttonStyle = { width: "100%", padding: "10px", marginTop: "10px", backgroundColor: "#8e44ad", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };
const linkStyle = { textAlign: "center", marginTop: "10px", cursor: "pointer", color: "#8e44ad" };

export default PharmacistSignup;
