import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      <h2>Welcome to Hospital Management System 🏥</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Home;
