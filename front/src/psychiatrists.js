import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";

export default function Psychiatrists() {

  const [psychiatrists, setPsychiatrists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { state } = useLocation();
  const patientId = state?.patientId;
  const patientName = state?.patientName;
  console.log(state);

  useEffect(() => {
    fetch(`${API_URL}/psychiatrists`)
      .then((res) => res.json())
      .then((data) => {
        setPsychiatrists(data.psychiatrists || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <h1 style={styles.title}>Talk to a Psychiatrist</h1>

        <p style={styles.subtitle}>
          Connect with verified mental health professionals.
        </p>
      </div>

      {loading ? (
        <div style={styles.loading}>
          Loading psychiatrists...
        </div>
      ) : (
        <div style={styles.list}>

          {psychiatrists.map((doc) => (

            <div key={doc.id} style={styles.card}>

              <div style={styles.avatar}>
                {doc.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div style={{ flex: 1 }}>

                <div style={styles.name}>
                  {doc.name}
                </div>

                <div style={styles.specialty}>
                  {doc.specialization || "Psychiatrist"}
                </div>

                <div style={styles.meta}>
                  {doc.experience || "Experienced Specialist"}
                </div>

              </div>

              <button
                style={styles.chatBtn}
                onClick={() =>
                    navigate("/psychiatrist-chat", {
                        state: {
                            doctor: doc,
                            patientId,
                            patientName,
                        },
                        })
                }
                >
                Chat
                </button>

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
    background: "#0D1117",
    color: "white",
    padding: 24,
    fontFamily: "DM Sans, sans-serif",
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 32,
    marginBottom: 8,
  },

  subtitle: {
    color: "#8B949E",
    fontSize: 14,
  },

  loading: {
    color: "#8B949E",
    marginTop: 40,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 800,
  },

  card: {
    background: "#161B22",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 20,
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#7C3AED",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 18,
    flexShrink: 0,
  },

  name: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },

  specialty: {
    color: "#C4B5FD",
    marginBottom: 6,
    fontSize: 14,
  },

  meta: {
    color: "#8B949E",
    fontSize: 13,
  },

  chatBtn: {
    background: "#7C3AED",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
  },
};