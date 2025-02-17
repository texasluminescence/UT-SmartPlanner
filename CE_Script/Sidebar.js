import React from "react";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="profile">
        <img src="profile-placeholder.png" alt="User Avatar" className="avatar" />
        <p>Welcome, User!</p>
      </div>
      <nav>
        <ul>
          <li>IDAI+</li>
          <li>SCHEDULES</li>
          <li>COURSES</li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
