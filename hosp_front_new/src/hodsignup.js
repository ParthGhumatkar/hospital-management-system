import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

export default function HODSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", department: "", phone: "",
  });
  const [toast, setToast] = useState(null);
  const [busy,  setBusy]  = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setBusy(true);
    try {
      const res  = await fetch(`${API_URL}/hod_signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message || "Account created! Redirecting…", type: "success" });
        setTimeout(() => navigate("/login/hod"), 1800);
      } else {
        setToast({ message: data.message || data.error || "Signup failed", type: "error" });
      }
    } catch {
      setToast({ message: "Error signing up. Please try again.", type: "error" });
    }
    setBusy(false);
  };

  const fields = [
    { key: "name",       label: "Full Name",    type: "text",     placeholder: "Dr. Jane Smith"      },
    { key: "email",      label: "Email Address",type: "email",    placeholder: "you@hospital.com"    },
    { key: "password",   label: "Password",     type: "password", placeholder: "••••••••"            },
    { key: "department", label: "Department",   type: "text",     placeholder: "e.g. Cardiology"     },
    { key: "phone",      label: "Phone Number", type: "text",     placeholder: "+1 555 000 0000"     },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ha-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh; background: #F8FAFC;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .ha-card {
          background: #fff; border-radius: 16px; padding: 40px 36px;
          width: 100%; max-width: 440px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #E2E8F0;
        }
        .ha-brand { text-align: center; margin-bottom: 28px; }
        .ha-logo {
          width: 52px; height: 52px; border-radius: 14px; background: #0F6E56;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
        }
        .ha-hospital {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .ha-subtitle { font-size: 14px; color: #64748B; }

        .ha-divider { height: 1px; background: #F1F5F9; margin: 0 0 24px; }

        .ha-field { margin-bottom: 14px; }
        .ha-label {
          display: block; font-size: 12px; font-weight: 600; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;
        }
        .ha-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0;
          border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #334155; outline: none; transition: border-color 0.15s;
          background: #fff;
        }
        .ha-input:focus { border-color: #0F6E56; }

        .ha-submit {
          width: 100%; padding: 11px; background: #0F6E56; color: #fff;
          border: none; border-radius: 9px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; margin-top: 8px;
        }
        .ha-submit:hover    { background: #0d5e49; }
        .ha-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .ha-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #64748B; }
        .ha-link { color: #0F6E56; font-weight: 600; cursor: pointer; }
        .ha-link:hover { text-decoration: underline; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="ha-page">
        <div className="ha-card">
          <div className="ha-brand">
            <div className="ha-logo">
              <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div className="ha-hospital">CityCare Hospital</div>
            <div className="ha-subtitle">Head of Department — Create Account</div>
          </div>

          <div className="ha-divider" />

          <form onSubmit={handleSubmit}>
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key} className="ha-field">
                <label className="ha-label">{label}</label>
                <input
                  className="ha-input"
                  type={type} name={key}
                  placeholder={placeholder}
                  value={form[key]} onChange={handleChange} required
                />
              </div>
            ))}
            <button className="ha-submit" type="submit" disabled={busy}>
              {busy ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="ha-footer">
            Already have an account?{" "}
            <span className="ha-link" onClick={() => navigate("/login/hod")}>
              Sign in
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
