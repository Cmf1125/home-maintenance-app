// Enhanced Dashboard functionality for The Home Keeper - Updated for Simplified Date System
class EnhancedDashboard {
    constructor() {
    this.currentFilter = 'all';
    
    // Use global category configuration (defined in app.js)
    this.categoryConfig = window.categoryConfig || {
        'HVAC': { icon: '🌡️', color: 'blue' },
        'Water Systems': { icon: '💧', color: 'cyan' },
        'Exterior': { icon: '🏠', color: 'green' },
        'Pest Control': { icon: '🐛', color: 'orange' },
        'Safety': { icon: '⚠️', color: 'red' },
        'General': { icon: '🔧', color: 'gray' }
    };
    
    console.log('🎯 Enhanced Dashboard initializing with shared categoryConfig');
    this.init();
}

    init() {
        this.bindEvents();
        this.render();
    }

    // FIXED: Enhanced Dashboard bindEvents() - Remove cost handler and fix syntax errors
    bindEvents() {
        // Make stat cards clickable for filtering
        const overdueCard = document.getElementById('overdue-card');
        if (overdueCard) {
            overdueCard.addEventListener('click', () => {
                console.log('📊 Overdue card clicked');
                this.setFilter('overdue');
            });
        }

        const weekCard = document.getElementById('week-card');
        if (weekCard) {
            weekCard.addEventListener('click', () => {
                console.log('📊 Week card clicked');
                this.setFilter('week');
            });
        }

        // Total Tasks card navigates to All Tasks view
        const totalCard = document.getElementById('total-card');
        if (totalCard) {
            totalCard.addEventListener('click', () => {
                console.log('📋 Total Tasks clicked - navigating to All Tasks view');
                if (typeof showAllTasks === 'function') {
                    showAllTasks();
                } else {
                    console.error('❌ showAllTasks function not found');
                }
            });
        }

        console.log('✅ Enhanced dashboard events bound successfully');
    }

    setFilter(filterType) {
    this.currentFilter = filterType;
    this.updateFilterUI();
    this.renderFilteredTasks();
    
    // 🎯 NEW: Smooth scroll to task list with visual feedback
    this.scrollToTaskList();
}

    // Add this method to your EnhancedDashboard class:
    scrollToTaskList() {
        const tasksList = document.getElementById('tasks-list');
        const tasksSection = tasksList?.closest('.bg-white.rounded-2xl.shadow-lg');
        
        if (tasksSection) {
            // Add a subtle flash effect to show something happened
            tasksSection.style.transition = 'all 0.3s ease';
            tasksSection.style.boxShadow = '0 0 20px rgba(14, 165, 233, 0.4)';
            tasksSection.style.transform = 'scale(1.01)';
            
            // Smooth scroll to the tasks section with some offset
            const rect = tasksSection.getBoundingClientRect();
            const offset = window.pageYOffset + rect.top - 20; // 20px offset from top
            
            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
            
            // Remove the flash effect after animation
            setTimeout(() => {
                tasksSection.style.boxShadow = '';
                tasksSection.style.transform = '';
            }, 800);
            
            // Add a brief highlight to the tasks list content
            if (tasksList) {
                tasksList.style.transition = 'background-color 0.3s ease';
                tasksList.style.backgroundColor = '#f0f9ff';
                setTimeout(() => {
                    tasksList.style.backgroundColor = '';
                }, 600);
            }
        }
    }

