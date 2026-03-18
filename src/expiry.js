import React, { useState, useEffect } from "react";

function ExpiryAlerts() {
  const [medicines, setMedicines] = useState([]);

  // Fetch medicines that are expiring soon
  const fetchExpiringMedicines = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/medicines/expiry");
      const data = await res.json();
      // Ensure data is an array
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching expiring medicines:", error);
      setMedicines([]);
    }
  };

  useEffect(() => {
    fetchExpiringMedicines();
  }, []);

  return (
    <div style={containerStyle}>
      <h2>Expiring Medicines (Next 30 Days)</h2>
      {medicines.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Stock Quantity</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => (
              <tr key={med.name}>
                <td>{med.name}</td>
                <td>{med.stock_quantity}</td>
                <td>{new Date(med.expiry_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No medicines expiring in the next 30 days.</p>
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: "700px",
  margin: "50px auto",
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "10px",
  backgroundColor: "#f9f9f9",
  textAlign: "center",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

export default ExpiryAlerts;
