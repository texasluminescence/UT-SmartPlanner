console.log('popup.js loaded');

(function(){
    function getUserSchedules() {
        try {
            const raw = localStorage.getItem('userSchedules');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return { schedules: parsed, selectedId: (parsed[0] && parsed[0].id) || null };
                if (parsed && Array.isArray(parsed.schedules)) return parsed;
                if (parsed && parsed.schedules && typeof parsed.schedules === 'object') {
                    const arr = Array.isArray(parsed.schedules) ? parsed.schedules : Object.values(parsed.schedules);
                    return { schedules: arr, selectedId: parsed.selectedId || (arr[0] && arr[0].id) };
                }
            }
            const legacy = JSON.parse(localStorage.getItem('userSchedule') || 'null');
            if (legacy && Array.isArray(legacy)) {
                return { schedules: [ { id: 'default', name: 'Schedule 1', items: legacy } ], selectedId: 'default' };
            }
        } catch (e) { console.error('popup: failed parsing schedules', e, localStorage.getItem('userSchedules')); }
        return { schedules: [ { id: 'default', name: 'Schedule 1', items: [] } ], selectedId: 'default' };
    }

    function renderSelectedSchedule() {
        const store = getUserSchedules();
        console.log('popup store', store);
        let schedule = (store.schedules || []).find(s => s.id === store.selectedId) || (store.schedules && store.schedules[0]) || { items: [] };
        let items = [];
        if (Array.isArray(schedule)) items = schedule;
        else if (Array.isArray(schedule.items)) items = schedule.items;
        else if (Array.isArray(schedule.courses)) items = schedule.courses;
        else items = [];

        const listEl = document.getElementById('selected-schedule-list');
        const noEl = document.getElementById('no-courses');
        let dbg = document.getElementById('popup-debug');
        if (!dbg) {
            dbg = document.createElement('pre'); dbg.id = 'popup-debug'; dbg.style.display = 'none'; dbg.style.whiteSpace = 'pre-wrap'; dbg.style.maxWidth = '420px'; dbg.style.background = '#fff'; dbg.style.border = '1px solid #eee'; dbg.style.padding = '8px'; dbg.style.marginTop = '8px'; document.querySelector('.parent_popup').appendChild(dbg);
        }
        listEl.innerHTML = '';
        if (!items || items.length === 0) {
            noEl.style.display = 'block';
            noEl.textContent = 'No courses selected.';
            dbg.style.display = 'block'; dbg.textContent = JSON.stringify(store, null, 2);
            return;
        }
        noEl.style.display = 'none'; dbg.style.display = 'none'; dbg.textContent = '';
        items.forEach(it => {
            const node = document.createElement('div');
            node.className = 'course-item';
            const id = it.id || it.unique || '';
            const name = (it.course_name || it.name || it.title) || '';
            const inst = it.instructor || it.professor || '';
            node.innerHTML = `
                <div class="course-left"><div class="unique_id">${id}</div></div>
                <div class="course-mid"><div class="course-name">${name}</div><div class="instructor">${inst}</div></div>
            `;
            listEl.appendChild(node);
        });
    }

    // initial render
    document.addEventListener('DOMContentLoaded', function() {
        console.log('popup: DOMContentLoaded');
        const status = document.getElementById('popup-script-status'); if (status) status.textContent = 'Script: loaded';
        renderSelectedSchedule();

        window.addEventListener('storage', function(e) {
            if (e.key === 'userSchedules' || e.key === 'userSchedulesUpdated' || e.key === 'userSchedule' || e.key === 'userScheduleUpdated') {
                console.log('popup: storage event', e.key);
                renderSelectedSchedule();
            }
        });

        // Poll localStorage and update when changed
        let lastStoreJson = null;
        function pollAndUpdate() {
            try {
                const store = getUserSchedules();
                const s = JSON.stringify(store);
                if (s !== lastStoreJson) {
                    lastStoreJson = s;
                    renderSelectedSchedule();
                    const meta = document.getElementById('popup-meta');
                    const schedule = (store.schedules || []).find(sch => sch.id === store.selectedId) || (store.schedules && store.schedules[0]) || { items: [] };
                    const items = Array.isArray(schedule.items) ? schedule.items : (Array.isArray(schedule.courses) ? schedule.courses : []);
                    if (meta) meta.textContent = `Updated: ${new Date().toLocaleTimeString()} • ${items.length} item(s)`;
                    const dbg = document.getElementById('popup-debug');
                    if (dbg && dbg.style.display === 'block') dbg.textContent = JSON.stringify(store, null, 2);
                }
            } catch (e) { console.error('popup poll error', e); }
        }
        pollAndUpdate();
        setInterval(pollAndUpdate, 1500);

        const refreshBtn = document.getElementById('popup-refresh');
        if (refreshBtn) refreshBtn.addEventListener('click', function(e) {
            console.log('popup: refresh clicked', e);
            const meta = document.getElementById('popup-meta'); if (meta) meta.textContent = 'Manual refresh triggered';
            const oldText = refreshBtn.innerText; refreshBtn.innerText = 'Refreshing...';
            pollAndUpdate();
            setTimeout(()=>{ refreshBtn.innerText = oldText; if (meta) meta.textContent = 'Manual refresh complete'; }, 700);
        });

        const debugToggle = document.getElementById('popup-debug-toggle');
        if (debugToggle) debugToggle.addEventListener('click', function(e) {
            console.log('popup: debug toggle clicked', e);
            let dbg = document.getElementById('popup-debug');
            if (!dbg) { renderSelectedSchedule(); dbg = document.getElementById('popup-debug'); }
            dbg.style.display = (dbg.style.display === 'block') ? 'none' : 'block';
            if (dbg.style.display === 'block') dbg.textContent = JSON.stringify(getUserSchedules(), null, 2);
            const meta = document.getElementById('popup-meta'); if (meta) meta.textContent = (dbg.style.display === 'block') ? 'Debug ON' : 'Debug OFF';
            const oldText2 = debugToggle.innerText; debugToggle.innerText = dbg.style.display === 'block' ? 'Hide Debug' : 'Show Debug';
            setTimeout(()=>{ debugToggle.innerText = oldText2; if (meta) meta.textContent = ''; }, 900);
        });

        // global click logging to help diagnose unresponsive UI
        try {
            const parent = document.querySelector('.parent_popup');
            if (parent) parent.addEventListener('click', function(ev) { console.log('popup container click:', ev.target && (ev.target.id || ev.target.className || ev.target.tagName)); });
        } catch (e) { console.error('popup click logger error', e); }
    });
})();
