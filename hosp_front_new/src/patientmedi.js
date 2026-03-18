import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function PatientMedicineTrack() {
  const navigate     = useNavigate();
  const { state }    = useLocation();
  const patientName  = state?.name      || "Patient";
  const patientId    = state?.patientId;

  const [medicines, setMedicines] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const INI = getInitials(patientName);

  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/patient_medicines/${patientId}`);
        const data = await res.json();
        setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
      } catch {
        setError("Could not load medicine history. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pmt-body {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #F8FAFC;
          color: #1E293B;
        }

        /* ── Header ── */
        .pmt-header {
          background: #fff; border-bottom: 1px solid #E2E8F0;
          padding: 14px 40px; display: flex; align-items: center;
          justify-content: space-between; position: sticky; top: 0; z-index: 10;
        }
        .pmt-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #185FA5;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .pmt-role-badge {
          display: inline-flex; align-items: center;
          background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8;
          font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 20px;
        }

        /* ── Main ── */
        .pmt-main { max-width: 700px; margin: 0 auto; padding: 32px 28px 60px; }

        .pmt-topbar {
          display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
        }
        .pmt-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .pmt-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .pmt-page-title {
          font-family: 'DM Serif Display', serif;
          font-size: 24px; font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .pmt-page-sub { font-size: 14px; color: #64748B; margin-bottom: 24px; }

        /* ── Table card ── */
        .pmt-card {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
          overflow: hidden;
        }
        .pmt-thead {
          display: grid; grid-template-columns: 2fr 1fr 1fr;
          background: #F8FAFC; border-bottom: 1px solid #E2E8F0;
        }
        .pmt-th {
          padding: 11px 18px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em; color: #94A3B8;
        }
        .pmt-row {
          display: grid; grid-template-columns: 2fr 1fr 1fr;
          border-bottom: 1px solid #F1F5F9; transition: background 0.1s;
        }
        .pmt-row:last-child { border-bottom: none; }
        .pmt-row:hover { background: #FAFBFC; }
        .pmt-td {
          padding: 14px 18px; font-size: 14px; color: #334155;
          display: flex; align-items: center;
        }
        .pmt-med-name { font-weight: 600; color: #0F172A; }
        .pmt-qty-chip {
          display: inline-flex; align-items: center;
          background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D;
          font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
        }

        /* ── Empty / error / loading states ── */
        .pmt-state {
          display: flex; flex-direction: column; align-items: center;
          padding: 56px 24px; gap: 10px; text-align: center;
        }
        .pmt-state-icon {
          width: 52px; height: 52px; border-radius: 50%; background: #EFF6FF;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .pmt-state-title { font-size: 15px; font-weight: 600; color: #334155; }
        .pmt-state-sub   { font-size: 13px; color: #94A3B8; max-width: 260px; line-height: 1.55; }

        @media (max-width: 600px) {
          .pmt-header { padding: 12px 16px; }
          .pmt-main   { padding: 20px 14px 48px; }
          .pmt-thead  { grid-template-columns: 2fr 1fr; }
          .pmt-row    { grid-template-columns: 2fr 1fr; }
          .pmt-td:last-child, .pmt-th:last-child { display: none; }
        }
      `}</style>

      <div className="pmt-body">

        {/* ── Header ── */}
        <header className="pmt-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="pmt-avatar">{INI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{patientName}</div>
              <span className="pmt-role-badge">Patient Portal</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </div>
        </header>

        <main className="pmt-main">

          {/* Top bar */}
          <div className="pmt-topbar">
            <button className="pmt-back-btn"
              onClick={() => navigate("/home/patient", { state: { name: patientName, patientId } })}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Home
            </button>
          </div>

          <div className="pmt-page-title">My Medicines</div>
          <div className="pmt-page-sub">Medicines dispensed to you by the pharmacy.</div>

          <div className="pmt-card">

            {loading ? (
              <div className="pmt-state">
                <div className="pmt-state-title" style={{ color: "#94A3B8" }}>Loading…</div>
              </div>

            ) : error ? (
              <div className="pmt-state">
                <div className="pmt-state-icon">
                  <svg width="22" height="22" fill="none" stroke="#EF4444" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div className="pmt-state-title">{error}</div>
              </div>

            ) : medicines.length === 0 ? (
              <div className="pmt-state">
                <div className="pmt-state-icon">
                  <svg width="22" height="22" fill="none" stroke="#93C5FD" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                  </svg>
                </div>
                <div className="pmt-state-title">No medicines assigned yet</div>
                <div className="pmt-state-sub">
                  Medicines dispensed by the pharmacy will appear here.
                </div>
              </div>

            ) : (
              <>
                <div className="pmt-thead">
                  <div className="pmt-th">Medicine</div>
                  <div className="pmt-th">Quantity</div>
                  <div className="pmt-th">Date Given</div>
                </div>
                {medicines.map((m) => (
                  <div key={m.id} className="pmt-row">
                    <div className="pmt-td">
                      <span className="pmt-med-name">{m.medicine_name}</span>
                    </div>
                    <div className="pmt-td">
                      <span className="pmt-qty-chip">{m.quantity} units</span>
                    </div>
                    <div className="pmt-td">{formatDate(m.date_given)}</div>
                  </div>
                ))}
              </>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
