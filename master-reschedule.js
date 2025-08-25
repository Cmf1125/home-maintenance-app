// MASTER RESCHEDULE FUNCTION - The One True Reschedule
// This consolidates all reschedule functionality into ONE reliable function

console.log('🔄 Loading Master Reschedule module...');

// THE ONE AND ONLY RESCHEDULE FUNCTION
window.masterRescheduleTask = function(taskId, event) {
    console.log('🚀 MASTER RESCHEDULE called for task:', taskId);
    
    // Stop event bubbling
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    // Find the task
    const task = window.tasks?.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        alert('❌ Task not found');
        return;
    }
    
    console.log('📋 Found task:', task.title);
    
    // Show the nice date picker modal
    showRescheduleDatePicker(task);
};

// Function to show the date picker modal
function showRescheduleDatePicker(task) {
    console.log('📅 Showing date picker for task:', task.title);
    
    // Store the task globally so the modal can access it
    window.currentRescheduleTask = task;
    
    // Remove any existing modal
    const existingModal = document.getElementById('master-reschedule-modal');
    if (existingModal) existingModal.remove();
    
    // Get current date as string
    const currentDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
    const currentDateStr = currentDate.toISOString().split('T')[0];
    
    // Create the modal HTML
    const modalHTML = `
        <div id="master-reschedule-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
            <div class="bg-white rounded-xl w-full max-w-md p-6">
                <div class="text-center mb-4">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">📅 Reschedule Task</h3>
                    <p class="text-gray-600">"${task.title}"</p>
                    <p class="text-sm text-gray-500 mt-1">Current: ${currentDate.toLocaleDateString()}</p>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Select New Date:</label>
                    <input type="date" id="master-new-date" value="${currentDateStr}" 
                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                
                <div class="grid grid-cols-2 gap-2 mb-6">
                    <button onclick="setQuickRescheduleDate(1)" class="p-2 bg-blue-100 hover:bg-blue-200 rounded text-sm">Tomorrow</button>
                    <button onclick="setQuickRescheduleDate(7)" class="p-2 bg-green-100 hover:bg-green-200 rounded text-sm">Next Week</button>
                    <button onclick="setQuickRescheduleDate(30)" class="p-2 bg-yellow-100 hover:bg-yellow-200 rounded text-sm">Next Month</button>
                    <button onclick="setQuickRescheduleDate(90)" class="p-2 bg-purple-100 hover:bg-purple-200 rounded text-sm">3 Months</button>
                </div>
                
                <div class="flex gap-3">
                    <button onclick="closeMasterRescheduleModal()" 
                            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg">
                        Cancel
                    </button>
                    <button onclick="confirmMasterReschedule()" 
                            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
                        📅 Reschedule
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Quick date setter for the modal
window.setQuickRescheduleDate = function(daysFromNow) {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysFromNow);
    const dateInput = document.getElementById('master-new-date');
    if (dateInput) {
        dateInput.value = newDate.toISOString().split('T')[0];
        // Add visual feedback
        dateInput.style.backgroundColor = '#dbeafe';
        setTimeout(() => {
            dateInput.style.backgroundColor = '';
        }, 300);
    }
};

// Close the modal
window.closeMasterRescheduleModal = function() {
    const modal = document.getElementById('master-reschedule-modal');
    if (modal) modal.remove();
    window.currentRescheduleTask = null;
};

// Confirm the reschedule with the selected date
window.confirmMasterReschedule = function() {
    console.log('✅ Confirming reschedule...');
    
    const task = window.currentRescheduleTask;
    if (!task) {
        console.error('❌ No task to reschedule');
        return;
    }
    
    const newDateStr = document.getElementById('master-new-date')?.value;
    if (!newDateStr) {
        alert('Please select a date');
        return;
    }
    
    // Create new date
    const newDate = new Date(newDateStr + 'T12:00:00');
    if (isNaN(newDate.getTime())) {
        alert('❌ Invalid date selected');
        return;
    }
    
    console.log('📅 Rescheduling from:', new Date(task.dueDate).toLocaleDateString());
    console.log('📅 Rescheduling to:', newDate.toLocaleDateString());
    
    // Update the task
    const oldDate = new Date(task.dueDate);
    task.dueDate = newDate;
    task.nextDue = newDate; // For calendar compatibility
    
    // Google Calendar Sync
    if (window.googleCalendarSync && window.googleCalendarSync.isConnected()) {
        console.log('🔍 Google Calendar sync check:', {
            googleCalendarSyncExists: !!window.googleCalendarSync,
            isConnected: window.googleCalendarSync.isConnected(),
            taskHasGoogleEventId: !!task.googleEventId,
            taskTitle: task.title
        });
        
        if (task.googleEventId) {
            // Task already has calendar event - update it
            console.log('📅 Updating existing Google Calendar event...');
            window.googleCalendarSync.updateCalendarEvent(task).then(() => {
                console.log('✅ Google Calendar event updated successfully');
            }).catch(error => {
                console.error('❌ Failed to update Google Calendar event:', error);
            });
        } else {
            // Task doesn't have calendar event yet - create one
            console.log('📅 Creating new Google Calendar event...');
            window.googleCalendarSync.syncTaskToCalendar(task).then((eventId) => {
                if (eventId) {
                    task.googleEventId = eventId;
                    console.log('✅ New Google Calendar event created');
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
    
    // Save data
    if (typeof window.saveData === 'function') {
        window.saveData();
        console.log('💾 Data saved');
    } else if (typeof saveData === 'function') {
        saveData();
        console.log('💾 Data saved (fallback)');
    }
    
    // Refresh all displays
    try {
        // Refresh enhanced dashboard
        if (window.enhancedDashboard?.render) {
            window.enhancedDashboard.render();
            console.log('🔄 Enhanced dashboard refreshed');
        }
        
        // Refresh calendar
        if (window.casaCareCalendar?.refresh) {
            window.casaCareCalendar.refresh();
            console.log('🔄 Calendar refreshed');
        }
        
        // Refresh basic dashboard as fallback
        if (typeof updateDashboard === 'function') {
            updateDashboard();
            console.log('🔄 Basic dashboard updated');
        }
        
    } catch (error) {
        console.error('❌ Error refreshing displays:', error);
    }
    
    // Close the modal
    closeMasterRescheduleModal();
    
    // Show success message
    const message = `✅ "${task.title}" rescheduled from ${oldDate.toLocaleDateString()} to ${newDate.toLocaleDateString()}`;
    console.log(message);
    alert(message);
};

// Make the master function available globally
window.rescheduleTaskFromDashboard = window.masterRescheduleTask;
window.rescheduleTask = window.masterRescheduleTask;
window.confirmReschedule = window.masterRescheduleTask;
window.confirmTaskReschedule = window.masterRescheduleTask;

console.log('✅ Master Reschedule module loaded - all reschedule functions unified');