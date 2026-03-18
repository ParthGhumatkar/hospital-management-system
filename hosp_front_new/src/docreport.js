import React, { useEffect, useState, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import API_URL from "./config";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DocReport() {
  const location = useLocation();
  const navigate = useNavigate();

  /* state may come from doctor dashboard or HOD dashboard */
  const callerName     = location.state?.name || location.state?.hodName || null;
  const callerIsDoctor = !!location.state?.doctorId;
  const callerId       = location.state?.doctorId || null;
  const hodId          = location.state?.id || localStorage.getItem("hod_id") || null;

  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [monthFilter, setMonthFilter] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    try {
      let url;
      if (!callerIsDoctor && hodId) {
        const params = new URLSearchParams({ hod_id: hodId });
        if (monthFilter) params.set("month", `${monthFilter}-01`);
        url = `${API_URL}/hod/reports?${params}`;
      } else {
        const query = monthFilter ? `?month=${monthFilter}-01` : "";
        url = `${API_URL}/doctor_performance${query}`;
      }
      const res  = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPerformanceData(data.reports || data.performance || []);
    } catch {
      setHasError(true);
    }
    setLoading(false);
  }, [callerIsDoctor, hodId, monthFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const uniqueDoctors = [...new Map(
    performanceData.map((d) => [d.doctor_id, d])
  ).values()];

  const handleDoctorClick = (id) => { if (!compareMode) setSelectedDoctorId(id); };

  const handleDoctorSelect = (id) => {
    setSelectedDoctors((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const CHART_COLORS = [
    "rgba(59,130,246,0.7)",
    "rgba(16,185,129,0.7)",
    "rgba(239,68,68,0.7)",
    "rgba(245,158,11,0.7)",
    "rgba(139,92,246,0.7)",
  ];

  const chartData = () => {
    const labels = ["Total Appointments", "Completed", "Missed"];
    if (compareMode && selectedDoctors.length > 0) {
      return {
        labels,
        datasets: selectedDoctors
          .map((docId, i) => {
            const doc = performanceData.find((d) => d.id === docId);
            if (!doc) return null;
            return {
              label: doc.name,
              data: [doc.total_appointments, doc.completed_appointments, doc.missed_appointments],
              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              borderRadius: 6,
            };
          })
          .filter(Boolean),
      };
    }
    if (selectedDoctorId) {
      const doc = performanceData.find((d) => d.id === selectedDoctorId);
      if (!doc) return { labels: [], datasets: [] };
      return {
        labels,
        datasets: [{
          label: doc.name,
          data: [doc.total_appointments, doc.completed_appointments, doc.missed_appointments],
          backgroundColor: ["rgba(59,130,246,0.7)", "rgba(16,185,129,0.7)", "rgba(239,68,68,0.7)"],
          borderRadius: 6,
        }],
      };
    }
    return { labels: [], datasets: [] };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: false,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#F1F5F9" }, beginAtZero: true },
    },
  };

  const showChart = !loading && !hasError &&
    ((selectedDoctorId && !compareMode) || (compareMode && selectedDoctors.length > 0));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dr-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .dr-header {
          background: #fff; border-bottom: 1px solid #E2E8F0; padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .dr-header-left { display: flex; align-items: center; gap: 10px; }
        .dr-logo-icon {
          width: 40px; height: 40px; border-radius: 10px; background: #EFF6FF;
          display: flex; align-items: center; justify-content: center;
        }

        .dr-main { max-width: 1000px; margin: 0 auto; padding: 32px 28px 60px; }

        .dr-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; margin-bottom: 28px;
          transition: border-color 0.15s, color 0.15s;
        }
        .dr-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .dr-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 14px;
        }

        .dr-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 22px; margin-bottom: 20px; }

        /* Controls row */
        .dr-controls { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }

        .dr-filter-group { display: flex; align-items: center; gap: 8px; }
        .dr-filter-label { font-size: 13px; font-weight: 500; color: #475569; white-space: nowrap; }

        .dr-month-input {
          padding: 7px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; color: #334155;
          background: #fff; outline: none; transition: border-color 0.15s;
        }
        .dr-month-input:focus { border-color: #93C5FD; }

        .dr-apply-btn {
          padding: 7px 16px; background: #185FA5; color: #fff;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; white-space: nowrap;
        }
        .dr-apply-btn:hover { background: #1a6fc4; }

        /* Toggle switch */
        .dr-toggle-wrap { display: flex; align-items: center; gap: 8px; margin-left: auto; }
        .dr-toggle-label { font-size: 13px; font-weight: 500; color: #475569; }
        .dr-toggle {
          width: 42px; height: 24px; border-radius: 12px; border: none;
          cursor: pointer; position: relative; transition: background 0.2s;
          flex-shrink: 0;
        }
        .dr-toggle::after {
          content: ''; position: absolute; top: 3px; width: 18px; height: 18px;
          border-radius: 50%; background: #fff;
          transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .dr-toggle.off { background: #CBD5E1; }
        .dr-toggle.off::after { left: 3px; }
        .dr-toggle.on { background: #185FA5; }
        .dr-toggle.on::after { left: 21px; }

        /* Doctor list */
        .dr-doctor-list { display: flex; flex-wrap: wrap; gap: 8px; }

        .dr-doc-chip {
          display: flex; align-items: center; gap: 6px; padding: 6px 14px;
          border-radius: 20px; border: 1.5px solid #E2E8F0; background: #fff;
          font-size: 13px; font-weight: 500; color: #475569; cursor: pointer;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .dr-doc-chip:hover { border-color: #BFDBFE; color: #1D4ED8; background: #EFF6FF; }
        .dr-doc-chip.selected { border-color: #1D4ED8; background: #EFF6FF; color: #1D4ED8; font-weight: 600; }

        .dr-doc-chip input[type="checkbox"] {
          width: 14px; height: 14px; accent-color: #185FA5; cursor: pointer;
        }

        /* Empty / loading states */
        .dr-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 48px 24px; gap: 10px; text-align: center;
        }
        .dr-empty-icon {
          width: 64px; height: 64px; border-radius: 50%; background: #EFF6FF;
          display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
        }
        .dr-empty-title { font-size: 15px; font-weight: 600; color: #334155; }
        .dr-empty-sub { font-size: 13px; color: #94A3B8; max-width: 340px; line-height: 1.6; }

        .dr-prompt {
          display: flex; flex-direction: column; align-items: center;
          padding: 40px 24px; gap: 8px; text-align: center;
        }
        .dr-prompt-title { font-size: 14px; font-weight: 600; color: #475569; }
        .dr-prompt-sub { font-size: 13px; color: #94A3B8; }

        @media (max-width: 640px) {
          .dr-header { padding: 12px 16px; }
          .dr-main { padding: 20px 14px 48px; }
          .dr-controls { flex-direction: column; align-items: flex-start; }
          .dr-toggle-wrap { margin-left: 0; }
        }
      `}</style>

      <div className="dr-body">
        {/* ── Header ── */}
        <header className="dr-header">
          <div className="dr-header-left">
            <div className="dr-logo-icon">
              <svg width="22" height="22" fill="none" stroke="#1D4ED8" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>Performance Reports</div>
              {callerName && (
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{callerName}</div>
              )}
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        <main className="dr-main">
          {/* Back button */}
          <button
            className="dr-back-btn"
            onClick={() => {
              if (callerIsDoctor) {
                navigate("/home/doctor", { state: { doctorId: callerId, name: callerName } });
              } else {
                navigate(-1);
              }
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>

          {/* Controls card */}
          <p className="dr-section-title">Filters &amp; Options</p>
          <div className="dr-card">
            <div className="dr-controls">
              <div className="dr-filter-group">
                <label htmlFor="dr-month" className="dr-filter-label">Month</label>
                <input
                  id="dr-month"
                  type="month"
                  className="dr-month-input"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                />
                <button className="dr-apply-btn" onClick={fetchData}>Apply</button>
                {monthFilter && (
                  <button
                    className="dr-apply-btn"
                    style={{ background: "#F1F5F9", color: "#64748B" }}
                    onClick={() => { setMonthFilter(""); }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="dr-toggle-wrap">
                <span className="dr-toggle-label">Comparison Mode</span>
                <button
                  className={`dr-toggle ${compareMode ? "on" : "off"}`}
                  onClick={() => {
                    setCompareMode((p) => !p);
                    setSelectedDoctors([]);
                    setSelectedDoctorId(null);
                  }}
                  aria-label="Toggle comparison mode"
                />
              </div>
            </div>
          </div>

          {/* Doctor selector */}
          {!loading && !hasError && uniqueDoctors.length > 0 && (
            <>
              <p className="dr-section-title">
                {compareMode ? "Select Doctors to Compare" : "Select a Doctor"}
              </p>
              <div className="dr-card" style={{ padding: "18px 22px" }}>
                <div className="dr-doctor-list">
                  {uniqueDoctors.map((doc) => (
                    <div key={doc.id}>
                      {compareMode ? (
                        <label
                          className={`dr-doc-chip${selectedDoctors.includes(doc.id) ? " selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDoctors.includes(doc.id)}
                            onChange={() => handleDoctorSelect(doc.id)}
                          />
                          {doc.name}
                        </label>
                      ) : (
                        <button
                          className={`dr-doc-chip${selectedDoctorId === doc.id ? " selected" : ""}`}
                          onClick={() => handleDoctorClick(doc.id)}
                        >
                          {doc.name}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Chart / states */}
          <p className="dr-section-title">Chart</p>
          <div className="dr-card">
            {loading ? (
              <div className="dr-prompt">
                <div style={{ fontSize: 13, color: "#94A3B8" }}>Loading performance data…</div>
              </div>
            ) : hasError || performanceData.length === 0 ? (
              <div className="dr-empty">
                <div className="dr-empty-icon">
                  <svg width="28" height="28" fill="none" stroke="#93C5FD" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div className="dr-empty-title">No performance data yet</div>
                <div className="dr-empty-sub">
                  Performance metrics will appear here once appointments have been completed and
                  doctor performance records have been entered into the system.
                </div>
              </div>
            ) : showChart ? (
              <div style={{ padding: "8px 0" }}>
                <Bar data={chartData()} options={chartOptions} />
              </div>
            ) : (
              <div className="dr-prompt">
                <div className="dr-prompt-title">
                  {compareMode ? "Select doctors above to compare" : "Select a doctor above to view their chart"}
                </div>
                <div className="dr-prompt-sub">
                  {compareMode
                    ? "Tick two or more doctors to see a side-by-side comparison."
                    : "Click a doctor chip to load their appointments, completions, and missed stats."}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
