import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function AssignMedicine() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const pharmName = location.state?.name || localStorage.getItem("pharmacist_name") || "Pharmacist";
  const pharmINI  = getInitials(pharmName);

  const [patients,  setPatients]  = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [form,      setForm]      = useState({ patient_id: "", medicine_id: "", quantity: "", date_given: "" });
  const [toast,     setToast]     = useState(null);
  const [busy,      setBusy]      = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch(`${API_URL}/patients`),
          fetch(`${API_URL}/medicines/stock`),
        ]);
        const pData = await pRes.json();
        const mData = await mRes.json();
        setPatients(Array.isArray(pData.patients) ? pData.patients : []);
        setMedicines(Array.isArray(mData) ? mData : []);
      } catch { /* silently fail */ }
    })();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectedMed = medicines.find((m) => m.id === parseInt(form.medicine_id));
  const stockLeft   = selectedMed?.stock_quantity ?? null;
  const isOverStock = stockLeft !== null && parseInt(form.quantity) > stockLeft;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOverStock) {
      setToast({ message: `Quantity exceeds available stock (${stockLeft})`, type: "error" });
      return;
    }
    setBusy(true);
    try {
      const res  = await fetch(`${API_URL}/patient_medicines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message || "Medicine assigned successfully!", type: "success" });
        setForm({ patient_id: "", medicine_id: "", quantity: "", date_given: "" });
        const mRes  = await fetch(`${API_URL}/medicines/stock`);
        const mData = await mRes.json();
        setMedicines(Array.isArray(mData) ? mData : []);
      } else {
        setToast({ message: data.error || "Error assigning medicine", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to assign medicine. Please try again.", type: "error" });
    }
    setBusy(false);
  };

  const stockColor = stockLeft === null
    ? "#94A3B8"
    : stockLeft === 0
      ? "#DC2626"
      : stockLeft <= (selectedMed?.reorder_level ?? 0)
        ? "#B45309"
        : "#16A34A";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .am-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .am-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .am-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #5B21B6;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .am-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.15s;
        }
        .am-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .am-main { max-width: 560px; margin: 0 auto; padding: 32px 24px 60px; }

        .am-page-title { font-size: 22px; font-weight: 700; color: #0F172A; margin-bottom: 6px; }
        .am-page-sub   { font-size: 14px; color: #64748B; margin-bottom: 28px; }

        .am-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 28px; }
        .am-section-label {
          font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
          color: #94A3B8; margin-bottom: 14px;
        }

        .am-field { margin-bottom: 16px; }
        .am-label {
          display: block; font-size: 12px; font-weight: 600; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;
        }
        .am-select, .am-input {
          width: 100%; padding: 10px 12px; border: 1px solid #E2E8F0; border-radius: 8px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: #334155;
          outline: none; background: #fff; transition: border-color 0.15s;
        }
        .am-select:focus, .am-input:focus { border-color: #A78BFA; }
        .am-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; padding-right: 34px;
          position: relative; z-index: 999;
        }
        .am-input.error { border-color: #FECACA; }

        .am-stock-pill {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 7px; padding: 4px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 600; border: 1px solid currentColor;
        }

        .am-quantity-wrap { position: relative; }
        .am-qty-hint {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          font-size: 12px; font-weight: 500; pointer-events: none;
        }

        .am-divider { height: 1px; background: #F1F5F9; margin: 20px 0; }

        .am-submit {
          width: 100%; padding: 12px; background: #7C3AED; color: #fff;
          border: none; border-radius: 9px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .am-submit:hover    { background: #6D28D9; }
        .am-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        @media (max-width: 600px) {
          .am-header { padding: 12px 16px; }
          .am-main   { padding: 20px 14px 48px; }
          .am-card   { padding: 20px 18px; }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="am-body">
        <header className="am-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="am-avatar">{pharmINI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{pharmName}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Assign Medicine</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        <main className="am-main">
          <button className="am-back-btn" style={{ marginBottom: 20 }}
            onClick={() => navigate("/pharmacist/home", { state: { name: pharmName } })}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Home
          </button>

          <div className="am-page-title">Assign Medicine to Patient</div>
          <div className="am-page-sub">Dispense medication and update inventory in real time.</div>

          <div className="am-card">
            <form onSubmit={handleSubmit}>
              <p className="am-section-label">Patient &amp; Medication</p>

              <div className="am-field">
                <label className="am-label">Patient</label>
                <select className="am-select" name="patient_id"
                  value={form.patient_id} onChange={handleChange} required>
                  <option value="" disabled>Select a patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="am-field">
                <label className="am-label">Medicine</label>
                <select className="am-select" name="medicine_id"
                  value={form.medicine_id} onChange={handleChange} required>
                  <option value="" disabled>Select a medicine...</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.stock_quantity === 0}>
                      {m.name}{m.stock_quantity === 0 ? " — Out of stock" : ""}
                    </option>
                  ))}
                </select>
                {selectedMed && (
                  <span className="am-stock-pill"
                    style={{ color: stockColor, borderColor: stockColor, background: stockColor + "18" }}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                    </svg>
                    {stockLeft} units in stock
                  </span>
                )}
              </div>

              <div className="am-field">
                <label className="am-label">Quantity</label>
                <div className="am-quantity-wrap">
                  <input
                    className={`am-input${isOverStock ? " error" : ""}`}
                    type="number" name="quantity"
                    placeholder="e.g. 2"
                    value={form.quantity} onChange={handleChange}
                    min="1"
                    max={stockLeft ?? undefined}
                    required
                  />
                  {stockLeft !== null && (
                    <span className="am-qty-hint"
                      style={{ color: isOverStock ? "#DC2626" : "#94A3B8" }}>
                      max {stockLeft}
                    </span>
                  )}
                </div>
                {isOverStock && (
                  <p style={{ fontSize: 12, color: "#DC2626", marginTop: 5 }}>
                    Exceeds available stock of {stockLeft} units.
                  </p>
                )}
              </div>

              <div className="am-divider" />

              <div className="am-field" style={{ marginBottom: 20 }}>
                <label className="am-label">Date Given</label>
                <input className="am-input" type="date" name="date_given"
                  value={form.date_given} onChange={handleChange} required />
              </div>

              <button className="am-submit" type="submit" disabled={busy || isOverStock}>
                {busy ? "Assigning…" : "Assign Medicine"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
