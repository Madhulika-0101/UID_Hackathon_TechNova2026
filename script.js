/* --- Global Event Data --- */

function showErr(id, msg) { document.getElementById(id).innerText = msg; }
const festEvents = [
    { id: 'E01', name: 'Hackathon', cat: 'Coding', datetime: '2026-10-10 09:00', venue: 'Lab 1', max: 50, fee: '$10', status: 'Open', image: 'images/hackathon.webp' },
    { id: 'E02', name: 'RoboWars', cat: 'Robotics', datetime: '2026-10-11 10:00', venue: 'Ground', max: 20, fee: '$15', status: 'Closed', image: 'images/robo.jpg' },
    { id: 'E03', name: 'Code Debugging', cat: 'Coding', datetime: '2026-10-12 09:00', venue: 'Lab 2', max: 40, fee: '$5', status: 'Open', image: 'images/code.jpg' },
    { id: 'E04', name: 'Paper Presentation', cat: 'Academic', datetime: '2026-10-10 14:00', venue: 'Seminar Hall', max: 30, fee: '$5', status: 'Open', image: 'images/paper.jpg' },
    { id: 'E05', name: 'Tech Quiz', cat: 'General', datetime: '2026-10-12 11:00', venue: 'Auditorium', max: 100, fee: 'Free', status: 'Open', image: 'images/tech.png' }
];

/* In-memory Session Arrays (replaces localStorage per requirements) */
const sessionRegistrations = [];
const sessionFeedbacks = [];
const FEST_DATE = new Date("October 10, 2026 09:00:00").getTime();

document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.id;

    if (pageId === 'home-page') initHomePage();
    if (pageId === 'events-page') initEventsPage();
    if (pageId === 'feedback-page') initFeedbackPage();
});

/* ================= HOME PAGE LOGIC ================= */
function initHomePage() {
    // 1. Dashboard Calculation
    document.getElementById('total-events').innerText = festEvents.length;
    document.getElementById('open-events').innerText = festEvents.filter(e => e.status === 'Open').length;
    document.getElementById('closed-events').innerText = festEvents.filter(e => e.status === 'Closed').length;

    // 2. Clock and Countdown
    setInterval(updateTimeAndCountdown, 1000);
    updateTimeAndCountdown();
}

