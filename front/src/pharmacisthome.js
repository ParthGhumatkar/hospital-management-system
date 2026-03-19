import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";

function getInitials(name) {
  if (!name) return "P";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function PharmacistHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const name = location.state?.name || localStorage.getItem("pharmacist_name") || "Pharmacist";
  const INI  = getInitials(name);

  const [stats,   setStats]   = useState({ total: 0, lowStock: 0, expiring: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [stockRes, expiryRes] = await Promise.all([
          fetch(`${API_URL}/medicines/stock`),
          fetch(`${API_URL}/medicines/expiry`),
        ]);
        const stockData  = await stockRes.json();
        const expiryData = await expiryRes.json();
        const meds = Array.isArray(stockData) ? stockData : [];
        setStats({
          total:    meds.length,
          lowStock: meds.filter((m) => m.stock_quantity <= m.reorder_level).length,
          expiring: Array.isArray(expiryData) ? expiryData.length : 0,
        });
      } catch { /* silently fail */ }
      setLoading(false);
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pharmacist_name");
    navigate("/");
  };

  const go = (path) => navigate(path, { state: { name } });

  const statCards = [
    {
      label: "Total Medicines",
      value: stats.total,
      bg: "#F5F3FF", border: "#DDD6FE", accent: "#7C3AED",
      icon: (
        <svg width="20" height="20" fill="none" stroke="#7C3AED" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
        </svg>
      ),
    },
    {
      label: "Low Stock Alerts",
      value: stats.lowStock,
      bg: "#FEF3C7", border: "#FDE68A", accent: "#B45309",
      icon: (
        <svg width="20" height="20" fill="none" stroke="#B45309" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
    {
      label: "Expiring Soon",
      value: stats.expiring,
      bg: "#FEF2F2", border: "#FECACA", accent: "#DC2626",
      icon: (
        <svg width="20" height="20" fill="none" stroke="#DC2626" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ];

  const actionCards = [
    {
      label: "Check Medicine Stock",
      desc:  "View current stock levels and status",
      path:  "/pharmacist/medicines-stock",
      iconBg: "#F5F3FF", iconStroke: "#7C3AED",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#7C3AED" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
        </svg>
      ),
    },
    {
      label: "Reorder Medicines",
      desc:  "View and restock low inventory items",
      path:  "/pharmacist/medicines-reorder",
      iconBg: "#FEF3C7", iconStroke: "#D97706",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#D97706" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
        </svg>
      ),
    },
    {
      label: "Patient Medicine Track",
      desc:  "View medicine assigned to each patient",
      path:  "/pharmacist/patient-medicine-track",
      iconBg: "#EFF6FF", iconStroke: "#1D4ED8",
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
      label: "Expiry Alerts",
      desc:  "Medicines expiring in the next 30 days",
      path:  "/pharmacist/medicines-expiry",
      iconBg: "#FEF2F2", iconStroke: "#DC2626",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#DC2626" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      label: "Assign Medicine",
      desc:  "Dispense medicine directly to a patient",
      path:  "/pharmacist/assign-medicine",
      iconBg: "#F0FDF4", iconStroke: "#16A34A",
      icon: (
        <svg width="22" height="22" fill="none" stroke="#16A34A" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ph-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .ph-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .ph-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #5B21B6;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .ph-badge {
          background: #EDE9FE; color: #6D28D9; font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px; border: 1px solid #DDD6FE;
        }

        .ph-main { max-width: 960px; margin: 0 auto; padding: 36px 28px 60px; }

        .ph-greeting {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(26px, 4vw, 34px); color: #0F172A; margin-bottom: 6px;
        }
        .ph-sub   { font-size: 14px; color: #64748B; margin-bottom: 36px; }
        .ph-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 14px;
        }

        .ph-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 40px; }
        .ph-stat-card { border-radius: 14px; padding: 22px 24px; border: 1px solid transparent; }
        .ph-stat-icon {
          width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px; border: 1px solid rgba(0,0,0,0.06);
        }
        .ph-stat-value { font-size: 32px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
        .ph-stat-label { font-size: 13px; color: #475569; }

        .ph-actions { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 48px; }
        .ph-action-btn {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
          padding: 20px 22px; text-align: left; cursor: pointer;
          display: flex; align-items: flex-start; gap: 16px;
          transition: box-shadow 0.15s, border-color 0.15s;
          font-family: 'DM Sans', sans-serif; width: 100%;
        }
        .ph-action-btn:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: #DDD6FE; }
        .ph-action-icon {
          width: 44px; height: 44px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ph-action-label { font-weight: 600; font-size: 15px; color: #0F172A; margin-bottom: 3px; }
        .ph-action-desc  { font-size: 12px; color: #94A3B8; }

        .ph-logout { display: flex; justify-content: center; }
        .ph-logout-btn {
          padding: 10px 36px; background: #fff; border: 1.5px solid #E2E8F0;
          border-radius: 8px; color: #EF4444; font-weight: 600; font-size: 14px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }
        .ph-logout-btn:hover { background: #FEF2F2; border-color: #FECACA; }

        @media (max-width: 700px) {
          .ph-header  { padding: 12px 16px; }
          .ph-main    { padding: 24px 14px 48px; }
          .ph-stats   { grid-template-columns: 1fr; }
          .ph-actions { grid-template-columns: 1fr; }
        }
        @media (min-width: 701px) and (max-width: 900px) {
          .ph-actions { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      <div className="ph-body">
        <header className="ph-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="ph-avatar">{INI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{name}</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Pharmacy</div>
            </div>
            <span className="ph-badge">● Pharmacist</span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        <main className="ph-main">
          <h1 className="ph-greeting">Good {getTimeOfDay()}, {name.split(" ")[0]}.</h1>
          <p className="ph-sub">Managing pharmacy inventory and patient prescriptions.</p>

          <p className="ph-section-title">Inventory Overview</p>
          <div className="ph-stats">
            {statCards.map((s) => (
              <div key={s.label} className="ph-stat-card"
                style={{ background: s.bg, borderColor: s.border }}>
                <div className="ph-stat-icon">{s.icon}</div>
                <div className="ph-stat-value" style={{ color: s.accent }}>
                  {loading ? "—" : s.value}
                </div>
                <div className="ph-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="ph-section-title">Quick Actions</p>
          <div className="ph-actions">
            {actionCards.map((a) => (
              <button key={a.label} className="ph-action-btn" onClick={() => go(a.path)}>
                <div className="ph-action-icon" style={{ background: a.iconBg }}>{a.icon}</div>
                <div>
                  <div className="ph-action-label">{a.label}</div>
                  <div className="ph-action-desc">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="ph-logout">
            <button className="ph-logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </main>
      </div>
    </>
  );
}
