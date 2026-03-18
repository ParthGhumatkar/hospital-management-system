import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function PharmacistLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // later: verify with backend via /login/pharmacist
    console.log("Pharmacist logged in:", form);
    localStorage.setItem("token", "dummyPharmacistToken");
    navigate("/pharmacist/home"); // Redirect to pharmacist dashboard
  };

  return (
    <div className="login">
      <h2>Pharmacist Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p onClick={() => navigate("/signup/pharmacist")}>
        New pharmacist? Sign up here
      </p>
    </div>
  );
}

export default PharmacistLogin;
