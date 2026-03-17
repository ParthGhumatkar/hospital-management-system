// receptionLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ReceptionLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/reception_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // navigate to home page and pass name
        navigate("/home/reception", { state: { name: data.name } });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Receptionist Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "5px" };
const buttonStyle = { width: "100%", padding: "10px", marginTop: "10px", borderRadius: "5px", backgroundColor: "#e67e22", color: "#fff", border: "none" };

export default ReceptionLogin;
