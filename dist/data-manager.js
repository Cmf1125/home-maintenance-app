// Data Manager Module - Handles all data storage and validation
// Extracted from app.js for better organization

console.log('🔄 Loading DataManager module...');

try {
    class DataManager {
        constructor() {
            this.STORAGE_KEY = 'casaCareData';
            this.VERSION = '2.1';
            console.log('💾 Data Manager module initialized');
        }

        // ===== DATA STORAGE FUNCTIONS =====
        
        saveData(homeData, tasks) {
            // Ensure calendar compatibility before saving
            if (window.tasks) {
                window.tasks.forEach(task => {
                    if (task.dueDate && !task.nextDue) {
                        task.nextDue = task.dueDate;
                    }
                });
            }
            
            const data = { 
                homeData: homeData, 
                tasks: tasks,
                version: this.VERSION
            };
            
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
                console.log('✅ Data saved to browser storage with calendar compatibility');
                return true;
            } catch (error) {
                console.error('❌ Failed to save data:', error);
                throw error; // Re-throw so caller can handle
            }
        }

        loadData() {
            try {
                const savedData = localStorage.getItem(this.STORAGE_KEY);
                if (savedData) {
                    const data = JSON.parse(savedData);
                    
                    const homeData = data.homeData || {};
                    const tasks = data.tasks || [];
                    
                    // Restore dates - handle both old nextDue and new dueDate formats
                    tasks.forEach(task => {
                        if (task.nextDue) {
                            task.dueDate = new Date(task.nextDue);
                            // Keep nextDue for calendar compatibility
                            task.nextDue = new Date(task.nextDue);
                        } else if (task.dueDate) {
                            task.dueDate = new Date(task.dueDate);
                            // Set nextDue for calendar compatibility
                            task.nextDue = new Date(task.dueDate);
                        }
                        if (task.lastCompleted) task.lastCompleted = new Date(task.lastCompleted);
                    });
                    
                    console.log('✅ Data loaded from browser storage with calendar compatibility');
                    return { homeData, tasks };
                }
            } catch (error) {
                console.error('❌ Failed to load data:', error);
            }
            return { homeData: {}, tasks: [] };
        }

        clearData() {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                localStorage.removeItem(this.STORAGE_KEY);
                
                // Reset UI
                document.getElementById('setup-form').style.display = 'block';
                document.getElementById('task-setup').classList.add('hidden');
                document.getElementById('main-app').classList.add('hidden');
                document.getElementById('header-subtitle').textContent = 'Smart home maintenance';
                
                console.log('✅ All data cleared');
                alert('✅ All data cleared. Starting fresh!');
                return true;
            }
            return false;
        }

        hasExistingData() {
            return this.loadData() && this.loadData().homeData.fullAddress;
        }

        exportData(homeData, tasks) {
            const data = {
                homeData: homeData,
                tasks: tasks,
                exportDate: new Date().toISOString(),
                version: this.VERSION
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const link = document.createElement("a");
            link.setAttribute("href", dataStr);
            link.setAttribute("download", "casa_care_backup.json");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('📄 Data exported successfully!');
            alert('📄 Data exported successfully!');
            return true;
        }

        // ===== DATA VALIDATION =====
        
        validateHomeData(data) {
            const errors = [];
            
            if (!data.address || data.address.trim().length < 5) {
                errors.push('Valid address is required (at least 5 characters)');
            }
            
            if (!data.city || data.city.trim().length < 2) {
                errors.push('Valid city is required');
            }
            
            if (!data.state || data.state.trim().length !== 2) {
                errors.push('Valid 2-letter state code is required');
            }
            
            if (!data.zipcode || data.zipcode.trim().length < 5) {
                errors.push('Valid zip code is required');
            }
            
            if (!data.yearBuilt || data.yearBuilt < 1900 || data.yearBuilt > new Date().getFullYear()) {
                errors.push('Valid year built is required (1900 to current year)');
            }
            
            if (!data.sqft || data.sqft < 100 || data.sqft > 50000) {
                errors.push('Valid square footage is required (100 to 50,000)');
            }
            
            if (errors.length > 0) {
                throw new Error('Validation failed: ' + errors.join(', '));
            }
            
            return true;
        }

        validateTask(task) {
            const errors = [];
            
            if (!task.title || task.title.trim().length < 3) {
                errors.push('Task title is required (at least 3 characters)');
            }
            
            if (!task.category) {
                errors.push('Task category is required');
            }
            
            if (errors.length > 0) {
                throw new Error('Task validation failed: ' + errors.join(', '));
            }
            
            return true;
        }

        // ===== UTILITY FUNCTIONS =====
        
        generateTaskId() {
            return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    }

    console.log('🔄 Creating DataManager global instance...');

    // Create a global instance
    window.dataManager = new DataManager();

    console.log('✅ DataManager global instance created:', !!window.dataManager);

    // Export for module systems (if needed later)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DataManager;
    }
} catch (error) {
    console.error('❌ Error loading DataManager module:', error);
}
