import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function AllPatientMedicines() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const pharmName   = location.state?.name || localStorage.getItem("pharmacist_name") || "Pharmacist";
  const pharmINI    = getInitials(pharmName);

  const [groups,  setGroups]  = useState([]);  // [{ patientName, medicines[] }]
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/all_patient_medicines`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response");

        /* group flat rows by patient_name */
        const map = new Map();
        data.forEach((row) => {
          if (!map.has(row.patient_name)) map.set(row.patient_name, []);
          map.get(row.patient_name).push(row);
        });
        setGroups([...map.entries()].map(([name, medicines]) => ({ name, medicines })));
      } catch {
        setError("Could not load medicine records. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .apm-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        /* ── Header ── */
        .apm-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .apm-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #5B21B6;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .apm-badge {
          background: #EDE9FE; color: #6D28D9; font-size: 11px; font-weight: 600;
          padding: 2px 9px; border-radius: 20px; border: 1px solid #DDD6FE;
        }

        /* ── Main ── */
        .apm-main { max-width: 860px; margin: 0 auto; padding: 32px 28px 60px; }

        .apm-topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .apm-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.15s, color 0.15s;
        }
        .apm-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .apm-page-title {
          font-family: 'DM Serif Display', serif;
          font-size: 24px; font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .apm-page-sub { font-size: 14px; color: #64748B; margin-bottom: 28px; }

        /* ── Patient group card ── */
        .apm-group {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
          overflow: hidden; margin-bottom: 20px;
        }
        .apm-group-hd {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px; background: #FAFBFC; border-bottom: 1px solid #F1F5F9;
        }
        .apm-pat-avatar {
          width: 34px; height: 34px; border-radius: 50%; background: #EDE9FE;
          color: #6D28D9; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 12px; flex-shrink: 0;
        }
        .apm-pat-name { font-size: 14px; font-weight: 700; color: #0F172A; }
        .apm-count-badge {
          margin-left: auto; background: #F5F3FF; border: 1px solid #DDD6FE;
          color: #6D28D9; font-size: 11px; font-weight: 600;
          padding: 2px 9px; border-radius: 20px;
        }

        /* ── Table ── */
        .apm-thead {
          display: grid; grid-template-columns: 2fr 1fr 1fr;
          background: #F8FAFC; border-bottom: 1px solid #E2E8F0;
        }
        .apm-th {
          padding: 9px 18px; font-size: 10px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.07em; color: #94A3B8;
        }
        .apm-row {
          display: grid; grid-template-columns: 2fr 1fr 1fr;
          border-bottom: 1px solid #F1F5F9;
        }
        .apm-row:last-child { border-bottom: none; }
        .apm-row:hover { background: #FAFBFC; }
        .apm-td { padding: 12px 18px; font-size: 13px; color: #334155; display: flex; align-items: center; }
        .apm-med-name { font-weight: 600; color: #0F172A; }
        .apm-qty-chip {
          display: inline-flex; align-items: center;
          background: #F5F3FF; border: 1px solid #DDD6FE; color: #6D28D9;
          font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 20px;
        }

        /* ── No medicines row ── */
        .apm-no-meds {
          padding: 20px 18px; font-size: 13px; color: #94A3B8;
          font-style: italic; text-align: center;
        }

        /* ── Full-page states ── */
        .apm-state {
          display: flex; flex-direction: column; align-items: center;
          padding: 80px 24px; gap: 12px; text-align: center;
        }
        .apm-state-icon {
          width: 56px; height: 56px; border-radius: 50%; background: #F5F3FF;
          display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
        }
        .apm-state-title { font-size: 15px; font-weight: 600; color: #334155; }
        .apm-state-sub   { font-size: 13px; color: #94A3B8; max-width: 280px; line-height: 1.55; }

        @media (max-width: 640px) {
          .apm-header { padding: 12px 16px; }
          .apm-main   { padding: 20px 14px 48px; }
          .apm-thead  { grid-template-columns: 2fr 1fr; }
          .apm-row    { grid-template-columns: 2fr 1fr; }
          .apm-td:last-child, .apm-th:last-child { display: none; }
        }
      `}</style>

      <div className="apm-body">

        {/* ── Header ── */}
        <header className="apm-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="apm-avatar">{pharmINI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{pharmName}</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Pharmacy</div>
            </div>
            <span className="apm-badge">● Pharmacist</span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </div>
        </header>

        <main className="apm-main">

          <div className="apm-topbar">
            <button className="apm-back-btn"
              onClick={() => navigate("/pharmacist/home", { state: location.state })}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Home
            </button>
          </div>

          <div className="apm-page-title">Patient Medicine Track</div>
          <div className="apm-page-sub">All medicines dispensed across every patient.</div>

          {loading ? (
            <div className="apm-state">
              <div className="apm-state-title" style={{ color: "#94A3B8" }}>Loading records…</div>
            </div>

          ) : error ? (
            <div className="apm-state">
              <div className="apm-state-icon">
                <svg width="24" height="24" fill="none" stroke="#DC2626" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div className="apm-state-title">{error}</div>
            </div>

          ) : groups.length === 0 ? (
            <div className="apm-state">
              <div className="apm-state-icon">
                <svg width="24" height="24" fill="none" stroke="#A78BFA" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                </svg>
              </div>
              <div className="apm-state-title">No medicines assigned yet</div>
              <div className="apm-state-sub">
                Medicines dispensed to patients will appear here once assigned.
              </div>
            </div>

          ) : (
            groups.map(({ name, medicines }) => (
              <div key={name} className="apm-group">

                {/* Patient header */}
                <div className="apm-group-hd">
                  <div className="apm-pat-avatar">{getInitials(name)}</div>
                  <span className="apm-pat-name">{name}</span>
                  <span className="apm-count-badge">
                    {medicines.length} {medicines.length === 1 ? "medicine" : "medicines"}
                  </span>
                </div>

                {/* Medicine rows */}
                {medicines.length === 0 ? (
                  <div className="apm-no-meds">No medicines assigned</div>
                ) : (
                  <>
                    <div className="apm-thead">
                      <div className="apm-th">Medicine</div>
                      <div className="apm-th">Quantity</div>
                      <div className="apm-th">Date Given</div>
                    </div>
                    {medicines.map((m, i) => (
                      <div key={i} className="apm-row">
                        <div className="apm-td">
                          <span className="apm-med-name">{m.medicine_name}</span>
                        </div>
                        <div className="apm-td">
                          <span className="apm-qty-chip">{m.quantity} units</span>
                        </div>
                        <div className="apm-td">{formatDate(m.date_given)}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))
          )}

        </main>
      </div>
    </>
  );
}
