import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

export default function DoctorLogin() {
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
      const res  = await fetch(`${API_URL}/doctor_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        navigate("/home/doctor", { state: { name: data.name, doctorId: data.id } });
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
        .dl-page {
          font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .dl-card {
          background: #fff; border-radius: 16px; padding: 40px 36px;
          width: 100%; max-width: 420px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #E2E8F0;
        }
        .dl-brand { text-align: center; margin-bottom: 28px; }
        .dl-logo {
          width: 52px; height: 52px; border-radius: 14px; background: #185FA5;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
        }
        .dl-hospital {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .dl-subtitle { font-size: 14px; color: #64748B; }
        .dl-divider  { height: 1px; background: #F1F5F9; margin: 0 0 24px; }
        .dl-field { margin-bottom: 16px; }
        .dl-label {
          display: block; font-size: 12px; font-weight: 600; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;
        }
        .dl-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0;
          border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #334155; outline: none; background: #fff; transition: border-color 0.15s;
        }
        .dl-input:focus { border-color: #93C5FD; }
        .dl-submit {
          width: 100%; padding: 11px; background: #185FA5; color: #fff;
          border: none; border-radius: 9px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; margin-top: 6px;
        }
        .dl-submit:hover    { background: #1450891; }
        .dl-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .dl-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #64748B; }
        .dl-link { color: #185FA5; font-weight: 600; cursor: pointer; }
        .dl-link:hover { text-decoration: underline; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="dl-page">
        <div className="dl-card">
          <div className="dl-brand">
            <div className="dl-logo">
              <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div className="dl-hospital">CityCare Hospital</div>
            <div className="dl-subtitle">Doctor — Sign In</div>
          </div>

          <div className="dl-divider" />

          <form onSubmit={handleSubmit}>
            <div className="dl-field">
              <label className="dl-label">Email Address</label>
              <input className="dl-input" type="email" name="email"
                placeholder="you@hospital.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="dl-field">
              <label className="dl-label">Password</label>
              <input className="dl-input" type="password" name="password"
                placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
            <button className="dl-submit" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="dl-footer">
            Don't have an account?{" "}
            <span className="dl-link" onClick={() => navigate("/signup/doctor")}>Create one</span>
          </p>
        </div>
      </div>
    </>
  );
}
