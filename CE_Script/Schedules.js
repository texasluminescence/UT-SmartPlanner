import React, { useState } from "react";
import "./Schedule.css"; 

function Schedule() {
  const [week, setWeek] = useState(1);

  const courses = [
    // { day: "MON", name: "COURSE NAME", instructor: "Last, First", code: "55555", color: "red" },
    // { day: "TUE", name: "COURSE NAME", instructor: "Last, First", code: "54682", color: "blue" },
    // { day: "TUE", name: "COURSE NAME", instructor: "Last, First", code: "55555", color: "red" },
    // { day: "WED", name: "COURSE NAME", instructor: "Last, First", code: "55555", color: "blue" },
    // { day: "THU", name: "COURSE NAME", instructor: "Last, First", code: "54682", color: "red" },
    // { day: "THU", name: "COURSE NAME", instructor: "Last, First", code: "55555", color: "blue" },
    // { day: "FRI", name: "COURSE NAME", instructor: "Last, First", code: "55555", color: "red" },
  ];

  const days = ["MON", "TUE", "WED", "THU", "FRI"];

  const handleWeekChange = (change) => {
    setWeek((prev) => Math.min(Math.max(prev + change, 1), 12));
  };

  return (
    <div className="schedule-page">
      <aside className="sidebar">
        <div className="user-info">
          <div className="avatar" />
          <p>Welcome, User!</p>
        </div>
        <nav>
          <button>IDAI+</button>
          <button>SCHEDULES</button>
          <button>COURSES</button>
        </nav>
      </aside>

      <main className="schedule-main">
        <header className="top-bar">
          <h2>SCHEDULES</h2>
          <div className="week-nav">
            <button onClick={() => handleWeekChange(-1)}>&lt;</button>
            <span>{week}/12</span>
            <button onClick={() => handleWeekChange(1)}>&gt;</button>
          </div>
        </header>

        <section className="schedule-grid">
          {days.map((day) => (
            <div key={day} className="day-column">
              <h3>{day}</h3>
              {courses.filter((c) => c.day === day).map((c, i) => (
                <div className="course-card" key={i} style={{ backgroundColor: c.color }}>
                  <p className="course-title">{c.name}</p>
                  <p className="instructor">{c.instructor}</p>
                  <p className="course-code">{c.code}</p>
                </div>
              ))}
            </div>
          ))}
        </section>

        <footer className="footer-actions">
          <button className="star-btn">☆</button>
          <button className="delete-btn">✕</button>
        </footer>
      </main>
    </div>
  );
}

export default Schedule;
