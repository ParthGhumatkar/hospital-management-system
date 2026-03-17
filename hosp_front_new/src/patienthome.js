import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PatientHome() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const patientId = state?.patientId;
  const patientName = state?.name;

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
      try {
        const [profileRes, apptRes] = await Promise.all([
          fetch(`http://127.0.0.1:5000/patient_profile/${patientId}`),
          fetch(`http://127.0.0.1:5000/patient_appointments/${patientId}`),
        ]);
        const profileData = await profileRes.json();
        const apptData = await apptRes.json();

        setProfile(profileData.profile || null);
        setAppointments(apptData.appointments || []);
      } catch (err) {
        console.error("Error fetching patient data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter((a) => a.date >= today);
  const past = appointments.filter((a) => a.date < today);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ textAlign: "center", color: "#888" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.headerTitle}>🏥 CityCare Hospital</h2>
          <p style={styles.headerSub}>Welcome back, <strong>{patientName}</strong></p>
        </div>
        <button style={styles.logoutBtn} onClick={() => navigate("/")}>Logout</button>
      </div>

      <div style={styles.grid}>

        {/* --- Profile Card --- */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>👤 My Profile</h3>
          {profile ? (
            <table style={styles.table}>
              <tbody>
                <InfoRow label="Name" value={profile.name} />
                <InfoRow label="Age" value={profile.age} />
                <InfoRow label="Gender" value={profile.gender} />
                <InfoRow label="Phone" value={profile.phone} />
                <InfoRow label="Address" value={profile.address} />
                <InfoRow label="Insurance" value={profile.insurance_provider || "—"} />
                <InfoRow label="Policy No." value={profile.policy_number || "—"} />
              </tbody>
            </table>
          ) : (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>
                No hospital record linked yet.
              </p>
              <p style={styles.emptySubText}>
                Visit reception to register your hospital profile. Your appointments and medical history will appear here once linked.
              </p>
            </div>
          )}
        </div>

        {/* --- Medical History Card --- */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🩺 Medical History</h3>
          {profile ? (
            <>
              <div style={styles.infoBlock}>
                <p style={styles.infoLabel}>Medical History</p>
                <p style={styles.infoValue}>{profile.medical_history || "None recorded"}</p>
              </div>
              <div style={styles.infoBlock}>
                <p style={styles.infoLabel}>Current Medication</p>
                <p style={styles.infoValue}>{profile.current_medication || "None recorded"}</p>
              </div>
              {profile.bed_id && (
                <div style={styles.infoBlock}>
                  <p style={styles.infoLabel}>Admitted — Bed</p>
                  <p style={{ ...styles.infoValue, color: "#e74c3c", fontWeight: "600" }}>
                    Bed #{profile.bed_id}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>No medical records found.</p>
            </div>
          )}
        </div>

        {/* --- Upcoming Appointments --- */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📅 Upcoming Appointments</h3>
          {upcoming.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>No upcoming appointments.</p>
            </div>
          ) : (
            upcoming.map((appt) => (
              <div key={appt.id} style={styles.apptRow}>
                <div>
                  <p style={styles.apptDoctor}>Dr. {appt.doctor_name}</p>
                  <p style={styles.apptMeta}>{appt.specialization} · {appt.date} at {appt.time}</p>
                </div>
                <span style={{ ...styles.badge, backgroundColor: "#e8f4fd", color: "#2e86de" }}>
                  {appt.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* --- Past Appointments --- */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🕓 Past Appointments</h3>
          {past.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>No past appointments found.</p>
            </div>
          ) : (
            past.slice(0, 5).map((appt) => (
              <div key={appt.id} style={styles.apptRow}>
                <div>
                  <p style={styles.apptDoctor}>Dr. {appt.doctor_name}</p>
                  <p style={styles.apptMeta}>{appt.specialization} · {appt.date} at {appt.time}</p>
                </div>
                <span style={{ ...styles.badge, backgroundColor: "#f0f0f0", color: "#555" }}>
                  {appt.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* --- Nirvana AI Card --- */}
        <div style={{ ...styles.card, ...styles.nirvanaCard }}>
          <div style={styles.nirvanaInner}>
            <div>
              <h3 style={styles.nirvanaTitle}>🧠 Nirvana AI</h3>
              <p style={styles.nirvanaSub}>
                Your mental health support companion. Talk anonymously, track your wellness, and access resources — anytime.
              </p>
            </div>
            <button
              style={styles.nirvanaBtn}
              onClick={() => navigate("/nirvana")}
            >
              Open Nirvana AI →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <tr>
      <td style={{ padding: "6px 10px 6px 0", color: "#888", fontSize: "13px", whiteSpace: "nowrap" }}>{label}</td>
      <td style={{ padding: "6px 0", fontSize: "14px", color: "#333" }}>{value}</td>
    </tr>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "0 0 40px 0",
  },
  header: {
    backgroundColor: "#2e86de",
    padding: "18px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
  },
  headerTitle: { margin: 0, fontSize: "22px" },
  headerSub: { margin: "4px 0 0 0", fontSize: "14px", opacity: 0.9 },
  logoutBtn: {
    backgroundColor: "white",
    color: "#2e86de",
    border: "none",
    padding: "8px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    padding: "28px 32px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "22px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    border: "1px solid #eee",
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    color: "#2e86de",
    fontWeight: "600",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  infoBlock: { marginBottom: "14px" },
  infoLabel: { margin: "0 0 3px 0", fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" },
  infoValue: { margin: 0, fontSize: "15px", color: "#333" },
  emptyBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    border: "1px dashed #ddd",
  },
  emptyText: { margin: "0 0 6px 0", color: "#999", fontSize: "14px" },
  emptySubText: { margin: 0, color: "#bbb", fontSize: "12px", lineHeight: "1.5" },
  apptRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  apptDoctor: { margin: "0 0 3px 0", fontSize: "14px", fontWeight: "600", color: "#333" },
  apptMeta: { margin: 0, fontSize: "12px", color: "#888" },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  nirvanaCard: {
    gridColumn: "1 / -1",
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    border: "none",
  },
  nirvanaInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },
  nirvanaTitle: { margin: "0 0 8px 0", fontSize: "18px", color: "#ffffff" },
  nirvanaSub: { margin: 0, fontSize: "14px", color: "#aab4c8", maxWidth: "600px", lineHeight: "1.6" },
  nirvanaBtn: {
    backgroundColor: "#7f77dd",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
};

export default PatientHome;