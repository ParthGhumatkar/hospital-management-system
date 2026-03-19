import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import API_URL from "./config";

/* ─── Vital definitions ──────────────────────────────────────────────────── */
const VITAL_DEFS = [
  { key: "heart_rate",   label: "Heart Rate",   short: "HR",      unit: "bpm",   min: 60,   max: 100,  dec: 0 },
  { key: "systolic_bp",  label: "Systolic BP",  short: "Sys BP",  unit: "mmHg",  min: 90,   max: 120,  dec: 0 },
  { key: "diastolic_bp", label: "Diastolic BP", short: "Dia BP",  unit: "mmHg",  min: 60,   max: 80,   dec: 0 },
  { key: "spo2",         label: "SpO₂",         short: "SpO₂",    unit: "%",     min: 95,   max: 100,  dec: 1 },
  { key: "temperature",  label: "Temperature",  short: "Temp",    unit: "auto",  min: null, max: null, dec: 1 },
  { key: "bmi",          label: "BMI",          short: "BMI",     unit: "kg/m²", min: 18.5, max: 24.9, dec: 1 },
  { key: "blood_sugar",  label: "Blood Sugar",  short: "B.Sugar", unit: "mg/dL", min: 70,   max: 100,  dec: 0 },
];

const SYMPTOM_FLAGS = [
  { key: "fever",                label: "Fever"                },
  { key: "cough",                label: "Cough"                },
  { key: "fatigue",              label: "Fatigue"              },
  { key: "difficulty_breathing", label: "Difficulty Breathing" },
  { key: "chest_pain",           label: "Chest Pain"           },
  { key: "nausea",               label: "Nausea"               },
];

