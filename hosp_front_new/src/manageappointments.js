import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(t) {
  if (!t) return "—";
  try {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
  } catch { return t; }
}

const EMPTY_FORM = { id: null, patient_id: "", date: "", time: "", status: "Scheduled" };

const STATUS_STYLE = {
  Scheduled: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  Completed: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  Cancelled: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
};

export default function ManageAppointments() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const recepName = location.state?.name || localStorage.getItem("reception_name") || "Receptionist";

  const [doctors,      setDoctors]      = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [selectedDoc,  setSelectedDoc]  = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [confirmId,    setConfirmId]    = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [showForm,     setShowForm]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [dRes, pRes] = await Promise.all([
          fetch(`${API_URL}/doctors`),
          fetch(`${API_URL}/patients`),
        ]);
        const dData = await dRes.json();
        const pData = await pRes.json();
        setDoctors(Array.isArray(dData.doctors) ? dData.doctors : []);
        setPatients(Array.isArray(pData.patients) ? pData.patients : []);
      } catch { /* silently fail */ }
    })();
  }, []);

  const selectDoctor = async (doc) => {
    setSelectedDoc(doc);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setConfirmId(null);
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/appointments/${doc.id}`);
      const data = await res.json();
      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    } catch { setAppointments([]); }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedDoc) { setToast({ message: "Select a doctor first", type: "error" }); return; }
    if (!form.patient_id || !form.date || !form.time) {
      setToast({ message: "Please fill in all fields", type: "error" }); return;
    }
    setSaving(true);
    try {
      const url    = form.id ? `${API_URL}/appointments/${form.id}` : `${API_URL}/appointments`;
      const method = form.id ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, doctor_id: selectedDoc.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setToast({ message: data.message || (form.id ? "Appointment updated" : "Appointment added"), type: "success" });
      setForm(EMPTY_FORM);
      setShowForm(false);
      selectDoctor(selectedDoc);
    } catch { setToast({ message: "Failed to save appointment", type: "error" }); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      const res  = await fetch(`${API_URL}/appointments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setToast({ message: data.message || "Appointment deleted", type: "success" });
      setConfirmId(null);
      selectDoctor(selectedDoc);
    } catch { setToast({ message: "Failed to delete appointment", type: "error" }); }
  };

  const openEdit = (appt) => {
    setForm({ id: appt.id, patient_id: appt.patient_id || "", date: appt.date, time: appt.time, status: appt.status });
    setShowForm(true);
    setConfirmId(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ma-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .ma-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .ma-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #854F0B;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .ma-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.15s;
        }
        .ma-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .ma-main { max-width: 1100px; margin: 0 auto; padding: 28px 28px 60px; }

        .ma-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .ma-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 12px;
        }

        /* Two-panel layout */
        .ma-layout { display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start; }

        /* Doctor list */
        .ma-doc-list { display: flex; flex-direction: column; gap: 8px; }
        .ma-doc-card {
          background: #fff; border: 1.5px solid #E2E8F0; border-radius: 12px;
          padding: 14px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px;
          transition: border-color 0.15s, background 0.15s;
        }
        .ma-doc-card:hover { border-color: #FDE68A; background: #FFFBEB; }
        .ma-doc-card.selected { border-color: #F59E0B; background: #FFFBEB; }
        .ma-doc-avatar {
          width: 38px; height: 38px; border-radius: 50%; background: #FEF3C7;
          color: #B45309; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px; flex-shrink: 0;
        }
        .ma-doc-card.selected .ma-doc-avatar { background: #FDE68A; color: #92400E; }
        .ma-doc-name { font-weight: 600; font-size: 14px; color: #0F172A; }
        .ma-doc-spec { font-size: 11px; color: #94A3B8; margin-top: 1px; }

        /* Right panel */
        .ma-panel { min-height: 400px; }

        .ma-panel-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
        }
        .ma-panel-title { font-size: 16px; font-weight: 700; color: #0F172A; }
        .ma-btn-add {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; background: #F59E0B; color: #fff;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .ma-btn-add:hover { background: #D97706; }

        /* Appointment card */
        .ma-appt-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .ma-appt-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; }
        .ma-appt-row {
          display: flex; align-items: center; padding: 14px 18px; gap: 14px;
        }
        .ma-pat-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: #F1F5F9;
          color: #64748B; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 12px; flex-shrink: 0;
        }
        .ma-appt-patient { font-weight: 600; font-size: 14px; color: #0F172A; }
        .ma-appt-meta    { font-size: 12px; color: #64748B; margin-top: 2px; }
        .ma-status-chip {
          margin-left: auto; padding: 3px 12px; border-radius: 20px;
          font-size: 11px; font-weight: 600; border: 1px solid transparent;
          flex-shrink: 0;
        }
        .ma-appt-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .ma-btn-edit-sm {
          padding: 4px 12px; background: #EFF6FF; color: #1D4ED8;
          border: 1px solid #BFDBFE; border-radius: 6px; font-size: 12px;
          font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
        }
        .ma-btn-del-sm {
          padding: 4px 12px; background: #FEF2F2; color: #DC2626;
          border: 1px solid #FECACA; border-radius: 6px; font-size: 12px;
          font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
        }

        /* Confirm bar */
        .ma-confirm {
          padding: 10px 18px; background: #FEF2F2; border-top: 1px solid #FECACA;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ma-confirm-text { font-size: 13px; color: #DC2626; font-weight: 500; }
        .ma-confirm-btns { display: flex; gap: 8px; }
        .ma-confirm-yes { padding: 5px 14px; background: #DC2626; color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ma-confirm-no  { padding: 5px 14px; background: #fff; color: #64748B; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

        /* Form card */
        .ma-form-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 22px 24px; }
        .ma-form-title { font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 16px; }
        .ma-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ma-field { display: flex; flex-direction: column; gap: 5px; }
        .ma-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; }
        .ma-input, .ma-select {
          padding: 9px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: #334155;
          outline: none; background: #fff; transition: border-color 0.15s; width: 100%;
        }
        .ma-input:focus, .ma-select:focus { border-color: #FCD34D; }
        .ma-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 34px; position: relative; z-index: 999; }
        .ma-form-actions { display: flex; gap: 8px; margin-top: 16px; }
        .ma-btn-save {
          padding: 9px 22px; background: #F59E0B; color: #fff; border: none;
          border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .ma-btn-save:hover { background: #D97706; }
        .ma-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .ma-btn-cancel-form {
          padding: 9px 22px; background: #fff; color: #64748B; border: 1.5px solid #E2E8F0;
          border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
        }

        /* Empty / placeholder */
        .ma-placeholder { background: #fff; border: 1.5px dashed #E2E8F0; border-radius: 14px; display: flex; flex-direction: column; align-items: center; padding: 60px 24px; gap: 10px; text-align: center; }
        .ma-placeholder-icon { width: 56px; height: 56px; border-radius: 50%; background: #FEF3C7; display: flex; align-items: center; justify-content: center; }
        .ma-placeholder-title { font-size: 15px; font-weight: 600; color: #334155; }
        .ma-placeholder-sub   { font-size: 13px; color: #94A3B8; }

        @media (max-width: 740px) {
          .ma-header  { padding: 12px 16px; }
          .ma-main    { padding: 20px 14px 48px; }
          .ma-layout  { grid-template-columns: 1fr; }
          .ma-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="ma-body">
        {/* ── Header ── */}
        <header className="ma-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="ma-avatar">
              {recepName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{recepName}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Manage Appointments</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        <main className="ma-main">
          <div className="ma-topbar">
            <button className="ma-back-btn"
              onClick={() => navigate("/home/reception", { state: { name: recepName } })}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Home
            </button>
          </div>

          <div className="ma-layout">
            {/* ── Doctor column ── */}
            <div>
              <p className="ma-section-title">Doctors ({doctors.length})</p>
              {doctors.length === 0 ? (
                <div style={{ fontSize: 13, color: "#94A3B8", padding: "20px 0" }}>No doctors found.</div>
              ) : (
                <div className="ma-doc-list">
                  {doctors.map((doc) => (
                    <div key={doc.id}
                      className={`ma-doc-card${selectedDoc?.id === doc.id ? " selected" : ""}`}
                      onClick={() => selectDoctor(doc)}>
                      <div className="ma-doc-avatar">{getInitials(doc.name)}</div>
                      <div>
                        <div className="ma-doc-name">{doc.name}</div>
                        <div className="ma-doc-spec">{doc.specialization}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Appointments column ── */}
            <div className="ma-panel">
              {!selectedDoc ? (
                <div className="ma-placeholder">
                  <div className="ma-placeholder-icon">
                    <svg width="24" height="24" fill="none" stroke="#F59E0B" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div className="ma-placeholder-title">No doctor selected</div>
                  <div className="ma-placeholder-sub">
                    Select a doctor from the list on the left to view and manage their appointments.
                  </div>
                </div>
              ) : (
                <>
                  <div className="ma-panel-header">
                    <div>
                      <div className="ma-panel-title">Dr. {selectedDoc.name}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                        {selectedDoc.specialization}
                        {" · "}
                        {loading ? "…" : `${appointments.length} appointment${appointments.length !== 1 ? "s" : ""}`}
                      </div>
                    </div>
                    <button className="ma-btn-add" onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add Appointment
                    </button>
                  </div>

                  {loading ? (
                    <div style={{ fontSize: 13, color: "#94A3B8", padding: "20px 0" }}>Loading…</div>
                  ) : (
                    <>
                      {/* Appointment list */}
                      {appointments.length === 0 ? (
                        <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20 }}>
                          No appointments scheduled for this doctor.
                        </div>
                      ) : (
                        <div className="ma-appt-list">
                          {appointments.map((a) => {
                            const ss = STATUS_STYLE[a.status] || STATUS_STYLE.Scheduled;
                            return (
                              <div key={a.id} className="ma-appt-card">
                                <div className="ma-appt-row">
                                  <div className="ma-pat-avatar">{getInitials(a.patient_name || "?")}</div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="ma-appt-patient">{a.patient_name || "Unknown Patient"}</div>
                                    <div className="ma-appt-meta">
                                      {a.date} · {formatTime(a.time)}
                                    </div>
                                  </div>
                                  <span className="ma-status-chip" style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}>
                                    {a.status}
                                  </span>
                                  <div className="ma-appt-actions">
                                    <button className="ma-btn-edit-sm" onClick={() => openEdit(a)}>Edit</button>
                                    <button className="ma-btn-del-sm"  onClick={() => setConfirmId(a.id)}>Delete</button>
                                  </div>
                                </div>
                                {confirmId === a.id && (
                                  <div className="ma-confirm">
                                    <span className="ma-confirm-text">Delete this appointment?</span>
                                    <div className="ma-confirm-btns">
                                      <button className="ma-confirm-yes" onClick={() => handleDelete(a.id)}>Delete</button>
                                      <button className="ma-confirm-no"  onClick={() => setConfirmId(null)}>Cancel</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add / Edit form */}
                      {showForm && (
                        <div className="ma-form-card">
                          <div className="ma-form-title">
                            {form.id ? "Update Appointment" : "Schedule New Appointment"}
                          </div>
                          <div className="ma-form-grid">
                            <div className="ma-field" style={{ gridColumn: "1 / -1" }}>
                              <label className="ma-label">Patient</label>
                              <select className="ma-select" value={form.patient_id}
                                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
                                <option value="">Select Patient</option>
                                {patients.map((p) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="ma-field">
                              <label className="ma-label">Date</label>
                              <input className="ma-input" type="date" value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="ma-field">
                              <label className="ma-label">Time</label>
                              <input className="ma-input" type="time" value={form.time}
                                onChange={(e) => setForm({ ...form, time: e.target.value })} />
                            </div>
                            <div className="ma-field">
                              <label className="ma-label">Status</label>
                              <select className="ma-select" value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                          <div className="ma-form-actions">
                            <button className="ma-btn-save" onClick={handleSave} disabled={saving}>
                              {saving ? "Saving…" : form.id ? "Update" : "Add Appointment"}
                            </button>
                            <button className="ma-btn-cancel-form"
                              onClick={() => { setForm(EMPTY_FORM); setShowForm(false); }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
