import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function DoctorLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/doctor_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // 🔍 Debugging output
      console.log("📩 Backend response:", data);
      console.log("✅ Doctor ID received:", data.id);
      console.log("✅ Doctor Name received:", data.name);

      if (response.ok) {
        console.log("➡️ Navigating to DoctorHome with state:", {
          name: data.name,
          doctorId: data.id,
        });

        navigate("/home/doctor", {
          state: { name: data.name, doctorId: data.id }, // pass 'id' as doctorId
        });
      } else {
        console.warn("⚠️ Login failed:", data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error("❌ Error during login:", error);
      alert("Login failed!");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#2e86de" }}>Doctor Login</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" style={buttonStyle}>
          Login
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "5px" };
const buttonStyle = { width: "100%", padding: "10px", marginTop: "10px", backgroundColor: "#2e86de", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };

export default DoctorLogin;
