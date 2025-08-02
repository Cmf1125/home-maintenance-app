// data-manager.js - Data persistence and validation
// Handles localStorage operations and data integrity

class DataManager {
    constructor() {
        this.storageKey = 'casaCareData';
        this.version = '2.1';
    }

    /**
     * Save data to localStorage with calendar compatibility
     */
    saveData(homeData, tasks) {
        // Ensure calendar compatibility before saving
        if (tasks) {
            tasks.forEach(task => {
                if (task.dueDate && !task.nextDue) {
                    task.nextDue = task.dueDate;
                }
            });
        }
        
        const data = { 
            homeData: homeData || window.homeData, 
            tasks: tasks || window.tasks,
            version: this.version,
            lastSaved: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('✅ Data saved to browser storage with calendar compatibility');
            return true;
        } catch (error) {
            console.error('❌ Failed to save data:', error);
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Please delete some data to free up space.');
            }
            throw error;
        }
    }

    /**
     * Load data from localStorage with date restoration
     */
    loadData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) {
                return { homeData: {}, tasks: [] };
            }

            const data = JSON.parse(savedData);
            
            // Restore dates - handle both old nextDue and new dueDate formats
            if (data.tasks) {
                data.tasks.forEach(task => {
                    if (task.nextDue) {
                        task.dueDate = new Date(task.nextDue);
                        task.nextDue = new Date(task.nextDue);
                    } else if (task.dueDate) {
                        task.dueDate = new Date(task.dueDate);
                        task.nextDue = new Date(task.dueDate);
                    }
                    if (task.lastCompleted) {
                        task.lastCompleted = new Date(task.lastCompleted);
                    }
                });
            }
            
            console.log('✅ Data loaded from browser storage with calendar compatibility');
            return {
                homeData: data.homeData || {},
                tasks: data.tasks || [],
                version: data.version,
                lastSaved: data.lastSaved
            };
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            return { homeData: {}, tasks: [] };
        }
    }

    /**
     * Validate home data structure
     */
    validateHomeData(homeData) {
        const errors = [];
        
        if (!homeData.address || homeData.address.trim() === '') {
            errors.push('Address is required');
        }
        
        if (!homeData.city || homeData.city.trim() === '') {
            errors.push('City is required');
        }
        
        if (!homeData.state || homeData.state.length !== 2) {
            errors.push('State must be 2 characters');
        }
        
        if (!homeData.zipcode || homeData.zipcode.trim() === '') {
            errors.push('Zip code is required');
        }
        
        if (!homeData.yearBuilt || homeData.yearBuilt < 1800 || homeData.yearBuilt > new Date().getFullYear() + 1) {
            errors.push('Year built must be valid');
        }
        
        if (!homeData.sqft || homeData.sqft < 100 || homeData.sqft > 50000) {
            errors.push('Square footage must be reasonable (100-50,000)');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate task data structure
     */
    validateTask(task) {
        const errors = [];
        
        if (!task.title || task.title.trim() === '') {
            errors.push('Task title is required');
        }
        
        if (!task.frequency || task.frequency <= 0) {
            errors.push('Frequency must be greater than 0');
        }
        
        if (task.cost < 0) {
            errors.push('Cost cannot be negative');
        }
        
        if (!['high', 'medium', 'low'].includes(task.priority)) {
            errors.push('Priority must be high, medium, or low');
        }
        
        if (!task.category || task.category.trim() === '') {
            errors.push('Category is required');
        }
        
        if (task.dueDate && isNaN(new Date(task.dueDate).getTime())) {
            errors.push('Due date must be valid');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Export data for backup
     */
    exportData(homeData, tasks) {
        const data = {
            homeData: homeData || window.homeData,
            tasks: tasks || window.tasks,
            exportDate: new Date().toISOString(),
            version: this.version,
            appName: 'The Home Keeper'
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `casa_care_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('📄 Data exported successfully');
        return true;
    }

    /**
     * Import data from backup
     */
    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validate imported data
            if (!data.homeData || !data.tasks) {
                throw new Error('Invalid backup file format');
            }
            
            // Validate home data
            const homeValidation = this.validateHomeData(data.homeData);
            if (!homeValidation.isValid) {
                throw new Error('Invalid home data: ' + homeValidation.errors.join(', '));
            }
            
            // Validate tasks
            const taskErrors = [];
            data.tasks.forEach((task, index) => {
                const taskValidation = this.validateTask(task);
                if (!taskValidation.isValid) {
                    taskErrors.push(`Task ${index + 1}: ${taskValidation.errors.join(', ')}`);
                }
            });
            
            if (taskErrors.length > 0) {
                throw new Error('Invalid task data: ' + taskErrors.join('; '));
            }
            
            // Save imported data
            this.saveData(data.homeData, data.tasks);
            
            console.log('✅ Data imported successfully');
            return {
                success: true,
                homeData: data.homeData,
                tasks: data.tasks
            };
            
        } catch (error) {
            console.error('❌ Import failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Clear all data
     */
    clearData() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('🗑️ All data cleared');
            return true;
        } catch (error) {
            console.error('❌ Failed to clear data:', error);
            return false;
        }
    }

    /**
     * Get storage usage info
     */
    getStorageInfo() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const sizeInBytes = new Blob([data || '']).size;
            const sizeInKB = Math.round(sizeInBytes / 1024);
            
            return {
                sizeInBytes,
                sizeInKB,
                hasData: !!data,
                lastSaved: this.loadData().lastSaved
            };
        } catch (error) {
            console.error('❌ Failed to get storage info:', error);
            return null;
        }
    }
}

// Create global instance
window.dataManager = new DataManager();

// Keep existing global functions for compatibility
window.saveData = function() {
    return window.dataManager.saveData(window.homeData, window.tasks);
};

window.loadData = function() {
    const result = window.dataManager.loadData();
    
    // Set global variables
    window.homeData = result.homeData || {};
    window.tasks = result.tasks || [];
    
    console.log('🔄 Global variables set:', {
        homeDataKeys: Object.keys(window.homeData),
        tasksLength: window.tasks.length
    });
    
    return !!(result.homeData && result.homeData.address);
};

window.clearData = function() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        const success = window.dataManager.clearData();
        if (success) {
            window.homeData = {};
            window.tasks = [];
            
            // Reset UI to setup form
            document.getElementById('setup-form').style.display = 'block';
            document.getElementById('task-setup').classList.add('hidden');
            document.getElementById('main-app').classList.add('hidden');
            document.getElementById('header-subtitle').textContent = 'Smart home maintenance';
            
            alert('✅ All data cleared. Starting fresh!');
        }
    }
};

window.exportData = function() {
    window.dataManager.exportData();
    alert('📄 Data exported successfully!');
};

window.hasExistingData = function() {
    const result = window.dataManager.loadData();
    return !!(result.homeData && result.homeData.address);
};

console.log('✅ Data management module loaded');
