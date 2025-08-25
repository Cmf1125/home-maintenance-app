// MASTER RESCHEDULE FUNCTION - The One True Reschedule
// This consolidates all reschedule functionality into ONE reliable function

console.log('🔄 Loading Master Reschedule module...');

// THE ONE AND ONLY RESCHEDULE FUNCTION
window.masterRescheduleTask = function(taskId, event) {
    console.log('🚀🚀🚀 MASTER RESCHEDULE FUNCTION CALLED! 🚀🚀🚀');
    console.log('🚀 MASTER RESCHEDULE called for task:', taskId);
    alert('🚀 MASTER RESCHEDULE FUNCTION CALLED!');
    
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
    
    // Get new date from user
    const currentDateStr = task.dueDate instanceof Date ? 
        task.dueDate.toISOString().split('T')[0] :
        new Date(task.dueDate).toISOString().split('T')[0];
    
    const newDateStr = prompt(`Reschedule "${task.title}"\n\nCurrent due date: ${new Date(task.dueDate).toLocaleDateString()}\n\nEnter new date (YYYY-MM-DD):`, currentDateStr);
    
    if (!newDateStr) {
        console.log('⚠️ User cancelled reschedule');
        return;
    }
    
    // Validate and create new date
    const newDate = new Date(newDateStr + 'T12:00:00');
    if (isNaN(newDate.getTime())) {
        alert('❌ Invalid date format. Please use YYYY-MM-DD format.');
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