import React, { useEffect, useState, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DocReport() {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthFilter, setMonthFilter] = useState(""); // 'YYYY-MM'
  const [compareMode, setCompareMode] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState([]); // comparison
  const [selectedDoctorId, setSelectedDoctorId] = useState(null); // individual

  // ---------------- Fetch Data from Flask API ----------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = monthFilter ? `?month=${monthFilter}-01` : "";
      const res = await fetch(`http://127.0.0.1:5000/doctor_performance${query}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPerformanceData(data.performance || []);
    } catch (err) {
      console.error("Error fetching performance:", err);
      setError("Failed to load performance data");
    }
    setLoading(false);
  }, [monthFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------- Handle doctor selection ----------------
  const handleDoctorClick = (id) => {
    if (!compareMode) setSelectedDoctorId(id);
  };

  const handleDoctorSelect = (id) => {
    setSelectedDoctors((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  // ---------------- Prepare chart data ----------------
  const chartData = () => {
    if (compareMode && selectedDoctors.length > 0) {
      const labels = ["Total Appointments", "Completed Appointments", "Missed Appointments"];
      const colors = [
        "rgba(54, 162, 235, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(255, 99, 132, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(153, 102, 255, 0.6)",
      ];
      const datasets = selectedDoctors
        .map((docId, index) => {
          const doc = performanceData.find((d) => d.id === docId);
          if (!doc) return null;
          return {
            label: doc.name,
            data: [doc.total_appointments, doc.completed_appointments, doc.missed_appointments],
            backgroundColor: colors[index % colors.length],
          };
        })
        .filter(Boolean);
      return { labels, datasets };
    } else if (selectedDoctorId) {
      const doc = performanceData.find((d) => d.id === selectedDoctorId);
      if (!doc) return { labels: [], datasets: [] };
      return {
        labels: ["Total Appointments", "Completed Appointments", "Missed Appointments"],
        datasets: [
          {
            label: doc.name,
            data: [doc.total_appointments, doc.completed_appointments, doc.missed_appointments],
            backgroundColor: [
              "rgba(54, 162, 235, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(255, 99, 132, 0.6)",
            ],
          },
        ],
      };
    } else {
      return { labels: [], datasets: [] };
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: compareMode
          ? "Comparison Report"
          : selectedDoctorId
          ? "Doctor Performance Report"
          : "Select a doctor to view chart",
      },
    },
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Poppins, sans-serif",
        height: "100vh",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Doctor Performance Report</h2>

      {/* Month Filter */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="month">Filter by Month: </label>
        <input
          type="month"
          id="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        />
        <button onClick={fetchData} style={{ marginLeft: "10px", padding: "5px 10px" }}>
          Apply
        </button>
      </div>

      {/* Compare Toggle */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          <input
            type="checkbox"
            checked={compareMode}
            onChange={() => {
              setCompareMode((prev) => !prev);
              setSelectedDoctors([]);
              setSelectedDoctorId(null);
            }}
            style={{ marginRight: "8px" }}
          />
          Comparison Mode
        </label>
      </div>

      {/* Doctor List */}
      {performanceData.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <strong>Doctors:</strong>
          <div
            style={{
              marginTop: "10px",
              lineHeight: "1.5",
              maxHeight: "140px",
              overflowY: "auto",
              paddingRight: "5px",
            }}
          >
            {performanceData.map((doc, index) => (
              <div key={doc.id} style={{ margin: "2px 0", fontSize: "12pt" }}>
                {!compareMode ? (
                  <span
                    onClick={() => handleDoctorClick(doc.id)}
                    style={{
                      cursor: "pointer",
                      borderBottom: selectedDoctorId === doc.id ? "1px solid #16a085" : "none",
                      padding: "2px",
                    }}
                  >
                    {String.fromCharCode(97 + index)}. {doc.name}
                  </span>
                ) : (
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedDoctors.includes(doc.id)}
                      onChange={() => handleDoctorSelect(doc.id)}
                      style={{ marginRight: "3px" }}
                    />
                    {String.fromCharCode(97 + index)}. {doc.name}
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading / Error */}
      {loading && <p>Loading performance data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Chart */}
      {!loading &&
      !error &&
      ((selectedDoctorId && !compareMode) || (compareMode && selectedDoctors.length > 0)) ? (
        <div style={{ width: "100%", minHeight: "300px" }}>
          <Bar data={chartData()} options={chartOptions} />
        </div>
      ) : (
        !loading && !error && <p>Select a doctor to view chart.</p>
      )}
    </div>
  );
}

export default DocReport;
