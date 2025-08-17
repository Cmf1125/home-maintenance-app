// Date Utils Module - Handles all date calculations and task scheduling
// Extracted from app.js for better organization

console.log('🔄 Loading DateUtils module...');

class DateUtils {
    constructor() {
        console.log('📅 Date Utils module initialized');
    }

    // ===== DATE SETTING AND VALIDATION =====
    
    setTaskDate(task, date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            console.error('❌ Invalid date provided to setTaskDate:', date);
            return false;
        }
        
        // Set both properties for maximum compatibility (enhances your existing system)
        task.dueDate = new Date(date);
        task.nextDue = new Date(date); // Critical for calendar display

        return true;
    }

    // ===== RECURRING DATE CALCULATIONS =====
    
    calculateNextDueDate(task, completionDate = new Date()) {
        if (!task.frequency || task.frequency <= 0) {
            console.error('❌ Invalid frequency for task:', task.title);
            return null;
        }
        
        // Use existing due date or completion date as base (same as your current logic)
        const baseDate = task.dueDate ? new Date(task.dueDate) : completionDate;
        const nextDate = new Date(baseDate.getTime() + (task.frequency * 24 * 60 * 60 * 1000));
        
        return nextDate;
    }

    // ===== DATE CONSISTENCY AND MIGRATION =====
    
    ensureTaskDateConsistency(tasks) {
        let fixedCount = 0;
        
        tasks.forEach(task => {
            let needsSync = false;
            
            // Fix missing dueDate
            if (!task.dueDate && task.nextDue) {
                task.dueDate = new Date(task.nextDue);
                needsSync = true;
            }
            
            // Fix missing nextDue (critical for calendar)
            if (!task.nextDue && task.dueDate) {
                task.nextDue = new Date(task.dueDate);
                needsSync = true;
            }
            
            // Fix date mismatches
            if (task.dueDate && task.nextDue) {
                const dueTime = new Date(task.dueDate).getTime();
                const nextTime = new Date(task.nextDue).getTime();
                
                if (Math.abs(dueTime - nextTime) > 1000) { // Allow 1 second difference
                    task.nextDue = new Date(task.dueDate); // dueDate is authoritative
                    needsSync = true;
                }
            }
            
            if (needsSync) {
                fixedCount++;
            }
        });
        
        if (fixedCount > 0) {
            console.log(`🔧 Fixed ${fixedCount} task date inconsistencies`);
        }
        
        return fixedCount;
    }

    migrateTaskDates() {
        if (!window.tasks || !Array.isArray(window.tasks)) {
            return 0;
        }
        
        const fixedCount = this.ensureTaskDateConsistency(window.tasks);
        
        if (fixedCount > 0) {
            // Save the fixes
            try {
                if (window.dataManager) {
                    window.dataManager.saveData(window.homeData, window.tasks);
                }
                console.log('💾 Date migration saved successfully');
            } catch (error) {
                console.error('❌ Error saving date migration:', error);
            }
        }

        return fixedCount;
    }

    // ===== TASK COMPLETION WITH DATE UPDATES =====
    
    completeTaskSafe(taskId) {
        console.log(`✅ Completing task ${taskId} (calendar-safe version)...`);
        
        const task = window.tasks?.find(t => t.id === taskId);
        if (!task) {
            console.error('❌ Task not found:', taskId);
            alert('❌ Task not found');
            return;
        }

        const oldDueDate = task.dueDate ? new Date(task.dueDate) : new Date();
        
        // Mark as completed with timestamp (same as your existing logic)
        task.lastCompleted = new Date();
        task.isCompleted = false; // Will be due again in the future
        
        // Calculate next due date using enhanced system
        const nextDueDate = this.calculateNextDueDate(task, oldDueDate);
        if (!nextDueDate) {
            alert('❌ Error calculating next due date');
            return;
        }
        
        // Use unified date setter (ensures calendar sync)
        if (!this.setTaskDate(task, nextDueDate)) {
            alert('❌ Error setting new due date');
            return;
        }
        
        console.log(`📅 Task "${task.title}" completed!`);
        console.log(`  Old due date: ${oldDueDate.toLocaleDateString()}`);
        console.log(`  Next due date: ${nextDueDate.toLocaleDateString()}`);
        console.log(`  Frequency: ${task.frequency} days`);
        console.log(`  ✅ Calendar sync confirmed: dueDate=${task.dueDate.toLocaleDateString()}, nextDue=${task.nextDue.toLocaleDateString()}`);
        
        // Save and refresh (same as your existing logic)
        try {
            if (window.dataManager) {
                window.dataManager.saveData(window.homeData, window.tasks);
            }
            console.log('💾 Data saved after task completion');
        } catch (error) {
            console.error('❌ Error saving data after completion:', error);
            alert('❌ Error saving task completion');
            return;
        }
        
        // Update global references
        window.tasks = window.tasks;
        
        // Refresh all displays
        this.refreshAllDisplays();
        
        // Success message
        alert(`✅ Task "${task.title}" completed!\nNext due: ${nextDueDate.toLocaleDateString()}`);
    }

    // ===== DISPLAY REFRESH HELPERS =====
    
    refreshAllDisplays() {
        // Refresh enhanced dashboard
        if (window.enhancedDashboard && typeof window.enhancedDashboard.render === 'function') {
            console.log('🔄 Refreshing enhanced dashboard...');
            window.enhancedDashboard.render();
        } else {
            console.log('🔄 Refreshing basic dashboard...');
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        }
        
        // CRITICAL: Force calendar refresh with verification
        if (window.casaCareCalendar) {
            console.log('📅 Forcing calendar refresh...');
            try {
                if (typeof window.casaCareCalendar.refresh === 'function') {
                    window.casaCareCalendar.refresh();
                    console.log('✅ Calendar refresh called successfully');
                } else if (typeof window.casaCareCalendar.render === 'function') {
                    window.casaCareCalendar.render();
                    console.log('✅ Calendar render called successfully');
                } else {
                    console.warn('⚠️ Calendar refresh method not found, trying to recreate...');
                    if (typeof CasaCareCalendar !== 'undefined') {
                        window.casaCareCalendar = new CasaCareCalendar();
                        console.log('✅ Calendar recreated successfully');
                    }
                }
            } catch (error) {
                console.error('❌ Error refreshing calendar:', error);
            }
        }
    }

    // ===== INITIALIZATION =====
    
    initializeDateManagement() {
        console.log('📅 Initializing calendar-safe date management...');
        
        // Run migration for existing data
        this.migrateTaskDates();
        
        // Make the enhanced complete task function available
        // But keep your original as backup
        window.completeTaskOriginal = window.completeTask;
        window.completeTask = (taskId) => this.completeTaskSafe(taskId);
        
        console.log('✅ Calendar-safe date management initialized');
    }

    // ===== UTILITY FUNCTIONS =====
    
    formatDate(date) {
        if (!date) return '';
        return date.toLocaleDateString();
    }

    formatDateTime(date) {
        if (!date) return '';
        return date.toLocaleString();
    }

    isDateValid(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }

    getDaysUntil(date) {
        if (!this.isDateValid(date)) return null;
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    isOverdue(date) {
        if (!this.isDateValid(date)) return false;
        return date < new Date();
    }

    isDueSoon(date, daysThreshold = 7) {
        if (!this.isDateValid(date)) return false;
        const daysUntil = this.getDaysUntil(date);
        return daysUntil !== null && daysUntil <= daysThreshold && daysUntil >= 0;
    }
}

console.log('🔄 Creating DateUtils global instance...');

// Create a global instance
window.dateUtils = new DateUtils();

console.log('✅ DateUtils global instance created:', !!window.dateUtils);

// Export the new functions for debugging and future use
window.setTaskDate = (task, date) => window.dateUtils.setTaskDate(task, date);
window.calculateNextDueDate = (task, completionDate) => window.dateUtils.calculateNextDueDate(task, completionDate);
window.ensureTaskDateConsistency = (tasks) => window.dateUtils.ensureTaskDateConsistency(tasks);
window.migrateTaskDates = () => window.dateUtils.migrateTaskDates();

// Export for module systems (if needed later)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DateUtils;
}
