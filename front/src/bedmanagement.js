import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

function getInitials(name) {
  if (!name) return "R";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const STATUS = {
  Available:   { bg: "#F0FDF4", border: "#BBF7D0", text: "#16A34A", dot: "#22C55E" },
  Occupied:    { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626", dot: "#EF4444" },
  Maintenance: { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309", dot: "#F59E0B" },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.Available;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

export default function BedManagement() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const recepName = location.state?.name || localStorage.getItem("reception_name") || "Receptionist";
  const INI = getInitials(recepName);

  const [beds,      setBeds]      = useState([]);
  const [patients,  setPatients]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);

  /* modal state */
  const [assignModal, setAssignModal] = useState(null); /* bed object */
  const [releaseModal, setReleaseModal] = useState(null); /* bed object */
  const [selectedPat, setSelectedPat] = useState("");
  const [saving,      setSaving]      = useState(false);

  /* ── data fetching ── */
  const fetchBeds = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/beds`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBeds(Array.isArray(data) ? data : []);
    } catch { setBeds([]); }
  }, []);

  const fetchUnassigned = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/patients_unassigned`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPatients(Array.isArray(data.patients) ? data.patients : []);
    } catch { setPatients([]); }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchBeds(), fetchUnassigned()]);
      setLoading(false);
    })();
  }, [fetchBeds, fetchUnassigned]);

  /* Normalize any casing the DB might use → always title-case for comparisons */
  const normStatus = (s) => {
    if (!s) return "Available";
    const lower = s.toLowerCase();
    if (lower === "occupied")    return "Occupied";
    if (lower === "maintenance") return "Maintenance";
    return "Available";
  };

  /* ── stats ── */
  const total       = beds.length;
  const available   = beds.filter((b) => normStatus(b.status) === "Available").length;
  const occupied    = beds.filter((b) => normStatus(b.status) === "Occupied").length;
  const maintenance = beds.filter((b) => normStatus(b.status) === "Maintenance").length;

  /* ── assign ── */
  const openAssign = (bed) => {
    setSelectedPat("");
    setAssignModal(bed);
  };

  const handleAssign = async () => {
    if (!selectedPat) { setToast({ message: "Please select a patient", type: "error" }); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/beds/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bed_id: assignModal.id, patient_id: parseInt(selectedPat) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign bed");
      setToast({ message: data.message || "Bed assigned successfully", type: "success" });
      setAssignModal(null);
      await Promise.all([fetchBeds(), fetchUnassigned()]);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
    setSaving(false);
  };

  /* ── release ── */
  const handleRelease = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/beds/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bed_id: releaseModal.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to release bed");
      setToast({ message: data.message || "Bed released successfully", type: "success" });
      setReleaseModal(null);
      await Promise.all([fetchBeds(), fetchUnassigned()]);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
    setSaving(false);
  };

  const bedLabel = (bed) =>
    bed.bed_number ? bed.bed_number : `B-${String(bed.id).padStart(2, "0")}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bm-body {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #F8FAFC;
          color: #1E293B;
        }

        /* ── Header ── */
        .bm-header {
          background: #fff;
          border-bottom: 1px solid #E2E8F0;
          padding: 14px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .bm-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: #854F0B; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .bm-badge {
          background: #FEF3C7; color: #B45309;
          font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid #FDE68A;
        }

        /* ── Main ── */
        .bm-main { max-width: 1100px; margin: 0 auto; padding: 32px 28px 72px; }

        .bm-topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
        .bm-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: 1.5px solid #E2E8F0; border-radius: 8px;
          padding: 7px 16px; font-size: 13px; font-weight: 600; color: #64748B;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, color 0.15s;
        }
        .bm-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .bm-page-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .bm-page-sub { font-size: 14px; color: #64748B; margin-bottom: 28px; }

        /* ── Stats bar ── */
        .bm-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 32px;
        }
        .bm-stat {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .bm-stat-icon {
          width: 42px; height: 42px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .bm-stat-num {
          font-size: 28px; font-weight: 700; color: #0F172A; line-height: 1;
        }
        .bm-stat-label { font-size: 12px; color: #64748B; margin-top: 2px; }

        /* ── Section title ── */
        .bm-section-title {
          font-size: 12px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #94A3B8; margin-bottom: 16px;
        }

        /* ── Bed grid ── */
        .bm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
        }

        .bm-bed-card {
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          padding: 18px 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .bm-bed-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); border-color: #CBD5E1; }
        .bm-bed-card.occupied  { border-color: #FECACA; }
        .bm-bed-card.available { border-color: #BBF7D0; }
        .bm-bed-card.maintenance { border-color: #FDE68A; }

        .bm-bed-top { display: flex; align-items: center; justify-content: space-between; }
        .bm-bed-num {
          font-size: 16px; font-weight: 700; color: #0F172A;
          font-family: 'DM Serif Display', serif;
        }
        .bm-bed-patient {
          font-size: 13px; font-weight: 500; color: #334155;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          min-height: 20px;
        }
        .bm-bed-patient.empty { color: #94A3B8; font-style: italic; }

        /* ── Bed action buttons ── */
        .bm-btn-assign {
          width: 100%;
          padding: 7px 0;
          background: #F0FDF4;
          color: #16A34A;
          border: 1.5px solid #BBF7D0;
          border-radius: 8px;
          font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .bm-btn-assign:hover { background: #DCFCE7; }

        .bm-btn-release {
          width: 100%;
          padding: 7px 0;
          background: #FEF2F2;
          color: #DC2626;
          border: 1.5px solid #FECACA;
          border-radius: 8px;
          font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .bm-btn-release:hover { background: #FEE2E2; }

        .bm-btn-maint {
          width: 100%;
          padding: 7px 0;
          background: #FFFBEB;
          color: #92400E;
          border: 1.5px solid #FDE68A;
          border-radius: 8px;
          font-size: 12px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: default;
        }

        /* ── Empty / loading ── */
        .bm-empty {
          display: flex; flex-direction: column;
          align-items: center; padding: 72px 24px;
          gap: 10px; text-align: center;
        }
        .bm-empty-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: #FEF3C7;
          display: flex; align-items: center; justify-content: center;
        }
        .bm-empty-title { font-size: 15px; font-weight: 600; color: #334155; }
        .bm-empty-sub   { font-size: 13px; color: #94A3B8; }

        /* ── Modal overlay ── */
        .bm-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 50; padding: 16px;
          animation: bm-fade-in 0.15s ease;
        }
        @keyframes bm-fade-in { from { opacity: 0 } to { opacity: 1 } }

        .bm-modal {
          background: #fff;
          border-radius: 16px;
          padding: 28px 28px 24px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          animation: bm-slide-up 0.18s ease;
        }
        @keyframes bm-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bm-modal-title {
          font-size: 17px; font-weight: 700; color: #0F172A; margin-bottom: 6px;
        }
        .bm-modal-sub {
          font-size: 13px; color: #64748B; margin-bottom: 20px;
        }

        .bm-modal-label {
          display: block; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: #64748B; margin-bottom: 6px;
        }
        .bm-modal-select {
          width: 100%; padding: 10px 12px;
          border: 1px solid #E2E8F0; border-radius: 8px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #334155; outline: none; background: #fff;
          transition: border-color 0.15s; margin-bottom: 20px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 34px;
          position: relative; z-index: 999;
        }
        .bm-modal-select:focus { border-color: #FCD34D; }

        .bm-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

        .bm-modal-cancel {
          padding: 9px 20px; background: #fff; color: #64748B;
          border: 1.5px solid #E2E8F0; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s;
        }
        .bm-modal-cancel:hover { border-color: #CBD5E1; }

        .bm-modal-confirm-green {
          padding: 9px 20px; background: #16A34A; color: #fff;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .bm-modal-confirm-green:hover    { background: #15803D; }
        .bm-modal-confirm-green:disabled { opacity: 0.6; cursor: not-allowed; }

        .bm-modal-confirm-red {
          padding: 9px 20px; background: #DC2626; color: #fff;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .bm-modal-confirm-red:hover    { background: #B91C1C; }
        .bm-modal-confirm-red:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Release warning box ── */
        .bm-release-info {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: #7F1D1D;
          margin-bottom: 20px;
          line-height: 1.55;
        }

        /* ── Loading skeleton placeholder ── */
        .bm-loading {
          display: flex; align-items: center; justify-content: center;
          min-height: 300px; font-size: 14px; color: #94A3B8;
        }

        @media (max-width: 900px) {
          .bm-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .bm-header { padding: 12px 16px; }
          .bm-main   { padding: 20px 14px 56px; }
          .bm-stats  { grid-template-columns: repeat(2, 1fr); }
          .bm-grid   { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 400px) {
          .bm-stats { grid-template-columns: 1fr; }
          .bm-grid  { grid-template-columns: 1fr; }
        }
      `}</style>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      {/* ── Assign Modal ── */}
      {assignModal && (
        <div className="bm-overlay" onClick={() => !saving && setAssignModal(null)}>
          <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bm-modal-title">Assign Patient to {bedLabel(assignModal)}</div>
            <div className="bm-modal-sub">
              Select the patient you want to check into this bed.
            </div>

            <label className="bm-modal-label">Patient</label>
            {patients.length === 0 ? (
              <p style={{ fontSize: 13, color: "#DC2626", marginBottom: 20 }}>
                No unassigned patients available.
              </p>
            ) : (
              <select
                className="bm-modal-select"
                value={selectedPat}
                onChange={(e) => setSelectedPat(e.target.value)}
              >
                <option value="" disabled>Select a patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}

            <div className="bm-modal-actions">
              <button className="bm-modal-cancel" onClick={() => setAssignModal(null)} disabled={saving}>
                Cancel
              </button>
              <button
                className="bm-modal-confirm-green"
                onClick={handleAssign}
                disabled={saving || patients.length === 0}
              >
                {saving ? "Assigning…" : "Assign Bed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Release Modal ── */}
      {releaseModal && (
        <div className="bm-overlay" onClick={() => !saving && setReleaseModal(null)}>
          <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bm-modal-title">Release {bedLabel(releaseModal)}?</div>
            <div className="bm-modal-sub">
              This will discharge the current patient and mark the bed as available.
            </div>
            <div className="bm-release-info">
              <strong>{releaseModal.patient_name}</strong> will be unlinked from this bed.
              Their patient record will remain intact.
            </div>
            <div className="bm-modal-actions">
              <button className="bm-modal-cancel" onClick={() => setReleaseModal(null)} disabled={saving}>
                Cancel
              </button>
              <button
                className="bm-modal-confirm-red"
                onClick={handleRelease}
                disabled={saving}
              >
                {saving ? "Releasing…" : "Release Bed"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bm-body">
        {/* ── Header ── */}
        <header className="bm-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="bm-avatar">{INI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{recepName}</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Front Desk</div>
            </div>
            <span className="bm-badge">● Receptionist</span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </div>
        </header>

        {/* ── Main ── */}
        <main className="bm-main">

          {/* Top bar */}
          <div className="bm-topbar">
            <button
              className="bm-back-btn"
              onClick={() => navigate("/home/reception", { state: { name: recepName } })}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Home
            </button>
          </div>

          <h1 className="bm-page-title">Bed Management</h1>
          <p className="bm-page-sub">Monitor bed availability and manage patient admissions in real time.</p>

          {/* ── Stats bar ── */}
          <div className="bm-stats">
            {[
              {
                label: "Total Beds", value: total,
                iconBg: "#F1F5F9", iconColor: "#64748B",
                icon: (
                  <svg width="20" height="20" fill="none" stroke="#64748B" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/>
                    <path d="M2 17h20"/><path d="M6 8v9"/>
                  </svg>
                ),
              },
              {
                label: "Available", value: available,
                iconBg: "#F0FDF4", iconColor: "#16A34A",
                icon: (
                  <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ),
              },
              {
                label: "Occupied", value: occupied,
                iconBg: "#FEF2F2", iconColor: "#DC2626",
                icon: (
                  <svg width="20" height="20" fill="none" stroke="#DC2626" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                ),
              },
              {
                label: "Maintenance", value: maintenance,
                iconBg: "#FFFBEB", iconColor: "#B45309",
                icon: (
                  <svg width="20" height="20" fill="none" stroke="#B45309" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                ),
              },
            ].map(({ label, value, iconBg, icon }) => (
              <div key={label} className="bm-stat">
                <div className="bm-stat-icon" style={{ background: iconBg }}>{icon}</div>
                <div>
                  <div className="bm-stat-num">{loading ? "—" : value}</div>
                  <div className="bm-stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Bed grid ── */}
          <p className="bm-section-title">
            {loading
              ? "Loading beds…"
              : `${total} bed${total !== 1 ? "s" : ""} · ${available} available`}
          </p>

          {loading ? (
            <div className="bm-loading">Loading bed data…</div>
          ) : beds.length === 0 ? (
            <div className="bm-empty">
              <div className="bm-empty-icon">
                <svg width="24" height="24" fill="none" stroke="#B45309" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/>
                  <path d="M2 17h20"/><path d="M6 8v9"/>
                </svg>
              </div>
              <div className="bm-empty-title">No beds found</div>
              <div className="bm-empty-sub">
                Add beds to the database to start managing them here.
              </div>
            </div>
          ) : (
            <div className="bm-grid">
              {beds.map((bed) => {
                const statusKey = normStatus(bed.status);
                const s = STATUS[statusKey] || STATUS.Available;
                return (
                  <div
                    key={bed.id}
                    className={`bm-bed-card ${statusKey.toLowerCase()}`}
                  >
                    {/* Top row: bed number + status */}
                    <div className="bm-bed-top">
                      <span className="bm-bed-num">{bedLabel(bed)}</span>
                      <StatusBadge status={statusKey} />
                    </div>

                    {/* Patient name */}
                    <div className={`bm-bed-patient${bed.patient_name ? "" : " empty"}`}>
                      {bed.patient_name || (statusKey === "Occupied" ? "Unknown patient" : "—")}
                    </div>

                    {/* Action button */}
                    {statusKey === "Available" && (
                      <button className="bm-btn-assign" onClick={() => openAssign(bed)}>
                        + Assign Patient
                      </button>
                    )}
                    {statusKey === "Occupied" && (
                      <button className="bm-btn-release" onClick={() => setReleaseModal(bed)}>
                        Release Bed
                      </button>
                    )}
                    {statusKey === "Maintenance" && (
                      <button className="bm-btn-maint" disabled>
                        Under Maintenance
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
