import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DoctorDashboard() {

    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState({});

    // ── Fetch Dashboard Data ─────────────────────────
    const fetchDashboardData = async () => {

        try {

            const response = await axios.get(
                "http://127.0.0.1:5000/doctor-dashboard-data"
            );

            setPatients(response.data.patients);
            setStats(response.data.stats);

        } catch (error) {

            console.log(error);

        }
    };

    // ── Auto Refresh Every 5 Seconds ─────────────────
    useEffect(() => {

        fetchDashboardData();

        const interval = setInterval(() => {

            fetchDashboardData();

        }, 5000);

        return () => clearInterval(interval);

    }, []);

    return (

        <div
            style={{
                padding: "30px",
                backgroundColor: "#f5f7fa",
                minHeight: "100vh",
                fontFamily: "Arial"
            }}
        >

            {/* ── Header ───────────────────────────── */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px"
                }}
            >

                <h1 style={{ color: "#1e293b" }}>
                    🏥 ICU Patient Monitor
                </h1>

                <h3 style={{ color: "#64748b" }}>
                    Select Patient For Live Monitoring
                </h3>

            </div>

            {/* ── Stats Cards ───────────────────── */}
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    marginBottom: "30px",
                    flexWrap: "wrap"
                }}
            >

                <div style={cardStyle("#dc2626")}>
                    <h2>🚨 Critical</h2>
                    <h1>{stats.critical || 0}</h1>
                </div>

                <div style={cardStyle("#f59e0b")}>
                    <h2>⚠ Warning</h2>
                    <h1>{stats.warning || 0}</h1>
                </div>

                <div style={cardStyle("#16a34a")}>
                    <h2>✅ Normal</h2>
                    <h1>{stats.normal || 0}</h1>
                </div>

            </div>

            {/* ── Patient List ─────────────────── */}
            <div
                style={{
                    backgroundColor: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                }}
            >

                <h2
                    style={{
                        marginBottom: "25px",
                        color: "#1e293b"
                    }}
                >
                    🩺 ICU Patients
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px"
                    }}
                >

                    {patients.map((patient, index) => (

                        <div
                            key={index}

                            onClick={() =>
                                navigate(
                                    `/patient-monitor/${patient.patient_id}`
                                )
                            }

                            style={{
                                backgroundColor: "#f8fafc",
                                padding: "20px",
                                borderRadius: "12px",
                                cursor: "pointer",
                                border: "1px solid #e2e8f0",
                                transition: "0.2s",
                                boxShadow:
                                    "0 2px 5px rgba(0,0,0,0.05)"
                            }}

                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    "scale(1.03)";
                            }}

                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    "scale(1)";
                            }}
                        >

                            <h3
                                style={{
                                    marginBottom: "12px",
                                    color: "#0f172a"
                                }}
                            >
                                {patient.name}
                            </h3>

                            <p
                                style={{
                                    color: "#64748b",
                                    marginBottom: "8px"
                                }}
                            >
                                🛏 Bed: {patient.bed}
                            </p>

                            <button
                                style={{
                                    marginTop: "10px",
                                    backgroundColor: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 15px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                Open Live Monitor →
                            </button>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );
}

// ── Card Style ───────────────────────────────────────
const cardStyle = (color) => ({
    backgroundColor: color,
    color: "white",
    padding: "20px",
    borderRadius: "12px",
    width: "250px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
});

export default DoctorDashboard;