import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

export default function PatientSignup() {
  const navigate = useNavigate();
  const [form,  setForm]  = useState({ name: "", email: "", password: "", phone: "", age: "", gender: "" });
  const [toast, setToast] = useState(null);
  const [busy,  setBusy]  = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setBusy(true);
    try {
      const res  = await fetch(`${API_URL}/patient_signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message || "Account created! Redirecting…", type: "success" });
        setTimeout(() => navigate("/login/patient"), 1800);
      } else {
        setToast({ message: data.message || "Signup failed!", type: "error" });
      }
    } catch {
      setToast({ message: "Error signing up. Please try again.", type: "error" });
    }
    setBusy(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ps-page {
          font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .ps-card {
          background: #fff; border-radius: 16px; padding: 40px 36px;
          width: 100%; max-width: 440px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #E2E8F0;
        }
        .ps-brand { text-align: center; margin-bottom: 28px; }
        .ps-logo {
          width: 52px; height: 52px; border-radius: 14px; background: #0F766E;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
        }
        .ps-hospital {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .ps-subtitle { font-size: 14px; color: #64748B; }
        .ps-divider  { height: 1px; background: #F1F5F9; margin: 0 0 24px; }
        .ps-field { margin-bottom: 14px; }
        .ps-label {
          display: block; font-size: 12px; font-weight: 600; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;
        }
        .ps-input, .ps-select {
          width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0;
          border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #334155; outline: none; background: #fff; transition: border-color 0.15s;
        }
        .ps-input:focus, .ps-select:focus { border-color: #5EEAD4; }
        .ps-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px;
        }
        .ps-submit {
          width: 100%; padding: 11px; background: #0F766E; color: #fff;
          border: none; border-radius: 9px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; margin-top: 8px;
        }
        .ps-submit:hover    { background: #0D6460; }
        .ps-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .ps-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #64748B; }
        .ps-link { color: #0F766E; font-weight: 600; cursor: pointer; }
        .ps-link:hover { text-decoration: underline; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="ps-page">
        <div className="ps-card">
          <div className="ps-brand">
            <div className="ps-logo">
              <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div className="ps-hospital">CityCare Hospital</div>
            <div className="ps-subtitle">Patient — Create Account</div>
          </div>

          <div className="ps-divider" />

          <form onSubmit={handleSubmit}>
            <div className="ps-field">
              <label className="ps-label">Full Name</label>
              <input className="ps-input" type="text" name="name"
                placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
            </div>
            <div className="ps-field">
              <label className="ps-label">Email Address</label>
              <input className="ps-input" type="email" name="email"
                placeholder="you@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="ps-field">
              <label className="ps-label">Password</label>
              <input className="ps-input" type="password" name="password"
                placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>
            <div className="ps-field">
              <label className="ps-label">Phone Number</label>
              <input className="ps-input" type="text" name="phone"
                placeholder="+1 555 000 0000" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="ps-field">
              <label className="ps-label">Age</label>
              <input className="ps-input" type="number" name="age"
                placeholder="e.g. 28" min="0" max="150" value={form.age} onChange={handleChange} required />
            </div>
            <div className="ps-field">
              <label className="ps-label">Gender</label>
              <select className="ps-select" name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Select gender…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button className="ps-submit" type="submit" disabled={busy}>
              {busy ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="ps-footer">
            Already have an account?{" "}
            <span className="ps-link" onClick={() => navigate("/login/patient")}>Sign in</span>
          </p>
        </div>
      </div>
    </>
  );
}
