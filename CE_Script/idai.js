document.addEventListener('DOMContentLoaded', function() {
    // Sidebar navigation
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const navMap = {
        'IDAI+': 'idai.html',
        'SCHEDULES': 'landing.html',
        'COURSES': 'courses.html',
        'COURSE SCHEDULE': 'landing.html',
        'MY UT': 'index.html'
    };

    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent.trim().toUpperCase();
            const dest = navMap[text];
            if (dest) window.location.href = dest;
        });
    });

    // State
    let uploadedPDF = null;
    let extractedData = null;
    let conversationHistory = [];

    // Elements
   // NEW CODE
    const pdfUpload = document.getElementById('pdf-upload');
    const uploadTriggerBtn = document.getElementById('upload-trigger-btn');

    // Make the button trigger the file input
    uploadTriggerBtn.addEventListener('click', function() {
        pdfUpload.click();
    });
    
    const fileName = document.getElementById('file-name');
    const uploadStatus = document.getElementById('upload-status');
    const generateBtn = document.getElementById('generate-btn');
    const uploadSection = document.getElementById('upload-section');
    const chatSection = document.getElementById('chat-section');
    const loading = document.getElementById('loading');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    // PDF Upload Handler
    pdfUpload.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        fileName.textContent = `Selected: ${file.name}`;
        uploadedPDF = file;

        // Parse PDF
        try {
            uploadStatus.className = 'upload-status';
            uploadStatus.textContent = 'Processing PDF...';
            uploadStatus.style.display = 'block';

            const text = await extractPDFText(file);
            extractedData = parseDegreAudit(text);

            uploadStatus.className = 'upload-status success';
            uploadStatus.textContent = `✓ Successfully parsed! Found ${extractedData.remainingCourses.length} required courses.`;
            generateBtn.disabled = false;
        } catch (error) {
            console.error('PDF parsing error:', error);
            uploadStatus.className = 'upload-status error';
            uploadStatus.textContent = '✗ Error parsing PDF. Please try again.';
            generateBtn.disabled = true;
        }
    });

    // Extract text from PDF (using pdf.js or similar library)
    async function extractPDFText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    // For demo purposes, we'll simulate extraction
                    // In production, use pdf.js: https://mozilla.github.io/pdf.js/
                    
                    // Simulated extraction - replace with actual PDF.js implementation
                    const text = await simulatePDFExtraction(file);
                    resolve(text);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // Simulate PDF extraction (REPLACE with real pdf.js implementation)
    async function simulatePDFExtraction(file) {
        // This is a placeholder - implement actual PDF parsing
        return `
            Major: Computer Science
            Remaining Courses:
            - C S 331 (Theory)
            - 21 hours of upper-division CS electives
            - M 408D (Calculus II)
            - 3 hours of science/math electives
        `;
    }

    // Parse degree audit text
    function parseDegreAudit(text) {
        const data = {
            major: '',
            remainingCourses: [],
            completedHours: 0,
            totalRequired: 120
        };

        // Extract major
        const majorMatch = text.match(/Major[:\s]+([^\n]+)/i);
        if (majorMatch) data.major = majorMatch[1].trim();

        // Extract remaining courses (simple parsing - improve as needed)
        const lines = text.split('\n');
        lines.forEach(line => {
            // Look for course codes (e.g., "C S 331", "M 408D")
            const courseMatch = line.match(/([A-Z]{1,4}\s\d{3}[A-Z]?)/g);
            if (courseMatch) {
                courseMatch.forEach(course => {
                    if (!data.remainingCourses.includes(course)) {
                        data.remainingCourses.push(course);
                    }
                });
            }

            // Look for hour requirements
            const hoursMatch = line.match(/(\d+)\s+hours?\s+(required|lacking)/i);
            if (hoursMatch) {
                // Track hours needed
            }
        });

        return data;
    }

    // Generate Schedules Button
    generateBtn.addEventListener('click', async function() {
        if (!extractedData) return;

        // Get preferences
        const preferences = {
            morning: document.getElementById('pref-morning').checked,
            afternoon: document.getElementById('pref-afternoon').checked,
            evening: document.getElementById('pref-evening').checked,
            rmpRating: document.getElementById('pref-rmp').value,
            daysPreference: document.getElementById('pref-days').value,
            numSchedules: parseInt(document.getElementById('num-schedules').value)
        };

        // Show loading
        loading.style.display = 'flex';

        // Call GPT API to generate schedules
        try {
            const schedules = await generateSchedulesWithGPT(extractedData, preferences);
            
            // Hide upload section, show chat
            uploadSection.style.display = 'none';
            chatSection.style.display = 'flex';
            loading.style.display = 'none';

            // Display generated schedules
            displaySchedules(schedules);
        } catch (error) {
            console.error('Schedule generation error:', error);
            loading.style.display = 'none';
            alert('Error generating schedules. Please try again.');
        }
    });

    // Generate schedules using GPT API
    async function generateSchedulesWithGPT(degreeData, preferences) {
        // Load courses.json
        const coursesResponse = await fetch('courses.json');
        const allCourses = await coursesResponse.json();

        // Filter courses based on requirements
        const relevantCourses = filterRelevantCourses(allCourses, degreeData, preferences);

        // Prepare prompt for GPT
        const prompt = `
You are a schedule optimizer for UT Austin students.

Student's degree requirements:
${JSON.stringify(degreeData, null, 2)}

Available courses:
${JSON.stringify(relevantCourses.slice(0, 100), null, 2)}

Student preferences:
- Morning classes: ${preferences.morning}
- Afternoon classes: ${preferences.afternoon}
- Evening classes: ${preferences.evening}
- Minimum professor rating: ${preferences.rmpRating}
- Days preference: ${preferences.daysPreference}

Generate ${preferences.numSchedules} optimal schedules that:
1. Fulfill the student's remaining degree requirements
2. Respect time preferences
3. Maximize professor ratings
4. Minimize scheduling conflicts
5. Balance course load across days

Return ONLY valid JSON in this exact format:
{
  "schedules": [
    {
      "name": "Schedule 1",
      "courses": [
        {
          "unique": "12345",
          "course_name": "C S 331",
          "instructor": "Smith, John",
          "days": "MWF",
          "hour": "9:00 a.m.-10:00 a.m.",
          "professor_rating": 4.5
        }
      ],
      "reasoning": "This schedule prioritizes morning classes with highly-rated professors."
    }
  ]
}
`;

        // Call GPT API (you'll need to add your OpenAI API key)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY_HERE' // REPLACE THIS
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are a UT Austin course scheduling assistant. Always respond with valid JSON only.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        
        return result.schedules;
    }

    // Filter courses based on requirements
    function filterRelevantCourses(allCourses, degreeData, preferences) {
        return allCourses.filter(course => {
            // Check if course is in remaining requirements
            const isRequired = degreeData.remainingCourses.some(req => 
                course.course_name && course.course_name.includes(req)
            );

            // Check RMP rating
            const meetsRating = !preferences.rmpRating || preferences.rmpRating === 'any' ||
                (course.professor_rating && course.professor_rating >= parseFloat(preferences.rmpRating));

            return isRequired && meetsRating;
        });
    }

    // Display generated schedules in chat
    function displaySchedules(schedules) {
        addMessage('assistant', `✨ Great! I've generated ${schedules.length} optimized schedules for you:`);

        schedules.forEach((schedule, index) => {
            const scheduleHTML = `
                <div class="schedule-preview">
                    <h4>${schedule.name}</h4>
                    <p><em>${schedule.reasoning}</em></p>
                    ${schedule.courses.map(course => `
                        <div class="course-item">
                            <strong>${course.course_name}</strong> - ${course.instructor}<br>
                            ${course.days} ${course.hour} | Rating: ${'★'.repeat(Math.floor(course.professor_rating))}
                        </div>
                    `).join('')}
                    <button onclick="saveScheduleToLocalStorage(${index})" style="margin-top: 10px; padding: 8px 16px; background: #BF5700; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        💾 Save This Schedule
                    </button>
                </div>
            `;
            addMessage('assistant', scheduleHTML);
        });

        addMessage('assistant', 'Would you like me to adjust any of these schedules? Just let me know your preferences!');
        
        // Store schedules globally for saving
        window.generatedSchedules = schedules;
    }

    // Save schedule to localStorage
    window.saveScheduleToLocalStorage = function(index) {
        const schedule = window.generatedSchedules[index];
        
        // Convert to format compatible with landing.js
        const store = JSON.parse(localStorage.getItem('userSchedules') || '{"schedules": [], "selectedId": null}');
        
        const newSchedule = {
            id: 's_' + Date.now(),
            name: schedule.name,
            items: schedule.courses.map((course, i) => {
                const dayMap = { 'M': 1, 'T': 2, 'W': 3, 'R': 4, 'F': 5 };
                const day = course.days.includes('M') ? 1 : 
                           course.days.includes('T') ? 2 :
                           course.days.includes('W') ? 3 :
                           course.days.includes('R') ? 4 : 5;
                
                const row = course.hour.includes('8:') ? 1 :
                           course.hour.includes('9:') ? 2 :
                           course.hour.includes('11:') ? 3 :
                           course.hour.includes('12:') ? 4 :
                           course.hour.includes('2:') ? 5 : 6;

                return {
                    id: course.unique,
                    unique: course.unique,
                    course_name: course.course_name,
                    instructor: course.instructor,
                    day: day,
                    row: row,
                    color: ['red', 'blue', 'purple', 'green', 'orange', 'teal'][i % 6]
                };
            })
        };

        store.schedules.push(newSchedule);
        store.selectedId = newSchedule.id;
        localStorage.setItem('userSchedules', JSON.stringify(store));

        addMessage('system', `✓ ${schedule.name} has been saved! You can view it in the Course Schedule page.`);
    };

    // Chat functionality
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage('user', message);
        chatInput.value = '';

        // Show loading
        const loadingMsg = addMessage('assistant', '...');
        
        // Get response from GPT
        try {
            conversationHistory.push({ role: 'user', content: message });
            const response = await getChatResponse(message);
            loadingMsg.remove();
            addMessage('assistant', response);
        } catch (error) {
            loadingMsg.remove();
            addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        }
    }

    async function getChatResponse(message) {
        // Call GPT with conversation history
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY_HERE'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are a helpful UT Austin scheduling assistant.' },
                    ...conversationHistory
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;
        conversationHistory.push({ role: 'assistant', content: reply });
        
        return reply;
    }

    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    // Reset function
    window.resetToUpload = function() {
        uploadSection.style.display = 'flex';
        chatSection.style.display = 'none';
        chatMessages.innerHTML = '';
        conversationHistory = [];
        uploadedPDF = null;
        extractedData = null;
    };
});