    // UPDATE: updateFilterUI() - Remove cost filter title
    updateFilterUI() {
        // Remove active class from all cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.classList.remove('active-filter');
        });

        // Add active class to selected card (overdue, week only)
        const activeCard = document.getElementById(`${this.currentFilter}-card`);
        if (activeCard && ['overdue', 'week'].includes(this.currentFilter)) {
            activeCard.classList.add('active-filter');
            
            // Add a subtle pulse effect to show it was clicked
            activeCard.style.transition = 'transform 0.2s ease';
            activeCard.style.transform = 'scale(1.05)';
            setTimeout(() => {
                activeCard.style.transform = '';
            }, 200);
        }

        // Update filter title - simplified
        const filterTitles = {
            'all': '📋 Upcoming Tasks',
            'overdue': '⚠️ Overdue Tasks',
            'week': '📅 This Week\'s Tasks'
            // REMOVED: 'cost' title
        };

        const titleElement = document.getElementById('tasks-list-title');
        if (titleElement) {
            const newTitle = filterTitles[this.currentFilter] || 'Upcoming Tasks';
            titleElement.textContent = newTitle;
            
            // Add a subtle animation to the title change
            titleElement.style.opacity = '0.7';
            setTimeout(() => {
                titleElement.style.opacity = '1';
            }, 150);
        }
    }

    // UPDATE: getFilteredTasks() - Remove cost case
    getFilteredTasks() {
        if (!window.tasks) {
            console.warn('⚠️ No tasks data available');
            return [];
        }

        const now = new Date();
        const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        switch (this.currentFilter) {
            case 'overdue':
                return window.tasks.filter(task => 
                    !task.isCompleted && 
                    task.dueDate && 
                    new Date(task.dueDate) < now
                ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            case 'week':
                return window.tasks.filter(task => 
                    !task.isCompleted && 
                    task.dueDate && 
                    new Date(task.dueDate) <= oneWeek &&
                    new Date(task.dueDate) >= now
                ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            // REMOVED: 'cost' case - moved to All Tasks

            default: // 'all' case - show next 8 upcoming tasks
                return window.tasks.filter(task => 
                    !task.isCompleted && 
                    task.dueDate
                ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 8);
        }
    }

    renderFilteredTasks() {
        const tasksList = document.getElementById('tasks-list');
        if (!tasksList) {
            console.error('❌ Tasks list container not found');
            return;
        }

        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            const emptyMessages = {
                'overdue': '🎉 No overdue tasks!',
                'week': '📅 No tasks due this week!',
                'total': '✅ All tasks complete!',
                'cost': '💰 No tasks found!',
                'all': '🎉 All tasks complete!'
            };
            
            tasksList.innerHTML = `<div class="p-6 text-center text-gray-500">${emptyMessages[this.currentFilter]}</div>`;
            return;
        }

        tasksList.innerHTML = filteredTasks.map(task => this.renderEnhancedTaskCard(task)).join('');
    }

    renderEnhancedTaskCard(task) {
    const now = new Date();
    const taskDate = new Date(task.dueDate);
    const daysUntilDue = Math.ceil((taskDate - now) / (24 * 60 * 60 * 1000));
    const isOverdue = daysUntilDue < 0;
    
    // Simplified status styling - focus on urgency, not arbitrary priority
    let statusClass = 'bg-white';
    let urgencyDot = '⚪';
    
// FIXED: Apply correct 4-tier visual priority system
if (isOverdue) {
    statusClass = 'bg-red-50 border-l-4 border-red-400';
    urgencyDot = '🔴';  // Red: Overdue tasks (any category)
} else if (task.category === 'Safety') {
    statusClass = 'bg-orange-50 border-l-4 border-orange-400';
    urgencyDot = '🟠';  // Orange: Safety tasks (when not overdue)
} else if (daysUntilDue <= 7) {
    statusClass = 'bg-yellow-50 border-l-4 border-yellow-400';
    urgencyDot = '🟡';  // Yellow: Due within 7 days (when not safety/overdue)
} else {
    statusClass = 'bg-white';
    urgencyDot = '⚪';  // Gray: Normal tasks
}
    
    // Clean due date display
    let dueDateDisplay;
    if (isOverdue) {
        dueDateDisplay = `<span class="text-red-600 font-semibold">${Math.abs(daysUntilDue)}d overdue</span>`;
    } else if (daysUntilDue === 0) {
        dueDateDisplay = `<span class="text-orange-600 font-semibold">Due today</span>`;
    } else if (daysUntilDue <= 7) {
        dueDateDisplay = `<span class="text-orange-600">Due in ${daysUntilDue}d</span>`;
    } else if (daysUntilDue <= 30) {
        dueDateDisplay = `<span class="text-gray-700">Due in ${daysUntilDue}d</span>`;
    } else {
        dueDateDisplay = `<span class="text-gray-600">Due ${taskDate.toLocaleDateString()}</span>`;
    }

    // Last completed display
    let lastCompletedDisplay = '';
    if (task.lastCompleted) {
        const lastDate = new Date(task.lastCompleted);
        const daysSince = Math.floor((now - lastDate) / (24 * 60 * 60 * 1000));
        lastCompletedDisplay = `<div class="text-xs text-gray-500 mt-1">
            ✅ Completed ${daysSince}d ago
        </div>`;
    }

    return `
        <div class="p-4 border-b ${statusClass} enhanced-task-card transition-all duration-200">
            <div class="flex justify-between items-start">
                <div class="flex-1 pr-3">
                    <div class="flex items-start gap-3 mb-2">
                        <span class="text-lg mt-0.5 flex-shrink-0">${urgencyDot}</span>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-gray-900 text-sm leading-tight">${task.title}</h4>
                            <p class="text-xs text-gray-600 mt-1 leading-relaxed">${task.description}</p>
                        </div>
                        <div class="text-right text-xs flex-shrink-0">
                            <div class="days-until">${dueDateDisplay}</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3 text-xs flex-wrap">
    <span class="category-badge px-2 py-1 rounded-full bg-${this.categoryConfig[task.category]?.color || 'gray'}-50 text-${this.categoryConfig[task.category]?.color || 'gray'}-700 font-medium">
        ${this.categoryConfig[task.category]?.icon || '📋'} ${task.category}
    </span>
    ${task.cost > 0 ? `<span class="text-green-600 font-medium">$${task.cost}</span>` : ''}
    <span class="text-gray-500">Every ${task.frequency}d</span>
</div>
                    
                    ${lastCompletedDisplay}
                </div>
                
                <div class="task-actions flex flex-col gap-2 ml-3">
                    <button onclick="completeTask(${task.id})" 
                            class="task-action-btn bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
                        ✅ Complete
                    </button>
                    <button onclick="rescheduleTaskFromDashboard(${task.id})" 
                            class="task-action-btn bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
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
        if (!task.isCompleted && task.dueDate) {
            const taskDate = new Date(task.dueDate);
            if (taskDate < now) {
                overdueCount++;
            }
            if (taskDate <= oneWeek && taskDate >= now) {
                weekCount++;
            }
        }
        totalCost += task.cost * (365 / task.frequency);
    });

    const totalTasks = window.tasks.filter(t => !t.isCompleted && t.dueDate).length;

    // Update stat displays - ONLY update elements that exist
    const overdueElement = document.getElementById('overdue-count');
    if (overdueElement) overdueElement.textContent = overdueCount;
    
    const weekElement = document.getElementById('week-count');
    if (weekElement) weekElement.textContent = weekCount;
    
    const totalElement = document.getElementById('total-count');
    if (totalElement) totalElement.textContent = totalTasks;
    
    // REMOVED: annual-cost update since it's no longer on dashboard
    // const annualCostElement = document.getElementById('annual-cost');
    // if (annualCostElement) annualCostElement.textContent = '$' + Math.round(totalCost);

    // Update home address
    const homeAddressElement = document.getElementById('home-address');
    if (homeAddressElement && window.homeData?.fullAddress) {
        homeAddressElement.textContent = `Managing maintenance for ${window.homeData.fullAddress}`;
    }
    
    console.log(`📊 Stats updated: ${overdueCount} overdue, ${weekCount} this week, ${totalTasks} total`);
}
}

// NEW: Edit task from dashboard
function editTaskFromDashboard(taskId) {
    const task = window.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        return;
    }

    // Create a simple edit dialog
    const newTitle = prompt('Task Title:', task.title);
    if (newTitle === null) return; // User cancelled
    
    const newDescription = prompt('Task Description:', task.description);
    if (newDescription === null) return;
    
    const newFrequency = parseInt(prompt('Frequency (days):', task.frequency));
    if (isNaN(newFrequency) || newFrequency <= 0) {
        alert('Invalid frequency');
        return;
    }
    
    const newCost = parseFloat(prompt('Cost ($):', task.cost));
    if (isNaN(newCost)) {
        alert('Invalid cost');
        return;
    }
    
    const newPriority = prompt('Priority (high, medium, low):', task.priority);
    if (!['high', 'medium', 'low'].includes(newPriority)) {
        alert('Invalid priority');
        return;
    }
    
    const currentDueDateStr = task.dueDate instanceof Date ? 
        task.dueDate.toISOString().split('T')[0] : 
        new Date(task.dueDate).toISOString().split('T')[0];
    
    const newDueDateStr = prompt('Due Date (YYYY-MM-DD):', currentDueDateStr);
    if (newDueDateStr === null) return;
    
    const newDueDate = new Date(newDueDateStr + 'T12:00:00');
    if (isNaN(newDueDate.getTime())) {
        alert('Invalid date format');
        return;
    }
    
    // Update task
    task.title = newTitle;
    task.description = newDescription;
    task.frequency = newFrequency;
    task.cost = newCost;
    task.priority = newPriority;
    task.dueDate = newDueDate;
    
    // Save data
    saveData();
    
    // Refresh dashboard
    if (window.enhancedDashboard) {
        window.enhancedDashboard.render();
    }
    
    // Refresh calendar if it exists
    if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
        window.casaCareCalendar.refresh();
    }
    
    console.log('✅ Task updated:', task);
    alert(`✅ Task "${newTitle}" updated successfully!`);
}

// FIXED: Enhanced reschedule function with proper fallbacks
// FIXED: Prevent double-calls with debounce mechanism
function rescheduleTaskFromDashboard(taskId) {
    // IMPROVED: More robust debounce mechanism
    const debounceKey = `reschedule_${taskId}`;
    const now = Date.now();
    
    // Check if we recently called this function
    if (window.rescheduleDebounce && window.rescheduleDebounce[debounceKey]) {
        const timeSinceLastCall = now - window.rescheduleDebounce[debounceKey];
        if (timeSinceLastCall < 1000) { // Less than 1 second ago
            console.log('⚠️ Reschedule debounced for task:', taskId);
            return;
        }
    }
    
    // Initialize debounce object if needed
    if (!window.rescheduleDebounce) window.rescheduleDebounce = {};
    window.rescheduleDebounce[debounceKey] = now;
    
    // Clear old debounce entries periodically
    setTimeout(() => {
        if (window.rescheduleDebounce && window.rescheduleDebounce[debounceKey]) {
            delete window.rescheduleDebounce[debounceKey];
        }
    }, 2000);
    
    // ... rest of your existing reschedule function code stays the same ...
    const task = window.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        return;
    }
    
    console.log('📅 Rescheduling task from dashboard:', task.title);
    window.currentRescheduleTask = task;
    
    // Close any existing modals first
    const taskEditModal = document.getElementById('task-edit-modal');
    if (taskEditModal && !taskEditModal.classList.contains('hidden')) {
        taskEditModal.classList.add('hidden');
    }
    
    const datePickerModal = document.getElementById('date-picker-modal');
    const taskNameElement = document.getElementById('reschedule-task-name');
    const currentDueDateElement = document.getElementById('current-due-date');
    const newDueDateInput = document.getElementById('new-due-date');
    
    if (datePickerModal && taskNameElement && currentDueDateElement && newDueDateInput) {
        console.log('✅ Using date picker modal');
        
        // Set task info
        taskNameElement.textContent = `"${task.title}"`;
        
        // Set current due date
        const currentDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        currentDueDateElement.textContent = currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Set default new date to current due date
        newDueDateInput.value = currentDate.toISOString().split('T')[0];
        
        // Show modal
        datePickerModal.classList.remove('hidden');
        
        // Focus on date input
        setTimeout(() => newDueDateInput.focus(), 100);
        
        console.log(`📅 Date picker opened for task: ${task.title}`);
    } else {
        console.warn('⚠️ Date picker modal elements not found');
       // ADD THIS COMPLETE FALLBACK CODE:
        const currentDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        const newDateStr = prompt(`Reschedule "${task.title}" to (YYYY-MM-DD):`, 
                                 currentDate.toISOString().split('T')[0]);
        
        if (newDateStr) {
            const newDate = new Date(newDateStr + 'T12:00:00');
            if (!isNaN(newDate.getTime())) {
                task.dueDate = newDate;
                task.nextDue = newDate;
                saveData();
                
                if (window.enhancedDashboard) {
                    window.enhancedDashboard.render();
                }
                
                if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
                    window.casaCareCalendar.refresh();
                }
                
                console.log(`✅ Task ${task.title} rescheduled to ${newDate.toLocaleDateString()}`);
                alert(`✅ Task rescheduled to ${newDate.toLocaleDateString()}`);
            } else {
                alert('❌ Invalid date format. Please use YYYY-MM-DD format.');
            }
        }
        
        delete window[debounceKey]; // Clear debounce for fallback case
    }
}

// UPDATED: Function to add task (replaces show all tasks)
function addTaskFromDashboard() {
    console.log('➕ Adding new task from dashboard...');
    
    const title = prompt('Task Title:');
    if (!title) return;
    
    const description = prompt('Task Description:');
    if (!description) return;
    
    const frequency = parseInt(prompt('How often (in days):', '365'));
    if (!frequency || frequency <= 0) return;
    
    const cost = parseFloat(prompt('Estimated cost ($):', '0'));
    if (isNaN(cost)) return;
    
    const priority = prompt('Priority (high, medium, low):', 'medium');
    if (!['high', 'medium', 'low'].includes(priority)) {
        alert('Invalid priority. Please use: high, medium, or low');
        return;
    }
    
    const dueDateStr = prompt('Due date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!dueDateStr) return;
    
    const dueDate = new Date(dueDateStr + 'T12:00:00');
    if (isNaN(dueDate.getTime())) {
        alert('Invalid date format');
        return;
    }
    
    // Find next available ID
    const maxId = Math.max(...window.tasks.map(t => t.id), 0);
    
    const newTask = {
        id: maxId + 1,
        title: title,
        description: description,
        category: 'General',
        frequency: frequency,
        cost: cost,
        priority: priority,
        dueDate: dueDate,
        lastCompleted: null,
        isCompleted: false
    };
    
    window.tasks.push(newTask);
    
    // Save data
    saveData();
    
    // Refresh dashboard
    if (window.enhancedDashboard) {
        window.enhancedDashboard.render();
    } else {
        updateDashboard();
    }
    
    // Refresh calendar if it exists
    if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
        window.casaCareCalendar.refresh();
    }
    
    console.log('✅ New task added:', newTask);
    alert(`✅ Task "${title}" added successfully!`);
}

// Function to export task list
function exportTaskList() {
    if (!window.tasks) {
        alert('❌ No tasks to export');
        return;
    }
    
    const filteredTasks = window.enhancedDashboard ? 
        window.enhancedDashboard.getFilteredTasks() : 
        window.tasks.filter(t => !t.isCompleted && t.dueDate);
    
    let csvContent = "Task,Description,Category,Priority,Due Date,Cost,Frequency,Last Completed\n";
    
    filteredTasks.forEach(task => {
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set';
        const lastCompleted = task.lastCompleted ? new Date(task.lastCompleted).toLocaleDateString() : 'Never';
        
        csvContent += `"${task.title}","${task.description}","${task.category}","${task.priority}","${dueDate}","$${task.cost}","${task.frequency} days","${lastCompleted}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `casa_care_tasks_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('📋 Task list exported');
    alert('📋 Task list exported successfully!');
}

// Close task edit modal
function closeTaskEditModal() {
    const modal = document.getElementById('task-edit-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    window.currentEditingTask = null;
    console.log('✅ Task edit modal closed');
}

// Delete task from edit modal
function deleteTaskFromEdit() {
    if (!window.currentEditingTask) {
        console.error('❌ No task being edited');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${window.currentEditingTask.title}"?`)) {
        const taskIndex = window.tasks.findIndex(t => t.id === window.currentEditingTask.id);
        if (taskIndex > -1) {
            const deletedTask = window.tasks.splice(taskIndex, 1)[0];
            console.log(`🗑️ Deleted task: ${deletedTask.title}`);
            
            // Save data
            if (typeof window.saveData === 'function') {
                window.saveData();
            } else if (typeof saveData === 'function') {
                saveData();
            }
            
            // Refresh dashboard
            if (window.enhancedDashboard) {
                window.enhancedDashboard.render();
            }
            
            // Refresh calendar if it exists
            if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
                window.casaCareCalendar.refresh();
            }
            
            // Also refresh task categories if in setup
            if (typeof renderTaskCategories === 'function') {
                const taskSetup = document.getElementById('task-setup');
                if (taskSetup && !taskSetup.classList.contains('hidden')) {
                    renderTaskCategories();
                }
            }
            
            // Close modal
            closeTaskEditModal();
            
            alert(`✅ Task "${deletedTask.title}" deleted successfully!`);
        }
    }
}

// ENHANCED: Save task from edit modal (works in both setup and dashboard)
function saveTaskFromEdit() {
    console.log('💾 Saving task from edit modal (enhanced dashboard version)...');
    
    if (!window.currentEditingTask) {
        console.error('❌ No task being edited');
        alert('❌ No task selected for editing');
        return;
    }
    
    // Get form values
    const title = document.getElementById('edit-task-name').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();
    const cost = parseFloat(document.getElementById('edit-task-cost').value) || 0;
    const frequency = parseInt(document.getElementById('edit-task-frequency').value) || 365;
    const priority = document.getElementById('edit-task-priority').value;
    const category = document.getElementById('edit-task-category')?.value || 'General';
    const dueDateInput = document.getElementById('edit-task-due-date');
    
    console.log('📝 Form values:', { title, description, cost, frequency, priority, category });
    
    // Validate inputs
    if (!title) {
        alert('❌ Task name is required');
        document.getElementById('edit-task-name').focus();
        return;
    }
    
    if (!description) {
        alert('❌ Task description is required');
        document.getElementById('edit-task-description').focus();
        return;
    }
    
    if (frequency <= 0) {
        alert('❌ Frequency must be greater than 0');
        document.getElementById('edit-task-frequency').focus();
        return;
    }
    
    if (!['high', 'medium', 'low'].includes(priority)) {
        alert('❌ Invalid priority');
        return;
    }
    
    // Handle due date
    let dueDate;
    if (dueDateInput && dueDateInput.value) {
        dueDate = new Date(dueDateInput.value + 'T12:00:00');
        if (isNaN(dueDate.getTime())) {
            alert('❌ Invalid due date');
            dueDateInput.focus();
            return;
        }
    } else {
        dueDate = new Date();
    }
    
    console.log('📅 Due date:', dueDate.toLocaleDateString());
    
    // Check if this is a new task
    const isNewTask = !window.tasks.find(t => t.id === window.currentEditingTask.id);
    console.log('🆕 Is new task:', isNewTask);
    
    // Update task properties
    window.currentEditingTask.title = title;
    window.currentEditingTask.description = description;
    window.currentEditingTask.cost = cost;
    window.currentEditingTask.frequency = frequency;
    window.currentEditingTask.priority = priority;
    window.currentEditingTask.category = category;
    window.currentEditingTask.dueDate = dueDate;
    window.currentEditingTask.nextDue = dueDate; // Calendar compatibility
    
    if (isNewTask) {
        // Add to tasks array
        window.tasks.push(window.currentEditingTask);
        console.log('✅ New task added to global array');
    } else {
        console.log('✅ Existing task updated');
    }
    
    // Always save data and refresh
    try {
        // Save data
        if (typeof window.saveData === 'function') {
            window.saveData();
        } else if (typeof saveData === 'function') {
            saveData();
        }
        console.log('💾 Data saved');
        
        // Refresh dashboard
        if (window.enhancedDashboard && typeof window.enhancedDashboard.render === 'function') {
            window.enhancedDashboard.render();
            console.log('🔄 Enhanced dashboard refreshed');
        } else if (typeof updateDashboard === 'function') {
            updateDashboard();
            console.log('🔄 Basic dashboard updated');
        }
        
        // Refresh calendar if available
        if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
            window.casaCareCalendar.refresh();
            console.log('📅 Calendar refreshed');
        }
        
        // Also try to refresh task categories if in setup
        if (typeof renderTaskCategories === 'function') {
            const taskSetup = document.getElementById('task-setup');
            if (taskSetup && !taskSetup.classList.contains('hidden')) {
                renderTaskCategories();
                console.log('📋 Task categories re-rendered');
            }
        }
        
    } catch (error) {
        console.error('❌ Error during save/refresh:', error);
    }
    
    // Close modal
    closeTaskEditModal();
    
    alert(`✅ Task "${title}" ${isNewTask ? 'added' : 'updated'} successfully!`);
}

