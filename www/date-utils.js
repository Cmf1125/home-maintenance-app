// date-utils.js - Calendar-safe date management utilities
// Safe to extract as it's self-contained with clear interfaces

/**
 * Unified date setter - ensures calendar sync
 * This enhances existing date logic with consistency checks
 */
function setTaskDate(task, date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error('❌ Invalid date provided to setTaskDate:', date);
        return false;
    }
    
    // Set both properties for maximum compatibility
    task.dueDate = new Date(date);
    task.nextDue = new Date(date); // Critical for calendar display
    return true;
}

/**
 * Unified recurring date calculator
 */
function calculateNextDueDate(task, completionDate = new Date()) {
    if (!task.frequency || task.frequency <= 0) {
        console.error('❌ Invalid frequency for task:', task.title);
        return null;
    }
    
    const baseDate = task.dueDate ? new Date(task.dueDate) : completionDate;
    const nextDate = new Date(baseDate.getTime() + (task.frequency * 24 * 60 * 60 * 1000));
    return nextDate;
}

/**
 * Ensure all tasks have consistent date properties
 * Fixes any data inconsistencies that might exist
 */
function ensureTaskDateConsistency(tasks) {
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
    
    return fixedCount;
}

/**
 * Migration function to fix any existing data
 */
function migrateTaskDates() {
    if (!window.tasks || !Array.isArray(window.tasks)) {
        return;
    }
    
    const fixedCount = ensureTaskDateConsistency(window.tasks);
    
    if (fixedCount > 0) {
        try {
            if (typeof window.saveData === 'function') {
                window.saveData();
            }
            console.log('💾 Date migration saved successfully');
        } catch (error) {
            console.error('❌ Error saving date migration:', error);
        }
    }
}

/**
 * Initialize the enhanced date management system
 */
function initializeDateManagement() {
    console.log('📅 Initializing calendar-safe date management...');
    migrateTaskDates();
    console.log('✅ Calendar-safe date management initialized');
}

// Export functions for global access
window.DateUtils = {
    setTaskDate,
    calculateNextDueDate,
    ensureTaskDateConsistency,
    migrateTaskDates,
    initializeDateManagement
};

// Keep critical functions global for calendar compatibility
window.setTaskDate = setTaskDate;
window.calculateNextDueDate = calculateNextDueDate;
window.ensureTaskDateConsistency = ensureTaskDateConsistency;
window.migrateTaskDates = migrateTaskDates;
window.initializeDateManagement = initializeDateManagement;

console.log('✅ Date utilities module loaded');
