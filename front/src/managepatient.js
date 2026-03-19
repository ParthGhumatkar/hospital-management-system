import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const EMPTY_EDIT = (p) => ({
  name: p.name || "", age: p.age || "", gender: p.gender || "",
  phone: p.phone || "", address: p.address || "",
  medical_history: p.medical_history || "", current_medication: p.current_medication || "",
});

export default function ManagePatients() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const recepName = location.state?.name || localStorage.getItem("reception_name") || "Receptionist";

  const [patients,  setPatients]  = useState([]);
  const [beds,      setBeds]      = useState([]);
  const [search,    setSearch]    = useState("");
  const [toast,     setToast]     = useState(null);

  const [expandedId, setExpandedId] = useState(null);
  const [editingId,  setEditingId]  = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [saving,     setSaving]     = useState(false);
  const [inlineMedForm, setInlineMedForm] = useState({
    medical_history: "",
    current_medication: "",
    insurance_provider: "",
    policy_number: "",
  });
  const [selectedBed, setSelectedBed] = useState({});

  const fetchPatients = async () => {
    try {
      const res  = await fetch(`${API_URL}/patients`);
      const data = await res.json();
      setPatients(Array.isArray(data.patients) ? data.patients : []);
    } catch { setPatients([]); }
  };

  const fetchBeds = async () => {
    try {
      const res  = await fetch(`${API_URL}/beds`);
      const data = await res.json();
      console.log("Beds from API:", data);
      setBeds(Array.isArray(data) ? data : []);
    } catch { setBeds([]); }
  };

  useEffect(() => { fetchPatients(); fetchBeds(); }, []);

  /* ── keep inline editor in sync with the expanded patient ── */
  useEffect(() => {
    if (expandedId == null) return;
    // Don't overwrite the full edit form while in edit mode.
    if (editingId === expandedId) return;
    const p = patients.find((x) => x.id === expandedId);
    if (!p) return;
    setInlineMedForm({
      medical_history: p.medical_history || "",
      current_medication: p.current_medication || "",
      insurance_provider: p.insurance_provider || "",
      policy_number: p.policy_number || "",
    });
  }, [expandedId, editingId, patients]);

  const availableBeds = beds.filter((b) => b.status?.toLowerCase() === "available");
  console.log("Available beds:", availableBeds.map((b) => ({ id: b.id, bed_number: b.bed_number, status: b.status })));

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ── assign bed ── */
  const assignBed = async (patientId) => {
    const bedId = selectedBed[patientId];
    if (!bedId) { setToast({ message: "Please select a bed first", type: "error" }); return; }
    const selectedBedId = parseInt(bedId);
    console.log("Sending bed_id:", selectedBedId);
    console.log("Full bed object:", availableBeds.find(b => b.id === selectedBedId));
    console.log("All available beds:", availableBeds.map(b => ({ id: b.id, number: b.bed_number })));
    try {
      const res  = await fetch(`${API_URL}/beds/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, bed_id: selectedBedId }),
      });
      const data = await res.json();
      setToast({ message: data.message || "Bed assigned!", type: "success" });
      fetchPatients(); fetchBeds();
    } catch { setToast({ message: "Failed to assign bed", type: "error" }); }
  };

  /* ── edit ── */
  const openEdit = (p) => {
    setEditForm(EMPTY_EDIT(p));
    setEditingId(p.id);
    setConfirmId(null);
    setExpandedId(p.id);
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const patient = patients.find((p) => p.id === editingId);
      const res  = await fetch(`${API_URL}/update_patient/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patient, ...editForm }),
      });
      const data = await res.json();
      setToast({ message: data.message || "Patient updated!", type: "success" });
      cancelEdit();
      fetchPatients();
    } catch { setToast({ message: "Failed to update patient", type: "error" }); }
    setSaving(false);
  };

  /* ── inline save (medical_history + current_medication) ── */
  const handleInlineSave = async (patient) => {
    if (!patient) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/update_patient/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...patient,
          medical_history: inlineMedForm.medical_history,
          current_medication: inlineMedForm.current_medication,
          insurance_provider: inlineMedForm.insurance_provider,
          policy_number: inlineMedForm.policy_number,
          // keep bed_id and all other fields unchanged
          bed_id: patient.bed_id,
        }),
      });
      const data = await res.json();
      setToast({ message: data.message || "Patient updated!", type: "success" });
      fetchPatients();
    } catch {
      setToast({ message: "Failed to update patient", type: "error" });
    }
    setSaving(false);
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    try {
      const res  = await fetch(`${API_URL}/delete_patient/${id}`, { method: "DELETE" });
      const data = await res.json();
      setToast({ message: data.message || "Patient deleted", type: "success" });
      setConfirmId(null);
      if (expandedId === id) setExpandedId(null);
      fetchPatients();
    } catch { setToast({ message: "Failed to delete patient", type: "error" }); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mp-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .mp-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .mp-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #854F0B;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }

        .mp-main { max-width: 880px; margin: 0 auto; padding: 32px 28px 60px; }

        .mp-topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .mp-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .mp-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .mp-search-wrap {
          flex: 1; position: relative; min-width: 200px;
        }
        .mp-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          pointer-events: none;
        }
        .mp-search {
          width: 100%; padding: 9px 12px 9px 38px;
          border: 1.5px solid #E2E8F0; border-radius: 9px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: #334155;
          outline: none; background: #fff; transition: border-color 0.15s;
        }
        .mp-search:focus { border-color: #FCD34D; }

        .mp-count { font-size: 13px; color: #94A3B8; flex-shrink: 0; }

        /* Table card */
        .mp-table-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: visible; }

        .mp-thead { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 150px; gap: 0; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
        .mp-th { padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94A3B8; }

        /* Patient row */
        .mp-row-wrap { border-bottom: 1px solid #F1F5F9; }
        .mp-row-wrap:last-child { border-bottom: none; }

        .mp-row {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 150px;
          align-items: center; cursor: pointer;
          transition: background 0.12s;
        }
        .mp-row:hover { background: #FAFBFC; }
        .mp-row.active { background: #FFFBEB; }

        .mp-td { padding: 14px 16px; font-size: 14px; color: #334155; }
        .mp-td-name { display: flex; align-items: center; gap: 10px; }
        .mp-pat-avatar {
          width: 34px; height: 34px; border-radius: 50%; background: #FEF3C7;
          color: #B45309; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 12px; flex-shrink: 0;
        }
        .mp-pat-name { font-weight: 600; color: #0F172A; }

        .mp-bed-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
        }
        .mp-bed-assigned   { background: #DCFCE7; color: #16A34A; border: 1px solid #BBF7D0; }
        .mp-bed-unassigned { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

        .mp-actions { display: flex; gap: 6px; padding: 14px 16px; }
        .mp-btn-edit {
          padding: 5px 14px; background: #EFF6FF; color: #1D4ED8;
          border: 1px solid #BFDBFE; border-radius: 6px; font-size: 12px;
          font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
        }
        .mp-btn-edit:hover { background: #DBEAFE; }
        .mp-btn-del {
          padding: 5px 14px; background: #FEF2F2; color: #DC2626;
          border: 1px solid #FECACA; border-radius: 6px; font-size: 12px;
          font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
        }
        .mp-btn-del:hover { background: #FEE2E2; }

        /* Confirm bar */
        .mp-confirm {
          padding: 12px 16px; background: #FEF2F2; border-top: 1px solid #FECACA;
          display: flex; align-items: center; justify-content: space-between;
        }
        .mp-confirm-text { font-size: 13px; color: #DC2626; font-weight: 500; }
        .mp-confirm-btns { display: flex; gap: 8px; }
        .mp-confirm-yes { padding: 5px 14px; background: #DC2626; color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .mp-confirm-no  { padding: 5px 14px; background: #fff; color: #64748B; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

        /* Expanded panel */
        .mp-expand { background: #FAFBFC; border-top: 1px solid #F1F5F9; padding: 20px 20px 20px; }

        .mp-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin-bottom: 16px; }
        .mp-info-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94A3B8; margin-bottom: 2px; }
        .mp-info-value { font-size: 13px; color: #334155; }

        /* Edit form */
        .mp-edit-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid #E2E8F0; }
        .mp-edit-title { font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 14px; }
        .mp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .mp-field { display: flex; flex-direction: column; gap: 5px; }
        .mp-f-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; }
        .mp-f-input, .mp-f-select, .mp-f-textarea {
          padding: 10px 12px; border: 1px solid #E2E8F0; border-radius: 8px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: #334155;
          outline: none; background: #fff; transition: border-color 0.15s;
        }
        .mp-f-select { position: relative; z-index: 999; }
        .mp-f-input:focus, .mp-f-select:focus, .mp-f-textarea:focus { border-color: #FCD34D; }
        .mp-f-textarea { resize: vertical; min-height: 70px; }
        .mp-form-actions { display: flex; gap: 8px; margin-top: 14px; }
        .mp-btn-save {
          padding: 8px 22px; background: #F59E0B; color: #fff; border: none;
          border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .mp-btn-save:hover { background: #D97706; }
        .mp-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .mp-btn-cancel-edit {
          padding: 8px 22px; background: #fff; color: #64748B; border: 1.5px solid #E2E8F0;
          border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        /* Bed assign */
        .mp-bed-assign { display: flex; align-items: center; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
        .mp-bed-label { font-size: 12px; font-weight: 600; color: #64748B; }
        .mp-bed-select {
          padding: 10px 12px; border: 1px solid #E2E8F0; border-radius: 8px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: #334155;
          outline: none; background: #fff; transition: border-color 0.15s;
          position: relative; z-index: 999;
        }
        .mp-bed-select:focus { border-color: #FCD34D; }
        .mp-btn-assign {
          padding: 7px 18px; background: #16A34A; color: #fff; border: none;
          border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .mp-btn-assign:hover { background: #15803D; }
        .mp-no-beds { font-size: 13px; color: #DC2626; margin-top: 10px; }

        /* Empty */
        .mp-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 60px 24px; gap: 10px; text-align: center;
        }
        .mp-empty-icon { width: 56px; height: 56px; border-radius: 50%; background: #FEF3C7; display: flex; align-items: center; justify-content: center; }
        .mp-empty-title { font-size: 15px; font-weight: 600; color: #334155; }
        .mp-empty-sub   { font-size: 13px; color: #94A3B8; }

        @media (max-width: 700px) {
          .mp-header { padding: 12px 16px; }
          .mp-main   { padding: 20px 14px 48px; }
          .mp-thead  { display: none; }
          .mp-row    { grid-template-columns: 1fr; }
          .mp-td:not(.mp-td-name):not(:last-child) { display: none; }
          .mp-info-grid { grid-template-columns: 1fr; }
          .mp-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="mp-body">
        {/* ── Header ── */}
        <header className="mp-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="mp-avatar">
              {recepName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{recepName}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Manage Patients</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        <main className="mp-main">
          {/* Top bar */}
          <div className="mp-topbar">
            <button className="mp-back-btn"
              onClick={() => navigate("/home/reception", { state: { name: recepName } })}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Home
            </button>

            <div className="mp-search-wrap">
              <span className="mp-search-icon">
                <svg width="14" height="14" fill="none" stroke="#94A3B8" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input className="mp-search" type="text" placeholder="Search by patient name…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span className="mp-count">{filtered.length} patient{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table card */}
          <div className="mp-table-card">
            {/* Table head */}
            <div className="mp-thead">
              <div className="mp-th">Patient</div>
              <div className="mp-th">Age</div>
              <div className="mp-th">Gender</div>
              <div className="mp-th">Bed</div>
              <div className="mp-th">Actions</div>
            </div>

            {filtered.length === 0 ? (
              <div className="mp-empty">
                <div className="mp-empty-icon">
                  <svg width="24" height="24" fill="none" stroke="#F59E0B" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="mp-empty-title">
                  {search ? "No patients match your search" : "No patients registered yet"}
                </div>
                <div className="mp-empty-sub">
                  {search ? "Try a different name." : "Register a new patient to get started."}
                </div>
              </div>
            ) : (
              filtered.map((p) => (
                <div key={p.id} className="mp-row-wrap">
                  {/* ── Main row ── */}
                  <div
                    className={`mp-row${expandedId === p.id ? " active" : ""}`}
                    onClick={() => {
                      if (editingId === p.id) return;
                      setExpandedId(expandedId === p.id ? null : p.id);
                      setConfirmId(null);
                    }}
                  >
                    <div className="mp-td mp-td-name">
                      <div className="mp-pat-avatar">{getInitials(p.name)}</div>
                      <div className="mp-pat-name">{p.name}</div>
                    </div>
                    <div className="mp-td">{p.age}</div>
                    <div className="mp-td">{p.gender}</div>
                    <div className="mp-td">
                      {p.bed_id
                        ? <span className="mp-bed-chip mp-bed-assigned">Bed {p.bed_id}</span>
                        : <span className="mp-bed-chip mp-bed-unassigned">Unassigned</span>}
                    </div>
                    <div className="mp-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="mp-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                      <button className="mp-btn-del"
                        onClick={() => { setConfirmId(p.id); setEditingId(null); setExpandedId(p.id); }}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* ── Delete confirm ── */}
                  {confirmId === p.id && (
                    <div className="mp-confirm">
                      <span className="mp-confirm-text">Delete {p.name}? This cannot be undone.</span>
                      <div className="mp-confirm-btns">
                        <button className="mp-confirm-yes" onClick={() => handleDelete(p.id)}>Delete</button>
                        <button className="mp-confirm-no"  onClick={() => setConfirmId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* ── Expanded panel ── */}
                  {expandedId === p.id && confirmId !== p.id && (
                    <div className="mp-expand">
                      {editingId === p.id ? (
                        /* Edit form */
                        <div className="mp-edit-section">
                          <div className="mp-edit-title">Editing — {p.name}</div>
                          <div className="mp-form-grid">
                            {[
                              { key: "name",    label: "Full Name", type: "text"   },
                              { key: "age",     label: "Age",       type: "number" },
                              { key: "phone",   label: "Phone",     type: "text"   },
                              { key: "address", label: "Address",   type: "text"   },
                            ].map(({ key, label, type }) => (
                              <div key={key} className="mp-field">
                                <label className="mp-f-label">{label}</label>
                                <input className="mp-f-input" type={type}
                                  value={editForm[key] || ""}
                                  onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
                              </div>
                            ))}
                            <div className="mp-field">
                              <label className="mp-f-label">Gender</label>
                              <select className="mp-f-select" value={editForm.gender || ""}
                                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                              <option value="" disabled>Select a gender...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <div className="mp-field" style={{ marginBottom: 12 }}>
                              <label className="mp-f-label">Medical History</label>
                              <textarea className="mp-f-textarea"
                                value={editForm.medical_history || ""}
                                onChange={(e) => setEditForm({ ...editForm, medical_history: e.target.value })} />
                            </div>
                            <div className="mp-field">
                              <label className="mp-f-label">Current Medication</label>
                              <textarea className="mp-f-textarea"
                                value={editForm.current_medication || ""}
                                onChange={(e) => setEditForm({ ...editForm, current_medication: e.target.value })} />
                            </div>
                          </div>
                          <div className="mp-form-actions">
                            <button className="mp-btn-save" onClick={handleSave} disabled={saving}>
                              {saving ? "Saving…" : "Save Changes"}
                            </button>
                            <button className="mp-btn-cancel-edit" onClick={cancelEdit}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        /* Detail view */
                        <>
                          <div className="mp-info-grid">
                            <div>
                              <div className="mp-info-label">Phone</div>
                              <div className="mp-info-value">{p.phone || "—"}</div>
                            </div>
                            <div>
                              <div className="mp-info-label">Address</div>
                              <div className="mp-info-value">{p.address || "—"}</div>
                            </div>
                            <div>
                              <div className="mp-info-label">Medical History</div>
                              <textarea
                                className="mp-f-textarea"
                                value={inlineMedForm.medical_history}
                                placeholder="Known conditions, past surgeries, allergies..."
                                onChange={(e) => setInlineMedForm((f) => ({ ...f, medical_history: e.target.value }))}
                              />
                            </div>
                            <div>
                              <div className="mp-info-label">Current Medication</div>
                              <textarea
                                className="mp-f-textarea"
                                value={inlineMedForm.current_medication}
                                placeholder="List of current medications and dosages..."
                                onChange={(e) => setInlineMedForm((f) => ({ ...f, current_medication: e.target.value }))}
                              />
                            </div>
                            <div>
                              <div className="mp-info-label">Insurance Provider</div>
                              <input
                                className="mp-f-input"
                                type="text"
                                value={inlineMedForm.insurance_provider}
                                placeholder="e.g. BlueCross"
                                onChange={(e) => setInlineMedForm((f) => ({ ...f, insurance_provider: e.target.value }))}
                              />
                            </div>
                            <div>
                              <div className="mp-info-label">Policy Number</div>
                              <input
                                className="mp-f-input"
                                type="text"
                                value={inlineMedForm.policy_number}
                                placeholder="e.g. POL-123456"
                                onChange={(e) => setInlineMedForm((f) => ({ ...f, policy_number: e.target.value }))}
                              />
                            </div>
                          </div>

                          {/* Bed assignment */}
                          <div style={{ paddingTop: 14, borderTop: "1px solid #E2E8F0" }}>
                            <div className="mp-bed-label">Assign Bed</div>
                            {availableBeds.length > 0 ? (
                              <div className="mp-bed-assign">
                                <select className="mp-bed-select"
                                  value={selectedBed[p.id] || ""}
                                  onChange={(e) => setSelectedBed({ ...selectedBed, [p.id]: e.target.value })}>
                                  <option value="" disabled>Select a bed...</option>
                                  {availableBeds.map((b) => (
                                    <option key={b.id} value={b.id}>{b.bed_number}</option>
                                  ))}
                                </select>
                                <button className="mp-btn-assign" onClick={() => assignBed(p.id)}>
                                  Assign
                                </button>
                              </div>
                            ) : (
                              <p className="mp-no-beds">No available beds at this time.</p>
                            )}
                          </div>

                          <div className="mp-form-actions" style={{ justifyContent: "flex-end" }}>
                            <button
                              className="mp-btn-save"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInlineSave(p);
                              }}
                              disabled={saving}
                            >
                              {saving ? "Saving…" : "Save Changes"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}
