import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

export default function PharmacistLogin() {
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
      const res  = await fetch(`${API_URL}/pharmacist_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("pharmacist_name", data.name);
        navigate("/pharmacist/home", { state: { name: data.name, pharmacistId: data.id } });
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

        .pa-page {
          font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .pa-card {
          background: #fff; border-radius: 16px; padding: 40px 36px;
          width: 100%; max-width: 420px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #E2E8F0;
        }
        .pa-brand { text-align: center; margin-bottom: 28px; }
        .pa-logo {
          width: 52px; height: 52px; border-radius: 14px; background: #7C3AED;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
        }
        .pa-hospital {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .pa-subtitle { font-size: 14px; color: #64748B; }
        .pa-divider  { height: 1px; background: #F1F5F9; margin: 0 0 24px; }

        .pa-field { margin-bottom: 16px; }
        .pa-label {
          display: block; font-size: 12px; font-weight: 600; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;
        }
        .pa-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0;
          border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #334155; outline: none; background: #fff; transition: border-color 0.15s;
        }
        .pa-input:focus { border-color: #A78BFA; }

        .pa-submit {
          width: 100%; padding: 11px; background: #7C3AED; color: #fff;
          border: none; border-radius: 9px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; margin-top: 6px;
        }
        .pa-submit:hover    { background: #6D28D9; }
        .pa-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .pa-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #64748B; }
        .pa-link { color: #7C3AED; font-weight: 600; cursor: pointer; }
        .pa-link:hover { text-decoration: underline; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="pa-page">
        <div className="pa-card">
          <div className="pa-brand">
            <div className="pa-logo">
              <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
              </svg>
            </div>
            <div className="pa-hospital">CityCare Hospital</div>
            <div className="pa-subtitle">Pharmacist — Sign In</div>
          </div>

          <div className="pa-divider" />

          <form onSubmit={handleSubmit}>
            <div className="pa-field">
              <label className="pa-label">Email Address</label>
              <input className="pa-input" type="email" name="email"
                placeholder="you@hospital.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="pa-field">
              <label className="pa-label">Password</label>
              <input className="pa-input" type="password" name="password"
                placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
            <button className="pa-submit" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="pa-footer">
            New pharmacist?{" "}
            <span className="pa-link" onClick={() => navigate("/signup/pharmacist")}>
              Create account
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
