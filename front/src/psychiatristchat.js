import React, { useEffect, useState } from "react";
import API_URL from "./config";
import { useNavigate, useLocation } from "react-router-dom";

export default function PsychiatristChat() {

  const { state } = useLocation();
  const doctorId = state?.doctorId;
  const doctor = state?.doctor || {
    id: doctorId,
    name: state?.patient?.doctor_name || "Psychiatrist",
};
  const patientId =
  state?.patientId || state?.patient?.id;
  const patientName = state?.patientName;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {

    fetch(
        `${API_URL}/get_psychiatrist_messages/${patientId}/${doctor.id}`
    )
        .then((res) => res.json())
        .then((data) => {

        setMessages(data.messages || []);

        })
        .catch((err) => {
        console.error(err);
        });

    }, [patientId, doctor.id]);

  const sendMessage = async () => {

    if (!input.trim()) return;

    const newMessage = {
        sender: "patient",
        message: input,
    };

    setMessages((prev) => [...prev, newMessage]);

    try {

        await fetch(`${API_URL}/send_psychiatrist_message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        

        body: JSON.stringify({
            
            patient_id: patientId,
            doctor_id: doctor.id,
            sender: "patient",
            message: input,
        }),
        });

    } catch (err) {
        console.error(err);
    }

    setInput("");
    };
  return (
    <div style={styles.page}>

      <div style={styles.header}>

        <div style={styles.avatar}>
          {doctor?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>

        <div>
          <div style={styles.name}>
            {doctor?.name}
          </div>

          <div style={styles.sub}>
            {doctor?.specialization}
          </div>
        </div>

      </div>

      <div style={styles.messages}>

        {messages.length === 0 ? (

            <div style={styles.empty}>
            Start your conversation with {doctor?.name}
            </div>

        ) : (

            messages.map((msg, i) => (

            <div
                key={i}
                style={{
                display: "flex",
                justifyContent:
                    msg.sender === "patient"
                    ? "flex-end"
                    : "flex-start",
                marginBottom: 12,
                }}
            >

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems:
                        msg.sender === "patient"
                            ? "flex-end"
                            : "flex-start",
                    }}
                    >

                    <div
                        style={{
                        fontSize: 12,
                        color: "#8B949E",
                        marginBottom: 4,
                        paddingLeft: 4,
                        paddingRight: 4,
                        }}
                    >
                        {msg.sender === "patient"
                        ? "You"
                        : doctor?.name}
                    </div>

                    <div
                        style={{
                        background:
                            msg.sender === "patient"
                            ? "#7C3AED"
                            : "#21262D",

                        padding: "10px 14px",

                        borderRadius:
                            msg.sender === "patient"
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",

                        maxWidth: "70%",
                        lineHeight: 1.5,
                        border:
                            msg.sender === "patient"
                            ? "none"
                            : "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        {msg.message}
                    </div>

                </div>

            </div>

            ))

        )}

        </div>

      <div style={styles.inputBar}>

        <input
            placeholder="Type your message..."
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
/>

        <button
            style={styles.sendBtn}
            onClick={sendMessage}
            >
            Send
        </button>

      </div>

    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#0D1117",
    display: "flex",
    flexDirection: "column",
    color: "white",
    fontFamily: "DM Sans, sans-serif",
  },

  header: {
    padding: 20,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#161B22",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#7C3AED",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
  },

  name: {
    fontSize: 18,
    fontWeight: 700,
  },

  sub: {
    color: "#8B949E",
    fontSize: 13,
    marginTop: 2,
  },

  messages: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
  },

  empty: {
    color: "#8B949E",
  },

  inputBar: {
    padding: 16,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    gap: 12,
    background: "#161B22",
  },

  input: {
    flex: 1,
    background: "#21262D",
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    color: "white",
    outline: "none",
  },

  sendBtn: {
    background: "#7C3AED",
    border: "none",
    color: "white",
    borderRadius: 10,
    padding: "0 18px",
    fontWeight: 600,
    cursor: "pointer",
  },
};