const HISTORY_FLAGS = [
  { key: "history_diabetes",     label: "Diabetes"     },
  { key: "history_hypertension", label: "Hypertension" },
  { key: "history_asthma",       label: "Asthma"       },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getTempMeta(raw) {
  if (raw == null) return { unit: "°F", min: 97, max: 99.5 };
  return raw < 50
    ? { unit: "°C", min: 36.1, max: 37.5 }
    : { unit: "°F", min: 97,   max: 99.5 };
}

function resolveVital(def, vitals) {
  const raw = parseFloat(vitals[def.key]);
  if (def.unit === "auto") {
    const m = getTempMeta(isNaN(raw) ? null : raw);
    return { raw, unit: m.unit, min: m.min, max: m.max };
  }
  return { raw, unit: def.unit, min: def.min, max: def.max };
}

function vitalStatus(raw, min, max) {
  if (raw == null || isNaN(raw)) return "unknown";
  if (raw >= min && raw <= max)  return "normal";
  const dev = raw < min ? min - raw : raw - max;
  return dev > (max - min) * 0.25 ? "critical" : "warning";
}

function healthScore(raw, min, max) {
  if (raw == null || isNaN(raw)) return 0;
  if (raw >= min && raw <= max) {
    const center    = (min + max) / 2;
    const halfRange = (max - min) / 2;
    return Math.round(100 - (Math.abs(raw - center) / halfRange) * 15);
  }
  const dev = raw < min ? min - raw : raw - max;
  return Math.max(5, Math.round(80 - (dev / ((max - min) * 0.5)) * 80));
}

const STATUS_STYLE = {
  normal:   { label: "Normal",  bg: "#F0FDF4", color: "#16A34A", border: "#86EFAC", bar: "#0F766E" },
  warning:  { label: "Review",  bg: "#FFFBEB", color: "#D97706", border: "#FCD34D", bar: "#F59E0B" },
  critical: { label: "Alert",   bg: "#FEF2F2", color: "#DC2626", border: "#FCA5A5", bar: "#EF4444" },
  unknown:  { label: "No Data", bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0", bar: "#CBD5E1" },
};

/* ─── VitalCard ──────────────────────────────────────────────────────────── */
function VitalCard({ def, vitals }) {
  const { raw, unit, min, max } = resolveVital(def, vitals);
  const status = vitalStatus(raw, min, max);
  const s      = STATUS_STYLE[status];
  const val    = !isNaN(raw) ? Number(raw).toFixed(def.dec) : "—";
  const rMin   = min != null ? Number(min).toFixed(def.dec) : "—";
  const rMax   = max != null ? Number(max).toFixed(def.dec) : "—";

  return (
    <div className="pv-vital-card" style={{ borderTop: `3px solid ${s.color}` }}>
      <div className="pv-vital-name">{def.label}</div>
      <div className="pv-vital-val-row">
        <span className="pv-vital-val">{val}</span>
        <span className="pv-vital-unit">{unit}</span>
      </div>
      <div className="pv-vital-range">Normal: {rMin}–{rMax}</div>
      <span className="pv-vital-badge"
        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
        {s.label}
      </span>
    </div>
  );
}

/* ─── Custom BarChart tooltip ────────────────────────────────────────────── */
function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const s = STATUS_STYLE[d.status] || STATUS_STYLE.unknown;
  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8,
      padding: "8px 12px", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)", lineHeight: 1.7,
    }}>
      <div style={{ fontWeight: 700, color: "#0F172A" }}>{d.label}</div>
      <div style={{ color: "#64748B" }}>
        Value: <strong style={{ color: "#0F172A" }}>{d.raw} {d.unit}</strong>
      </div>
      <div style={{ color: s.color }}>Status: <strong>{s.label}</strong></div>
      <div style={{ color: "#94A3B8" }}>Normal: {d.min}–{d.max} {d.unit}</div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function PatientVitals() {
  const { id }    = useParams();
  const { state } = useLocation();
  const navigate  = useNavigate();

  const patientName = state?.name || "Patient";
  const INI         = getInitials(patientName);

  const [vitals,  setVitals]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) { navigate("/"); return; }
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/patient_vitals/${id}`);
        const data = await res.json();
        if (data.error) { setError(data.error); return; }
        setVitals(data.vitals || null);
      } catch {
        setError("Could not load vitals. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  /* build chart data only when vitals are available */
  const chartData = vitals
    ? VITAL_DEFS.map((def) => {
        const { raw, unit, min, max } = resolveVital(def, vitals);
        const score  = healthScore(raw, min, max);
        const status = vitalStatus(raw, min, max);
        return {
          name: def.short, label: def.label,
          score, raw, unit,
          min: Number(min).toFixed(def.dec),
          max: Number(max).toFixed(def.dec),
          status,
          /* recharts Radar uses these keys */
          subject: def.label, fullMark: 100,
        };
      })
    : [];

  const goBack = () =>
    navigate("/home/patient", { state: { name: patientName, patientId: id } });

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });

  const doctorName = vitals?.doctor_name || null;
  const recordedAt = vitals?.recorded_at || null;
  const recordedDate = recordedAt
    ? new Date(recordedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" })
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pv-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        /* ── Header ── */
        .pv-header {
          background: #fff; border-bottom: 1px solid #E2E8F0;
          padding: 14px 40px; display: flex; align-items: center;
          justify-content: space-between; position: sticky; top: 0; z-index: 10;
        }
        .pv-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #0F766E;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .pv-logout-btn {
          padding: 8px 18px; background: #fff; border: 1.5px solid #E2E8F0;
          border-radius: 8px; color: #EF4444; font-weight: 600; font-size: 13px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }
        .pv-logout-btn:hover { background: #FEF2F2; border-color: #FECACA; }

        /* ── Main ── */
        .pv-main { max-width: 1060px; margin: 0 auto; padding: 28px 28px 60px; }

        /* ── Page head (back + title) ── */
        .pv-page-head { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
        .pv-info-banner {
          background: #F0FDFA;
          border: 1px solid #CCFBF1;
          color: #0F766E;
          border-radius: 12px;
          padding: 12px 14px;
          margin: -14px 0 22px;
          font-size: 13px;
          line-height: 1.5;
        }
        .pv-info-banner strong { color: #0D5F58; }
        .pv-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: 1.5px solid #E2E8F0; border-radius: 9px;
          padding: 8px 14px; font-size: 13px; font-weight: 600; color: #64748B;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          white-space: nowrap; margin-top: 2px;
        }
        .pv-back-btn:hover { border-color: #0F766E; color: #0F766E; background: #F0FDFA; }
        .pv-page-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(22px, 3vw, 28px); font-weight: 400; color: #0F172A;
        }
        .pv-page-sub { font-size: 13px; color: #64748B; margin-top: 3px; }

        /* ── Stat cards grid ── */
        .pv-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
          margin-bottom: 18px;
          align-items: stretch;
        }
        .pv-vital-card {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 12px;
          padding: 16px 18px; display: flex; flex-direction: column; gap: 3px;
          height: 100%;
          min-height: 160px; /* keep all vital cards visually identical height */
        }
        .pv-vital-name {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.07em; color: #94A3B8;
        }
        .pv-vital-val-row { display: flex; align-items: baseline; gap: 5px; margin-top: 4px; }
        .pv-vital-val  { font-size: 30px; font-weight: 700; color: #0F172A; line-height: 1.1; }
        .pv-vital-unit { font-size: 12px; color: #64748B; }
        .pv-vital-range { font-size: 11px; color: #CBD5E1; margin-top: 7px; }
        .pv-vital-badge {
          display: inline-flex; align-self: flex-start;
          font-size: 11px; font-weight: 600; padding: 3px 10px;
          border-radius: 20px; margin-top: 6px;
        }

        /* ── Charts row ── */
        .pv-charts-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; margin-bottom: 16px;
        }
        .pv-chart-card {
          background: #fff; border: 1px solid #E2E8F0;
          border-radius: 14px; padding: 20px 20px 10px;
        }
        .pv-chart-title {
          font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 6px;
        }
        .pv-chart-sub {
          font-size: 11px; color: #94A3B8; margin-bottom: 14px;
        }

        /* ── Flags card ── */
        .pv-flags-card {
          background: #fff; border: 1px solid #E2E8F0;
          border-radius: 14px; padding: 20px 24px;
        }
        .pv-section-head {
          display: flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.07em; color: #0F766E;
          padding-bottom: 8px; border-bottom: 1px solid #CCFBF1;
          margin-bottom: 12px;
        }
        .pv-section-head + .pv-section-head { margin-top: 20px; }
        .pv-flags-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
        .pv-flag {
          font-size: 12px; font-weight: 600; padding: 5px 14px;
          border-radius: 20px; display: inline-flex; align-items: center; gap: 5px;
        }
        .pv-flag-yes     { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
        .pv-flag-no      { background: #F8FAFC; color: #94A3B8; border: 1px solid #E2E8F0; }
        .pv-flag-history { background: #FFF7ED; color: #D97706; border: 1px solid #FDE68A; }

        /* ── Empty / error state ── */
        .pv-empty {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
          display: flex; flex-direction: column; align-items: center;
          padding: 56px 24px; gap: 10px; text-align: center;
        }
        .pv-empty-icon {
          width: 56px; height: 56px; border-radius: 50%; background: #F0FDFA;
          display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
        }
        .pv-empty-title { font-size: 16px; font-weight: 600; color: #0F172A; }
        .pv-empty-sub   { font-size: 13px; color: #64748B; max-width: 340px; line-height: 1.6; }

        /* ── Loading ── */
        .pv-loading {
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; font-size: 14px; color: #94A3B8;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Legend dot for BarChart ── */
        .pv-legend { display: flex; gap: 16px; margin-top: 8px; justify-content: center; }
        .pv-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #64748B; }
        .pv-legend-dot  { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }

        @media (max-width: 768px) {
          .pv-header  { padding: 12px 16px; }
          .pv-main    { padding: 20px 14px 48px; }
          .pv-charts-row { grid-template-columns: 1fr; }
          .pv-stat-grid  { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        }
        @media (max-width: 480px) {
          .pv-stat-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        }
      `}</style>

      {loading ? (
        <div className="pv-loading">Loading vitals…</div>
      ) : (
        <div className="pv-body">

          {/* ── Header ── */}
          <header className="pv-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="pv-avatar">{INI}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{patientName}</div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>Patient Portal</div>
              </div>
            </div>
            <button className="pv-logout-btn" onClick={() => navigate("/")}>Sign Out</button>
          </header>

          <main className="pv-main">

            {/* ── Page head ── */}
            <div className="pv-page-head">
              <button className="pv-back-btn" onClick={goBack}>
                <svg width="13" height="13" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Dashboard
              </button>
              <div>
                <h1 className="pv-page-title">Vital Signs</h1>
                <p className="pv-page-sub">
                  {vitals ? "Your latest recorded health measurements" : "No vitals recorded yet"} · {today}
                </p>
              </div>
            </div>

            {/* ── Recorded info banner ── */}
            {vitals && (
              <div className="pv-info-banner">
                {doctorName
                  ? <>Recorded by <strong>Dr. {doctorName}</strong></>
                  : <>Recorded by <strong>hospital staff</strong></>}
                {recordedDate && (
                  <div style={{ marginTop: 6 }}>
                    Last updated: <strong>{recordedDate}</strong>
                  </div>
                )}
              </div>
            )}

            {/* ── No vitals ── */}
            {error || !vitals ? (
              <div className="pv-empty">
                <div className="pv-empty-icon">
                  <svg width="26" height="26" fill="none" stroke="#0F766E" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div className="pv-empty-title">No vitals on record</div>
                <div className="pv-empty-sub">
                  {error || "Your vitals haven't been recorded yet. Ask your doctor or nurse to enter them."}
                </div>
              </div>
            ) : (
              <>

                {/* ── Stat cards ── */}
                <div className="pv-stat-grid">
                  {VITAL_DEFS.map((def) => (
                    <VitalCard key={def.key} def={def} vitals={vitals} />
                  ))}
                </div>

                {/* ── Charts ── */}
                <div className="pv-charts-row">

                  {/* Left — Health score bar chart */}
                  <div className="pv-chart-card">
                    <div className="pv-chart-title">Health Score by Vital</div>
                    <div className="pv-chart-sub">0–100 score (higher = closer to normal range)</div>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={chartData}
                        margin={{ top: 4, right: 16, left: -18, bottom: 0 }}
                        barCategoryGap="30%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}
                          axisLine={false} tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 11, fill: "#CBD5E1", fontFamily: "'DM Sans', sans-serif" }}
                          axisLine={false} tickLine={false}
                        />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: "#F8FAFC" }} />
                        <ReferenceLine
                          y={85}
                          stroke="#0F766E"
                          strokeDasharray="5 3"
                          strokeWidth={1.5}
                        />
                        <Bar dataKey="score" radius={[5, 5, 0, 0]} maxBarSize={40}>
                          {chartData.map((entry, idx) => (
                            <Cell
                              key={idx}
                              fill={STATUS_STYLE[entry.status]?.bar || "#CBD5E1"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="pv-legend">
                      {[["#0F766E", "Normal"], ["#F59E0B", "Review"], ["#EF4444", "Alert"]].map(([color, label]) => (
                        <div key={label} className="pv-legend-item">
                          <div className="pv-legend-dot" style={{ background: color }} />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right — Radar chart */}
                  <div className="pv-chart-card">
                    <div className="pv-chart-title">Health Radar</div>
                    <div className="pv-chart-sub">Visual overview across all vital dimensions</div>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart
                        data={chartData}
                        cx="50%" cy="50%"
                        outerRadius="68%"
                        margin={{ top: 0, right: 30, bottom: 0, left: 30 }}
                      >
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fontSize: 10, fill: "#64748B", fontFamily: "'DM Sans', sans-serif" }}
                        />
                        <PolarRadiusAxis
                          angle={90} domain={[0, 100]}
                          tick={false} axisLine={false}
                        />
                        <Radar
                          name="Health Score"
                          dataKey="score"
                          stroke="#0F766E"
                          fill="#0F766E"
                          fillOpacity={0.18}
                          strokeWidth={2}
                          dot={{ r: 3, fill: "#0F766E", strokeWidth: 0 }}
                        />
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value} / 100`,
                            props.payload.label,
                          ]}
                          contentStyle={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                            borderRadius: 8, border: "1px solid #E2E8F0",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                </div>

                {/* ── Symptoms & history flags ── */}
                <div className="pv-flags-card">

                  <div className="pv-section-head">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Reported Symptoms
                  </div>
                  <div className="pv-flags-row">
                    {SYMPTOM_FLAGS.map(({ key, label }) => (
                      <span
                        key={key}
                        className={`pv-flag ${vitals[key] ? "pv-flag-yes" : "pv-flag-no"}`}
                      >
                        {vitals[key] ? "● " : ""}{label}
                      </span>
                    ))}
                  </div>

                  <div className="pv-section-head" style={{ marginTop: 20 }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Medical History
                  </div>
                  <div className="pv-flags-row">
                    {HISTORY_FLAGS.map(({ key, label }) => (
                      <span
                        key={key}
                        className={`pv-flag ${vitals[key] ? "pv-flag-history" : "pv-flag-no"}`}
                      >
                        {vitals[key] ? "● " : ""}{label}
                      </span>
                    ))}
                  </div>

                </div>

              </>
            )}

          </main>
        </div>
      )}
    </>
  );
}
