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
        'Energy': { icon: '🔋', color: 'yellow' },
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
        // MOBILE FIX: Use better scroll calculation
        const rect = tasksSection.getBoundingClientRect();
        const headerHeight = document.querySelector('.sticky')?.offsetHeight || 64;
        const buffer = 20; // Clean spacing
        
        // Calculate proper offset
        const targetPosition = window.pageYOffset + rect.top - headerHeight - buffer;
        
        // Use smooth scroll with better mobile support
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
        } else {
            // Fallback for older browsers
            window.scrollTo(0, Math.max(0, targetPosition));
        }
        
        // Add visual feedback
        tasksSection.style.transition = 'box-shadow 0.3s ease';
        tasksSection.style.boxShadow = '0 0 20px rgba(14, 165, 233, 0.4)';
        
        setTimeout(() => {
            tasksSection.style.boxShadow = '';
        }, 1000);
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
    
    // Enhanced Safety task detection
    const isSafetyTask = task.category === 'Safety' || task.priority === 'high' || 
                        task.title.toLowerCase().includes('smoke') || 
                        task.title.toLowerCase().includes('detector') ||
                        task.title.toLowerCase().includes('fire') ||
                        task.title.toLowerCase().includes('carbon');
    
    // Enhanced status styling
    let statusClass = 'bg-white';
    let urgencyDot = '⚪';
    
    if (isOverdue) {
        statusClass = 'bg-red-50 border-l-4 border-red-400';
        urgencyDot = '🔴';
    } else if (isSafetyTask) {
        statusClass = 'bg-orange-50 border-l-4 border-orange-400';
        urgencyDot = '🟠';
    } else if (daysUntilDue <= 7) {
        statusClass = 'bg-yellow-50 border-l-4 border-yellow-400';
        urgencyDot = '🟡';
    }
    
    // Clean due date display
    let dueDateDisplay;
    let dueDateColor = 'text-gray-600';

    if (isOverdue) {
    dueDateDisplay = 'Overdue';
    dueDateColor = 'text-red-600 font-semibold';
    } else if (daysUntilDue === 0) {
    dueDateDisplay = 'Due today';
    dueDateColor = 'text-orange-600 font-semibold';
    } else if (daysUntilDue === 1) {
    dueDateDisplay = 'Due tomorrow';
    dueDateColor = 'text-orange-600';
    } else {
    dueDateDisplay = `Due ${taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    dueDateColor = daysUntilDue <= 7 ? 'text-orange-600' : 'text-gray-600';
}

    // Get category info
    const categoryInfo = this.categoryConfig[task.category] || { icon: '📋', color: 'gray' };

    return `
   <div class="p-3 border-b ${statusClass} enhanced-task-card mobile-task-card-simple transition-all duration-200 hover:bg-gray-50" onclick="window.TaskManager.openModal(window.tasks.find(t => t.id === ${task.id}), false)">
        <!-- Row 1: Dot + Task Name + Category -->
        <div class="flex items-center gap-2 mb-2">
            <span class="font-semibold text-gray-900 text-sm flex-1 min-w-0 truncate">${urgencyDot} ${task.title}</span>
            <span class="text-xs text-gray-500">${categoryInfo.icon} ${task.category}</span>
        </div>
        
        <!-- Row 2: Video Demo (if available) -->
        ${task.youtubeUrl ? `
        <div class="mb-2">
            <button onclick="event.stopPropagation(); openYouTubeVideo('${task.youtubeUrl}')" 
                    class="bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1">
                📺 Watch How-To Video
            </button>
        </div>
        ` : ''}
        
        <!-- Row 3: Due Date + Action Buttons -->
        <div class="flex items-center justify-between gap-2">
            <span class="text-xs ${dueDateColor} flex-shrink-0">${dueDateDisplay}</span>
            <div class="flex gap-1">
                <button onclick="event.stopPropagation(); showTaskHistory(${task.id})" 
                        class="bg-gray-100 text-gray-700 hover:bg-gray-200 px-1.5 py-1 rounded text-xs font-medium transition-colors">
                    History
                </button>
                <button onclick="event.stopPropagation(); completeTask(${task.id})" 
                        class="bg-green-100 text-green-700 hover:bg-green-200 px-1.5 py-1 rounded text-xs font-medium transition-colors">
                    Complete
                </button>
                <button onclick="event.stopPropagation(); rescheduleTaskFromDashboard(${task.id}, event)"
                        class="bg-blue-100 text-blue-700 hover:bg-blue-200 px-1.5 py-1 rounded text-xs font-medium transition-colors">
                    Reschedule
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

    // Update welcome message and home address
    const subtitleElement = document.getElementById('dashboard-subtitle');
    const homeAddressElement = document.getElementById('home-address');
    
    // Update welcome message with user's name
    if (subtitleElement) {
        const user = firebase.auth().currentUser;
        const firstName = user?.displayName ? user.displayName.split(' ')[0] : '';
        if (firstName) {
            subtitleElement.textContent = `👋 Welcome ${firstName}!`;
        } else {
            subtitleElement.textContent = '👋 Welcome back!';
        }
    }
    
    // Show address
    if (homeAddressElement && window.homeData?.fullAddress) {
        homeAddressElement.textContent = `🏠 ${window.homeData.fullAddress}`;
    }
    
    console.log(`📊 Stats updated: ${overdueCount} overdue, ${weekCount} this week, ${totalTasks} total`);
}
}

// REMOVED: Using the original reschedule function from HTML instead

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
    
    // ADDED: Google Calendar sync for reschedules
    if (window.googleCalendarSync && window.googleCalendarSync.isConnected()) {
        const task = window.currentRescheduleTask;
        console.log('🔍 Google Calendar sync check for reschedule:', {
            googleCalendarSyncExists: !!window.googleCalendarSync,
            isConnected: window.googleCalendarSync.isConnected(),
            taskHasGoogleEventId: !!task.googleEventId,
            taskTitle: task.title
        });
        
        if (task.googleEventId) {
            // Task already has calendar event - update it
            console.log('📅 Updating existing Google Calendar event for reschedule...');
            window.googleCalendarSync.updateCalendarEvent(task).then(() => {
                console.log('✅ Google Calendar event updated for reschedule');
            }).catch(error => {
                console.error('❌ Failed to update Google Calendar event:', error);
            });
        } else {
            // Task doesn't have calendar event yet - create one
            console.log('📅 Creating new Google Calendar event for reschedule...');
            window.googleCalendarSync.syncTaskToCalendar(task).then((eventId) => {
                if (eventId) {
                    task.googleEventId = eventId;
                    console.log('✅ New Google Calendar event created for reschedule');
                    // Save again to persist the googleEventId
                    if (typeof window.saveData === 'function') {
                        window.saveData();
                    }
                }
            }).catch(error => {
                console.error('❌ Failed to create Google Calendar event:', error);
            });
        }
    } else {
        console.log('⚠️ Google Calendar sync not available or not connected');
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


console.log('📋 Enhanced Dashboard script loaded with simplified date system');
