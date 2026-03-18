import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "./config";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
}

const STATUS_BADGE = {
  Scheduled: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
  Completed:  { bg: "#F0FDF4", border: "#BBF7D0", text: "#16A34A" },
  Cancelled:  { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
};

/* ── Collapsible card wrapper ─────────────────────────────────────────────── */
function Card({ id, expanded, onToggle, icon, title, badge, children }) {
  return (
    <div className="ph-card">
      <button className="ph-card-hd" onClick={() => onToggle(id)}>
        <span className="ph-card-hd-left">
          {icon}
          <span className="ph-card-title-text">{title}</span>
          {badge}
        </span>
        <svg
          className={`ph-chevron${expanded ? " open" : ""}`}
          width="16" height="16" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && <div className="ph-card-body">{children}</div>}
    </div>
  );
}

/* ── Info row inside cards ────────────────────────────────────────────────── */
function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="ph-info-row">
      <span className="ph-info-label">{label}</span>
      <span className="ph-info-value">{value}</span>
    </div>
  );
}

/* ── Section label ────────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, textTransform: "uppercase",
      letterSpacing: "0.07em", color: "#94A3B8", margin: "14px 0 6px",
    }}>
      {children}
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
function EmptyState({ icon, title, sub }) {
  return (
    <div className="ph-empty">
      <div className="ph-empty-icon">{icon}</div>
      <div className="ph-empty-title">{title}</div>
      {sub && <div className="ph-empty-sub">{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function PatientHome() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const patientId   = state?.patientId;
  const patientName = state?.name || "Patient";

  const [profile,      setProfile]      = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [expanded,     setExpanded]     = useState({
    profile: true, medical: true, upcoming: true, past: true,
  });

  const INI = getInitials(patientName);

  const toggleCard = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ── fetch ── */
  useEffect(() => {
    if (!patientId) { navigate("/"); return; }
    (async () => {
      try {
        const [profileRes, apptRes] = await Promise.all([
          fetch(`${API_URL}/patient_profile/${patientId}`),
          fetch(`${API_URL}/patient_appointments/${patientId}`),
        ]);
        const pd = await profileRes.json();
        const ad = await apptRes.json();
        setProfile(pd.profile || null);
        setAppointments(ad.appointments || []);
      } catch { /* silently fail */ }
      finally { setLoading(false); }
    })();
  }, [patientId, navigate]);

  const today    = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter((a) => a.date >= today);
  const past     = appointments.filter((a) => a.date < today);

  if (!patientId) return null;

  /* ── SVG icons ── */
  const iconProfile = (
    <svg width="15" height="15" fill="none" stroke="#185FA5" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
  const iconMedical = (
    <svg width="15" height="15" fill="none" stroke="#185FA5" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
  const iconCalendar = (
    <svg width="15" height="15" fill="none" stroke="#185FA5" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
  const iconClock = (
    <svg width="15" height="15" fill="none" stroke="#185FA5" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ph-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        /* Header */
        .ph-header {
          background: #fff; border-bottom: 1px solid #E2E8F0;
          padding: 14px 40px; display: flex; align-items: center;
          justify-content: space-between; position: sticky; top: 0; z-index: 10;
        }
        .ph-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #185FA5;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0;
        }
        .ph-logout-btn {
          padding: 8px 18px; background: #fff; border: 1.5px solid #E2E8F0;
          border-radius: 8px; color: #EF4444; font-weight: 600; font-size: 13px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }
        .ph-logout-btn:hover { background: #FEF2F2; border-color: #FECACA; }

        /* Main */
        .ph-main { max-width: 1060px; margin: 0 auto; padding: 32px 28px 60px; }
        .ph-greeting {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(24px, 3.5vw, 32px); font-weight: 400; color: #0F172A; margin-bottom: 4px;
        }
        .ph-sub { font-size: 14px; color: #64748B; margin-bottom: 32px; }

        /* 2-column grid */
        .ph-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

        /* Card */
        .ph-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; }

        /* Collapsible header */
        .ph-card-hd {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.12s;
        }
        .ph-card-hd:hover { background: #F8FAFC; }
        .ph-card-hd-left { display: flex; align-items: center; gap: 8px; }
        .ph-card-title-text { font-size: 13px; font-weight: 700; color: #0F172A; }

        .ph-chevron { color: #94A3B8; transition: transform 0.2s; flex-shrink: 0; }
        .ph-chevron.open { transform: rotate(180deg); }

        /* Card body */
        .ph-card-body { padding: 0 20px 18px; }

        /* Info rows */
        .ph-info-row {
          display: flex; gap: 10px; padding: 7px 0;
          border-bottom: 1px solid #F1F5F9;
        }
        .ph-info-row:last-child { border-bottom: none; }
        .ph-info-label { font-size: 12px; color: #94A3B8; min-width: 118px; flex-shrink: 0; padding-top: 1px; }
        .ph-info-value { font-size: 14px; color: #334155; line-height: 1.5; }

        /* Admission chip */
        .ph-admit-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626;
          border-radius: 8px; padding: 5px 12px; font-size: 12px; font-weight: 600;
          margin-top: 10px;
        }

        /* Appointment rows */
        .ph-appt-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 0; gap: 10px;
        }
        .ph-appt-row + .ph-appt-row { border-top: 1px solid #F1F5F9; }
        .ph-appt-name  { font-size: 14px; font-weight: 600; color: #0F172A; }
        .ph-appt-meta  { font-size: 12px; color: #94A3B8; margin-top: 2px; }
        .ph-badge {
          font-size: 11px; font-weight: 600; padding: 3px 10px;
          border-radius: 20px; border: 1px solid transparent;
          white-space: nowrap; flex-shrink: 0;
        }

        /* Empty state */
        .ph-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 28px 16px; gap: 8px; text-align: center;
        }
        .ph-empty-icon {
          width: 50px; height: 50px; border-radius: 50%; background: #EFF6FF;
          display: flex; align-items: center; justify-content: center; margin-bottom: 2px;
        }
        .ph-empty-title { font-size: 14px; font-weight: 600; color: #334155; }
        .ph-empty-sub   { font-size: 12px; color: #94A3B8; max-width: 240px; line-height: 1.55; }

        /* Medication text block */
        .ph-text-block {
          font-size: 14px; color: #334155; line-height: 1.65;
          white-space: pre-wrap;
        }
        .ph-text-block.muted { color: #94A3B8; font-style: italic; }

        /* Nirvana full-width */
        .ph-nirvana {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          border: none !important;
        }
        .ph-nirvana-inner {
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; padding: 24px;
        }
        .ph-nirvana-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 5px; }
        .ph-nirvana-sub   { font-size: 13px; color: #94a3b8; line-height: 1.6; max-width: 560px; }
        .ph-nirvana-btn {
          background: #7f77dd; color: #fff; border: none;
          padding: 10px 20px; border-radius: 9px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap;
          transition: background 0.15s; flex-shrink: 0;
        }
        .ph-nirvana-btn:hover { background: #6f67cc; }

        /* Loading */
        .ph-loading {
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; font-size: 14px; color: #94A3B8;
          font-family: 'DM Sans', sans-serif;
        }

        @media (max-width: 768px) {
          .ph-header { padding: 12px 16px; }
          .ph-main   { padding: 20px 14px 48px; }
          .ph-grid   { grid-template-columns: 1fr; }
          .ph-nirvana-inner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {loading ? (
        <div className="ph-loading">Loading your dashboard…</div>
      ) : (
        <div className="ph-body">

          {/* ── Header ── */}
          <header className="ph-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="ph-avatar">{INI}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{patientName}</div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>Patient Portal</div>
              </div>
            </div>
            <button className="ph-logout-btn" onClick={() => navigate("/")}>Sign Out</button>
          </header>

          {/* ── Main ── */}
          <main className="ph-main">
            <h1 className="ph-greeting">Good {getTimeOfDay()}, {patientName.split(" ")[0]}.</h1>
            <p className="ph-sub">Here's your health summary at CityCare Hospital.</p>

            <div className="ph-grid">

              {/* ── 1. My Profile ── */}
              <Card
                id="profile"
                expanded={expanded.profile}
                onToggle={toggleCard}
                icon={iconProfile}
                title="My Profile"
                badge={null}
              >
                {profile ? (
                  <>
                    <InfoRow label="Full Name" value={profile.name} />
                    <InfoRow label="Email"     value={profile.email} />
                    <InfoRow label="Phone"     value={profile.phone} />
                    <InfoRow label="Age"       value={profile.age} />
                    <InfoRow label="Gender"    value={profile.gender} />
                  </>
                ) : (
                  <EmptyState
                    icon={
                      <svg width="22" height="22" fill="none" stroke="#93C5FD" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    }
                    title="No hospital record linked"
                    sub="Visit reception to register. Your profile will appear here once linked."
                  />
                )}
              </Card>

              {/* ── 2. Medical Records (dedicated card for quick scan) ── */}
              <Card
                id="medical"
                expanded={expanded.medical}
                onToggle={toggleCard}
                icon={iconMedical}
                title="Medical Records"
              >
                <EmptyState
                  icon={
                    <svg width="22" height="22" fill="none" stroke="#93C5FD" strokeWidth="1.6"
                      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  }
                  title="Medical records managed by hospital"
                  sub="Your diagnosis, medication and bed details are updated by your doctor and reception."
                />
              </Card>

              {/* ── 3. Upcoming Appointments ── */}
              <Card
                id="upcoming"
                expanded={expanded.upcoming}
                onToggle={toggleCard}
                icon={iconCalendar}
                title="Upcoming Appointments"
                badge={
                  upcoming.length > 0
                    ? <span style={{
                        marginLeft: 6, background: "#EFF6FF", border: "1px solid #BFDBFE",
                        color: "#1D4ED8", fontSize: 11, fontWeight: 600,
                        padding: "2px 8px", borderRadius: 20,
                      }}>{upcoming.length}</span>
                    : null
                }
              >
                {upcoming.length === 0 ? (
                  <EmptyState
                    icon={
                      <svg width="22" height="22" fill="none" stroke="#93C5FD" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    }
                    title="No upcoming appointments"
                    sub="Appointments booked by reception will appear here."
                  />
                ) : (
                  upcoming.map((appt) => {
                    const s = STATUS_BADGE[appt.status] || STATUS_BADGE.Scheduled;
                    return (
                      <div key={appt.id} className="ph-appt-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="ph-appt-name">Dr. {appt.doctor_name}</div>
                          <div className="ph-appt-meta">
                            {appt.specialization} · {appt.date} · {fmtTime(appt.time)}
                          </div>
                        </div>
                        <span className="ph-badge"
                          style={{ background: s.bg, borderColor: s.border, color: s.text }}>
                          {appt.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </Card>

              {/* ── 4. Past Appointments ── */}
              <Card
                id="past"
                expanded={expanded.past}
                onToggle={toggleCard}
                icon={iconClock}
                title="Past Appointments"
                badge={
                  past.length > 0
                    ? <span style={{
                        marginLeft: 6, background: "#F1F5F9", border: "1px solid #E2E8F0",
                        color: "#64748B", fontSize: 11, fontWeight: 600,
                        padding: "2px 8px", borderRadius: 20,
                      }}>{past.length}</span>
                    : null
                }
              >
                {past.length === 0 ? (
                  <EmptyState
                    icon={
                      <svg width="22" height="22" fill="none" stroke="#93C5FD" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    }
                    title="No past appointments"
                    sub="Your appointment history will appear here."
                  />
                ) : (
                  past.slice(0, 6).map((appt) => {
                    const s = STATUS_BADGE[appt.status]
                      || { bg: "#F1F5F9", border: "#E2E8F0", text: "#64748B" };
                    return (
                      <div key={appt.id} className="ph-appt-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="ph-appt-name">Dr. {appt.doctor_name}</div>
                          <div className="ph-appt-meta">
                            {appt.specialization} · {appt.date} · {fmtTime(appt.time)}
                          </div>
                        </div>
                        <span className="ph-badge"
                          style={{ background: s.bg, borderColor: s.border, color: s.text }}>
                          {appt.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </Card>

              {/* ── Nirvana AI — full width ── */}
              <div className="ph-card ph-nirvana">
                <div className="ph-nirvana-inner">
                  <div>
                    <div className="ph-nirvana-title">🧠 Nirvana AI</div>
                    <div className="ph-nirvana-sub">
                      Your mental health support companion. Talk anonymously, track your
                      wellness, and access resources — anytime.
                    </div>
                  </div>
                  <button className="ph-nirvana-btn" onClick={() => navigate("/nirvana")}>
                    Open Nirvana AI →
                  </button>
                </div>
              </div>

            </div>
          </main>
        </div>
      )}
    </>
  );
}
