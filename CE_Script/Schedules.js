import React, { useState, useEffect } from "react";
import "./Schedules.css"; 

function Schedule() {
  const [week, setWeek] = useState(1);
  const [schedules, setSchedules] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userSchedules');
      if (raw) {
        const store = JSON.parse(raw);
        setSchedules(store.schedules || []);
        setSelectedId(store.selectedId || (store.schedules && store.schedules[0] && store.schedules[0].id));
      }
    } catch (e) { console.error('Failed to load schedules', e); }
  }, []);

  const currentSchedule = schedules.find(s => s.id === selectedId) || schedules[0] || { items: [] };

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
          <div className="sidebar-item">IDAI+</div>
          <div className="sidebar-item selected">SCHEDULES</div>
          <div className="sidebar-item" onClick={() => window.location.href='courses.html'}>COURSES</div>
        </nav>
      </aside>

      <main className="schedule-main">
        <header className="top-bar">
          <h2>SCHEDULES</h2>
          <div className="week-nav">
            <select value={selectedId || ''} onChange={(e) => { setSelectedId(e.target.value); const raw = JSON.parse(localStorage.getItem('userSchedules')||'{}'); raw.selectedId = e.target.value; localStorage.setItem('userSchedules', JSON.stringify(raw)); }}>
              {schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={() => {
              const id = 's_' + Date.now();
              const newSched = { id, name: `Schedule ${schedules.length + 1}`, items: [] };
              const updated = [...schedules, newSched];
              setSchedules(updated); setSelectedId(id); localStorage.setItem('userSchedules', JSON.stringify({ schedules: updated, selectedId: id }));
            }}>+ New</button>
            <button onClick={() => {
              const src = schedules.find(s => s.id === selectedId);
              if (!src) return;
              const copy = { id: 's_' + Date.now(), name: `Copy of ${src.name}`, items: JSON.parse(JSON.stringify(src.items)) };
              const updated = [...schedules, copy];
              setSchedules(updated); setSelectedId(copy.id); localStorage.setItem('userSchedules', JSON.stringify({ schedules: updated, selectedId: copy.id }));
            }}>Duplicate</button>
            <button onClick={() => {
              const name = prompt('Rename schedule', schedules.find(s => s.id === selectedId)?.name || 'Schedule');
              if (!name) return;
              const updated = schedules.map(s => s.id === selectedId ? { ...s, name } : s);
              setSchedules(updated); localStorage.setItem('userSchedules', JSON.stringify({ schedules: updated, selectedId }));
            }}>Rename</button>
            <button onClick={() => {
              if (!confirm('Delete schedule?')) return;
              const updated = schedules.filter(s => s.id !== selectedId);
              setSchedules(updated); setSelectedId(updated[0] && updated[0].id); localStorage.setItem('userSchedules', JSON.stringify({ schedules: updated, selectedId: updated[0] && updated[0].id }));
            }}>Delete</button>
            <button onClick={() => handleWeekChange(-1)}>&lt;</button>
            <span>{week}/12</span>
            <button onClick={() => handleWeekChange(1)}>&gt;</button>
          </div>
        </header>

        <section className="schedule-grid">
          {days.map((day) => (
            <div key={day} className="day-column">
              <h3>{day}</h3>
              {(currentSchedule.items || []).filter((c) => c.day === day).map((c, i) => (
                <div className="course-card" key={i} style={{ backgroundColor: c.color }}>
                  <p className="course-title">{c.course_name || c.name}</p>
                  <p className="instructor">{c.instructor}</p>
                  <p className="course-code">{c.unique || c.code}</p>
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
