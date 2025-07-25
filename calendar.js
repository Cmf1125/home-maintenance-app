// Calendar functionality for Casa Care
class CasaCareCalendar {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.selectedDate = null;
        this.init();
    }

    init() {
        this.createCalendarHTML();
        this.bindEvents();
        this.renderCalendar();
    }

    createCalendarHTML() {
        const calendarContainer = document.getElementById('calendar-view');
        if (!calendarContainer) return;

        calendarContainer.innerHTML = `
            <div class="calendar-container">
                <!-- Calendar Header -->
                <div class="calendar-header">
                    <button id="prev-month" class="calendar-nav-btn">‹</button>
                    <h2 id="calendar-month-year" class="calendar-title"></h2>
                    <button id="next-month" class="calendar-nav-btn">›</button>
                </div>

                <!-- Calendar Grid -->
                <div class="calendar-grid">
                    <!-- Day headers -->
                    <div class="calendar-day-header">Sun</div>
                    <div class="calendar-day-header">Mon</div>
                    <div class="calendar-day-header">Tue</div>
                    <div class="calendar-day-header">Wed</div>
                    <div class="calendar-day-header">Thu</div>
                    <div class="calendar-day-header">Fri</div>
                    <div class="calendar-day-header">Sat</div>
                    
                    <!-- Calendar days will be inserted here -->
                    <div id="calendar-days" class="calendar-days-container"></div>
                </div>

                <!-- Selected Day Panel -->
                <div id="selected-day-panel" class="selected-day-panel hidden">
                    <div class="selected-day-header">
                        <h3 id="selected-day-title">Selected Day</h3>
                        <button id="close-day-panel" class="close-panel-btn">×</button>
                    </div>
                    <div id="selected-day-tasks" class="selected-day-tasks">
                        <!-- Tasks for selected day will appear here -->
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('prev-month')?.addEventListener('click', () => {
            this.previousMonth();
        });

        document.getElementById('next-month')?.addEventListener('click', () => {
            this.nextMonth();
        });

        // Close day panel
        document.getElementById('close-day-panel')?.addEventListener('click', () => {
            this.closeDayPanel();
        });
    }

    renderCalendar() {
        this.updateMonthYearDisplay();
        this.renderCalendarDays();
    }

    updateMonthYearDisplay() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const monthYearElement = document.getElementById('calendar-month-year');
        if (monthYearElement) {
            monthYearElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }
    }

    renderCalendarDays() {
        const calendarDaysContainer = document.getElementById('calendar-days');
        if (!calendarDaysContainer) return;

        calendarDaysContainer.innerHTML = '';

        // Get first day of month and number of days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Add empty cells for previous month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarDaysContainer.appendChild(emptyDay);
        }

        // Add days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createDayElement(day);
            calendarDaysContainer.appendChild(dayElement);
        }
    }

    createDayElement(day) {
        const dayElement = document.createElement('div');
        const currentDate = new Date(this.currentYear, this.currentMonth, day);
        const today = new Date();
        
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = currentDate.toISOString().split('T')[0];

        // Check if it's today
        if (this.isSameDay(currentDate, today)) {
            dayElement.classList.add('today');
        }

        // Check if it's selected
        if (this.selectedDate && this.isSameDay(currentDate, this.selectedDate)) {
            dayElement.classList.add('selected');
        }

        // Get tasks for this day
        const dayTasks = this.getTasksForDate(currentDate);
        
        // Create day content
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="day-tasks">
                ${this.renderDayTaskDots(dayTasks)}
            </div>
        `;

        // Add click event
        dayElement.addEventListener('click', () => {
            this.selectDay(currentDate, dayTasks);
        });

        return dayElement;
    }

    renderDayTaskDots(dayTasks) {
        if (dayTasks.length === 0) return '';

        // Group tasks by priority
        const priorityCounts = { high: 0, medium: 0, low: 0 };
        dayTasks.forEach(task => {
            priorityCounts[task.priority]++;
        });

        let dotsHTML = '';
        
        // Add dots for each priority level
        if (priorityCounts.high > 0) {
            dotsHTML += `<div class="task-dot high" title="${priorityCounts.high} high priority tasks"></div>`;
        }
        if (priorityCounts.medium > 0) {
            dotsHTML += `<div class="task-dot medium" title="${priorityCounts.medium} medium priority tasks"></div>`;
        }
        if (priorityCounts.low > 0) {
            dotsHTML += `<div class="task-dot low" title="${priorityCounts.low} low priority tasks"></div>`;
        }

        // Show count if more than 3 tasks
        if (dayTasks.length > 3) {
            dotsHTML += `<div class="task-count">+${dayTasks.length - 3}</div>`;
        }

        return dotsHTML;
    }

    getTasksForDate(date) {
        if (!window.tasks) return [];

        return window.tasks.filter(task => {
            if (!task.nextDue) return false;
            return this.isSameDay(new Date(task.nextDue), date);
        });
    }

    selectDay(date, dayTasks) {
        // Update selected date
        this.selectedDate = date;
        
        // Update visual selection
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        document.querySelector(`[data-date="${date.toISOString().split('T')[0]}"]`)?.classList.add('selected');

        // Show day panel
        this.showDayPanel(date, dayTasks);
    }

    showDayPanel(date, dayTasks) {
        const panel = document.getElementById('selected-day-panel');
        const title = document.getElementById('selected-day-title');
        const tasksContainer = document.getElementById('selected-day-tasks');

        if (!panel || !title || !tasksContainer) return;

        // Format date
        const formatOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = date.toLocaleDateString('en-US', formatOptions);

        title.textContent = formattedDate;

        // Render tasks
        if (dayTasks.length === 0) {
            tasksContainer.innerHTML = '<div class="no-tasks">No tasks scheduled for this day</div>';
        } else {
            tasksContainer.innerHTML = dayTasks.map(task => this.renderDayPanelTask(task)).join('');
        }

        panel.classList.remove('hidden');
    }

    renderDayPanelTask(task) {
        const isOverdue = new Date(task.nextDue) < new Date();
        const priorityClass = `priority-${task.priority}`;
        const overdueClass = isOverdue ? 'overdue' : '';

        return `
            <div class="day-panel-task ${priorityClass} ${overdueClass}">
                <div class="task-info">
                    <h4 class="task-title">${task.title}</h4>
                    <p class="task-description">${task.description}</p>
                    <div class="task-meta">
                        <span class="task-category">${task.category}</span>
                        <span class="task-cost">$${task.cost}</span>
                        <span class="task-priority">${task.priority} priority</span>
                        ${isOverdue ? '<span class="overdue-badge">OVERDUE</span>' : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button onclick="completeTask(${task.id})" class="complete-task-btn">✅ Complete</button>
                    <button onclick="rescheduleTask(${task.id})" class="reschedule-task-btn">📅 Reschedule</button>
                </div>
            </div>
        `;
    }

    closeDayPanel() {
        const panel = document.getElementById('selected-day-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
        
        // Clear selection
        this.selectedDate = null;
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
        this.closeDayPanel();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.renderCalendar();
        this.closeDayPanel();
    }

    // Utility function to check if two dates are the same day
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // Public method to refresh calendar when tasks change
    refresh() {
        this.renderCalendar();
    }
}

// Function to reschedule a task (called from calendar)
function rescheduleTask(taskId) {
    const task = window.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newDateStr = prompt(`Reschedule "${task.title}" to (YYYY-MM-DD):`, 
                             task.nextDue.toISOString().split('T')[0]);
    
    if (newDateStr) {
        const newDate = new Date(newDateStr + 'T12:00:00');
        if (!isNaN(newDate.getTime())) {
            task.nextDue = newDate;
            saveData(); // Use existing saveData function
            
            // Refresh calendar and dashboard
            if (window.casaCareCalendar) {
                window.casaCareCalendar.refresh();
            }
            updateDashboard(); // Use existing updateDashboard function
            
            alert(`✅ Task rescheduled to ${newDate.toLocaleDateString()}`);
        } else {
            alert('❌ Invalid date format. Please use YYYY-MM-DD format.');
        }
    }
}

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if calendar view exists
    if (document.getElementById('calendar-view')) {
        window.casaCareCalendar = new CasaCareCalendar();
    }
});
