import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

export default function ReceptionLogin() {
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
      const res  = await fetch(`${API_URL}/reception_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("reception_name", data.name);
        navigate("/home/reception", { state: { name: data.name } });
      } else {
        setToast({ message: data.message || "Invalid credentials", type: "error" });
      }
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    }
    setBusy(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ra-page {
          font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .ra-card {
          background: #fff; border-radius: 16px; padding: 40px 36px;
          width: 100%; max-width: 420px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #E2E8F0;
        }
        .ra-brand { text-align: center; margin-bottom: 28px; }
        .ra-logo {
          width: 52px; height: 52px; border-radius: 14px; background: #F59E0B;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
        }
        .ra-hospital {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .ra-subtitle { font-size: 14px; color: #64748B; }
        .ra-divider { height: 1px; background: #F1F5F9; margin: 0 0 24px; }

        .ra-field { margin-bottom: 16px; }
        .ra-label {
          display: block; font-size: 12px; font-weight: 600; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;
        }
        .ra-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0;
          border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #334155; outline: none; background: #fff; transition: border-color 0.15s;
        }
        .ra-input:focus { border-color: #F59E0B; }

        .ra-submit {
          width: 100%; padding: 11px; background: #F59E0B; color: #fff;
          border: none; border-radius: 9px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; margin-top: 6px;
        }
        .ra-submit:hover    { background: #D97706; }
        .ra-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .ra-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #64748B; }
        .ra-link { color: #D97706; font-weight: 600; cursor: pointer; }
        .ra-link:hover { text-decoration: underline; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="ra-page">
        <div className="ra-card">
          <div className="ra-brand">
            <div className="ra-logo">
              <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="ra-hospital">CityCare Hospital</div>
            <div className="ra-subtitle">Receptionist — Sign In</div>
          </div>

          <div className="ra-divider" />

          <form onSubmit={handleSubmit}>
            <div className="ra-field">
              <label className="ra-label">Email Address</label>
              <input className="ra-input" type="email" name="email"
                placeholder="you@hospital.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="ra-field">
              <label className="ra-label">Password</label>
              <input className="ra-input" type="password" name="password"
                placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
            <button className="ra-submit" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="ra-footer">
            Don't have an account?{" "}
            <span className="ra-link" onClick={() => navigate("/signup/reception")}>
              Create one
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
