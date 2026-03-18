import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

export default function DoctorSignup() {
  const navigate = useNavigate();
  const [form,  setForm]  = useState({ name: "", email: "", password: "", specialization: "", phone: "", department: "" });
  const [toast, setToast] = useState(null);
  const [busy,  setBusy]  = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setBusy(true);
    try {
      const res  = await fetch(`${API_URL}/doctor_signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message || "Account created! Redirecting…", type: "success" });
        setTimeout(() => navigate("/login/doctor"), 1800);
      } else {
        setToast({ message: data.message || "Signup failed", type: "error" });
      }
    } catch {
      setToast({ message: "Error signing up. Please try again.", type: "error" });
    }
    setBusy(false);
  };

  const fields = [
    { key: "name",           label: "Full Name",      type: "text",     placeholder: "Dr. Jane Smith"    },
    { key: "email",          label: "Email Address",  type: "email",    placeholder: "you@hospital.com"  },
    { key: "password",       label: "Password",       type: "password", placeholder: "••••••••"          },
    { key: "specialization", label: "Specialization", type: "text",     placeholder: "e.g. Cardiology"   },
    { key: "phone",          label: "Phone Number",   type: "text",     placeholder: "+1 555 000 0000"   },
    { key: "department",     label: "Department",     type: "text",     placeholder: "e.g. Surgery"      },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ds-page {
          font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .ds-card {
          background: #fff; border-radius: 16px; padding: 40px 36px;
          width: 100%; max-width: 440px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #E2E8F0;
        }
        .ds-brand { text-align: center; margin-bottom: 28px; }
        .ds-logo {
          width: 52px; height: 52px; border-radius: 14px; background: #185FA5;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
        }
        .ds-hospital {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .ds-subtitle { font-size: 14px; color: #64748B; }
        .ds-divider  { height: 1px; background: #F1F5F9; margin: 0 0 24px; }
        .ds-field { margin-bottom: 14px; }
        .ds-label {
          display: block; font-size: 12px; font-weight: 600; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;
        }
        .ds-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0;
          border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #334155; outline: none; background: #fff; transition: border-color 0.15s;
        }
        .ds-input:focus { border-color: #93C5FD; }
        .ds-submit {
          width: 100%; padding: 11px; background: #185FA5; color: #fff;
          border: none; border-radius: 9px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; margin-top: 8px;
        }
        .ds-submit:hover    { background: #145089; }
        .ds-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .ds-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #64748B; }
        .ds-link { color: #185FA5; font-weight: 600; cursor: pointer; }
        .ds-link:hover { text-decoration: underline; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="ds-page">
        <div className="ds-card">
          <div className="ds-brand">
            <div className="ds-logo">
              <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div className="ds-hospital">CityCare Hospital</div>
            <div className="ds-subtitle">Doctor — Create Account</div>
          </div>

          <div className="ds-divider" />

          <form onSubmit={handleSubmit}>
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key} className="ds-field">
                <label className="ds-label">{label}</label>
                <input className="ds-input"
                  type={type} name={key}
                  placeholder={placeholder}
                  value={form[key]} onChange={handleChange} required />
              </div>
            ))}
            <button className="ds-submit" type="submit" disabled={busy}>
              {busy ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="ds-footer">
            Already have an account?{" "}
            <span className="ds-link" onClick={() => navigate("/login/doctor")}>Sign in</span>
          </p>
        </div>
      </div>
    </>
  );
}