function updateTimeAndCountdown() {
    const now = new Date();
    document.getElementById('current-datetime').innerText = now.toLocaleString();

    const distance = FEST_DATE - now.getTime();
    if (distance < 0) {
        document.getElementById('countdown-timer').innerText = "Fest has started!";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('countdown-timer').innerText = `${days}d ${hours}h ${mins}m ${secs}s`;
}

/* ================= EVENTS PAGE LOGIC ================= */
function initEventsPage() {
    renderEventCards();
    populateEventDropdown();

    // Toggle Team Fields
    const individualRadio = document.getElementById('individual');
    const teamRadio = document.getElementById('team');
    const teamFields = document.getElementById('team-fields');

    const toggleFields = () => { teamFields.style.display = teamRadio.checked ? 'block' : 'none'; };
    individualRadio.addEventListener('change', toggleFields);
    teamRadio.addEventListener('change', toggleFields);

    // Form Submission Event Handling
    document.getElementById('registration-form').addEventListener('submit', handleRegistration);
}

function renderEventCards() {
    const container = document.getElementById('event-cards-container');
    festEvents.forEach(e => {
        const card = document.createElement('div');
        // Added 'event-card' class to target specific background styling in CSS
        card.className = 'card event-card'; 
        // Apply the specific image for the event
        card.style.backgroundImage = `url('${e.image}')`; 
        
        card.innerHTML = `
            <h3>${e.name} (${e.id})</h3>
            <p><strong>Category:</strong> ${e.cat}</p>
            <p><strong>Time:</strong> ${e.datetime}</p>
            <p><strong>Venue:</strong> ${e.venue}</p>
            <p><strong>Fee:</strong> ${e.fee} | <strong>Max:</strong> ${e.max}</p>
            <p><strong>Status:</strong> <span class="status-${e.status.toLowerCase()}">${e.status}</span></p>
        `;
        container.appendChild(card);
    });
}

function populateEventDropdown() {
    const select = document.getElementById('event-select');
    festEvents.forEach(e => {
        const option = document.createElement('option');
        option.value = e.name;
        option.innerText = `${e.name} - ${e.status}`;
        select.appendChild(option);
    });
}

function handleRegistration(event) {
    event.preventDefault();
    clearErrors();

    // Field References
    const name = document.getElementById('student-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const regNo = document.getElementById('register-no').value.trim();
    const eventSelected = document.getElementById('event-select').value;
    const isTeam = document.getElementById('team').checked;
    
    let isValid = true;

    // Regex Validation
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;
    const regNoRegex = /^BL\.AI\.U4[A-Z]{3}\d{5}$/;

    if (!nameRegex.test(name)) { showErr('name-error', 'Name must contain only alphabets and spaces'); isValid = false; }
    if (!emailRegex.test(email)) { showErr('email-error', 'Invalid email format'); isValid = false; }
    if (!mobileRegex.test(mobile)) { showErr('mobile-error', 'Mobile must be exactly 10 digits'); isValid = false; }
    if (!regNoRegex.test(regNo)) { showErr('regno-error', 'Invalid Register Number pattern'); isValid = false; }
    
    // Event specific validation
    if (!eventSelected) { showErr('event-error', 'Please select an event'); isValid = false; }
    else {
        const eventData = festEvents.find(e => e.name === eventSelected);
        if (eventData && eventData.status === 'Closed') {
            showErr('event-error', 'This event is closed for registration.');
            isValid = false;
        }
    }

    // Team Validation
    let teamName = '', teamCount = '';
    if (isTeam) {
        teamName = document.getElementById('team-name').value.trim();
        teamCount = parseInt(document.getElementById('team-members').value, 10);
        
        if (!teamName) { showErr('team-name-error', 'Team name is required'); isValid = false; }
        if (isNaN(teamCount) || teamCount < 2 || teamCount > 4) {
            showErr('team-members-error', 'Team size must be between 2 and 4');
            isValid = false;
        }
    }

    // Duplicate Check
    const isDuplicate = sessionRegistrations.some(r => r.regNo === regNo && r.event === eventSelected);
    if (isDuplicate) {
        showMessage('form-messages', 'Duplicate Registration! You are already registered for this event.', 'error');
        isValid = false;
    }

    if (isValid) {
        const type = isTeam ? `Team (${teamCount})` : 'Individual';
        sessionRegistrations.push({ name, regNo, event: eventSelected, type });
        
        showMessage('form-messages', `Successfully registered ${name} for ${eventSelected}!`, 'success');
        document.getElementById('registration-form').reset();
        document.getElementById('team-fields').style.display = 'none'; // reset dynamic field
        updateRegistrationTable();
    }
}

function updateRegistrationTable() {
    const section = document.getElementById('reg-summary-section');
    const tbody = document.getElementById('reg-table-body');
    const countSpan = document.getElementById('total-reg-count');
    
    section.style.display = 'block';
    countSpan.innerText = sessionRegistrations.length;
    tbody.innerHTML = ''; // Clear existing

    sessionRegistrations.forEach(r => {
        const row = `<tr><td>${r.name}</td><td>${r.regNo}</td><td>${r.event}</td><td>${r.type}</td></tr>`;
        tbody.innerHTML += row;
    });
}

/* ================= FEEDBACK PAGE LOGIC ================= */
function initFeedbackPage() {
    document.getElementById('feedback-form').addEventListener('submit', handleFeedback);
}

function handleFeedback(event) {
    event.preventDefault();
    clearErrors();

    const regNo = document.getElementById('fb-regno').value.trim();
    const eventAttended = document.getElementById('fb-event').value;
    const comments = document.getElementById('fb-comments').value.trim();
    const ratingObj = document.querySelector('input[name="rating"]:checked');
    const regNoRegex = /^BL\.AI\.U4[A-Z]{3}\d{5}$/;
    
    let isValid = true;
    if (!regNoRegex.test(regNo)) { showErr('fb-regno-error', 'Invalid Register Number pattern'); isValid = false; }
    if (!eventAttended) { showErr('fb-event-error', 'Please select an event'); isValid = false; }
    if (!ratingObj) { showErr('fb-rating-error', 'Please select a rating'); isValid = false; }
    if (comments.length < 20) { showErr('fb-comments-error', 'Comments must be at least 20 characters'); isValid = false; }

    if (isValid) {
        const rating = parseInt(ratingObj.value, 10);
        sessionFeedbacks.push({ regNo, event: eventAttended, rating, comments });
        
        showMessage('fb-messages', 'Feedback submitted successfully!', 'success');
        document.getElementById('feedback-form').reset();
        updateFeedbackSummary();
    }
}

function updateFeedbackSummary() {
    const section = document.getElementById('fb-summary-section');
    const tbody = document.getElementById('fb-table-body');
    const avgSpan = document.getElementById('avg-rating');
    
    section.style.display = 'block';
    tbody.innerHTML = '';

    let totalRating = 0;
    sessionFeedbacks.forEach(f => {
        totalRating += f.rating;
        const row = `<tr><td>${f.regNo}</td><td>${f.event}</td><td>${f.rating}/5</td><td>${f.comments}</td></tr>`;
        tbody.innerHTML += row;
    });

    const avg = (totalRating / sessionFeedbacks.length).toFixed(1);
    avgSpan.innerText = avg;
}

/* ================= UTILITY FUNCTIONS ================= */
function clearErrors() { document.querySelectorAll('.error').forEach(e => e.innerText = ''); }
function showMessage(containerId, msg, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="msg-${type}">${msg}</div>`;
    setTimeout(() => container.innerHTML = '', 5000);
}