import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MatchedCourses from "./components/MatchedCourses";  // A component that displays matched courses
import Schedule from "./components/Schedule";
import Sidebar from "./components/Sidebar";
import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Sidebar />
        <Routes>
          <Route path="/matched-courses" element={<MatchedCourses />} />
          <Route path="/schedule" element={<Schedule />} />
          {/* Redirect any other path to matched courses */}
          <Route path="*" element={<Navigate to="/matched-courses" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
