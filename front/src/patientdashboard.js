import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const API_URL = "http://127.0.0.1:5000";

export default function PatientDashboard() {

    const { patientId } = useParams();

    const { state } = useLocation();

    const patientName = state?.name || "Patient";

    const [vitals, setVitals] = useState([]);

    // ── Fetch Vitals ───────────────────────────────
    const fetchVitals = async () => {

        try {

            const response = await axios.get(
                `${API_URL}/patient-monitor/${patientId}`
            );

            setVitals(response.data.vitals);

        } catch (error) {

            console.log(error);

        }
    };

    // ── Auto Refresh ───────────────────────────────
    useEffect(() => {

        fetchVitals();

        const interval = setInterval(() => {

            fetchVitals();

        }, 5000);

        return () => clearInterval(interval);

    }, []);

    const latest = vitals[0];

    return (

        <div
            style={{
                minHeight: "100vh",
                background: "#F8FAFC",
                padding: "32px",
                fontFamily: "'DM Sans', sans-serif"
            }}
        >

            {/* ── Header ───────────────────────── */}
            <div
                style={{
                    marginBottom: "30px"
                }}
            >

                <h1
                    style={{
                        fontSize: "34px",
                        color: "#0F172A",
                        marginBottom: "8px"
                    }}
                >
                    ❤️ My Vital Signs
                </h1>

                <p
                    style={{
                        color: "#64748B",
                        fontSize: "15px"
                    }}
                >
                    Live health monitoring for {patientName}
                </p>

            </div>

            {/* ── Latest Vitals ───────────────── */}
            {latest && (

                <div
                    style={{
                        background: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "20px",
                        padding: "28px",
                        marginBottom: "28px",
                        boxShadow: "0 4px 14px rgba(15,23,42,0.05)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "24px",
                            flexWrap: "wrap",
                            gap: "15px"
                        }}
                    >

                        <div>

                            <h2
                                style={{
                                    color: "#0F172A",
                                    fontSize: "28px",
                                    marginBottom: "6px"
                                }}
                            >
                                {latest.name}
                            </h2>

                            <p
                                style={{
                                    color: "#64748B"
                                }}
                            >
                                🛏 Bed: {latest.bed}
                            </p>

                        </div>

                        <div
                            style={{
                                background:
                                    latest.risk_level === "CRITICAL"
                                        ? "#FEF2F2"
                                        : latest.risk_level === "WARNING"
                                        ? "#FFFBEB"
                                        : "#F0FDF4",

                                color:
                                    latest.risk_level === "CRITICAL"
                                        ? "#DC2626"
                                        : latest.risk_level === "WARNING"
                                        ? "#D97706"
                                        : "#16A34A",

                                padding: "10px 18px",
                                borderRadius: "12px",
                                fontWeight: "700",
                                fontSize: "14px"
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
                                "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "18px"
                        }}
                    >

                        <VitalCard
                            title="Heart Rate"
                            value={latest.heart_rate}
                            unit="BPM"
                            color="#DC2626"
                            icon="❤️"
                        />

                        <VitalCard
                            title="Oxygen"
                            value={latest.oxygen_level}
                            unit="%"
                            color="#2563EB"
                            icon="🫁"
                        />

                        <VitalCard
                            title="Temperature"
                            value={Number(
                                latest.temperature
                            ).toFixed(1)}
                            unit="°F"
                            color="#D97706"
                            icon="🌡"
                        />

                        <VitalCard
                            title="Blood Pressure"
                            value={`${latest.systolic_bp}/${latest.diastolic_bp}`}
                            unit="mmHg"
                            color="#7C3AED"
                            icon="🩸"
                        />

                    </div>

                </div>

            )}

            {/* ── Charts ───────────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(450px, 1fr))",
                    gap: "22px"
                }}
            >

                <ChartCard
                    title="❤️ Heart Rate Trend"
                    data={vitals}
                    dataKey="heart_rate"
                    stroke="#DC2626"
                />

                <ChartCard
                    title="🫁 Oxygen Trend"
                    data={vitals}
                    dataKey="oxygen_level"
                    stroke="#2563EB"
                />

                <ChartCard
                    title="🌡 Temperature Trend"
                    data={vitals}
                    dataKey="temperature"
                    stroke="#D97706"
                />

            </div>

        </div>

    );
}

// ── Vital Card ─────────────────────────────────────
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
                background: "#F8FAFC",
                borderRadius: "18px",
                padding: "22px",
                borderTop: `4px solid ${color}`
            }}
        >

            <h3
                style={{
                    color: "#334155",
                    marginBottom: "12px",
                    fontSize: "15px"
                }}
            >
                {icon} {title}
            </h3>

            <h1
                style={{
                    color,
                    fontSize: "34px",
                    marginBottom: "6px"
                }}
            >
                {value}
            </h1>

            <p
                style={{
                    color: "#64748B",
                    fontSize: "14px"
                }}
            >
                {unit}
            </p>

        </div>

    );
}

// ── Chart Card ─────────────────────────────────────
function ChartCard({
    title,
    data,
    dataKey,
    stroke
}) {

    return (

        <div
            style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 14px rgba(15,23,42,0.05)"
            }}
        >

            <h3
                style={{
                    marginBottom: "20px",
                    color: "#0F172A"
                }}
            >
                {title}
            </h3>

            <ResponsiveContainer
                width="100%"
                height={280}
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