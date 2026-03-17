import React, { useEffect, useState } from "react";

function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState({});
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/patients");
      const data = await res.json();
      setPatients(Array.isArray(data.patients) ? data.patients : []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  };

  // Fetch beds
  const fetchBeds = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/beds");
      const data = await res.json();
      setBeds(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching beds:", error);
      setBeds([]);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchBeds();
  }, []);

  // Assign bed
  const assignBed = async (patientId) => {
    const bedId = selectedBed[patientId];
    if (!bedId) {
      alert("Select a bed first");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/assign_bed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, bed_id: parseInt(bedId) }),
      });
      const data = await res.json();
      alert(data.message || "Bed assigned successfully!");
      fetchPatients();
      fetchBeds();
    } catch (error) {
      console.error("Error assigning bed:", error);
      alert("Failed to assign bed");
    }
  };

  // Delete patient
  const deletePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/delete_patient/${patientId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      alert(data.message || "Patient deleted!");
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Failed to delete patient");
    }
  };

  // Update patient (simple prompt-based update example)
  const updatePatient = async (patient) => {
    const newName = prompt("Enter new name:", patient.name);
    if (!newName) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/update_patient/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patient, name: newName }),
      });
      const data = await res.json();
      alert(data.message || "Patient updated!");
      fetchPatients();
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("Failed to update patient");
    }
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Patients</h2>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search patient by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "10px", padding: "5px", width: "250px" }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map((p) => (
            <React.Fragment key={p.id}>
              {/* Row with basic info */}
              <tr
                onClick={() =>
                  setExpandedPatient(expandedPatient === p.id ? null : p.id)
                }
                style={{ cursor: "pointer", borderBottom: "1px solid #ccc" }}
              >
                <td>{p.name}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePatient(p);
                    }}
                    style={{ marginRight: "5px" }}
                  >
                    Update
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePatient(p.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>

              {/* Expanded row with full details */}
              {expandedPatient === p.id && (
                <tr>
                  <td colSpan="4" style={{ background: "#f0f0f0", padding: "10px" }}>
                    <p><b>Phone:</b> {p.phone}</p>
                    <p><b>Address:</b> {p.address}</p>
                    <p><b>Medical History:</b> {p.medical_history || "n/a"}</p>
                    <p><b>Current Medication:</b> {p.current_medication || "n/a"}</p>
                    <p><b>Bed:</b> {p.bed_id || "Not assigned"}</p>

                    <select
                      value={selectedBed[p.id] || ""}
                      onChange={(e) =>
                        setSelectedBed({ ...selectedBed, [p.id]: e.target.value })
                      }
                    >
                      <option value="">Select Bed</option>
                      {beds.map((b) => (
                        <option key={b.bed_id} value={b.bed_id}>
                          {b.bed_id} ({b.status})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignBed(p.id)}
                      style={{ marginLeft: "5px", padding: "5px 10px" }}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManagePatients;
