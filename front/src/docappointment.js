import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "./config";
import Toast from "./Toast";

function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
}

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const STATUS = {
  Scheduled: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
  Completed: { bg: "#F0FDF4", border: "#BBF7D0", text: "#16A34A" },
  Cancelled: { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
};

export default function DoctorAppointments() {
  const location = useLocation();
  const navigate = useNavigate();

  const doctorId = location.state?.doctorId;
  const doctorName = location.state?.name || "Doctor";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const INI = getInitials(doctorName);

  const fetchAppointments = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/appointments/upcoming/${doctorId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    } catch {
      setAppointments([]);
    }
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId) { navigate("/"); return; }
    fetchAppointments();
  }, [doctorId, navigate, fetchAppointments]);

  const updateStatus = async (appt, status) => {
    try {
      const res = await fetch(`${API_URL}/appointments/${appt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, date: appt.date, time: appt.time }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setToast({ message: `Appointment marked as ${status}`, type: "success" });
      fetchAppointments();
    } catch {
      setToast({ message: "Failed to update appointment", type: "error" });
    }
  };

  if (!doctorId) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .da-body { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F8FAFC; color: #1E293B; }

        .da-header {
          background: #fff; border-bottom: 1px solid #E2E8F0;
          padding: 14px 40px; display: flex; align-items: center;
          justify-content: space-between; position: sticky; top: 0; z-index: 10;
        }
        .da-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #1D4ED8;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; flex-shrink: 0; letter-spacing: 1px;
        }
        .da-main { max-width: 900px; margin: 0 auto; padding: 32px 28px 60px; }

        .da-back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none;
          border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer;
          font-family: 'DM Sans', sans-serif; margin-bottom: 28px;
          transition: border-color 0.15s, color 0.15s;
        }
        .da-back-btn:hover { border-color: #CBD5E1; color: #334155; }

        .da-section-title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 14px;
        }

        .da-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; }

        .da-appt-row {
          display: flex; align-items: center; padding: 16px 20px;
          gap: 14px; transition: background 0.1s;
        }
        .da-appt-row + .da-appt-row { border-top: 1px solid #F1F5F9; }
        .da-appt-row:hover { background: #FAFBFC; }

        .da-pat-avatar {
          width: 40px; height: 40px; border-radius: 50%; background: #EFF6FF;
          color: #1D4ED8; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; flex-shrink: 0;
        }
        .da-pat-name { font-weight: 600; font-size: 14px; color: #0F172A; }
        .da-pat-meta { font-size: 12px; color: #94A3B8; margin-top: 2px; }

        .da-status-chip {
          font-size: 11px; font-weight: 600; padding: 3px 10px;
          border-radius: 20px; border: 1px solid transparent;
          white-space: nowrap; flex-shrink: 0;
        }

        .da-actions { display: flex; gap: 8px; flex-shrink: 0; margin-left: auto; }

        .da-btn-done {
          background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0;
          border-radius: 7px; padding: 6px 14px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; white-space: nowrap;
        }
        .da-btn-done:hover { background: #DCFCE7; }

        .da-btn-cancel {
          background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA;
          border-radius: 7px; padding: 6px 14px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s; white-space: nowrap;
        }
        .da-btn-cancel:hover { background: #FEE2E2; }

        .da-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 60px 24px; gap: 10px;
          text-align: center;
        }
        .da-empty-icon {
          width: 60px; height: 60px; border-radius: 50%;
          background: #EFF6FF; display: flex; align-items: center;
          justify-content: center; margin-bottom: 4px;
        }
        .da-empty-title { font-size: 15px; font-weight: 600; color: #334155; }
        .da-empty-sub { font-size: 13px; color: #94A3B8; max-width: 300px; line-height: 1.55; }

        @media (max-width: 640px) {
          .da-header { padding: 12px 16px; }
          .da-main { padding: 20px 14px 48px; }
          .da-appt-row { flex-wrap: wrap; }
          .da-actions { width: 100%; }
        }
      `}</style>

      <div className="da-body">
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

        {/* ── Header ── */}
        <header className="da-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="da-avatar">{INI}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>Dr. {doctorName}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Appointments</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </header>

        {/* ── Main ── */}
        <main className="da-main">
          <button
            className="da-back-btn"
            onClick={() => navigate("/home/doctor", { state: { name: doctorName, doctorId } })}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Home
          </button>

          <p className="da-section-title">Upcoming Appointments</p>

          <div className="da-card">
            {loading ? (
              <div className="da-empty">
                <div style={{ fontSize: 13, color: "#94A3B8" }}>Loading appointments…</div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="da-empty">
                <div className="da-empty-icon">
                  <svg width="28" height="28" fill="none" stroke="#93C5FD" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="da-empty-title">No upcoming appointments</div>
                <div className="da-empty-sub">
                  You have no scheduled appointments at this time. New bookings will appear here.
                </div>
              </div>
            ) : (
              appointments.map((appt) => {
                const s = STATUS[appt.status] || STATUS.Scheduled;
                return (
                  <div key={appt.id} className="da-appt-row">
                    <div className="da-pat-avatar">
                      {appt.patient_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="da-pat-name">{appt.patient_name}</div>
                      <div className="da-pat-meta">{appt.date} · {fmtTime(appt.time)}</div>
                    </div>
                    <span
                      className="da-status-chip"
                      style={{ background: s.bg, borderColor: s.border, color: s.text }}
                    >
                      {appt.status}
                    </span>
                    <div className="da-actions">
                      <button className="da-btn-done" onClick={() => updateStatus(appt, "Completed")}>
                        Mark Complete
                      </button>
                      <button className="da-btn-cancel" onClick={() => updateStatus(appt, "Cancelled")}>
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </>
  );
}
