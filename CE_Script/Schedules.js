import React, { useState } from "react";

function Schedule() {
  const [week, setWeek] = useState(1);

  const courses = [
    { day: "MON", name: "COURSE NAME", instructor: "Last, First", code: "55555", color: "red" },
    { day: "TUE", name: "COURSE NAME", instructor: "Last, First", code: "54682", color: "blue" },
    { day: "WED", name: "COURSE NAME", instructor: "Last, First", code: "55555", color: "red" },
    { day: "THU", name: "COURSE NAME", instructor: "Last, First", code: "54682", color: "blue" },
    { day: "FRI", name: "COURSE NAME", instructor: "Last, First", code: "55555", color: "red" },
  ];

  const days = ["MON", "TUE", "WED", "THU", "FRI"];

  const handleWeekChange = (change) => {
    setWeek((prevWeek) => Math.min(Math.max(prevWeek + change, 1), 12));
  };

  return (
    <div className="schedule-container">
      <header>
        <h1>Schedules</h1>
        <div className="week-navigation">
          <button onClick={() => handleWeekChange(-1)}>&lt;</button>
          <span>{week} / 12</span>
          <button onClick={() => handleWeekChange(1)}>&gt;</button>
        </div>
      </header>
      <div className="schedule">
        {days.map((day) => (
          <div key={day} className="day-column">
            <h3>{day}</h3>
            {courses
              .filter((course) => course.day === day)
              .map((course, index) => (
                <div
                  key={index}
                  className="course"
                  style={{ backgroundColor: course.color }}
                >
                  <p>{course.name}</p>
                  <p>{course.instructor}</p>
                  <p>{course.code}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
      <footer>
        <button className="action-star">★</button>
        <button className="action-delete">✖</button>
      </footer>
    </div>
  );
}

export default Schedule;
