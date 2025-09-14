// Calendar functionality for The Home Keeper
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
            <div class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-4">
                <!-- Calendar Header -->
                <div class="bg-white/90 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20 shadow-sm">
                    <div class="flex items-center justify-between">
                        <button id="prev-month" class="bg-blue-100 hover:bg-blue-200 text-blue-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl transition-colors">‹</button>
                        <h2 id="calendar-month-year" class="text-2xl font-bold text-gray-900"></h2>
                        <button id="next-month" class="bg-blue-100 hover:bg-blue-200 text-blue-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl transition-colors">›</button>
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div class="bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm overflow-hidden">
                    <div class="grid grid-cols-7">
                        <!-- Day headers -->
                        <div class="bg-gray-50/90 p-3 text-center font-semibold text-gray-700 text-sm border-b border-gray-200">Sun</div>
                        <div class="bg-gray-50/90 p-3 text-center font-semibold text-gray-700 text-sm border-b border-gray-200">Mon</div>
                        <div class="bg-gray-50/90 p-3 text-center font-semibold text-gray-700 text-sm border-b border-gray-200">Tue</div>
                        <div class="bg-gray-50/90 p-3 text-center font-semibold text-gray-700 text-sm border-b border-gray-200">Wed</div>
                        <div class="bg-gray-50/90 p-3 text-center font-semibold text-gray-700 text-sm border-b border-gray-200">Thu</div>
                        <div class="bg-gray-50/90 p-3 text-center font-semibold text-gray-700 text-sm border-b border-gray-200">Fri</div>
                        <div class="bg-gray-50/90 p-3 text-center font-semibold text-gray-700 text-sm border-b border-gray-200">Sat</div>
                    </div>
                    
                    <!-- Calendar days will be inserted here -->
                    <div id="calendar-days" class="grid grid-cols-7"></div>
                </div>

                <!-- Task Panel Below Calendar -->
                <div id="task-panel" class="bg-white border-t-2 border-blue-100 hidden">
                    <div class="p-4">
                        <div class="flex items-center justify-between mb-3">
                            <h3 id="selected-date-title" class="text-lg font-bold text-gray-900">Select a date</h3>
                            <button id="clear-selection" class="text-gray-500 hover:text-gray-700 text-sm">Clear</button>
                        </div>
                        <div id="task-panel-content" class="space-y-2">
                            <p class="text-gray-500 text-center py-8">Click on a date to see tasks</p>
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

        // Clear task panel selection
        document.getElementById('clear-selection')?.addEventListener('click', () => {
            this.clearTaskPanel();
        });
    }

    renderCalendar() {
        this.updateMonthYearDisplay();
        this.renderCalendarDays();
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

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
    
    // Categorize tasks by visual priority (same logic as dashboard)
    const priorityCounts = { overdue: 0, safety: 0, dueSoon: 0, normal: 0 };
    
    dayTasks.forEach(task => {
        const taskDate = new Date(task.nextDue || task.dueDate);
        taskDate.setHours(0, 0, 0, 0); // Normalize task date
        
        const daysUntilDue = Math.ceil((taskDate - currentDate) / (24 * 60 * 60 * 1000));
        const isOverdue = daysUntilDue < 0;
        
        // Apply same visual priority logic as dashboard
        if (isOverdue) {
            priorityCounts.overdue++;
        } else if (task.category === 'Safety') {
            priorityCounts.safety++;
        } else if (daysUntilDue <= 7) {
            priorityCounts.dueSoon++;
        } else {
            priorityCounts.normal++;
        }
    });

    let dotsHTML = '';
    
    // Add dots for each priority level (highest priority first)
    if (priorityCounts.overdue > 0) {
        dotsHTML += `<div class="task-dot overdue" title="${priorityCounts.overdue} overdue tasks"></div>`;
    }
    if (priorityCounts.safety > 0) {
        dotsHTML += `<div class="task-dot safety" title="${priorityCounts.safety} safety tasks"></div>`;
    }
    if (priorityCounts.dueSoon > 0) {
        dotsHTML += `<div class="task-dot due-soon" title="${priorityCounts.dueSoon} tasks due soon"></div>`;
    }
    if (priorityCounts.normal > 0) {
        dotsHTML += `<div class="task-dot normal" title="${priorityCounts.normal} normal tasks"></div>`;
    }

    // Show count if more than 4 total dots would be displayed
    const totalVisualDots = (priorityCounts.overdue > 0 ? 1 : 0) + 
                           (priorityCounts.safety > 0 ? 1 : 0) + 
                           (priorityCounts.dueSoon > 0 ? 1 : 0) + 
                           (priorityCounts.normal > 0 ? 1 : 0);
    
    if (dayTasks.length > 4 && totalVisualDots >= 3) {
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

        const tasksForDate = [];
        const searchDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        window.tasks.forEach(task => {
            if (!task.nextDue || !task.frequency) return;
            
            // Get the task's base due date
            let baseTaskDate;
            if (task.nextDue instanceof Date) {
                baseTaskDate = task.nextDue;
            } else {
                baseTaskDate = new Date(task.nextDue);
            }
            
            // Normalize the base task date
            const normalizedBaseDate = new Date(baseTaskDate.getFullYear(), baseTaskDate.getMonth(), baseTaskDate.getDate());
            
            // Check if this date matches the task's next due date
            if (normalizedBaseDate.getTime() === searchDate.getTime()) {
                tasksForDate.push(task);
                return;
            }
            
            // For recurring tasks, check if this date is a future occurrence
            if (task.frequency > 0) {
                // Calculate how many days difference between search date and base date
                const daysDiff = Math.floor((searchDate.getTime() - normalizedBaseDate.getTime()) / (24 * 60 * 60 * 1000));
                
                // Only look ahead (positive days) and within reasonable range (2 years)
                if (daysDiff > 0 && daysDiff <= 730) {
                    // Check if this date falls on a recurring interval
                    if (daysDiff % task.frequency === 0) {
                        // Create a virtual instance for this recurring date
                        const recurringTask = {
                            ...task,
                            nextDue: new Date(searchDate),
                            isRecurringInstance: true,
                            originalDueDate: normalizedBaseDate
                        };
                        tasksForDate.push(recurringTask);
                    }
                }
            }
        });

        if (tasksForDate.length > 0) {
            console.log(`📅 Found ${tasksForDate.length} tasks for ${date.toDateString()} (including recurring)`);
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

        // Show task panel below calendar
        this.showTaskPanel(date, dayTasks);
    }

showTaskPanel(date, dayTasks) {
    const taskPanel = document.getElementById('task-panel');
    const dateTitle = document.getElementById('selected-date-title');
    const taskContent = document.getElementById('task-panel-content');

    if (!taskPanel || !dateTitle || !taskContent) return;

    // Format date
    const formatOptions = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = date.toLocaleDateString('en-US', formatOptions);

    dateTitle.textContent = formattedDate;

    // Render tasks
    if (dayTasks.length === 0) {
        taskContent.innerHTML = '<div class="text-center text-gray-500 py-8">No tasks scheduled for this day</div>';
    } else {
        taskContent.innerHTML = dayTasks.map(task => this.renderTaskPanelTask(task)).join('');
    }

    // Show task panel
    taskPanel.classList.remove('hidden');
    
    // Smooth scroll to task panel
    setTimeout(() => {
        taskPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

clearTaskPanel() {
    const taskPanel = document.getElementById('task-panel');
    const dateTitle = document.getElementById('selected-date-title');
    const taskContent = document.getElementById('task-panel-content');

    if (taskPanel) {
        taskPanel.classList.add('hidden');
    }

    if (dateTitle) {
        dateTitle.textContent = 'Select a date';
    }

    if (taskContent) {
        taskContent.innerHTML = '<p class="text-gray-500 text-center py-8">Click on a date to see tasks</p>';
    }

    // Clear visual selection
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });

    this.selectedDate = null;
}
    
    renderTaskPanelTask(task) {
        const taskDate = task.nextDue instanceof Date ? task.nextDue : new Date(task.nextDue);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);
        
        const isOverdue = taskDate < currentDate;
        const isToday = taskDate.getTime() === currentDate.getTime();
        
        let statusClass = 'border-l-4 border-gray-300';
        let statusIcon = '⚪';
        
        if (isOverdue) {
            statusClass = 'border-l-4 border-red-400 bg-red-50';
            statusIcon = '🔴';
        } else if (task.category === 'Safety' || task.priority === 'high') {
            statusClass = 'border-l-4 border-orange-400 bg-orange-50';
            statusIcon = '🟠';
        } else if (isToday) {
            statusClass = 'border-l-4 border-blue-400 bg-blue-50';
            statusIcon = '🔵';
        }
        
        return `
            <div class="bg-white rounded-lg p-3 shadow-sm ${statusClass} cursor-pointer hover:shadow-md transition-shadow" onclick="window.TaskManager.openModal(window.tasks.find(t => t.id === ${task.id}), false)">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span>${statusIcon}</span>
                            <span class="font-semibold text-gray-900 text-sm">${task.title}</span>
                        </div>
                        <p class="text-gray-600 text-xs mb-2 line-clamp-2">${task.description || ''}</p>
                        <div class="flex items-center gap-3 text-xs text-gray-500">
                            <span>📋 ${task.category}</span>
                            <span>💰 $${task.cost}</span>
                            <span>🔄 Every ${task.frequency} days</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1 ml-3">
                        <button onclick="event.stopPropagation(); completeTask(${task.id})" 
                                class="bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs">
                            Complete
                        </button>
                        <button onclick="event.stopPropagation(); rescheduleTaskFromDashboard(${task.id}, event)" 
                                class="bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded text-xs">
                            Reschedule
                        </button>
                    </div>
                </div>
            </div>
        `;
}

// This method is no longer needed - we use clearTaskPanel instead

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
        this.clearTaskPanel();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.renderCalendar();
        this.clearTaskPanel();
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
    console.log('📅 Calendar reschedule button clicked for task:', taskId);
    
    // Use the fixed reschedule function
    if (typeof window.rescheduleTaskFromDashboard === 'function') {
        window.rescheduleTaskFromDashboard(taskId);
    } else {
        console.error('❌ Fixed reschedule function not available');
        alert('❌ Reschedule function not available');
    }
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
