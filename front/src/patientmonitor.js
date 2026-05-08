import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function PatientMonitor() {

    const { patientId } = useParams();

    const [vitals, setVitals] = useState([]);

    // ── Fetch Patient Vitals ────────────────────────
    const fetchVitals = async () => {

        try {

            const response = await axios.get(
                `http://127.0.0.1:5000/patient-monitor/${patientId}`
            );

            setVitals(response.data.vitals);

        } catch (error) {

            console.log(error);

        }
    };

    // ── Auto Refresh Every 5 Seconds ────────────────
    useEffect(() => {

        fetchVitals();

        const interval = setInterval(() => {

            fetchVitals();

        }, 5000);

        return () => clearInterval(interval);

    }, []);

    // ── Latest Record ───────────────────────────────
    const latest = vitals[0];

    return (

        <div
            style={{
                padding: "30px",
                backgroundColor: "#f4f7fb",
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
                    marginBottom: "30px",
                    flexWrap: "wrap",
                    gap: "20px"
                }}
            >

                <div>

                    <h1
                        style={{
                            fontSize: "38px",
                            color: "#1e3a8a",
                            marginBottom: "10px"
                        }}
                    >
                        🩺 Live Patient Monitor
                    </h1>

                    <p
                        style={{
                            color: "#64748b",
                            fontSize: "16px"
                        }}
                    >
                        Real-Time ICU Monitoring & Analytics
                    </p>

                </div>

                {/* Live Status */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "white",
                        padding: "12px 18px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
                    }}
                >

                    <div
                        style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            backgroundColor: "#22c55e",
                            boxShadow: "0 0 10px #22c55e"
                        }}
                    />

                    <span
                        style={{
                            color: "#0f172a",
                            fontWeight: "bold"
                        }}
                    >
                        LIVE STREAMING
                    </span>

                </div>

            </div>

            {/* ── Critical Alert Banner ───────────── */}
            {
                latest?.risk_level === "CRITICAL" && (

                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, #dc2626, #ef4444)",
                            color: "white",
                            padding: "18px",
                            borderRadius: "14px",
                            marginBottom: "25px",
                            fontWeight: "bold",
                            fontSize: "18px",
                            boxShadow:
                                "0 4px 15px rgba(239,68,68,0.3)"
                        }}
                    >

                        🚨 CRITICAL PATIENT CONDITION DETECTED

                    </div>

                )
            }

            {/* ── Patient Summary Card ───────────── */}
            {latest && (

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "20px",
                        marginBottom: "30px",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
                    }}
                >

                    {/* Top Info */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "30px",
                            flexWrap: "wrap",
                            gap: "20px"
                        }}
                    >

                        <div>

                            <h2
                                style={{
                                    fontSize: "32px",
                                    color: "#0f172a",
                                    marginBottom: "10px"
                                }}
                            >
                                {latest.name}
                            </h2>

                            <p
                                style={{
                                    color: "#64748b",
                                    fontSize: "17px"
                                }}
                            >
                                🛏 Bed: {latest.bed}
                            </p>

                        </div>

                        {/* Risk Badge */}
                        <div
                            style={{
                                padding: "12px 24px",
                                borderRadius: "12px",
                                fontWeight: "bold",
                                fontSize: "17px",

                                backgroundColor:
                                    latest.risk_level === "CRITICAL"
                                        ? "#fee2e2"
                                        : latest.risk_level === "WARNING"
                                        ? "#fef3c7"
                                        : "#dcfce7",

                                color:
                                    latest.risk_level === "CRITICAL"
                                        ? "#dc2626"
                                        : latest.risk_level === "WARNING"
                                        ? "#d97706"
                                        : "#16a34a"
                            }}
                        >

                            {latest.risk_level}

                        </div>

                    </div>

                    {/* ── Vital Cards ───────────── */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: "20px"
                        }}
                    >

                        <VitalCard
                            title="Heart Rate"
                            value={latest.heart_rate}
                            unit="BPM"
                            color="#ef4444"
                            icon="❤️"
                        />

                        <VitalCard
                            title="Oxygen Level"
                            value={latest.oxygen_level}
                            unit="%"
                            color="#2563eb"
                            icon="🫁"
                        />

                        <VitalCard
                            title="Temperature"
                            value={Number(latest.temperature).toFixed(1)}
                            unit="°F"
                            color="#f59e0b"
                            icon="🌡"
                        />

                        <BloodPressureCard
                            systolic={latest.systolic_bp}
                            diastolic={latest.diastolic_bp}
                        />

                    </div>

                </div>

            )}

            {/* ── Charts Section ─────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(500px, 1fr))",
                    gap: "25px",
                    marginBottom: "30px"
                }}
            >

                <ChartCard
                    title="❤️ Heart Rate Trend"
                    data={vitals}
                    dataKey="heart_rate"
                    stroke="#ef4444"
                />

                <ChartCard
                    title="🫁 Oxygen Level Trend"
                    data={vitals}
                    dataKey="oxygen_level"
                    stroke="#2563eb"
                />

                <ChartCard
                    title="🌡 Temperature Trend"
                    data={vitals}
                    dataKey="temperature"
                    stroke="#f59e0b"
                />

            </div>

            {/* ── History Table ─────────────────── */}
            <div
                style={{
                    backgroundColor: "white",
                    padding: "25px",
                    borderRadius: "20px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
                }}
            >

                <h2
                    style={{
                        marginBottom: "25px",
                        color: "#1e3a8a"
                    }}
                >
                    📋 Vitals History
                </h2>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: "0 10px"
                    }}
                >

                    <thead>

                        <tr
                            style={{
                                color: "#64748b"
                            }}
                        >

                            <th>Heart Rate</th>
                            <th>Oxygen</th>
                            <th>Temperature</th>
                            <th>Blood Pressure</th>
                            <th>Risk</th>
                            <th>Timestamp</th>

                        </tr>

                    </thead>

                    <tbody>

                        {vitals.map((vital, index) => (

                            <tr
                                key={index}
                                style={{
                                    backgroundColor: "#f8fafc"
                                }}
                            >

                                <td style={tableCell}>
                                    {vital.heart_rate}
                                </td>

                                <td style={tableCell}>
                                    {vital.oxygen_level}
                                </td>

                                <td style={tableCell}>
                                    {Number(vital.temperature).toFixed(1)}
                                </td>

                                <td style={tableCell}>
                                    {vital.systolic_bp}/
                                    {vital.diastolic_bp}
                                </td>

                                <td style={tableCell}>

                                    <span
                                        style={{
                                            color:
                                                vital.risk_level === "CRITICAL"
                                                    ? "#dc2626"
                                                    : vital.risk_level === "WARNING"
                                                    ? "#d97706"
                                                    : "#16a34a",
                                            fontWeight: "bold"
                                        }}
                                    >

                                        {vital.risk_level}

                                    </span>

                                </td>

                                <td style={tableCell}>
                                    {vital.timestamp}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );
}

// ── Vital Card ───────────────────────────────────────
function VitalCard({
    title,
    value,
    unit,
    color,
    icon
}) {

    return (

        <div
            style={{
                backgroundColor: "#f8fafc",
                padding: "25px",
                borderRadius: "18px",
                borderTop: `5px solid ${color}`,
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}
        >

            <h3
                style={{
                    marginBottom: "15px",
                    color: "#334155"
                }}
            >
                {icon} {title}
            </h3>

            <h1
                style={{
                    color,
                    fontSize: "34px",
                    marginBottom: "10px",
                    wordBreak: "break-word"
                }}
            >
                {value}
            </h1>

            <p
                style={{
                    color: "#64748b"
                }}
            >
                {unit}
            </p>

        </div>

    );
}

// ── Blood Pressure Card ─────────────────────────────
function BloodPressureCard({
    systolic,
    diastolic
}) {

    return (

        <div
            style={{
                backgroundColor: "#f8fafc",
                padding: "25px",
                borderRadius: "18px",
                borderTop: "5px solid #8b5cf6",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}
        >

            <h3
                style={{
                    marginBottom: "15px",
                    color: "#334155"
                }}
            >
                🩸 Blood Pressure
            </h3>

            <h1
                style={{
                    color: "#8b5cf6",
                    fontSize: "34px",
                    marginBottom: "10px",
                    wordBreak: "break-word"
                }}
            >
                {systolic}/{diastolic}
            </h1>

            <p
                style={{
                    color: "#64748b"
                }}
            >
                mmHg
            </p>

        </div>

    );
}

// ── Chart Card ───────────────────────────────────────
function ChartCard({
    title,
    data,
    dataKey,
    stroke
}) {

    return (

        <div
            style={{
                backgroundColor: "white",
                padding: "25px",
                borderRadius: "20px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
            }}
        >

            <h3
                style={{
                    marginBottom: "20px",
                    color: "#1e3a8a"
                }}
            >
                {title}
            </h3>

            <ResponsiveContainer
                width="100%"
                height={300}
            >

                <LineChart
                    data={[...data].reverse()}
                >

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="timestamp"
                        hide
                    />

                    <YAxis />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={stroke}
                        strokeWidth={4}
                        dot={false}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );
}

// ── Table Cell Style ────────────────────────────────
const tableCell = {
    padding: "15px",
    textAlign: "center",
    color: "#0f172a"
};

export default PatientMonitor;