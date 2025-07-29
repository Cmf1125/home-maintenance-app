// Enhanced Dashboard functionality for The Home Keeper - Updated for Simplified Date System
class EnhancedDashboard {
    constructor() {
        this.currentFilter = 'all'; // 'all', 'overdue', 'week', 'total', 'cost'
        console.log('🎯 Enhanced Dashboard initializing with simplified dates...');
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
            'all': 'Upcoming Tasks',
            'overdue': 'Overdue Tasks ⚠️',
            'week': 'This Week\'s Tasks 📅',
            'total': 'All Active Tasks 📋',
            'cost': 'Tasks by Cost 💰'
        };

        const titleElement = document.getElementById('tasks-list-title');
        if (titleElement) {
            titleElement.textContent = filterTitles[this.currentFilter] || 'Tasks';
        }
    }

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

            case 'total':
                return window.tasks.filter(task => 
                    !task.isCompleted && 
                    task.dueDate
                ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            case 'cost':
                return window.tasks.filter(task => 
                    !task.isCompleted && 
                    task.dueDate
                ).sort((a, b) => b.cost - a.cost);

            default:
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
                ✅ Last done: ${daysSince}d ago (${lastDate.toLocaleDateString()})
            </div>`;
        } else {
            lastCompletedDisplay = `<div class="text-xs text-gray-500 mt-1">❌ Never completed</div>`;
        }

        // Priority badge colors
        const priorityColors = {
            'high': 'bg-red-100 text-red-700',
            'medium': 'bg-yellow-100 text-yellow-700',
            'low': 'bg-gray-100 text-gray-700'
        };

        return `
            <div class="p-4 border-b ${statusClass} enhanced-task-card">
                <div class="flex justify-between items-start">
                    <div class="flex-1 pr-3">
                        <div class="flex items-start justify-between mb-2">
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-900 text-sm">${task.title}</h4>
                                <p class="text-xs text-gray-600 mt-1">${task.description}</p>
                            </div>
                            <div class="ml-3 text-right text-xs">
                                <div class="font-semibold due-date">${taskDate.toLocaleDateString()}</div>
                                <div class="days-until">${dueDateDisplay}</div>
                            </div>
                        </div>
                        
                        <div class="task-meta-row">
                            <span class="category-badge">${task.category}</span>
                            <span class="priority-badge px-2 py-1 rounded ${priorityColors[task.priority]}">${task.priority}</span>
                            <span class="text-green-600 font-medium text-xs">$${task.cost}</span>
                            <span class="text-gray-500 text-xs">Every ${task.frequency}d</span>
                        </div>
                        
                        ${lastCompletedDisplay}
                    </div>
                    
                    <div class="task-actions">
                        <button onclick="completeTask(${task.id})" 
                                class="task-action-btn task-action-complete">
                            ✅ Complete
                        </button>
                        <button onclick="editTaskFromDashboard(${task.id})" 
                                class="task-action-btn task-action-edit">
                            ✏️ Edit
                        </button>
                        <button onclick="rescheduleTaskFromDashboard(${task.id})" 
                                class="task-action-btn task-action-reschedule">
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

        // Update stat displays
        document.getElementById('overdue-count').textContent = overdueCount;
        document.getElementById('week-count').textContent = weekCount;
        document.getElementById('total-count').textContent = totalTasks;
        document.getElementById('annual-cost').textContent = '$' + Math.round(totalCost);
 // ADD THIS: Update home address in enhanced dashboard too
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
function rescheduleTaskFromDashboard(taskId) {
    const task = window.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        return;
    }

    console.log('📅 Rescheduling task from dashboard:', task.title);

    // Store the task for the date picker modal
    window.currentRescheduleTask = task;
    
    // Try to use the date picker modal first
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
        console.warn('⚠️ Date picker modal elements not found, using simple prompt');
        // Fallback to simple prompt
        const currentDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        const newDateStr = prompt(`Reschedule "${task.title}" to (YYYY-MM-DD):`, 
                                 currentDate.toISOString().split('T')[0]);
        
        if (newDateStr) {
            const newDate = new Date(newDateStr + 'T12:00:00');
            if (!isNaN(newDate.getTime())) {
                task.dueDate = newDate;
                // CRITICAL: Update nextDue for calendar compatibility
                task.nextDue = newDate;
                saveData();
                
                // Refresh dashboard
                if (window.enhancedDashboard) {
                    window.enhancedDashboard.render();
                }
                
                // Refresh calendar if it exists
                if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
                    window.casaCareCalendar.refresh();
                }
                
                console.log(`✅ Task ${task.title} rescheduled to ${newDate.toLocaleDateString()}`);
                alert(`✅ Task rescheduled to ${newDate.toLocaleDateString()}`);
            } else {
                alert('❌ Invalid date format. Please use YYYY-MM-DD format.');
            }
        }
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
            
            // Close modal
            closeTaskEditModal();
            
            alert(`✅ Task "${deletedTask.title}" deleted successfully!`);
        }
    }
}
// FIXED: Date picker modal functions for new date system
function closeDatePickerModal() {
    const modal = document.getElementById('date-picker-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    window.currentRescheduleTask = null;
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
    if (!window.currentRescheduleTask) {
        console.error('❌ No task selected for rescheduling');
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
    
    // Update the task
    const oldDate = window.currentRescheduleTask.dueDate instanceof Date ? 
        window.currentRescheduleTask.dueDate : new Date(window.currentRescheduleTask.dueDate);
    
    window.currentRescheduleTask.dueDate = newDate;
    
    // CRITICAL: Update nextDue for calendar compatibility
    window.currentRescheduleTask.nextDue = newDate;
    
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
    
    // Close modal
    closeDatePickerModal();
    
    // Show success message
    const message = `✅ "${window.currentRescheduleTask.title}" rescheduled from ${oldDate.toLocaleDateString()} to ${newDate.toLocaleDateString()}`;
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
