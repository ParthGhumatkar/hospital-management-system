import React, { useEffect, useState } from "react";

function MedicinesReorder() {
  const [reorderList, setReorderList] = useState([]);

  const fetchReorderList = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/medicines/reorder");
      const data = await response.json();
      setReorderList(data);
    } catch (error) {
      console.error("Error fetching reorder list:", error);
      alert("Failed to fetch reorder medicines!");
    }
  };

  const handleSendToSupplier = () => {
    // For now, just show an alert. You can integrate email or API later
    const names = reorderList.map((med) => med.name).join(", ");
    alert(`Order sent to supplier for: ${names}`);
  };

  useEffect(() => {
    fetchReorderList();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Reorder Medicines</h2>
      {reorderList.length > 0 ? (
        <>
          <p style={{ color: "red", fontWeight: "bold" }}>
            These medicines are low in stock — send order to supplier!
          </p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Stock Quantity</th>
                <th>Reorder Level</th>
                <th>Reorder Quantity</th>
              </tr>
            </thead>
            <tbody>
              {reorderList.map((med) => (
                <tr key={med.name}>
                  <td>{med.name}</td>
                  <td>{med.stock_quantity}</td>
                  <td>{med.reorder_level}</td>
                  <td>{med.reorder_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={buttonStyle} onClick={handleSendToSupplier}>
            Send to Supplier
          </button>
        </>
      ) : (
        <p>All medicines are sufficiently stocked.</p>
      )}
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const buttonStyle = {
  padding: "10px 20px",
  marginTop: "15px",
  fontSize: "16px",
  cursor: "pointer",
  borderRadius: "5px",
  backgroundColor: "#e67e22",
  color: "#fff",
  border: "none",
};

export default MedicinesReorder;
