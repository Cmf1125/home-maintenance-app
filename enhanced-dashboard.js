// Enhanced Dashboard functionality
class EnhancedDashboard {
    constructor() {
        this.currentFilter = 'all'; // 'all', 'overdue', 'week', 'total'
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Make stat cards clickable
        document.getElementById('overdue-card')?.addEventListener('click', () => {
            this.setFilter('overdue');
        });

        document.getElementById('week-card')?.addEventListener('click', () => {
            this.setFilter('week');
        });

        document.getElementById('total-card')?.addEventListener('click', () => {
            this.setFilter('total');
        });

        document.getElementById('cost-card')?.addEventListener('click', () => {
            this.setFilter('cost');
        });
    }

    setFilter(filterType) {
        this.currentFilter = filterType;
        this.updateFilterUI();
        this.renderFilteredTasks();
        console.log(`🔍 Filter set to: ${filterType}`);
    }

    updateFilterUI() {
        // Remove active class from all cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.classList.remove('active-filter');
        });

        // Add active class to selected card
        const activeCard = document.getElementById(`${this.currentFilter}-card`);
        if (activeCard) {
            activeCard.classList.add('active-filter');
        }

        // Update filter title
        const filterTitles = {
            'all': 'All Tasks',
            'overdue': 'Overdue Tasks',
            'week': 'This Week\'s Tasks',
            'total': 'All Active Tasks',
            'cost': 'Tasks by Cost'
        };

        const titleElement = document.getElementById('tasks-list-title');
        if (titleElement) {
            titleElement.textContent = filterTitles[this.currentFilter] || 'Tasks';
        }
    }

    getFilteredTasks() {
        if (!window.tasks) return [];

        const now = new Date();
        const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        switch (this.currentFilter) {
            case 'overdue':
                return window.tasks.filter(task => 
                    !task.isCompleted && 
                    task.nextDue && 
                    new Date(task.nextDue) < now
                ).sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));

            case 'week':
                return window.tasks.filter(task => 
                    !task.isCompleted && 
                    task.nextDue && 
                    new Date(task.nextDue) <= oneWeek &&
                    new Date(task.nextDue) >= now
                ).sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));

            case 'total':
                return window.tasks.filter(task => 
                    !task.isCompleted && 
                    task.nextDue
                ).sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));

            case 'cost':
                return window.tasks.filter(task => 
                    !task.isCompleted && 
                    task.nextDue
                ).sort((a, b) => b.cost - a.cost);

            default:
                return window.tasks.filter(task => 
                    !task.isCompleted && 
                    task.nextDue
                ).sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue))
                .slice(0, 8);
        }
    }

    renderFilteredTasks() {
        const tasksList = document.getElementById('tasks-list');
        if (!tasksList) return;

        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            const emptyMessages = {
                'overdue': '🎉 No overdue tasks!',
                'week': '📅 No tasks due this week!',
                'total': '✅ All tasks complete!',
                'cost': '💰 No tasks with costs!',
                'all': '🎉 All tasks complete!'
            };
            
            tasksList.innerHTML = `<div class="p-6 text-center text-gray-500">${emptyMessages[this.currentFilter]}</div>`;
            return;
        }

        tasksList.innerHTML = filteredTasks.map(task => this.renderEnhancedTaskCard(task)).join('');
    }

    renderEnhancedTaskCard(task) {
        const now = new Date();
        const taskDate = new Date(task.nextDue);
        const daysUntilDue = Math.ceil((taskDate - now) / (24 * 60 * 60 * 1000));
        const isOverdue = daysUntilDue < 0;
        
        // Status styling
        const statusClass = isOverdue ? 'bg-red-50 border-l-4 border-red-400' : 
                           daysUntilDue <= 7 ? 'bg-orange-50 border-l-4 border-orange-400' : 'bg-white';
        
        // Due date display
        let dueDateDisplay;
        if (isOverdue) {
            dueDateDisplay = `<span class="text-red-600 font-semibold">${Math.abs(daysUntilDue)}d overdue</span>`;
        } else if (daysUntilDue === 0) {
            dueDateDisplay = `<span class="text-orange-600 font-semibold">Due today</span>`;
        } else if (daysUntilDue <= 7) {
            dueDateDisplay = `<span class="text-orange-600">Due in ${daysUntilDue}d</span>`;
        } else {
            dueDateDisplay = `<span class="text-gray-600">Due in ${daysUntilDue}d</span>`;
        }

        // Last completed display
        let lastCompletedDisplay = '';
        if (task.lastCompleted) {
            const lastDate = new Date(task.lastCompleted);
            const daysSince = Math.floor((now - lastDate) / (24 * 60 * 60 * 1000));
            lastCompletedDisplay = `<div class="text-xs text-gray-500 mt-1">
                Last done: ${daysSince}d ago (${lastDate.toLocaleDateString()})
            </div>`;
        } else {
            lastCompletedDisplay = `<div class="text-xs text-gray-500 mt-1">Never completed</div>`;
        }

        // Priority badge
        const priorityColors = {
            'high': 'bg-red-100 text-red-700',
            'medium': 'bg-yellow-100 text-yellow-700',
            'low': 'bg-gray-100 text-gray-700'
        };

        return `
            <div class="p-4 border-b ${statusClass}">
                <div class="flex justify-between items-start">
                    <div class="flex-1 pr-3">
                        <div class="flex items-start justify-between mb-2">
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-900 text-sm">${task.title}</h4>
                                <p class="text-xs text-gray-600 mt-1">${task.description}</p>
                            </div>
                            <div class="ml-3 text-right text-xs">
                                <div class="font-semibold">${taskDate.toLocaleDateString()}</div>
                                ${dueDateDisplay}
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-3 text-xs">
                            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded">${task.category}</span>
                            <span class="px-2 py-1 rounded ${priorityColors[task.priority]}">${task.priority}</span>
                            <span class="text-green-600 font-medium">$${task.cost}</span>
                            <span class="text-gray-500">Every ${task.frequency}d</span>
                        </div>
                        
                        ${lastCompletedDisplay}
                    </div>
                    
                    <div class="flex flex-col gap-1">
                        <button onclick="completeTask(${task.id})" 
                                class="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 text-xs touch-btn">
                            ✅ Complete
                        </button>
                        <button onclick="rescheduleTaskFromDashboard(${task.id})" 
                                class="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 text-xs touch-btn">
                            📅 Reschedule
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        this.updateStats();
        this.renderFilteredTasks();
        this.updateFilterUI();
    }

    updateStats() {
        if (!window.tasks) return;

        const now = new Date();
        const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        let overdueCount = 0;
        let weekCount = 0;
        let totalCost = 0;

        window.tasks.forEach(task => {
            if (!task.isCompleted && task.nextDue) {
                const taskDate = new Date(task.nextDue);
                if (taskDate < now) {
                    overdueCount++;
                }
                if (taskDate <= oneWeek && taskDate >= now) {
                    weekCount++;
                }
            }
            totalCost += task.cost * (365 / task.frequency);
        });

        const totalTasks = window.tasks.filter(t => !t.isCompleted && t.nextDue).length;

        // Update stat displays
        document.getElementById('overdue-count').textContent = overdueCount;
        document.getElementById('week-count').textContent = weekCount;
        document.getElementById('total-count').textContent = totalTasks;
        document.getElementById('annual-cost').textContent = '$' + Math.round(totalCost);
    }
}

// Function to reschedule task from dashboard
function rescheduleTaskFromDashboard(taskId) {
    const task = window.tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentDate = task.nextDue instanceof Date ? task.nextDue : new Date(task.nextDue);
    const newDateStr = prompt(`Reschedule "${task.title}" to (YYYY-MM-DD):`, 
                             currentDate.toISOString().split('T')[0]);
    
    if (newDateStr) {
        const newDate = new Date(newDateStr + 'T12:00:00');
        if (!isNaN(newDate.getTime())) {
            task.nextDue = newDate;
            saveData();
            
            // Refresh dashboard
            if (window.enhancedDashboard) {
                window.enhancedDashboard.render();
            }
            
            // Refresh calendar if it exists
            if (window.casaCareCalendar) {
                window.casaCareCalendar.refresh();
            }
            
            alert(`✅ Task rescheduled to ${newDate.toLocaleDateString()}`);
        } else {
            alert('❌ Invalid date format. Please use YYYY-MM-DD format.');
        }
    }
}

// Function to show all tasks (reset filter)
function showAllTasks() {
    if (window.enhancedDashboard) {
        window.enhancedDashboard.setFilter('all');
    }
}

// Initialize enhanced dashboard
function initializeEnhancedDashboard() {
    if (window.tasks && document.getElementById('tasks-list')) {
        window.enhancedDashboard = new EnhancedDashboard();
        console.log('✅ Enhanced dashboard initialized');
    }
}
