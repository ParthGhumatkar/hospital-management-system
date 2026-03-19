import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

const EMPTY = {
  name: "", age: "", gender: "", phone: "", address: "",
  insurance_provider: "", policy_number: "",
  medical_history: "", current_medication: "",
};

export default function PatientRegistry() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const recepName = location.state?.name || localStorage.getItem("reception_name") || "Receptionist";

  const [form,  setForm]  = useState(EMPTY);
  const [toast, setToast] = useState(null);
  const [busy,  setBusy]  = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res  = await fetch(`${API_URL}/register_patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message || "Patient registered successfully!", type: "success" });
        setForm(EMPTY);
      } else {
        setToast({ message: data.error || "Failed to register patient", type: "error" });
      }
    } catch {
      setToast({ message: "Error registering patient. Please try again.", type: "error" });
    }
    setBusy(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pr-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .pr-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .pr-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #854F0B;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .pr-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.15s, color 0.15s;
        }
        .pr-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .pr-main { max-width: 680px; margin: 0 auto; padding: 36px 24px 60px; }

        .pr-page-title { font-size: 22px; font-weight: 700; color: #0F172A; margin-bottom: 6px; }
        .pr-page-sub   { font-size: 14px; color: #64748B; margin-bottom: 32px; }

        /* Form card */
        .pr-section {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
          padding: 24px 28px; margin-bottom: 20px;
        }
        .pr-section-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px; padding-bottom: 14px;
          border-bottom: 1px solid #F1F5F9;
        }
        .pr-section-icon {
          width: 34px; height: 34px; border-radius: 9px; background: #FEF3C7;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pr-section-title { font-size: 14px; font-weight: 700; color: #0F172A; }
        .pr-section-sub   { font-size: 12px; color: #94A3B8; margin-top: 1px; }

        .pr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pr-grid-1 { display: grid; grid-template-columns: 1fr; gap: 14px; }

        .pr-field { display: flex; flex-direction: column; gap: 5px; }
        .pr-label {
          font-size: 12px; font-weight: 600; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .pr-input, .pr-select, .pr-textarea {
          padding: 10px 12px; border: 1px solid #E2E8F0; border-radius: 8px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: #334155;
          outline: none; background: #fff; transition: border-color 0.15s;
          width: 100%;
        }
        .pr-input:focus, .pr-select:focus, .pr-textarea:focus { border-color: #FCD34D; }
        .pr-textarea { resize: vertical; min-height: 90px; }
        .pr-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; position: relative; z-index: 999; }

        .pr-submit {
          width: 100%; padding: 12px; background: #F59E0B; color: #fff;
          border: none; border-radius: 9px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; margin-top: 4px;
        }
        .pr-submit:hover    { background: #D97706; }
        .pr-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .pr-optional-badge {
          font-size: 10px; font-weight: 500; color: #94A3B8;
          background: #F1F5F9; border-radius: 4px; padding: 1px 6px; margin-left: 6px;
          vertical-align: middle; text-transform: none; letter-spacing: 0;
        }

        @media (max-width: 600px) {
          .pr-header { padding: 12px 16px; }
          .pr-main   { padding: 24px 14px 48px; }
          .pr-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="pr-body">
        {/* ── Header ── */}
        <header className="pr-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="pr-avatar">
              {recepName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{recepName}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Register Patient</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        <main className="pr-main">
          {/* Back + title */}
          <button className="pr-back-btn" style={{ marginBottom: 20 }}
            onClick={() => navigate("/home/reception", { state: { name: recepName } })}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Home
          </button>

          <div className="pr-page-title">Register New Patient</div>
          <div className="pr-page-sub">Fill in the patient's details to create their record in the system.</div>

          <form onSubmit={handleSubmit}>
            {/* ── Patient Information ── */}
            <div className="pr-section">
              <div className="pr-section-header">
                <div className="pr-section-icon">
                  <svg width="16" height="16" fill="none" stroke="#D97706" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div className="pr-section-title">Patient Information</div>
                  <div className="pr-section-sub">Basic personal and contact details</div>
                </div>
              </div>

              <div className="pr-grid-2" style={{ marginBottom: 14 }}>
                <div className="pr-field">
                  <label className="pr-label">Full Name</label>
                  <input className="pr-input" type="text" name="name"
                    placeholder="e.g. John Doe" value={form.name}
                    onChange={handleChange} required />
                </div>
                <div className="pr-field">
                  <label className="pr-label">Age</label>
                  <input className="pr-input" type="number" name="age"
                    placeholder="e.g. 35" min="0" max="150" value={form.age}
                    onChange={handleChange} required />
                </div>
              </div>

              <div className="pr-grid-2" style={{ marginBottom: 14 }}>
                <div className="pr-field">
                  <label className="pr-label">Gender</label>
                  <select className="pr-select" name="gender" value={form.gender}
                    onChange={handleChange} required>
                    <option value="" disabled>Select a gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="pr-field">
                  <label className="pr-label">Phone Number</label>
                  <input className="pr-input" type="text" name="phone"
                    placeholder="e.g. +1 555 000 0000" value={form.phone}
                    onChange={handleChange} required />
                </div>
              </div>

              <div className="pr-grid-1">
                <div className="pr-field">
                  <label className="pr-label">Address</label>
                  <input className="pr-input" type="text" name="address"
                    placeholder="Street, City, State" value={form.address}
                    onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* ── Medical & Insurance ── */}
            <div className="pr-section">
              <div className="pr-section-header">
                <div className="pr-section-icon" style={{ background: "#FEE2E2" }}>
                  <svg width="16" height="16" fill="none" stroke="#EF4444" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div>
                  <div className="pr-section-title">Medical &amp; Insurance Details</div>
                  <div className="pr-section-sub">All fields in this section are optional</div>
                </div>
              </div>

              <div className="pr-grid-2" style={{ marginBottom: 14 }}>
                <div className="pr-field">
                  <label className="pr-label">
                    Insurance Provider
                    <span className="pr-optional-badge">optional</span>
                  </label>
                  <input className="pr-input" type="text" name="insurance_provider"
                    placeholder="e.g. BlueCross" value={form.insurance_provider}
                    onChange={handleChange} />
                </div>
                <div className="pr-field">
                  <label className="pr-label">
                    Policy Number
                    <span className="pr-optional-badge">optional</span>
                  </label>
                  <input className="pr-input" type="text" name="policy_number"
                    placeholder="e.g. POL-123456" value={form.policy_number}
                    onChange={handleChange} />
                </div>
              </div>

              <div className="pr-grid-1" style={{ marginBottom: 14 }}>
                <div className="pr-field">
                  <label className="pr-label">
                    Medical History
                    <span className="pr-optional-badge">optional</span>
                  </label>
                  <textarea className="pr-textarea" name="medical_history"
                    placeholder="Known conditions, past surgeries, allergies…"
                    value={form.medical_history} onChange={handleChange} />
                </div>
              </div>

              <div className="pr-grid-1">
                <div className="pr-field">
                  <label className="pr-label">
                    Current Medication
                    <span className="pr-optional-badge">optional</span>
                  </label>
                  <textarea className="pr-textarea" name="current_medication"
                    placeholder="List of current medications and dosages…"
                    value={form.current_medication} onChange={handleChange} />
                </div>
              </div>
            </div>

            <button className="pr-submit" type="submit" disabled={busy}>
              {busy ? "Registering…" : "Register Patient"}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
