import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "./config";

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

        @media (max-width: 768px) {
          .dp-header { padding: 12px 16px; }
          .dp-main { padding: 20px 14px 48px; }
          .dp-layout { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dp-body">
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
    </>
  );
}