// FIXED: Date picker modal functions for new date system
function closeDatePickerModal() {
    const modal = document.getElementById('date-picker-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Only clear debounce and task reference after a delay to ensure confirmReschedule can access it
    if (window.currentRescheduleTask) {
        const debounceKey = `reschedule_${window.currentRescheduleTask.id}`;
        setTimeout(() => {
            delete window[debounceKey];
            window.currentRescheduleTask = null;
        }, 100);
    }
    
    console.log('📅 Date picker modal closed');
}
function setQuickDate(daysFromNow) {
    const newDueDateInput = document.getElementById('new-due-date');
    if (!newDueDateInput) return;
    
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysFromNow);
    
    newDueDateInput.value = newDate.toISOString().split('T')[0];
    
    // Add visual feedback
    newDueDateInput.style.backgroundColor = '#dbeafe';
    setTimeout(() => {
        newDueDateInput.style.backgroundColor = '';
    }, 300);
    
    console.log(`📅 Quick date set to ${daysFromNow} days from now`);
}

function confirmReschedule() {
    console.log('🔧 Confirm reschedule called, currentRescheduleTask:', window.currentRescheduleTask);
    
    if (!window.currentRescheduleTask) {
        console.error('❌ No task selected for rescheduling');
        alert('❌ Error: No task selected for rescheduling. Please try again.');
        closeDatePickerModal();
        return;
    }
    
    const newDueDateInput = document.getElementById('new-due-date');
    if (!newDueDateInput || !newDueDateInput.value) {
        alert('❌ Please select a new due date');
        return;
    }
    
    const newDate = new Date(newDueDateInput.value + 'T12:00:00');
    if (isNaN(newDate.getTime())) {
        alert('❌ Invalid date selected');
        return;
    }
    
    // Check if it's in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) {
        const confirmPast = confirm('⚠️ The selected date is in the past. Are you sure you want to schedule this task for a past date?');
        if (!confirmPast) {
            return;
        }
    }
    
    // Store task reference before we lose it
    const taskToUpdate = window.currentRescheduleTask;
    const taskTitle = taskToUpdate.title;
    const oldDate = taskToUpdate.dueDate instanceof Date ? 
        taskToUpdate.dueDate : new Date(taskToUpdate.dueDate);
    
    // Update the task in the global tasks array
    const taskIndex = window.tasks.findIndex(t => t.id === taskToUpdate.id);
    if (taskIndex === -1) {
        alert('❌ Task not found in tasks array');
        closeDatePickerModal();
        return;
    }
    
    // Update both the reference and the array
    window.tasks[taskIndex].dueDate = newDate;
    window.tasks[taskIndex].nextDue = newDate; // Calendar compatibility
    taskToUpdate.dueDate = newDate;
    taskToUpdate.nextDue = newDate;
    
    // Save data
    try {
        if (typeof window.saveData === 'function') {
            window.saveData();
        } else if (typeof saveData === 'function') {
            saveData();
        }
        console.log('💾 Data saved after reschedule');
    } catch (error) {
        console.error('❌ Error saving data:', error);
        alert('❌ Error saving changes');
        return;
    }
    
    // Refresh dashboard
    if (window.enhancedDashboard) {
        window.enhancedDashboard.render();
    }
    
    // Refresh calendar if it exists
    if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
        window.casaCareCalendar.refresh();
    }
    
    // Close modal
    closeDatePickerModal();
    
    // Show success message
    const message = `✅ "${taskTitle}" rescheduled from ${oldDate.toLocaleDateString()} to ${newDate.toLocaleDateString()}`;
    console.log(message);
    
    // Show a nice success notification
    showSuccessNotification(`Task rescheduled to ${newDate.toLocaleDateString()}`);
}

