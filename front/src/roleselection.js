import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ── Role definitions ─────────────────────────────────────────────────────── */
const STAFF_ROLES = [
  {
    key: "doctor",
    label: "Doctor",
    desc: "Manage patients, view appointments and medical records.",
    accent: "#1D4ED8",
    iconBg: "#EFF6FF",
    icon: (
      <svg width="26" height="26" fill="none" stroke="#1D4ED8" strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    key: "hod",
    label: "Head of Department",
    desc: "Monitor doctors, review performance and manage the department.",
    accent: "#7C3AED",
    iconBg: "#F5F3FF",
    icon: (
      <svg width="26" height="26" fill="none" stroke="#7C3AED" strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    key: "reception",
    label: "Reception",
    desc: "Register patients, assign beds and manage appointments.",
    accent: "#EA580C",
    iconBg: "#FFF7ED",
    icon: (
      <svg width="26" height="26" fill="none" stroke="#EA580C" strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "pharmacist",
    label: "Pharmacist",
    desc: "Track medicine inventory, handle reorders and dispense medicines.",
    accent: "#0891B2",
    iconBg: "#ECFEFF",
    icon: (
      <svg width="26" height="26" fill="none" stroke="#0891B2" strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
];

/* ── Component ────────────────────────────────────────────────────────────── */
export default function RoleSelection() {
  const navigate = useNavigate();
  const [view, setView] = useState("home"); // "home" | "staff"
  const [hovered, setHovered] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rs-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #F8FAFC;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
        }

        /* ── Branding ── */
        .rs-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
          text-align: center;
        }
        .rs-logo-circle {
          width: 64px; height: 64px; border-radius: 18px;
          background: #185FA5;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(24,95,165,0.25);
          margin-bottom: 4px;
        }
        .rs-hospital-name {
          font-family: 'DM Serif Display', serif;
          font-size: 28px; font-weight: 400; color: #0F172A;
        }
        .rs-tagline { font-size: 14px; color: #64748B; }

        /* ── Divider label ── */
        .rs-divider {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.09em; color: #94A3B8; margin-bottom: 14px;
        }

        /* ── Home view cards ── */
        .rs-home-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          width: 100%;
          max-width: 520px;
        }

        .rs-home-card {
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          padding: 28px 22px;
          text-align: center;
          cursor: pointer;
          transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .rs-home-card:hover {
          box-shadow: 0 6px 24px rgba(24,95,165,0.13);
          border-color: #BFDBFE;
          transform: translateY(-2px);
        }
        .rs-home-icon {
          width: 54px; height: 54px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 2px;
        }
        .rs-home-card h3 {
          font-size: 16px; font-weight: 700; color: #0F172A;
        }
        .rs-home-card p {
          font-size: 13px; color: #64748B; line-height: 1.5;
        }
        .rs-arrow {
          font-size: 18px; color: #CBD5E1; margin-top: 4px;
          transition: color 0.15s, transform 0.15s;
        }
        .rs-home-card:hover .rs-arrow { color: #185FA5; transform: translateX(3px); }

        /* ── Staff view ── */
        .rs-staff-wrap {
          width: 100%;
          max-width: 820px;
        }

        .rs-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: 1.5px solid #E2E8F0; border-radius: 8px;
          padding: 7px 16px; font-size: 13px; font-weight: 600; color: #64748B;
          cursor: pointer; font-family: 'DM Sans', sans-serif; margin-bottom: 28px;
          transition: border-color 0.15s, color 0.15s;
        }
        .rs-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .rs-staff-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .rs-role-card {
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          padding: 22px 20px;
          cursor: pointer;
          transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .rs-role-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .rs-role-icon-wrap {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rs-role-card h3 { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
        .rs-role-card p { font-size: 13px; color: #64748B; line-height: 1.5; }

        .rs-role-chevron {
          margin-left: auto; flex-shrink: 0; color: #CBD5E1;
          transition: color 0.15s, transform 0.15s;
          align-self: center;
        }
        .rs-role-card:hover .rs-role-chevron { color: #185FA5; transform: translateX(3px); }

        /* ── Separator between sections ── */
        .rs-sep {
          display: flex; align-items: center; gap: 10px;
          margin: 18px 0 14px;
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.09em; color: #CBD5E1;
        }
        .rs-sep-line { flex: 1; height: 1px; background: #E2E8F0; }

        /* ── Patient card in staff view ── */
        .rs-patient-link {
          background: #F8FAFC; border: 1.5px dashed #CBD5E1;
          border-radius: 12px; padding: 14px 20px;
          display: flex; align-items: center; gap: 12px;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
          font-family: 'DM Sans', sans-serif; width: 100%; text-align: left;
        }
        .rs-patient-link:hover { border-color: #93C5FD; background: #EFF6FF; }
        .rs-patient-link span { font-size: 13px; color: #64748B; font-weight: 500; }
        .rs-patient-link strong { color: #185FA5; }

        @media (max-width: 540px) {
          .rs-home-grid { grid-template-columns: 1fr; }
          .rs-staff-grid { grid-template-columns: 1fr; }
          .rs-hospital-name { font-size: 24px; }
        }
      `}</style>

      <div className="rs-page">
        {/* ── Branding ── */}
        <div className="rs-brand">
          <div className="rs-logo-circle">
            <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1 className="rs-hospital-name">CityCare Hospital</h1>
          <p className="rs-tagline">
            {view === "home"
              ? "Advanced care, every step of the way."
              : "Select your staff role to sign up or log in."}
          </p>
        </div>

        {view === "home" ? (
          /* ── Home: two-choice view ── */
          <div style={{ width: "100%", maxWidth: 520 }}>
            <p className="rs-divider" style={{ textAlign: "center", marginBottom: 16 }}>
              Who are you?
            </p>
            <div className="rs-home-grid">
              {/* Hospital Staff */}
              <div className="rs-home-card" onClick={() => setView("staff")}>
                <div className="rs-home-icon" style={{ background: "#EFF6FF" }}>
                  <svg width="26" height="26" fill="none" stroke="#1D4ED8" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                </div>
                <h3>Hospital Staff</h3>
                <p>Doctor, HOD, Reception, or Pharmacist login.</p>
                <span className="rs-arrow">→</span>
              </div>

              {/* Patient */}
              <div className="rs-home-card" onClick={() => navigate("/login/patient")}>
                <div className="rs-home-icon" style={{ background: "#F0FDF4" }}>
                  <svg width="26" height="26" fill="none" stroke="#16A34A" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3>Patient</h3>
                <p>Access your appointments, records, and health support.</p>
                <span className="rs-arrow">→</span>
              </div>
            </div>
          </div>
        ) : (
          /* ── Staff: role selection view ── */
          <div className="rs-staff-wrap">
            <button className="rs-back-btn" onClick={() => setView("home")}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>

            <p className="rs-divider">Staff Roles</p>
            <div className="rs-staff-grid">
              {STAFF_ROLES.map((role) => (
                <div
                  key={role.key}
                  className="rs-role-card"
                  style={
                    hovered === role.key
                      ? { borderColor: role.accent, boxShadow: `0 6px 20px ${role.accent}1a` }
                      : {}
                  }
                  onClick={() => navigate(`/login/${role.key}`)}
                  onMouseEnter={() => setHovered(role.key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className="rs-role-icon-wrap"
                    style={{ background: role.iconBg }}
                  >
                    {role.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>{role.label}</h3>
                    <p>{role.desc}</p>
                  </div>
                  <svg className="rs-role-chevron" width="16" height="16" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                    strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>

            {/* Patient shortcut */}
            <div className="rs-sep">
              <span className="rs-sep-line" />
              <span>or</span>
              <span className="rs-sep-line" />
            </div>
            <button className="rs-patient-link" onClick={() => navigate("/login/patient")}>
              <svg width="18" height="18" fill="none" stroke="#16A34A" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Are you a <strong>Patient</strong>? Log in to the patient portal →</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
