import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";

function getStatusInfo(stock, reorder) {
  if (stock === 0)              return { label: "Out of Stock", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
  if (stock <= reorder * 0.5)  return { label: "Critical",     bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
  if (stock <= reorder)        return { label: "Low",          bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" };
  return                              { label: "Good",         bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" };
}

export default function MedicinesStock() {
  const navigate = useNavigate();
  const location = useLocation();
  const pharmName = location.state?.name || localStorage.getItem("pharmacist_name") || "Pharmacist";

  const [medicines,    setMedicines]    = useState([]);
  const [mostUsed,     setMostUsed]     = useState([]);
  const [showMostUsed, setShowMostUsed] = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");

  const fetchStock = async () => {
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/medicines/stock`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMedicines(Array.isArray(data) ? data : []);
      setShowMostUsed(false);
    } catch { setError("Failed to fetch medicine stock."); }
    setLoading(false);
  };

  const fetchMostUsed = async () => {
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/medicines/usage`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMostUsed(Array.isArray(data) ? data : []);
      setShowMostUsed(true);
    } catch { setError("Failed to fetch most used medicines."); }
    setLoading(false);
  };

  useEffect(() => { fetchStock(); }, []);

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const pharmINI = pharmName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cs-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .cs-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .cs-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #5B21B6;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .cs-main { max-width: 900px; margin: 0 auto; padding: 32px 28px 60px; }

        .cs-topbar { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .cs-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; flex-shrink: 0;
          transition: border-color 0.15s, color 0.15s;
        }
        .cs-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        /* Toggle */
        .cs-toggle { display: flex; background: #F1F5F9; border-radius: 9px; padding: 3px; gap: 2px; flex-shrink: 0; }
        .cs-tab {
          padding: 6px 16px; border-radius: 7px; font-size: 13px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'DM Sans', sans-serif;
          color: #64748B; background: transparent; transition: background 0.15s, color 0.15s;
        }
        .cs-tab.active { background: #fff; color: #7C3AED; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

        .cs-search-wrap { flex: 1; position: relative; min-width: 180px; }
        .cs-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .cs-search {
          width: 100%; padding: 8px 12px 8px 36px;
          border: 1.5px solid #E2E8F0; border-radius: 9px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; color: #334155;
          outline: none; background: #fff; transition: border-color 0.15s;
        }
        .cs-search:focus { border-color: #DDD6FE; }

        .cs-refresh-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; background: #F5F3FF; color: #7C3AED;
          border: 1px solid #DDD6FE; border-radius: 8px; font-size: 13px;
          font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; flex-shrink: 0;
        }
        .cs-refresh-btn:hover { background: #EDE9FE; }

        .cs-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 12px;
        }

        /* Table card */
        .cs-table-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; }
        .cs-thead { display: grid; grid-template-columns: 3fr 1fr 1fr 120px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
        .cs-th { padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94A3B8; }

        .cs-row { display: grid; grid-template-columns: 3fr 1fr 1fr 120px; align-items: center; border-bottom: 1px solid #F1F5F9; }
        .cs-row:last-child { border-bottom: none; }
        .cs-row:hover { background: #FAFBFC; }
        .cs-td { padding: 13px 16px; font-size: 14px; color: #334155; }
        .cs-med-name { font-weight: 600; color: #0F172A; }

        .cs-status-chip { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid transparent; }

        /* Most used table */
        .cs-mu-row { display: grid; grid-template-columns: 3fr 1fr; align-items: center; border-bottom: 1px solid #F1F5F9; }
        .cs-mu-row:last-child { border-bottom: none; }
        .cs-mu-row:hover { background: #FAFBFC; }
        .cs-mu-bar-wrap { height: 6px; background: #EDE9FE; border-radius: 3px; margin-top: 4px; overflow: hidden; }
        .cs-mu-bar      { height: 6px; background: #7C3AED; border-radius: 3px; }

        /* Empty */
        .cs-empty { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; gap: 10px; text-align: center; }
        .cs-empty-icon { width: 54px; height: 54px; border-radius: 50%; background: #EDE9FE; display: flex; align-items: center; justify-content: center; }
        .cs-empty-title { font-size: 15px; font-weight: 600; color: #334155; }
        .cs-empty-sub   { font-size: 13px; color: #94A3B8; }

        .cs-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 14px 16px; color: #DC2626; font-size: 14px; margin-bottom: 20px; }

        @media (max-width: 600px) {
          .cs-header { padding: 12px 16px; }
          .cs-main   { padding: 20px 14px 48px; }
          .cs-thead  { grid-template-columns: 2fr 1fr 100px; }
          .cs-thead .cs-th:nth-child(3) { display: none; }
          .cs-row    { grid-template-columns: 2fr 1fr 100px; }
          .cs-row .cs-td:nth-child(3) { display: none; }
        }
      `}</style>

      <div className="cs-body">
        <header className="cs-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="cs-avatar">{pharmINI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{pharmName}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Medicine Stock</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        <main className="cs-main">
          <div className="cs-topbar">
            <button className="cs-back-btn"
              onClick={() => navigate("/pharmacist/home", { state: { name: pharmName } })}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back
            </button>

            <div className="cs-toggle">
              <button className={`cs-tab${!showMostUsed ? " active" : ""}`}
                onClick={() => { if (showMostUsed) fetchStock(); }}>
                All Stock
              </button>
              <button className={`cs-tab${showMostUsed ? " active" : ""}`}
                onClick={() => { if (!showMostUsed) fetchMostUsed(); }}>
                Most Used
              </button>
            </div>

            {!showMostUsed && (
              <div className="cs-search-wrap">
                <span className="cs-search-icon">
                  <svg width="13" height="13" fill="none" stroke="#94A3B8" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input className="cs-search" placeholder="Search medicines…"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            )}

            <button className="cs-refresh-btn" onClick={showMostUsed ? fetchMostUsed : fetchStock}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
              </svg>
              Refresh
            </button>
          </div>

          {error && <div className="cs-error">{error}</div>}

          {!showMostUsed ? (
            <>
              <p className="cs-section-title">
                {loading ? "Loading…" : `${filtered.length} medicine${filtered.length !== 1 ? "s" : ""}`}
              </p>
              <div className="cs-table-card">
                <div className="cs-thead">
                  <div className="cs-th">Medicine Name</div>
                  <div className="cs-th">Stock</div>
                  <div className="cs-th">Reorder Level</div>
                  <div className="cs-th">Status</div>
                </div>
                {loading ? (
                  <div className="cs-empty"><div style={{ fontSize: 13, color: "#94A3B8" }}>Loading…</div></div>
                ) : filtered.length === 0 ? (
                  <div className="cs-empty">
                    <div className="cs-empty-icon">
                      <svg width="22" height="22" fill="none" stroke="#A78BFA" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                      </svg>
                    </div>
                    <div className="cs-empty-title">
                      {search ? "No medicines match your search" : "No medicines in stock"}
                    </div>
                  </div>
                ) : (
                  filtered.map((med) => {
                    const si = getStatusInfo(med.stock_quantity, med.reorder_level);
                    return (
                      <div key={med.id} className="cs-row">
                        <div className="cs-td"><span className="cs-med-name">{med.name}</span></div>
                        <div className="cs-td" style={{ fontWeight: 600, color: med.stock_quantity <= med.reorder_level ? "#B45309" : "#0F172A" }}>
                          {med.stock_quantity}
                        </div>
                        <div className="cs-td" style={{ color: "#64748B" }}>{med.reorder_level}</div>
                        <div className="cs-td">
                          <span className="cs-status-chip"
                            style={{ background: si.bg, color: si.color, borderColor: si.border }}>
                            {si.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <>
              <p className="cs-section-title">Most Used Medicines</p>
              <div className="cs-table-card">
                <div className="cs-thead" style={{ gridTemplateColumns: "3fr 1fr" }}>
                  <div className="cs-th">Medicine Name</div>
                  <div className="cs-th">Total Used</div>
                </div>
                {loading ? (
                  <div className="cs-empty"><div style={{ fontSize: 13, color: "#94A3B8" }}>Loading…</div></div>
                ) : mostUsed.length === 0 ? (
                  <div className="cs-empty">
                    <div className="cs-empty-title">No usage data available</div>
                  </div>
                ) : (() => {
                  const maxUsed = Math.max(...mostUsed.map((m) => m.total_used), 1);
                  return mostUsed.map((med, i) => (
                    <div key={i} className="cs-mu-row">
                      <div className="cs-td">
                        <div className="cs-med-name">{med.name}</div>
                        <div className="cs-mu-bar-wrap" style={{ maxWidth: 180 }}>
                          <div className="cs-mu-bar" style={{ width: `${(med.total_used / maxUsed) * 100}%` }} />
                        </div>
                      </div>
                      <div className="cs-td" style={{ fontWeight: 700, color: "#7C3AED" }}>{med.total_used}</div>
                    </div>
                  ));
                })()}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
