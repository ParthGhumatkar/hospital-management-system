import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function DoctorPatients() {
  const location = useLocation();
  const navigate = useNavigate();

  const doctorId = location.state?.doctorId;
  const doctorName = location.state?.name || "Doctor";

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Record Vitals modal ────────────────────────────────────────────────
  const [vitalsModalPatient, setVitalsModalPatient] = useState(null); // selected patient object
  const [vitalsSaving, setVitalsSaving] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    age: "",
    gender: "Male",
    bmi: "",
    temperature: "",
    heart_rate: "",
    systolic_bp: "",
    diastolic_bp: "",
    spo2: "",
    blood_sugar: "",
    fever: false,
    cough: false,
    fatigue: false,
    difficulty_breathing: false,
    chest_pain: false,
    nausea: false,
    history_diabetes: false,
    history_hypertension: false,
    history_asthma: false,
  });

  const INI = getInitials(doctorName);

  const fetchPatients = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/doctor/${doctorId}/patients`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPatients(Array.isArray(data.patients) ? data.patients : []);
    } catch {
      setPatients([]);
    }
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId) { navigate("/"); return; }
    fetchPatients();
  }, [doctorId, navigate, fetchPatients]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setAnalysis(null);
  };

  const openVitalsModal = (patient) => {
    setVitalsModalPatient(patient);
    setVitalsSaving(false);
    setAnalysis(null);
    setVitalsForm({
      age: patient?.age != null ? String(patient.age) : "",
      gender: "Male",
      bmi: "",
      temperature: "",
      heart_rate: "",
      systolic_bp: "",
      diastolic_bp: "",
      spo2: "",
      blood_sugar: "",
      fever: false,
      cough: false,
      fatigue: false,
      difficulty_breathing: false,
      chest_pain: false,
      nausea: false,
      history_diabetes: false,
      history_hypertension: false,
      history_asthma: false,
    });
  };

  const submitVitals = async () => {
    if (!vitalsModalPatient) return;
    setVitalsSaving(true);
    setToast(null);

    const p = vitalsModalPatient;

    const requiredNumericKeys = [
      "age",
      "bmi",
      "temperature",
      "heart_rate",
      "systolic_bp",
      "diastolic_bp",
      "spo2",
      "blood_sugar",
    ];
    for (const k of requiredNumericKeys) {
      if (vitalsForm[k] === "" || vitalsForm[k] === null || vitalsForm[k] === undefined) {
        setToast({ message: "Please fill all numeric vital fields", type: "error" });
        setVitalsSaving(false);
        return;
      }
      const n = Number(vitalsForm[k]);
      if (Number.isNaN(n)) {
        setToast({ message: "Some numeric vital values are invalid", type: "error" });
        setVitalsSaving(false);
        return;
      }
    }

    const ranges = {
      bmi: { min: 10, max: 50 },
      temperature: { min: 95, max: 108 },
      heart_rate: { min: 40, max: 200 },
      spo2: { min: 70, max: 100 },
      blood_sugar: { min: 50, max: 500 },
      systolic_bp: { min: 50, max: 250 },
      diastolic_bp: { min: 50, max: 250 },
    };
    for (const [key, r] of Object.entries(ranges)) {
      const n = Number(vitalsForm[key]);
      if (n < r.min || n > r.max) {
        setToast({
          message: `${key.replaceAll("_", " ")} must be between ${r.min} and ${r.max}`,
          type: "error",
        });
        setVitalsSaving(false);
        return;
      }
    }

    const payload = {
      patient_id: p.id,
      doctor_id: doctorId ? Number(doctorId) : null,
      age: Number(vitalsForm.age),
      gender: vitalsForm.gender,
      bmi: Number(vitalsForm.bmi),
      temperature: Number(vitalsForm.temperature),
      heart_rate: Number(vitalsForm.heart_rate),
      systolic_bp: Number(vitalsForm.systolic_bp),
      diastolic_bp: Number(vitalsForm.diastolic_bp),
      spo2: Number(vitalsForm.spo2),
      blood_sugar: Number(vitalsForm.blood_sugar),
      fever: vitalsForm.fever ? 1 : 0,
      cough: vitalsForm.cough ? 1 : 0,
      fatigue: vitalsForm.fatigue ? 1 : 0,
      difficulty_breathing: vitalsForm.difficulty_breathing ? 1 : 0,
      chest_pain: vitalsForm.chest_pain ? 1 : 0,
      nausea: vitalsForm.nausea ? 1 : 0,
      history_diabetes: vitalsForm.history_diabetes ? 1 : 0,
      history_hypertension: vitalsForm.history_hypertension ? 1 : 0,
      history_asthma: vitalsForm.history_asthma ? 1 : 0,
    };

    try {
      const res = await fetch(`${API_URL}/record_vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error || data.success !== true) {
        throw new Error(data.error || "Failed to record vitals");
      }

      setToast({ message: "Vitals recorded successfully", type: "success" });
      setVitalsModalPatient(null);
    } catch (err) {
      setToast({ message: err?.message || "Failed to record vitals", type: "error" });
    } finally {
      setVitalsSaving(false);
    }
  };

  const analyzePatient = async () => {
    if (!selectedPatient) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch(`${API_URL}/analyze_patient/${selectedPatient.id}`, { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis({ result: data.possible_diseases.join(", "), error: false });
    } catch (err) {
      setAnalysis({ result: err.message || "Failed to analyze patient.", error: true });
    }
    setAnalyzing(false);
  };

  if (!doctorId) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dp-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .dp-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .dp-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #1D4ED8;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }

        .dp-main { max-width: 1060px; margin: 0 auto; padding: 32px 28px 60px; }

        .dp-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; margin-bottom: 28px;
          transition: border-color 0.15s, color 0.15s;
        }
        .dp-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .dp-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 14px;
        }

        .dp-layout { display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: start; }

        .dp-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; }

        /* Patient rows */
        .dp-patient-row {
          display: flex; align-items: center; gap: 14px; padding: 14px 20px;
          cursor: pointer; transition: background 0.12s;
        }
        .dp-patient-row + .dp-patient-row { border-top: 1px solid #F1F5F9; }
        .dp-patient-row:hover { background: #F8FAFC; }
        .dp-patient-row.active { background: #EFF6FF; }

        .dp-pat-avatar {
          width: 40px; height: 40px; border-radius: 50%; background: #EFF6FF;
          color: #1D4ED8; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; flex-shrink: 0;
        }
        .dp-patient-row.active .dp-pat-avatar { background: #DBEAFE; }
        .dp-pat-name { font-weight: 600; font-size: 14px; color: #0F172A; }
        .dp-pat-meta { font-size: 12px; color: #94A3B8; margin-top: 2px; }

        .dp-chevron { margin-left: auto; color: #CBD5E1; flex-shrink: 0; }
        .dp-patient-row.active .dp-chevron { color: #1D4ED8; }

        /* Detail panel */
        .dp-detail { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; }

        .dp-detail-header { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
        .dp-detail-avatar {
          width: 52px; height: 52px; border-radius: 50%; background: #DBEAFE;
          color: #1D4ED8; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 18px;
        }
        .dp-detail-name { font-weight: 700; font-size: 17px; color: #0F172A; }
        .dp-detail-sub { font-size: 13px; color: #64748B; margin-top: 2px; }

        .dp-info-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94A3B8; margin-bottom: 4px; }
        .dp-info-value { font-size: 14px; color: #334155; line-height: 1.5; }
        .dp-info-block { margin-bottom: 18px; }

        .dp-divider { height: 1px; background: #F1F5F9; margin: 4px 0 18px; }

        .dp-analyze-btn {
          width: 100%; padding: 10px; background: #185FA5; color: #fff;
          border: none; border-radius: 9px; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s; margin-top: 6px;
        }
        .dp-analyze-btn:hover { background: #1a6fc4; }
        .dp-analyze-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .dp-analysis-box {
          margin-top: 14px; border-radius: 10px; padding: 14px 16px;
          font-size: 13px; line-height: 1.6;
        }

        .dp-placeholder {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center; padding: 40px 20px; gap: 10px;
        }
        .dp-placeholder-icon {
          width: 56px; height: 56px; border-radius: 50%; background: #EFF6FF;
          display: flex; align-items: center; justify-content: center;
        }
        .dp-placeholder-title { font-size: 14px; font-weight: 600; color: #475569; }
        .dp-placeholder-sub { font-size: 12px; color: #94A3B8; max-width: 220px; line-height: 1.5; }

        .dp-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 60px 24px; gap: 10px; text-align: center;
        }
        .dp-empty-icon {
          width: 60px; height: 60px; border-radius: 50%; background: #EFF6FF;
          display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
        }
        .dp-empty-title { font-size: 15px; font-weight: 600; color: #334155; }
        .dp-empty-sub { font-size: 13px; color: #94A3B8; max-width: 300px; line-height: 1.55; }

        /* ── Vitals button ─────────────────────────────────────────────── */
        .dp-vitals-btn {
          background: #EFF6FF;
          color: #185FA5;
          border: 1.5px solid #BFDBFE;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 800;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          white-space: nowrap;
          margin-left: auto;
        }
        .dp-vitals-btn:hover {
          background: #DBEAFE;
          border-color: #60A5FA;
        }

        /* ── Modal overlay + card ───────────────────────────────────────── */
        .dp-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 60; padding: 16px;
          animation: dp-fade-in 0.15s ease;
        }
        @keyframes dp-fade-in { from { opacity: 0 } to { opacity: 1 } }

        .dp-modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 720px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          padding: 22px 22px 18px;
        }

        .dp-modal-title {
          font-size: 17px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 6px;
        }
        .dp-modal-sub {
          font-size: 13px;
          color: #64748B;
          margin-bottom: 18px;
          line-height: 1.5;
        }

        .dp-modal-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px 14px;
          margin-bottom: 12px;
        }

        .dp-field { display: flex; flex-direction: column; gap: 6px; }
        .dp-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748B;
        }
        .dp-input, .dp-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #334155;
          outline: none;
          background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .dp-input:focus, .dp-select:focus {
          border-color: #60A5FA;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.18);
        }

        .dp-check-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .dp-check {
          display: flex; align-items: center; gap: 8px;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
        }
        .dp-check input { accent-color: #185FA5; width: 16px; height: 16px; }
        .dp-check span { font-size: 13px; color: #334155; font-weight: 600; }

        .dp-history {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid #F1F5F9;
        }
        .dp-history-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #185FA5;
          margin-bottom: 10px;
        }

        .dp-actions {
          display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px;
        }
        .dp-btn-cancel {
          padding: 10px 18px;
          background: #fff;
          color: #64748B;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .dp-btn-cancel:hover { border-color: #CBD5E1; color: #334155; background: #F8FAFC; }

        .dp-btn-save {
          padding: 10px 18px;
          background: #185FA5;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .dp-btn-save:hover { background: #1a6fc4; }
        .dp-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }

        @media (max-width: 860px) {
          .dp-layout { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .dp-header { padding: 12px 16px; }
          .dp-main { padding: 20px 14px 48px; }
          .dp-layout { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dp-body">
        {toast && (
          <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
        )}

        {/* ── Header ── */}
        <header className="dp-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="dp-avatar">{INI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>Dr. {doctorName}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Patient Records</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        {/* ── Main ── */}
        <main className="dp-main">
          <button
            className="dp-back-btn"
            onClick={() => navigate("/home/doctor", { state: { name: doctorName, doctorId } })}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Home
          </button>

          <div className="dp-layout">
            {/* Left — patient list */}
            <div>
              <p className="dp-section-title">Your Patients ({patients.length})</p>
              <div className="dp-card">
                {loading ? (
                  <div className="dp-empty">
                    <div style={{ fontSize: 13, color: "#94A3B8" }}>Loading patients…</div>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="dp-empty">
                    <div className="dp-empty-icon">
                      <svg width="28" height="28" fill="none" stroke="#93C5FD" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className="dp-empty-title">No patients yet</div>
                    <div className="dp-empty-sub">
                      Patients assigned to you via appointments will appear here.
                    </div>
                  </div>
                ) : (
                  patients.map((p) => (
                    <div
                      key={p.id}
                      className={`dp-patient-row${selectedPatient?.id === p.id ? " active" : ""}`}
                      onClick={() => handleSelectPatient(p)}
                    >
                      <div className="dp-pat-avatar">{getInitials(p.name)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="dp-pat-name">{p.name}</div>
                        <div className="dp-pat-meta">
                          Age {p.age} · {p.phone}
                          {p.bed_id ? ` · Bed #${p.bed_id}` : ""}
                        </div>
                      </div>
                      <button
                        className="dp-vitals-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openVitalsModal(p);
                        }}
                        disabled={vitalsSaving}
                        title="Record latest patient vitals"
                      >
                        Record Vitals
                      </button>
                      <svg className="dp-chevron" width="16" height="16" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right — detail panel */}
            <div>
              <p className="dp-section-title">Patient Details</p>
              {selectedPatient ? (
                <div className="dp-detail">
                  <div className="dp-detail-header">
                    <div className="dp-detail-avatar">{getInitials(selectedPatient.name)}</div>
                    <div>
                      <div className="dp-detail-name">{selectedPatient.name}</div>
                      <div className="dp-detail-sub">
                        Age {selectedPatient.age} · {selectedPatient.phone}
                      </div>
                    </div>
                  </div>

                  <div className="dp-info-block">
                    <div className="dp-info-label">Bed Assignment</div>
                    <div className="dp-info-value">
                      {selectedPatient.bed_id ? `Bed #${selectedPatient.bed_id}` : "Not assigned"}
                    </div>
                  </div>

                  <div className="dp-divider" />

                  <div className="dp-info-block">
                    <div className="dp-info-label">Medical History</div>
                    <div className="dp-info-value">
                      {selectedPatient.medical_history || "No medical history recorded."}
                    </div>
                  </div>

                  <div className="dp-info-block">
                    <div className="dp-info-label">Current Medication</div>
                    <div className="dp-info-value">
                      {selectedPatient.current_medication || "No current medication."}
                    </div>
                  </div>

                  <div className="dp-divider" />

                  <button
                    className="dp-analyze-btn"
                    onClick={analyzePatient}
                    disabled={analyzing}
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    {analyzing ? "Analyzing…" : "Run Disease Analysis"}
                  </button>

                  {analysis && (
                    <div
                      className="dp-analysis-box"
                      style={{
                        background: analysis.error ? "#FEF2F2" : "#F0FDF4",
                        border: `1px solid ${analysis.error ? "#FECACA" : "#BBF7D0"}`,
                        color: analysis.error ? "#DC2626" : "#15803D",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {analysis.error ? "Analysis Error: " : "AI Suggestion: "}
                      </span>
                      {analysis.result}
                    </div>
                  )}
                </div>
              ) : (
                <div className="dp-card">
                  <div className="dp-placeholder">
                    <div className="dp-placeholder-icon">
                      <svg width="26" height="26" fill="none" stroke="#93C5FD" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <div className="dp-placeholder-title">Select a patient</div>
                    <div className="dp-placeholder-sub">
                      Click any patient on the left to view their full details and run a disease analysis.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Record Vitals Modal ───────────────────────────────────────── */}
      {vitalsModalPatient && (
        <div
          className="dp-overlay"
          onClick={() => !vitalsSaving && setVitalsModalPatient(null)}
        >
          <div className="dp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dp-modal-title">Record Vitals</div>
            <div className="dp-modal-sub">
              Enter the latest measurements for <strong>{vitalsModalPatient.name}</strong>.
            </div>

            <div className="dp-modal-grid">
              <div className="dp-field">
                <div className="dp-label">Age</div>
                <input
                  className="dp-input"
                  type="number"
                  value={vitalsForm.age}
                  onChange={(e) => setVitalsForm((f) => ({ ...f, age: e.target.value }))}
                />
              </div>
              <div className="dp-field">
                <div className="dp-label">Gender</div>
                <select
                  className="dp-select"
                  value={vitalsForm.gender}
                  onChange={(e) => setVitalsForm((f) => ({ ...f, gender: e.target.value }))}
                >
                  <option value="" disabled>Select a gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="dp-field">
                <div className="dp-label">BMI</div>
                <input
                  className="dp-input"
                  type="number"
                  min="10"
                  max="50"
                  step="0.1"
                  value={vitalsForm.bmi}
                  onChange={(e) => setVitalsForm((f) => ({ ...f, bmi: e.target.value }))}
                />
              </div>
              <div className="dp-field">
                <div className="dp-label">Temperature</div>
                <input
                  className="dp-input"
                  type="number"
                  min="95"
                  max="108"
                  step="0.1"
                  value={vitalsForm.temperature}
                  onChange={(e) => setVitalsForm((f) => ({ ...f, temperature: e.target.value }))}
                />
              </div>

              <div className="dp-field">
                <div className="dp-label">Heart Rate</div>
                <input
                  className="dp-input"
                  type="number"
                  min="40"
                  max="200"
                  step="1"
                  value={vitalsForm.heart_rate}
                  onChange={(e) => setVitalsForm((f) => ({ ...f, heart_rate: e.target.value }))}
                />
              </div>
              <div className="dp-field">
                <div className="dp-label">SpO2</div>
                <input
                  className="dp-input"
                  type="number"
                  min="70"
                  max="100"
                  step="0.1"
                  value={vitalsForm.spo2}
                  onChange={(e) => setVitalsForm((f) => ({ ...f, spo2: e.target.value }))}
                />
              </div>

              <div className="dp-field">
                <div className="dp-label">Systolic BP</div>
                <input
                  className="dp-input"
                  type="number"
                  min="50"
                  max="250"
                  step="1"
                  value={vitalsForm.systolic_bp}
                  onChange={(e) => setVitalsForm((f) => ({ ...f, systolic_bp: e.target.value }))}
                />
              </div>
              <div className="dp-field">
                <div className="dp-label">Diastolic BP</div>
                <input
                  className="dp-input"
                  type="number"
                  min="50"
                  max="250"
                  step="1"
                  value={vitalsForm.diastolic_bp}
                  onChange={(e) => setVitalsForm((f) => ({ ...f, diastolic_bp: e.target.value }))}
                />
              </div>

              <div className="dp-field">
                <div className="dp-label">Blood Sugar</div>
                <input
                  className="dp-input"
                  type="number"
                  min="50"
                  max="500"
                  step="1"
                  value={vitalsForm.blood_sugar}
                  onChange={(e) => setVitalsForm((f) => ({ ...f, blood_sugar: e.target.value }))}
                />
              </div>
              <div />
            </div>

            <div className="dp-history">
              <div className="dp-history-title">
                <svg width="14" height="14" fill="none" stroke="#185FA5" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Symptoms
              </div>

              <div className="dp-check-row">
                {[
                  { key: "fever", label: "Fever" },
                  { key: "cough", label: "Cough" },
                  { key: "fatigue", label: "Fatigue" },
                  { key: "difficulty_breathing", label: "Difficulty Breathing" },
                  { key: "chest_pain", label: "Chest Pain" },
                  { key: "nausea", label: "Nausea" },
                ].map((f) => (
                  <label key={f.key} className="dp-check">
                    <input
                      type="checkbox"
                      checked={!!vitalsForm[f.key]}
                      onChange={(e) => setVitalsForm((s) => ({ ...s, [f.key]: e.target.checked }))}
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>

              <div className="dp-history" style={{ marginTop: 18 }}>
                <div className="dp-history-title">Medical History</div>
                <div className="dp-check-row">
                  {[
                    { key: "history_diabetes", label: "Diabetes" },
                    { key: "history_hypertension", label: "Hypertension" },
                    { key: "history_asthma", label: "Asthma" },
                  ].map((f) => (
                    <label key={f.key} className="dp-check">
                      <input
                        type="checkbox"
                        checked={!!vitalsForm[f.key]}
                        onChange={(e) => setVitalsForm((s) => ({ ...s, [f.key]: e.target.checked }))}
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                  {/* Keep grid alignment */}
                  <div />
                  <div />
                  <div />
                </div>
              </div>
            </div>

            <div className="dp-actions">
              <button
                className="dp-btn-cancel"
                onClick={() => setVitalsModalPatient(null)}
                disabled={vitalsSaving}
              >
                Cancel
              </button>
              <button
                className="dp-btn-save"
                onClick={submitVitals}
                disabled={vitalsSaving}
                title="Save vitals to patient_vitals"
              >
                {vitalsSaving ? "Saving…" : "Save Vitals"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
