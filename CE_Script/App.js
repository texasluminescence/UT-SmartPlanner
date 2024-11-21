import React from "react";
import Sidebar from "./components/Sidebar";
import Schedule from "./components/Schedule";
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <Sidebar />
      <Schedules />
    </div>
  );
}

export default App;
