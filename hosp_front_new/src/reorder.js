import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

export default function MedicinesReorder() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const pharmName = location.state?.name || localStorage.getItem("pharmacist_name") || "Pharmacist";
  const pharmINI  = pharmName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const [reorderList, setReorderList] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState(null);
  const [sentIds,     setSentIds]     = useState(new Set());
  const [sending,     setSending]     = useState(null); // id of row being processed

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/medicines/reorder`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setReorderList(Array.isArray(data) ? data : []);
      } catch { setError("Failed to fetch reorder medicines."); }
      setLoading(false);
    })();
  }, []);

  const handleSendOne = async (med) => {
    setSending(med.name);
    await new Promise((r) => setTimeout(r, 600)); // slight delay for UX
    setSentIds((prev) => new Set([...prev, med.name]));
    setSending(null);
    setToast({ message: `Order sent to supplier for: ${med.name}`, type: "success" });
  };

  const handleSendAll = async () => {
    const unsent = reorderList.filter((m) => !sentIds.has(m.name));
    if (unsent.length === 0) { setToast({ message: "All orders already sent!", type: "success" }); return; }
    setSending("__all__");
    await new Promise((r) => setTimeout(r, 800));
    setSentIds(new Set(reorderList.map((m) => m.name)));
    setSending(null);
    const names = unsent.map((m) => m.name).join(", ");
    setToast({ message: `Orders sent for: ${names}`, type: "success" });
  };

  const unsentCount = reorderList.filter((m) => !sentIds.has(m.name)).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ro-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .ro-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .ro-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #5B21B6;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .ro-main { max-width: 820px; margin: 0 auto; padding: 32px 28px 60px; }

        .ro-topbar { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .ro-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.15s; flex-shrink: 0;
        }
        .ro-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        /* Alert banner */
        .ro-alert {
          background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 12px;
          padding: 14px 18px; display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
        }
        .ro-alert-icon { flex-shrink: 0; }
        .ro-alert-text { font-size: 14px; color: #92400E; font-weight: 500; flex: 1; }
        .ro-send-all {
          flex-shrink: 0; padding: 8px 20px; background: #7C3AED; color: #fff;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .ro-send-all:hover    { background: #6D28D9; }
        .ro-send-all:disabled { opacity: 0.6; cursor: not-allowed; }

        .ro-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 12px;
        }

        /* List card */
        .ro-list-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; }
        .ro-list-head { display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 160px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
        .ro-th { padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94A3B8; }

        .ro-row { display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 160px; align-items: center; border-bottom: 1px solid #F1F5F9; }
        .ro-row:last-child { border-bottom: none; }
        .ro-row.sent  { background: #F8FAFC; opacity: 0.7; }
        .ro-td { padding: 13px 16px; font-size: 14px; color: #334155; }
        .ro-med-name { font-weight: 600; color: #0F172A; }

        .ro-stock-val { font-weight: 700; color: #DC2626; }
        .ro-reorder-val { color: #64748B; }

        .ro-btn-send {
          padding: 6px 16px; background: #F5F3FF; color: #7C3AED;
          border: 1.5px solid #DDD6FE; border-radius: 8px; font-size: 12px;
          font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; display: inline-flex; align-items: center; gap: 5px;
          white-space: nowrap;
        }
        .ro-btn-send:hover    { background: #EDE9FE; }
        .ro-btn-send:disabled { opacity: 0.6; cursor: not-allowed; }
        .ro-btn-sent {
          padding: 6px 16px; background: #F0FDF4; color: #16A34A;
          border: 1.5px solid #BBF7D0; border-radius: 8px; font-size: 12px;
          font-weight: 600; font-family: 'DM Sans', sans-serif;
          display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
        }

        /* Empty */
        .ro-empty { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; gap: 10px; text-align: center; }
        .ro-empty-icon { width: 54px; height: 54px; border-radius: 50%; background: #F0FDF4; display: flex; align-items: center; justify-content: center; }
        .ro-empty-title { font-size: 15px; font-weight: 600; color: #334155; }
        .ro-empty-sub   { font-size: 13px; color: #94A3B8; }

        .ro-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 14px 16px; color: #DC2626; font-size: 14px; margin-bottom: 20px; }

        @media (max-width: 640px) {
          .ro-header    { padding: 12px 16px; }
          .ro-main      { padding: 20px 14px 48px; }
          .ro-list-head { grid-template-columns: 2fr 1fr 140px; }
          .ro-list-head .ro-th:nth-child(3),
          .ro-list-head .ro-th:nth-child(4) { display: none; }
          .ro-row       { grid-template-columns: 2fr 1fr 140px; }
          .ro-row .ro-td:nth-child(3),
          .ro-row .ro-td:nth-child(4) { display: none; }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="ro-body">
        <header className="ro-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="ro-avatar">{pharmINI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{pharmName}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Reorder Medicines</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        <main className="ro-main">
          <div className="ro-topbar">
            <button className="ro-back-btn"
              onClick={() => navigate("/pharmacist/home", { state: { name: pharmName } })}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back
            </button>
          </div>

          {error && <div className="ro-error">{error}</div>}

          {!loading && reorderList.length > 0 && unsentCount > 0 && (
            <div className="ro-alert">
              <span className="ro-alert-icon">
                <svg width="20" height="20" fill="none" stroke="#B45309" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
              <span className="ro-alert-text">
                {unsentCount} medicine{unsentCount !== 1 ? "s are" : " is"} below reorder level and need restocking.
              </span>
              <button className="ro-send-all" onClick={handleSendAll} disabled={sending === "__all__"}>
                {sending === "__all__" ? "Sending…" : `Send All (${unsentCount})`}
              </button>
            </div>
          )}

          <p className="ro-section-title">
            {loading ? "Loading…" : `${reorderList.length} medicine${reorderList.length !== 1 ? "s" : ""} need reordering`}
          </p>

          <div className="ro-list-card">
            <div className="ro-list-head">
              <div className="ro-th">Medicine Name</div>
              <div className="ro-th">Current Stock</div>
              <div className="ro-th">Reorder Level</div>
              <div className="ro-th">Reorder Qty</div>
              <div className="ro-th">Action</div>
            </div>

            {loading ? (
              <div className="ro-empty"><div style={{ fontSize: 13, color: "#94A3B8" }}>Loading…</div></div>
            ) : reorderList.length === 0 ? (
              <div className="ro-empty">
                <div className="ro-empty-icon">
                  <svg width="22" height="22" fill="none" stroke="#4ADE80" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="ro-empty-title">All medicines sufficiently stocked</div>
                <div className="ro-empty-sub">No reorder needed at this time.</div>
              </div>
            ) : (
              reorderList.map((med) => {
                const isSent    = sentIds.has(med.name);
                const isSending = sending === med.name;
                return (
                  <div key={med.name} className={`ro-row${isSent ? " sent" : ""}`}>
                    <div className="ro-td"><span className="ro-med-name">{med.name}</span></div>
                    <div className="ro-td"><span className="ro-stock-val">{med.stock_quantity}</span></div>
                    <div className="ro-td"><span className="ro-reorder-val">{med.reorder_level}</span></div>
                    <div className="ro-td" style={{ fontWeight: 600, color: "#7C3AED" }}>
                      {med.reorder_quantity}
                    </div>
                    <div className="ro-td">
                      {isSent ? (
                        <span className="ro-btn-sent">
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Order Sent
                        </span>
                      ) : (
                        <button className="ro-btn-send" onClick={() => handleSendOne(med)} disabled={!!sending}>
                          {isSending ? "Sending…" : (
                            <>
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                              </svg>
                              Send Order
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </>
  );
}
