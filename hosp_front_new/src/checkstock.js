import React, { useEffect, useState } from "react";

function MedicinesStock() {
  const [medicines, setMedicines] = useState([]);
  const [mostUsed, setMostUsed] = useState([]);
  const [showMostUsed, setShowMostUsed] = useState(false);

  // Fetch all medicines stock
  const fetchStock = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/medicines/stock");
      const data = await response.json();
      setMedicines(data);
      setShowMostUsed(false); // hide most used when fetching stock
    } catch (error) {
      console.error("Error fetching stock:", error);
      alert("Failed to fetch medicine stock!");
    }
  };

  // Fetch most used medicines
  const fetchMostUsed = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/medicines/usage");
      const data = await response.json();
      setMostUsed(data);
      setShowMostUsed(true); // show most used table
    } catch (error) {
      console.error("Error fetching usage:", error);
      alert("Failed to fetch most used medicines!");
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Medicine Stock</h2>
      <button style={buttonStyle} onClick={fetchMostUsed}>
        Show Most Used Medicines
      </button>
      <button style={buttonStyle} onClick={fetchStock}>
        Refresh Stock
      </button>

      {!showMostUsed && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Stock Quantity</th>
              <th>Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => (
              <tr key={med.id}>
                <td>{med.id}</td>
                <td>{med.name}</td>
                <td>{med.stock_quantity}</td>
                <td>{med.reorder_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showMostUsed && (
        <div>
          <h3>Most Used Medicines</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Total Used</th>
              </tr>
            </thead>
            <tbody>
              {mostUsed.map((med, index) => (
                <tr key={index}>
                  <td>{med.name}</td>
                  <td>{med.total_used}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: "8px 15px",
  margin: "10px",
  fontSize: "14px",
  cursor: "pointer",
  borderRadius: "5px",
  backgroundColor: "#8e44ad",
  color: "#fff",
  border: "none",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

export default MedicinesStock;
