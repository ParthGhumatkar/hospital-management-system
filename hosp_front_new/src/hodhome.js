import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";

function getInitials(name) {
  if (!name) return "H";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function HODHome() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const name       = location.state?.name       || localStorage.getItem("hod_name")       || "HOD";
  const department = location.state?.department || localStorage.getItem("hod_department") || "";

  const [stats,   setStats]   = useState({ doctors: 0, departments: 0, reports: 0 });
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [showDeptList, setShowDeptList] = useState(false);

  const INI = getInitials(name);

  useEffect(() => {
    (async () => {
      try {
        const query = department ? `?department=${encodeURIComponent(department)}` : "";
        const [docRes, perfRes] = await Promise.all([
          fetch(`${API_URL}/hod/doctors${query}`),
          fetch(`${API_URL}/doctor_performance`),
        ]);
        const docData  = await docRes.json();
        const perfData = await perfRes.json();
        const list = docData.doctors || [];
        const uniqueDepts = new Set(list.map((d) => d.department).filter(Boolean));
        setDoctors(list);
        setStats({
          doctors:     list.length,
          departments: uniqueDepts.size || (department ? 1 : 0),
          reports:     (perfData.performance || []).length,
        });
      } catch { /* silently fail */ }
      setLoading(false);
    })();
  }, [department]);

  const handleLogout = () => {
    localStorage.removeItem("hod_name");
    localStorage.removeItem("hod_department");
    navigate("/");
  };

  const goWith = (path) => navigate(path, { state: { name, department } });

  const statCards = [
    {
      label: "Doctors in Dept.",
      value: stats.doctors,
      bg: "#EFF6FF", border: "#BFDBFE", accent: "#1D4ED8",
      icon: (
        <svg width="20" height="20" fill="none" stroke="#1D4ED8" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: "Departments",
      value: stats.departments,
      bg: "#F5F3FF", border: "#DDD6FE", accent: "#7C3AED",
      icon: (
        <svg width="20" height="20" fill="none" stroke="#7C3AED" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
      ),
    },
    {
      label: "Performance Reports",
      value: stats.reports,
      bg: "#F0FDF4", border: "#BBF7D0", accent: "#16A34A",
      icon: (
        <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6"  y1="20" x2="6"  y2="14"/>
        </svg>
      ),
    },
  ];

  const actionCards = [
    {
      label: "Manage Doctors",
      desc:  "Edit, remove or review your department's doctors",
      path:  "/hod/manage-doctors",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1D4ED8" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
    },
    {
      label: "View Reports",
      desc:  "Doctor performance analytics and comparisons",
      path:  "/hod/reports",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1D4ED8" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6"  y1="20" x2="6"  y2="14"/>
        </svg>
      ),
    },
    {
      label: "Department Overview",
      desc:  "See all doctors assigned to your department",
      path:  null, /* handled inline */
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1D4ED8" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/>
          <line x1="10" y1="14" x2="14" y2="14"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hh-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .hh-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .hh-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #0F6E56;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .hh-badge {
          background: #DCFCE7; color: #16A34A; font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px; border: 1px solid #BBF7D0;
        }

        .hh-main { max-width: 960px; margin: 0 auto; padding: 36px 28px 60px; }

        .hh-greeting {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(26px, 4vw, 34px); font-weight: 400; color: #0F172A; margin-bottom: 6px;
        }
        .hh-sub { font-size: 14px; color: #64748B; margin-bottom: 36px; }
        .hh-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 14px;
        }

        /* Stat cards */
        .hh-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 40px; }
        .hh-stat-card { border-radius: 14px; padding: 22px 24px; border: 1px solid transparent; }
        .hh-stat-icon {
          width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px; border: 1px solid rgba(0,0,0,0.06);
        }
        .hh-stat-value { font-size: 32px; font-weight: 700; color: #0F172A; line-height: 1; margin-bottom: 6px; }
        .hh-stat-label { font-size: 13px; color: #475569; }

        /* Action cards */
        .hh-actions { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 40px; }
        .hh-action-btn {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
          padding: 20px 22px; text-align: left; cursor: pointer;
          display: flex; align-items: flex-start; gap: 16px;
          transition: box-shadow 0.15s, border-color 0.15s;
          font-family: 'DM Sans', sans-serif; width: 100%;
        }
        .hh-action-btn:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: #BFDBFE; }
        .hh-action-icon {
          width: 44px; height: 44px; border-radius: 11px; background: #EFF6FF;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .hh-action-label { font-weight: 600; font-size: 15px; color: #0F172A; margin-bottom: 3px; }
        .hh-action-desc  { font-size: 12px; color: #94A3B8; }

        /* Department list */
        .hh-dept-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; margin-bottom: 36px; }
        .hh-dept-row { display: flex; align-items: center; gap: 12px; padding: 14px 20px; }
        .hh-dept-row + .hh-dept-row { border-top: 1px solid #F1F5F9; }
        .hh-dept-row:hover { background: #FAFBFC; }
        .hh-doc-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: #EFF6FF; color: #1D4ED8;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px; flex-shrink: 0;
        }
        .hh-doc-name  { font-weight: 500; font-size: 14px; color: #0F172A; }
        .hh-doc-spec  { font-size: 12px; color: #94A3B8; margin-top: 1px; }
        .hh-dept-badge {
          margin-left: auto; font-size: 11px; font-weight: 600; padding: 3px 10px;
          border-radius: 20px; background: #F5F3FF; color: #7C3AED;
          border: 1px solid #DDD6FE; white-space: nowrap; flex-shrink: 0;
        }

        /* Logout */
        .hh-logout {
          display: flex; justify-content: center;
        }
        .hh-logout-btn {
          padding: 10px 36px; background: #fff; border: 1.5px solid #E2E8F0;
          border-radius: 8px; color: #EF4444; font-weight: 600; font-size: 14px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }
        .hh-logout-btn:hover { background: #FEF2F2; border-color: #FECACA; }

        .hh-empty { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 8px; }
        .hh-empty-title { font-size: 14px; font-weight: 600; color: #475569; }
        .hh-empty-sub   { font-size: 13px; color: #94A3B8; }

        @media (max-width: 700px) {
          .hh-header  { padding: 12px 16px; }
          .hh-main    { padding: 24px 14px 48px; }
          .hh-stats   { grid-template-columns: 1fr; }
          .hh-actions { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="hh-body">
        {/* ── Header ── */}
        <header className="hh-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="hh-avatar">{INI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{name}</div>
              {department && <div style={{ fontSize: 12, color: "#64748B" }}>{department}</div>}
            </div>
            <span className="hh-badge">● HOD</span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        {/* ── Main ── */}
        <main className="hh-main">
          <h1 className="hh-greeting">Good {getTimeOfDay()}, {name.split(" ")[0]}.</h1>
          <p className="hh-sub">
            {department ? `Managing the ${department} department.` : "Department management overview."}
          </p>

          {/* Stat cards */}
          <p className="hh-section-title">Overview</p>
          <div className="hh-stats">
            {statCards.map((s) => (
              <div key={s.label} className="hh-stat-card"
                style={{ background: s.bg, borderColor: s.border }}>
                <div className="hh-stat-icon">{s.icon}</div>
                <div className="hh-stat-value" style={{ color: s.accent }}>
                  {loading ? "—" : s.value}
                </div>
                <div className="hh-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Action cards */}
          <p className="hh-section-title">Quick Actions</p>
          <div className="hh-actions">
            {actionCards.map((a) => (
              <button
                key={a.label}
                className="hh-action-btn"
                onClick={() => {
                  if (a.path) goWith(a.path);
                  else setShowDeptList((v) => !v);
                }}
              >
                <div className="hh-action-icon">{a.icon}</div>
                <div>
                  <div className="hh-action-label">{a.label}</div>
                  <div className="hh-action-desc">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Department overview panel */}
          {showDeptList && (
            <>
              <p className="hh-section-title">
                {department ? `Doctors — ${department}` : "All Doctors"}
              </p>
              <div className="hh-dept-card">
                {loading ? (
                  <div className="hh-empty"><div className="hh-empty-title">Loading…</div></div>
                ) : doctors.length === 0 ? (
                  <div className="hh-empty">
                    <div className="hh-empty-title">No doctors found</div>
                    <div className="hh-empty-sub">Add doctors via Manage Doctors.</div>
                  </div>
                ) : (
                  doctors.map((doc) => {
                    const ini = doc.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <div key={doc.id} className="hh-dept-row">
                        <div className="hh-doc-avatar">{ini}</div>
                        <div>
                          <div className="hh-doc-name">{doc.name}</div>
                          <div className="hh-doc-spec">{doc.specialization}</div>
                        </div>
                        {doc.department && (
                          <span className="hh-dept-badge">{doc.department}</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Logout */}
          <div className="hh-logout">
            <button className="hh-logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </main>
      </div>
    </>
  );
}
