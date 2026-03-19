import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

export default function PatientLogin() {
  const navigate = useNavigate();
  const [form,  setForm]  = useState({ email: "", password: "" });
  const [toast, setToast] = useState(null);
  const [busy,  setBusy]  = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setBusy(true);
    try {
      const res  = await fetch(`${API_URL}/patient_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        navigate("/home/patient", { state: { name: data.name, patientId: data.id } });
      } else {
        setToast({ message: data.message || "Invalid credentials", type: "error" });
      }
    } catch {
      setToast({ message: "Login failed. Please try again.", type: "error" });
    }
    setBusy(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pl-page {
          font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .pl-card {
          background: #fff; border-radius: 16px; padding: 40px 36px;
          width: 100%; max-width: 420px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #E2E8F0;
        }
        .pl-brand { text-align: center; margin-bottom: 28px; }
        .pl-logo {
          width: 52px; height: 52px; border-radius: 14px; background: #0F766E;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
        }
        .pl-hospital {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .pl-subtitle { font-size: 14px; color: #64748B; }
        .pl-divider  { height: 1px; background: #F1F5F9; margin: 0 0 24px; }
        .pl-field { margin-bottom: 16px; }
        .pl-label {
          display: block; font-size: 12px; font-weight: 600; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;
        }
        .pl-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0;
          border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #334155; outline: none; background: #fff; transition: border-color 0.15s;
        }
        .pl-input:focus { border-color: #5EEAD4; }
        .pl-submit {
          width: 100%; padding: 11px; background: #0F766E; color: #fff;
          border: none; border-radius: 9px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; margin-top: 6px;
        }
        .pl-submit:hover    { background: #0D6460; }
        .pl-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .pl-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #64748B; }
        .pl-link { color: #0F766E; font-weight: 600; cursor: pointer; }
        .pl-link:hover { text-decoration: underline; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="pl-page">
        <div className="pl-card">
          <div className="pl-brand">
            <div className="pl-logo">
              <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div className="pl-hospital">CityCare Hospital</div>
            <div className="pl-subtitle">Patient — Sign In</div>
          </div>

          <div className="pl-divider" />

          <form onSubmit={handleSubmit}>
            <div className="pl-field">
              <label className="pl-label">Email Address</label>
              <input className="pl-input" type="email" name="email"
                placeholder="you@email.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="pl-field">
              <label className="pl-label">Password</label>
              <input className="pl-input" type="password" name="password"
                placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
            <button className="pl-submit" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="pl-footer">
            Don't have an account?{" "}
            <span className="pl-link" onClick={() => navigate("/signup/patient")}>Create one</span>
          </p>
        </div>
      </div>
    </>
  );
}
