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
        this.logTaskDates(); // Debug: show all task dates
        console.log('📅 Calendar initialized');
    }

    logTaskDates() {
        console.log('🔍 DEBUGGING TASK DATES:');
        if (window.tasks && window.tasks.length > 0) {
            window.tasks.forEach((task, index) => {
                if (task.nextDue) {
                    const taskDate = task.nextDue instanceof Date ? task.nextDue : new Date(task.nextDue);
                    console.log(`Task ${index + 1}: "${task.title}" due on ${taskDate.toDateString()} (${taskDate.toISOString().split('T')[0]})`);
                }
            });
        }
        console.log(`📅 Currently viewing: ${this.getMonthName()} ${this.currentYear}`);
    }

    getMonthName() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[this.currentMonth];
    }

    createCalendarHTML() {
        const calendarContainer = document.getElementById('calendar-view');
        if (!calendarContainer) {
            console.error('❌ Calendar container not found');
            return;
        }

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

                <!-- Debug Info -->
                <div class="p-4 bg-gray-100 text-sm">
                    <strong>Debug Info:</strong> 
                    <span id="debug-info">Loading...</span>
                    <br>
                    <strong>Task Date Range:</strong> 
                    <span id="date-range-info">Calculating...</span>
                    <br>
                    <button onclick="window.casaCareCalendar.goToTaskMonth()" class="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1">
                        Go to First Task Month
                    </button>
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
        this.updateDebugInfo();
    }

    updateDebugInfo() {
        const debugElement = document.getElementById('debug-info');
        const dateRangeElement = document.getElementById('date-range-info');
        
        if (debugElement) {
            const taskCount = window.tasks ? window.tasks.length : 0;
            const tasksWithDates = window.tasks ? window.tasks.filter(t => t.nextDue).length : 0;
            debugElement.textContent = `${taskCount} total tasks, ${tasksWithDates} with due dates`;
        }

        if (dateRangeElement && window.tasks) {
            const taskDates = window.tasks
                .filter(t => t.nextDue)
                .map(t => t.nextDue instanceof Date ? t.nextDue : new Date(t.nextDue))
                .sort((a, b) => a - b);
            
            if (taskDates.length > 0) {
                const firstDate = taskDates[0].toDateString();
                const lastDate = taskDates[taskDates.length - 1].toDateString();
                dateRangeElement.textContent = `${firstDate} to ${lastDate}`;
            } else {
                dateRangeElement.textContent = 'No tasks with dates';
            }
        }
    }

    goToTaskMonth() {
        if (window.tasks) {
            const taskDates = window.tasks
                .filter(t => t.nextDue)
                .map(t => t.nextDue instanceof Date ? t.nextDue : new Date(t.nextDue))
                .sort((a, b) => a - b);
            
            if (taskDates.length > 0) {
                const firstTaskDate = taskDates[0];
                this.currentMonth = firstTaskDate.getMonth();
                this.currentYear = firstTaskDate.getFullYear();
                this.renderCalendar();
                console.log(`📅 Jumped to ${this.getMonthName()} ${this.currentYear}`);
            }
        }
    }

    updateMonthYearDisplay() {
        const monthYearElement = document.getElementById('calendar-month-year');
        if (monthYearElement) {
            monthYearElement.textContent = `${this.getMonthName()} ${this.currentYear}`;
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
        // Check if window.tasks exists and has data
        if (!window.tasks || !Array.isArray(window.tasks)) {
            console.warn('⚠️ No tasks data available for calendar');
            return [];
        }

        const tasksForDate = window.tasks.filter(task => {
            if (!task.nextDue) return false;
            
            // Handle both Date objects and string dates
            let taskDate;
            if (task.nextDue instanceof Date) {
                taskDate = task.nextDue;
            } else {
                taskDate = new Date(task.nextDue);
            }
            
            // Normalize both dates to avoid timezone issues
            const normalizedTaskDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
            const normalizedSearchDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            
            const matches = normalizedTaskDate.getTime() === normalizedSearchDate.getTime();
            
            // Debug log for the first few checks
            if (date.getDate() <= 3) {
                console.log(`🔍 Comparing task "${task.title}": ${normalizedTaskDate.toDateString()} vs ${normalizedSearchDate.toDateString()} = ${matches}`);
            }
            
            return matches;
        });

        if (tasksForDate.length > 0) {
            console.log(`📅 Found ${tasksForDate.length} tasks for ${date.toDateString()}`);
        }
        
        return tasksForDate;
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
        const taskDate = task.nextDue instanceof Date ? task.nextDue : new Date(task.nextDue);
        const isOverdue = taskDate < new Date();
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
        console.log('📅 Refreshing calendar...');
        this.renderCalendar();
    }
}

// Function to reschedule a task (called from calendar)
function rescheduleTask(taskId) {
    // Use the same beautiful date picker modal as dashboard
    rescheduleTaskFromDashboard(taskId);
}
// Initialize calendar - but wait for tasks to be loaded
function initializeCalendar() {
    // Only initialize if calendar view exists and we have tasks
    if (document.getElementById('calendar-view') && window.tasks) {
        window.casaCareCalendar = new CasaCareCalendar();
        console.log('✅ Calendar initialized with tasks');
    } else {
        console.log('⏳ Waiting for calendar view or tasks data...');
    }
}

// Try to initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeCalendar, 100); // Small delay to ensure tasks are loaded
});
