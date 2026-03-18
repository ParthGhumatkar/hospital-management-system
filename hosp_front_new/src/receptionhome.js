import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";

function getInitials(name) {
  if (!name) return "R";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function ReceptionHome() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const name = location.state?.name || localStorage.getItem("reception_name") || "Receptionist";
  const INI  = getInitials(name);

  const [stats,   setStats]   = useState({ patients: 0, beds: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, bRes] = await Promise.all([
          fetch(`${API_URL}/patients`),
          fetch(`${API_URL}/beds`),
        ]);
        const pData = await pRes.json();
        const bData = await bRes.json();
        const patientList = pData.patients || [];
        const bedList     = Array.isArray(bData) ? bData : [];
        setStats({
          patients: patientList.length,
          beds:     bedList.filter((b) => b.status === "Available").length,
          pending:  patientList.filter((p) => !p.bed_id).length,
        });
      } catch { /* silently fail */ }
      setLoading(false);
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("reception_name");
    navigate("/");
  };

  const goWith = (path) => navigate(path, { state: { name } });

  const statCards = [
    {
      label: "Total Patients",
      value: stats.patients,
      bg: "#FFFBEB", border: "#FDE68A", accent: "#B45309",
      icon: (
        <svg width="20" height="20" fill="none" stroke="#B45309" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: "Available Beds",
      value: stats.beds,
      bg: "#F0FDF4", border: "#BBF7D0", accent: "#16A34A",
      icon: (
        <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>
        </svg>
      ),
    },
    {
      label: "Pending Registration",
      value: stats.pending,
      bg: "#FEF2F2", border: "#FECACA", accent: "#DC2626",
      icon: (
        <svg width="20" height="20" fill="none" stroke="#DC2626" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
  ];

  const actionCards = [
    {
      label: "Register Patient",
      desc:  "Add a new patient to the system",
      path:  "/register-patient",
      color: "#FFFBEB",
      iconBg: "#FEF3C7",
      iconStroke: "#D97706",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#D97706" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
      ),
    },
    {
      label: "Manage Patients",
      desc:  "View, edit and assign beds to patients",
      path:  "/manage-patients",
      color: "#EFF6FF",
      iconBg: "#DBEAFE",
      iconStroke: "#1D4ED8",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1D4ED8" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: "Manage Appointments",
      desc:  "Schedule and update appointments",
      path:  "/manage-appointments",
      color: "#F5F3FF",
      iconBg: "#EDE9FE",
      iconStroke: "#7C3AED",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#7C3AED" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      label: "Bed Management",
      desc:  "Track bed availability and assign beds to patients",
      path:  "/manage-patients#beds",
      color: "#F0FDF4",
      iconBg: "#DCFCE7",
      iconStroke: "#16A34A",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#16A34A" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/>
          <path d="M2 17h20"/><path d="M6 8v9"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rh-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .rh-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .rh-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #854F0B;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .rh-badge {
          background: #FEF3C7; color: #B45309; font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px; border: 1px solid #FDE68A;
        }

        .rh-main { max-width: 960px; margin: 0 auto; padding: 36px 28px 60px; }

        .rh-greeting {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(26px, 4vw, 34px); font-weight: 400; color: #0F172A; margin-bottom: 6px;
        }
        .rh-sub   { font-size: 14px; color: #64748B; margin-bottom: 36px; }
        .rh-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 14px;
        }

        /* Stat cards */
        .rh-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 40px; }
        .rh-stat-card { border-radius: 14px; padding: 22px 24px; border: 1px solid transparent; }
        .rh-stat-icon {
          width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px; border: 1px solid rgba(0,0,0,0.06);
        }
        .rh-stat-value { font-size: 32px; font-weight: 700; color: #0F172A; line-height: 1; margin-bottom: 6px; }
        .rh-stat-label { font-size: 13px; color: #475569; }

        /* Action cards */
        .rh-actions { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; margin-bottom: 48px; }
        .rh-action-btn {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
          padding: 20px 22px; text-align: left; cursor: pointer;
          display: flex; align-items: flex-start; gap: 16px;
          transition: box-shadow 0.15s, border-color 0.15s;
          font-family: 'DM Sans', sans-serif; width: 100%;
        }
        .rh-action-btn:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: #FDE68A; }
        .rh-action-icon {
          width: 44px; height: 44px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rh-action-label { font-weight: 600; font-size: 15px; color: #0F172A; margin-bottom: 3px; }
        .rh-action-desc  { font-size: 12px; color: #94A3B8; }

        .rh-logout { display: flex; justify-content: center; }
        .rh-logout-btn {
          padding: 10px 36px; background: #fff; border: 1.5px solid #E2E8F0;
          border-radius: 8px; color: #EF4444; font-weight: 600; font-size: 14px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }
        .rh-logout-btn:hover { background: #FEF2F2; border-color: #FECACA; }

        @media (max-width: 700px) {
          .rh-header  { padding: 12px 16px; }
          .rh-main    { padding: 24px 14px 48px; }
          .rh-stats   { grid-template-columns: 1fr; }
          .rh-actions { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="rh-body">
        {/* ── Header ── */}
        <header className="rh-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="rh-avatar">{INI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{name}</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Front Desk</div>
            </div>
            <span className="rh-badge">● Receptionist</span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        {/* ── Main ── */}
        <main className="rh-main">
          <h1 className="rh-greeting">Good {getTimeOfDay()}, {name.split(" ")[0]}.</h1>
          <p className="rh-sub">Here's today's overview for the front desk.</p>

          {/* Stat cards */}
          <p className="rh-section-title">Overview</p>
          <div className="rh-stats">
            {statCards.map((s) => (
              <div key={s.label} className="rh-stat-card"
                style={{ background: s.bg, borderColor: s.border }}>
                <div className="rh-stat-icon">{s.icon}</div>
                <div className="rh-stat-value" style={{ color: s.accent }}>
                  {loading ? "—" : s.value}
                </div>
                <div className="rh-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Action cards */}
          <p className="rh-section-title">Quick Actions</p>
          <div className="rh-actions">
            {actionCards.map((a) => (
              <button key={a.label} className="rh-action-btn" onClick={() => goWith(a.path)}>
                <div className="rh-action-icon" style={{ background: a.iconBg }}>{a.icon}</div>
                <div>
                  <div className="rh-action-label">{a.label}</div>
                  <div className="rh-action-desc">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="rh-logout">
            <button className="rh-logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </main>
      </div>
    </>
  );
}
