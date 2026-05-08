import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "./config";

export default function PsychiatristDashboard() {

  const navigate = useNavigate();
  const { state } = useLocation();

  const doctorId = state?.doctorId;

  const [patients, setPatients] = useState([]);

  useEffect(() => {

    if (!doctorId) return;

    fetch(`${API_URL}/psychiatrist_patients/${doctorId}`)
      .then((res) => res.json())
      .then((data) => {

        setPatients(data.patients || []);

      })
      .catch((err) => {
        console.error(err);
      });

  }, [doctorId]);

  return (
    <div style={styles.page}>

      <div style={styles.header}>

        <h1 style={styles.title}>
          Mental Health Chats
        </h1>

        <p style={styles.sub}>
          View patients who contacted you through Nirvana AI.
        </p>

      </div>

      {patients.length === 0 ? (

        <div style={styles.empty}>
          No patient conversations yet.
        </div>

      ) : (

        <div style={styles.list}>

          {patients.map((patient) => (

            <div
              key={patient.id}
              style={styles.card}
              onClick={() =>
                navigate("/psychiatrist-chat", {
                  state: {
                    patient,
                    doctorId,
                  },
                })
              }
            >

              <div style={styles.avatar}>
                {patient.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div>

                <div style={styles.patientName}>
                  {patient.name}
                </div>

                <div style={styles.patientSub}>
                  Tap to open conversation
                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    background: "#F8FAFC",
    padding: 30,
    fontFamily: "DM Sans, sans-serif",
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: 8,
  },

  sub: {
    color: "#64748B",
    fontSize: 14,
  },

  empty: {
    background: "white",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: 30,
    color: "#64748B",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  card: {
    background: "white",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "#7C3AED",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
  },

  patientName: {
    fontWeight: 700,
    fontSize: 16,
    color: "#0F172A",
  },

  patientSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

};