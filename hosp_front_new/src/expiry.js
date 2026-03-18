import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";

function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const today  = new Date(); today.setHours(0,0,0,0);
  const expiry = new Date(dateStr + "T00:00:00");
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function getUrgency(days) {
  if (days <= 0)  return { label: "Expired",     bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", rowBg: "#FFF5F5" };
  if (days <= 7)  return { label: `${days}d left`, bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", rowBg: "#FFF5F5" };
  if (days <= 30) return { label: `${days}d left`, bg: "#FEF3C7", color: "#B45309", border: "#FDE68A", rowBg: "#FFFEF0" };
  return               { label: `${days}d left`, bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", rowBg: "#fff" };
}

export default function ExpiryAlerts() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const pharmName = location.state?.name || localStorage.getItem("pharmacist_name") || "Pharmacist";
  const pharmINI  = pharmName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const [medicines, setMedicines] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("all"); // "all" | "critical" | "warning" | "safe"

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/medicines/expiry`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMedicines(Array.isArray(data) ? data : []);
      } catch { setError("Failed to fetch expiring medicines."); }
      setLoading(false);
    })();
  }, []);

  const enriched = medicines.map((m) => ({
    ...m,
    days: daysUntil(m.expiry_date),
    urgency: getUrgency(daysUntil(m.expiry_date)),
  })).sort((a, b) => a.days - b.days);

  const filtered = enriched.filter((m) => {
    if (filter === "critical") return m.days <= 7;
    if (filter === "warning")  return m.days > 7 && m.days <= 30;
    if (filter === "safe")     return m.days > 30;
    return true;
  });

  const counts = {
    critical: enriched.filter((m) => m.days <= 7).length,
    warning:  enriched.filter((m) => m.days > 7 && m.days <= 30).length,
    safe:     enriched.filter((m) => m.days > 30).length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ex-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .ex-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .ex-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #5B21B6;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .ex-main { max-width: 820px; margin: 0 auto; padding: 32px 28px 60px; }

        .ex-topbar { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .ex-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.15s; flex-shrink: 0;
        }
        .ex-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        /* Filter chips */
        .ex-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .ex-chip {
          padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1.5px solid #E2E8F0; background: #fff; color: #64748B;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .ex-chip.active-all      { background: #F5F3FF; border-color: #DDD6FE; color: #7C3AED; }
        .ex-chip.active-critical { background: #FEF2F2; border-color: #FECACA; color: #DC2626; }
        .ex-chip.active-warning  { background: #FEF3C7; border-color: #FDE68A; color: #B45309; }
        .ex-chip.active-safe     { background: #F0FDF4; border-color: #BBF7D0; color: #16A34A; }
        .ex-chip-count {
          min-width: 18px; height: 18px; border-radius: 9px; background: currentColor;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; opacity: 0.85;
        }

        .ex-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 12px;
        }

        /* Table */
        .ex-table-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; }
        .ex-thead { display: grid; grid-template-columns: 3fr 1fr 1fr 120px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
        .ex-th { padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94A3B8; }

        .ex-row { display: grid; grid-template-columns: 3fr 1fr 1fr 120px; align-items: center; border-bottom: 1px solid #F1F5F9; }
        .ex-row:last-child { border-bottom: none; }
        .ex-td { padding: 13px 16px; font-size: 14px; color: #334155; }
        .ex-med-name { font-weight: 600; color: #0F172A; }

        .ex-chip-badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid transparent; }

        /* Empty */
        .ex-empty { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; gap: 10px; text-align: center; }
        .ex-empty-icon { width: 54px; height: 54px; border-radius: 50%; background: #F0FDF4; display: flex; align-items: center; justify-content: center; }
        .ex-empty-title { font-size: 15px; font-weight: 600; color: #334155; }
        .ex-empty-sub   { font-size: 13px; color: #94A3B8; }

        .ex-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 14px 16px; color: #DC2626; font-size: 14px; margin-bottom: 20px; }

        @media (max-width: 600px) {
          .ex-header { padding: 12px 16px; }
          .ex-main   { padding: 20px 14px 48px; }
          .ex-thead  { grid-template-columns: 2fr 1fr 100px; }
          .ex-thead .ex-th:nth-child(2) { display: none; }
          .ex-row    { grid-template-columns: 2fr 1fr 100px; }
          .ex-row .ex-td:nth-child(2) { display: none; }
        }
      `}</style>

      <div className="ex-body">
        <header className="ex-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="ex-avatar">{pharmINI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{pharmName}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Expiry Alerts</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        <main className="ex-main">
          <div className="ex-topbar">
            <button className="ex-back-btn"
              onClick={() => navigate("/pharmacist/home", { state: { name: pharmName } })}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back
            </button>
            <div style={{ fontSize: 13, color: "#64748B" }}>
              {loading ? "Loading…" : `${enriched.length} medicine${enriched.length !== 1 ? "s" : ""} monitored`}
            </div>
          </div>

          {error && <div className="ex-error">{error}</div>}

          {/* Filter chips */}
          <div className="ex-filters">
            {[
              { key: "all",      label: "All",      count: enriched.length, activeClass: "active-all"      },
              { key: "critical", label: "Critical ≤7d", count: counts.critical, activeClass: "active-critical" },
              { key: "warning",  label: "Warning ≤30d", count: counts.warning,  activeClass: "active-warning"  },
              { key: "safe",     label: "Safe",     count: counts.safe,     activeClass: "active-safe"     },
            ].map((c) => (
              <button key={c.key}
                className={`ex-chip${filter === c.key ? ` ${c.activeClass}` : ""}`}
                onClick={() => setFilter(c.key)}>
                {c.label}
                <span className="ex-chip-count">{c.count}</span>
              </button>
            ))}
          </div>

          <p className="ex-section-title">Expiring Medicines — Next 30 Days</p>
          <div className="ex-table-card">
            <div className="ex-thead">
              <div className="ex-th">Medicine Name</div>
              <div className="ex-th">Stock</div>
              <div className="ex-th">Expiry Date</div>
              <div className="ex-th">Status</div>
            </div>

            {loading ? (
              <div className="ex-empty"><div style={{ fontSize: 13, color: "#94A3B8" }}>Loading…</div></div>
            ) : filtered.length === 0 ? (
              <div className="ex-empty">
                <div className="ex-empty-icon">
                  <svg width="22" height="22" fill="none" stroke="#4ADE80" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="ex-empty-title">
                  {filter === "all" ? "No expiring medicines" : `No medicines in this category`}
                </div>
                <div className="ex-empty-sub">
                  {filter === "all" ? "All medicines in inventory are within safe expiry dates." : "Try switching to a different filter."}
                </div>
              </div>
            ) : (
              filtered.map((med) => (
                <div key={med.name} className="ex-row" style={{ background: med.urgency.rowBg }}>
                  <div className="ex-td"><span className="ex-med-name">{med.name}</span></div>
                  <div className="ex-td" style={{ color: "#64748B" }}>{med.stock_quantity}</div>
                  <div className="ex-td" style={{ fontWeight: 500, color: "#334155" }}>
                    {formatDate(med.expiry_date)}
                  </div>
                  <div className="ex-td">
                    <span className="ex-chip-badge"
                      style={{ background: med.urgency.bg, color: med.urgency.color, borderColor: med.urgency.border }}>
                      {med.urgency.label}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}
