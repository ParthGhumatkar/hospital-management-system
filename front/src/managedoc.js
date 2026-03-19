import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const EMPTY_FORM = (dept = "") => ({
  id: null, name: "", email: "", specialization: "", department: dept, phone: "",
});

export default function ManageDoctors() {
  const location = useLocation();
  const navigate  = useNavigate();

  const hodId         = location.state?.id         || localStorage.getItem("hod_id")         || null;
  const hodName       = location.state?.name       || localStorage.getItem("hod_name")       || "HOD";
  const hodDepartment = location.state?.department || localStorage.getItem("hod_department") || "";
  const hodINI = getInitials(hodName);

  const [doctors,      setDoctors]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM(hodDepartment));
  const [editingId,    setEditingId]    = useState(null);   // card whose edit form is open
  const [confirmId,    setConfirmId]    = useState(null);   // card awaiting delete confirm
  const [saving,       setSaving]       = useState(false);

  /* ── fetch ── */
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const q = hodId ? `?hod_id=${hodId}` : (hodDepartment ? `?department=${encodeURIComponent(hodDepartment)}` : "");
      const res  = await fetch(`${API_URL}/hod/doctors${q}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
    } catch {
      setToast({ message: "Failed to load doctors", type: "error" });
    }
    setLoading(false);
  }, [hodId, hodDepartment]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  /* ── edit ── */
  const openEdit = (doc) => {
    setForm({ id: doc.id, name: doc.name, email: doc.email,
              specialization: doc.specialization, department: doc.department, phone: doc.phone });
    setEditingId(doc.id);
    setConfirmId(null);
  };
  const cancelEdit = () => { setForm(EMPTY_FORM(hodDepartment)); setEditingId(null); };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setToast({ message: "Name and Email are required", type: "error" }); return;
    }
    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/doctors/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setToast({ message: data.message || "Doctor updated", type: "success" });
      cancelEdit();
      fetchDoctors();
    } catch {
      setToast({ message: "Failed to update doctor", type: "error" });
    }
    setSaving(false);
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    try {
      const res  = await fetch(`${API_URL}/doctors/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setToast({ message: data.message || "Doctor deleted", type: "success" });
      setConfirmId(null);
      fetchDoctors();
    } catch {
      setToast({ message: "Failed to delete doctor", type: "error" });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .md-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .md-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .md-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #0F6E56;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }

        .md-main { max-width: 1040px; margin: 0 auto; padding: 32px 28px 60px; }

        .md-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px;
        }
        .md-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.15s, color 0.15s;
        }
        .md-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .md-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 16px;
        }

        /* Doctor grid */
        .md-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 16px;
          margin-bottom: 8px;
        }

        /* Doctor card */
        .md-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; }
        .md-card-body { padding: 20px; }

        .md-doc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .md-doc-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #EFF6FF;
          color: #1D4ED8; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .md-doc-name { font-weight: 700; font-size: 15px; color: #0F172A; }
        .md-doc-spec { font-size: 12px; color: #64748B; margin-top: 2px; }

        .md-info-row { display: flex; gap: 8px; margin-bottom: 6px; align-items: flex-start; }
        .md-info-label { font-size: 12px; color: #94A3B8; min-width: 80px; flex-shrink: 0; padding-top: 1px; }
        .md-info-value { font-size: 13px; color: #334155; }

        /* Card actions */
        .md-card-footer {
          display: flex; gap: 8px; padding: 12px 20px;
          border-top: 1px solid #F1F5F9;
        }
        .md-btn-edit {
          flex: 1; padding: 7px; background: #EFF6FF; color: #1D4ED8;
          border: 1px solid #BFDBFE; border-radius: 8px; font-size: 13px;
          font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .md-btn-edit:hover { background: #DBEAFE; }
        .md-btn-delete {
          flex: 1; padding: 7px; background: #FEF2F2; color: #DC2626;
          border: 1px solid #FECACA; border-radius: 8px; font-size: 13px;
          font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .md-btn-delete:hover { background: #FEE2E2; }

        /* Inline confirm */
        .md-confirm-bar {
          padding: 12px 20px; background: #FEF2F2; border-top: 1px solid #FECACA;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .md-confirm-text { font-size: 13px; color: #DC2626; font-weight: 500; }
        .md-confirm-btns { display: flex; gap: 8px; }
        .md-confirm-yes {
          padding: 5px 14px; background: #DC2626; color: #fff; border: none;
          border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .md-confirm-no {
          padding: 5px 14px; background: #fff; color: #64748B; border: 1px solid #E2E8F0;
          border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        /* Edit form panel */
        .md-edit-panel {
          margin-top: 24px; background: #fff; border: 1px solid #E2E8F0;
          border-radius: 14px; padding: 24px;
        }
        .md-edit-title { font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 18px; }
        .md-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .md-field { display: flex; flex-direction: column; gap: 5px; }
        .md-field label { font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
        .md-input {
          padding: 9px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: #334155;
          outline: none; transition: border-color 0.15s;
        }
        .md-input:focus { border-color: #93C5FD; }
        .md-form-actions { display: flex; gap: 10px; margin-top: 18px; }
        .md-btn-save {
          padding: 10px 24px; background: #0F6E56; color: #fff; border: none;
          border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .md-btn-save:hover { background: #0d5e49; }
        .md-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .md-btn-cancel-form {
          padding: 10px 24px; background: #fff; color: #64748B;
          border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 14px;
          font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s;
        }
        .md-btn-cancel-form:hover { border-color: #CBD5E1; }

        /* Empty state */
        .md-empty {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
          display: flex; flex-direction: column; align-items: center;
          padding: 60px 24px; gap: 10px; text-align: center;
        }
        .md-empty-icon {
          width: 60px; height: 60px; border-radius: 50%; background: #EFF6FF;
          display: flex; align-items: center; justify-content: center;
        }
        .md-empty-title { font-size: 15px; font-weight: 600; color: #334155; }
        .md-empty-sub   { font-size: 13px; color: #94A3B8; max-width: 280px; line-height: 1.55; }

        @media (max-width: 640px) {
          .md-header { padding: 12px 16px; }
          .md-main   { padding: 20px 14px 48px; }
          .md-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="md-body">
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

        {/* ── Header ── */}
        <header className="md-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="md-avatar">{hodINI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{hodName}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>
                {hodDepartment ? `${hodDepartment} — ` : ""}Manage Doctors
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        {/* ── Main ── */}
        <main className="md-main">
          {/* Top bar */}
          <div className="md-topbar">
            <button
              className="md-back-btn"
              onClick={() => navigate("/home/hod", { state: { name: hodName, department: hodDepartment } })}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Home
            </button>
            <div style={{ fontSize: 13, color: "#64748B" }}>
              {loading ? "Loading…" : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""}`}
            </div>
          </div>

          <p className="md-section-title">
            {hodDepartment ? `${hodDepartment} Department` : "All Doctors"}
          </p>

          {loading ? (
            <div className="md-empty">
              <div style={{ fontSize: 13, color: "#94A3B8" }}>Loading doctors…</div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="md-empty">
              <div className="md-empty-icon">
                <svg width="26" height="26" fill="none" stroke="#93C5FD" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <div className="md-empty-title">No doctors found</div>
              <div className="md-empty-sub">
                {hodDepartment
                  ? `No doctors are assigned to the ${hodDepartment} department yet.`
                  : "No doctors have been registered yet."}
              </div>
            </div>
          ) : (
            <div className="md-grid">
              {doctors.map((doc) => (
                <div key={doc.id} className="md-card">
                  <div className="md-card-body">
                    <div className="md-doc-header">
                      <div className="md-doc-avatar">{getInitials(doc.name)}</div>
                      <div>
                        <div className="md-doc-name">{doc.name}</div>
                        <div className="md-doc-spec">{doc.specialization}</div>
                      </div>
                    </div>
                    <div className="md-info-row">
                      <span className="md-info-label">Department</span>
                      <span className="md-info-value">{doc.department || "—"}</span>
                    </div>
                    <div className="md-info-row">
                      <span className="md-info-label">Phone</span>
                      <span className="md-info-value">{doc.phone || "—"}</span>
                    </div>
                    <div className="md-info-row">
                      <span className="md-info-label">Email</span>
                      <span className="md-info-value" style={{ wordBreak: "break-all" }}>{doc.email || "—"}</span>
                    </div>
                  </div>

                  {/* Delete confirm bar */}
                  {confirmId === doc.id ? (
                    <div className="md-confirm-bar">
                      <span className="md-confirm-text">Delete this doctor?</span>
                      <div className="md-confirm-btns">
                        <button className="md-confirm-yes" onClick={() => handleDelete(doc.id)}>Delete</button>
                        <button className="md-confirm-no"  onClick={() => setConfirmId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="md-card-footer">
                      <button className="md-btn-edit"   onClick={() => openEdit(doc)}>Edit</button>
                      <button className="md-btn-delete" onClick={() => { setConfirmId(doc.id); setEditingId(null); }}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Inline edit panel ── */}
          {editingId && (
            <div className="md-edit-panel">
              <div className="md-edit-title">
                Editing — {doctors.find((d) => d.id === editingId)?.name}
              </div>
              <div className="md-form-grid">
                {[
                  { key: "name",           label: "Full Name",      type: "text"  },
                  { key: "email",          label: "Email",          type: "email" },
                  { key: "specialization", label: "Specialization", type: "text"  },
                  { key: "department",     label: "Department",     type: "text"  },
                  { key: "phone",          label: "Phone",          type: "text"  },
                ].map(({ key, label, type }) => (
                  <div key={key} className="md-field">
                    <label>{label}</label>
                    <input
                      type={type}
                      className="md-input"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <div className="md-form-actions">
                <button className="md-btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button className="md-btn-cancel-form" onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