function showSuccessNotification(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Slide out and remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Ensure enhanced dashboard is available globally
window.EnhancedDashboard = EnhancedDashboard;

// Debug function to check function status
window.debugDashboardFunctions = function() {
    console.log('🔍 ENHANCED DASHBOARD FUNCTIONS DEBUG:');
    const functions = [
        'addTaskFromDashboard',
        'editTaskFromDashboard', 
        'rescheduleTaskFromDashboard',
        'closeTaskEditModal',
        'saveTaskFromEdit',
        'deleteTaskFromEdit',
        'closeDatePickerModal',
        'setQuickDate',
        'confirmReschedule'
    ];
    
    functions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        const hasPrompt = exists && window[funcName].toString().includes('prompt');
        console.log(`  ${funcName}: ${exists ? '✅' : '❌'}${hasPrompt ? ' (⚠️ STILL USES PROMPTS!)' : ''}`);
    });
    
    // Check modal elements
    const modals = ['task-edit-modal', 'date-picker-modal'];
    console.log('\n🔍 MODAL ELEMENTS:');
    modals.forEach(modalId => {
        const element = document.getElementById(modalId);
        console.log(`  ${modalId}: ${element ? '✅' : '❌'}`);
    });
    
    console.log('\n🔍 CURRENT EDITING TASK:', window.currentEditingTask ? '✅' : '❌');
};

console.log('📋 Enhanced Dashboard script loaded with simplified date system');
