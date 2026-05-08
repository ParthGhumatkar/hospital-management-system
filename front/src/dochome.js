import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
}

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function DoctorHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const name = location.state?.name || "Doctor";
  const doctorId = location.state?.doctorId;

  const [department, setDepartment] = useState("");
  const [stats, setStats] = useState({ today: 0, active: 0, completed: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  /* redirect if no session */
  useEffect(() => {
    if (!doctorId) navigate("/");
  }, [doctorId, navigate]);

  /* inject Google Fonts */
  useEffect(() => {
    const id = "dochome-gfonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  /* fetch data */
  useEffect(() => {
    if (!doctorId) return;
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      fetch(`${API_URL}/appointments/${doctorId}`).then((r) => r.json()),
      fetch(`${API_URL}/appointments/upcoming/${doctorId}`).then((r) => r.json()),
      fetch(`${API_URL}/doctor/${doctorId}/patient_count`).then((r) => r.json()),
      fetch(`${API_URL}/hod/doctors`).then((r) => r.json()),
    ])
      .then(([appData, upData, countData, docData]) => {
        const all = appData.appointments || [];
        const todayAppts = all.filter((a) => a.date === today);

        setStats({
          today: todayAppts.length,
          active: countData.count || 0,
          completed: todayAppts.filter((a) => a.status === "Completed").length,
        });

        setUpcoming((upData.appointments || []).slice(0, 3));

        const me = (docData.doctors || []).find(
          (d) => d.id === parseInt(doctorId, 10)
        );
        if (me) setDepartment(me.department || me.specialization || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [doctorId]);

  if (!doctorId) return null;

  const INI = initials(name);

  const statCards = [
    {
      label: "Today's Appointments",
      value: stats.today,
      bg: "#EFF6FF",
      border: "#BFDBFE",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      accent: "#1D4ED8",
    },
    {
      label: "Active Patients",
      value: stats.active,
      bg: "#F0FDF4",
      border: "#BBF7D0",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      accent: "#16A34A",
    },
    {
      label: "Completed Today",
      value: stats.completed,
      bg: "#FFF7ED",
      border: "#FED7AA",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      accent: "#EA580C",
    },
  ];

  const actionCards = [

    {
  label: "Live ICU Monitor",
  desc: "Real-time patient vitals & alerts",
  path: "/doctor-dashboard",
  icon: (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="#1D4ED8"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
},
    {
      label: "Appointments",
      desc: "View & manage your schedule",
      path: "/doctor/appointments",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: "Patient Records",
      desc: "Browse & update patient history",
      path: "/doctor/patients",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: "Reports",
      desc: "Doctor performance analytics",
      path: "/hod/reports",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      label: "Disease Analysis",
      desc: "AI-powered diagnosis tool",
      path: "/doctor/patients",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      ),
    },
    ...(department?.toLowerCase().includes("psychi")
      ? [{
          label: "Mental Health Chats",
          desc: "View and reply to patient conversations",
          path: "/psychiatrist-dashboard",
          icon: (
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          ),
        }]
      : []),

  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dh-body {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #F8FAFC;
          color: #1E293B;
        }

        .dh-header {
          background: #fff;
          border-bottom: 1px solid #E2E8F0;
          padding: 14px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .dh-avatar {
          width: 50px; height: 50px; border-radius: 50%;
          background: #1D4ED8; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 17px; flex-shrink: 0;
          letter-spacing: 1px;
        }

        .dh-badge {
          background: #DCFCE7; color: #16A34A;
          font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid #BBF7D0;
          white-space: nowrap;
        }

        .dh-main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 36px 28px 60px;
        }

        .dh-greeting {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 400;
          color: #0F172A;
          margin-bottom: 6px;
          line-height: 1.2;
        }

        .dh-sub {
          color: #64748B;
          font-size: 14px;
          margin-bottom: 36px;
        }

        .dh-section-title {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94A3B8;
          margin-bottom: 14px;
        }

        /* Stat cards */
        .dh-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .dh-stat-card {
          border-radius: 14px;
          padding: 22px 24px;
          border: 1px solid transparent;
        }

        .dh-stat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
          border: 1px solid rgba(0,0,0,0.06);
        }

        .dh-stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1;
          margin-bottom: 6px;
        }

        .dh-stat-label {
          font-size: 13px;
          color: #475569;
        }

        /* Action cards */
        .dh-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 40px;
        }

        .dh-action-btn {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 20px 22px;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: box-shadow 0.15s, border-color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .dh-action-btn:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border-color: #BFDBFE;
        }

        .dh-action-icon {
          width: 44px; height: 44px; border-radius: 11px;
          background: #EFF6FF;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .dh-action-label {
          font-weight: 600;
          font-size: 15px;
          color: #0F172A;
          margin-bottom: 3px;
        }

        .dh-action-desc {
          font-size: 12px;
          color: #94A3B8;
        }

        /* Upcoming */
        .dh-upcoming-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 36px;
        }

        .dh-appt-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 22px;
        }

        .dh-appt-row + .dh-appt-row {
          border-top: 1px solid #F1F5F9;
        }

        .dh-appt-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: #EFF6FF; color: #1D4ED8;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; flex-shrink: 0;
        }

        .dh-appt-name { font-weight: 500; font-size: 14px; color: #0F172A; }
        .dh-appt-date { font-size: 12px; color: #94A3B8; margin-top: 2px; }

        .dh-time-chip {
          background: #F0FDF4; color: #16A34A;
          font-size: 12px; font-weight: 600;
          padding: 4px 12px; border-radius: 20px;
          border: 1px solid #BBF7D0;
          white-space: nowrap;
        }

        .dh-empty {
          padding: 28px;
          text-align: center;
          font-size: 13px;
          color: #94A3B8;
        }

        .dh-logout {
          display: flex;
          justify-content: center;
        }

        .dh-logout-btn {
          padding: 10px 36px;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          color: #EF4444;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }

        .dh-logout-btn:hover {
          background: #FEF2F2;
          border-color: #FECACA;
        }

        @media (max-width: 640px) {
          .dh-header { padding: 12px 20px; }
          .dh-main { padding: 24px 16px 48px; }
          .dh-stats { grid-template-columns: 1fr; }
          .dh-actions { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .dh-badge { display: none; }
        }
      `}</style>

      <div className="dh-body">
        {/* ── Header ── */}
        <header className="dh-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="dh-avatar">{INI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>
                Dr. {name}
              </div>
              {department && (
                <div style={{ fontSize: 13, color: "#64748B" }}>{department}</div>
              )}
            </div>
            <span className="dh-badge">● On Duty</span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        {/* ── Main ── */}
        <main className="dh-main">
          <h1 className="dh-greeting">
            Good {getTimeOfDay()}, Dr. {name}.
          </h1>
          <p className="dh-sub">Here's your overview for today.</p>

          {/* Stat cards */}
          <p className="dh-section-title">Today's Summary</p>
          <div className="dh-stats">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="dh-stat-card"
                style={{ background: s.bg, borderColor: s.border }}
              >
                <div className="dh-stat-icon">{s.icon}</div>
                <div className="dh-stat-value" style={{ color: s.accent }}>
                  {loading ? "—" : s.value}
                </div>
                <div className="dh-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Action cards */}
          <p className="dh-section-title">Quick Actions</p>
          <div className="dh-actions">
            {actionCards.map((a) => (
              <button
                key={a.label}
                className="dh-action-btn"
                onClick={() =>
                  navigate(a.path, {
                    state: {
                      doctorId,
                      name,
                      department,
                    },
                  })
                }
              >
                <div className="dh-action-icon">{a.icon}</div>
                <div>
                  <div className="dh-action-label">{a.label}</div>
                  <div className="dh-action-desc">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Upcoming appointments */}
          <p className="dh-section-title">Upcoming Appointments</p>
          <div className="dh-upcoming-card">
            {loading ? (
              <div className="dh-empty">Loading…</div>
            ) : upcoming.length === 0 ? (
              <div className="dh-empty">No upcoming appointments.</div>
            ) : (
              upcoming.map((appt) => (
                <div key={appt.id} className="dh-appt-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="dh-appt-avatar">
                      {appt.patient_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="dh-appt-name">{appt.patient_name}</div>
                      <div className="dh-appt-date">{appt.date}</div>
                    </div>
                  </div>
                  <span className="dh-time-chip">{fmtTime(appt.time)}</span>
                </div>
              ))
            )}
          </div>

          {/* Logout */}
          <div className="dh-logout">
            <button
              className="dh-logout-btn"
              onClick={() => navigate("/")}
            >
              Sign Out
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
