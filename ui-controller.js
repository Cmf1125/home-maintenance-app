// UI Controller Module - Handles all DOM manipulation and UI interactions
// Extracted from app.js for better organization

console.log('🔄 Loading UIController module...');

class UIController {
    constructor() {
        console.log('🎨 UI Controller module initialized');
        this.currentEditingTask = null;
    }

    // ===== WELL WATER OPTIONS =====
    
    toggleWellWaterOptions() {
        const wellWaterCheckbox = document.getElementById('well-water');
        const wellWaterOptions = document.getElementById('well-water-options');
        
        if (wellWaterCheckbox && wellWaterOptions) {
            if (wellWaterCheckbox.checked) {
                wellWaterOptions.classList.remove('hidden');
            } else {
                wellWaterOptions.classList.add('hidden');
                // Uncheck all sub-options
                const subOptions = ['sediment-filter', 'uv-filter', 'water-softener', 'whole-house-filter'];
                subOptions.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) element.checked = false;
                });
            }
        }
    }

    // ===== TASK SETUP UI =====
    
    showTaskSetup() {
        // Update property summary
        this.updatePropertySummary();
        
        // Render task categories
        this.renderTaskCategories();
    }

    updatePropertySummary() {
        const taskSetupSummary = document.getElementById('task-setup-summary');
        if (!taskSetupSummary) {
            console.error('❌ Task setup summary element not found');
            return;
        }
        
        const homeData = window.homeData || {};
        
        const heatingCooling = [];
        if (homeData.features?.centralAC) heatingCooling.push('Central AC/Heat');
        if (homeData.features?.miniSplits) heatingCooling.push('Mini-Splits');
        if (homeData.features?.wallAC) heatingCooling.push('Wall AC');
        if (homeData.features?.electricBaseboard) heatingCooling.push('Electric Baseboard');
        if (homeData.features?.boiler) heatingCooling.push('Boiler');

        const waterSewer = [];
        if (homeData.features?.municipalWater) waterSewer.push('Municipal Water');
        if (homeData.features?.wellWater) {
            let wellWaterText = 'Well Water';
            const wellWaterSubs = [];
            if (homeData.features?.sedimentFilter) wellWaterSubs.push('Sediment Filter');
            if (homeData.features?.uvFilter) wellWaterSubs.push('UV Filter');
            if (homeData.features?.waterSoftener) wellWaterSubs.push('Water Softener');
            if (homeData.features?.wholeHouseFilter) wellWaterSubs.push('Whole House Filter');
            if (wellWaterSubs.length > 0) {
                wellWaterText += ` (${wellWaterSubs.join(', ')})`;
            }
            waterSewer.push(wellWaterText);
        }
        if (homeData.features?.municipalSewer) waterSewer.push('Municipal Sewer');
        if (homeData.features?.septic) waterSewer.push('Septic System');

        const otherFeatures = [];
        if (homeData.features?.fireplace) otherFeatures.push('Fireplace');
        if (homeData.features?.pool) otherFeatures.push('Pool/Spa');
        if (homeData.features?.deck) otherFeatures.push('Deck/Patio');
        if (homeData.features?.garage) otherFeatures.push('Garage');
        if (homeData.features?.basement) otherFeatures.push('Basement');
        if (homeData.features?.otherFeatures) otherFeatures.push(homeData.features.otherFeatures);

        const climateRegion = window.taskGenerator?.getClimateRegion(homeData.state) || 'GENERAL';
        const regionDisplayNames = {
            'NORTHEAST_COLD': 'Northeast (Cold Climate)',
            'SOUTHEAST_HUMID': 'Southeast (Humid Climate)', 
            'MIDWEST_CONTINENTAL': 'Midwest (Continental Climate)',
            'SOUTHWEST_ARID': 'Southwest (Arid Climate)',
            'WEST_COAST': homeData.state?.toUpperCase() === 'CA' ? 'California' : 'Pacific Northwest',
            'MOUNTAIN_WEST': 'Mountain West',
            'ALASKA_HAWAII': homeData.state?.toUpperCase() === 'AK' ? 'Alaska' : 'Hawaii',
            'GENERAL': 'General Climate'
        };

        const propertyTypeDisplay = {
            'single-family': 'Single Family Home',
            'townhouse': 'Townhouse',
            'condo': 'Condo',
            'apartment': 'Apartment',
            'mobile-home': 'Mobile Home'
        };

        taskSetupSummary.innerHTML = `
            <div class="space-y-1 text-sm">
                <div><strong>🏠 Address:</strong> ${homeData.fullAddress || 'Not set'}</div>
                <div><strong>🏢 Type:</strong> ${propertyTypeDisplay[homeData.propertyType] || 'Not set'} • <strong>📐 Size:</strong> ${homeData.sqft?.toLocaleString() || 'Not set'} sq ft • <strong>🏗️ Built:</strong> ${homeData.yearBuilt || 'Not set'}</div>
                ${heatingCooling.length > 0 ? `<div><strong>🌡️ Heating/Cooling:</strong> ${heatingCooling.join(', ')}</div>` : ''}
                ${waterSewer.length > 0 ? `<div><strong>💧 Water/Sewer:</strong> ${waterSewer.join(', ')}</div>` : ''}
                ${otherFeatures.length > 0 ? `<div><strong>⚙️ Other Features:</strong> ${otherFeatures.join(', ')}</div>` : ''}
                <div><strong>🌍 Climate Region:</strong> ${regionDisplayNames[climateRegion]} (includes regional seasonal tasks)</div>
            </div>
        `;
    }

    renderTaskCategories() {
        const taskCategoriesContainer = document.getElementById('task-categories');
        const taskSummaryStats = document.getElementById('task-summary-stats');
        
        if (!taskCategoriesContainer || !taskSummaryStats) {
            console.error('❌ Task containers not found!');
            return;
        }
        
        const tasks = window.tasks || [];
        
        if (tasks.length === 0) {
            taskCategoriesContainer.innerHTML = '<div class="text-center text-gray-500 py-8">No tasks generated.</div>';
            return;
        }

        // Organize tasks by category
        const tasksByCategory = {};
        const seasonalTasks = { spring: [], summer: [], fall: [], winter: [] };
        
        tasks.forEach(task => {
            if (task.category === 'Seasonal') {
                const season = task.season || 'fall';
                seasonalTasks[season].push(task);
            } else {
                if (!tasksByCategory[task.category]) {
                    tasksByCategory[task.category] = [];
                }
                tasksByCategory[task.category].push(task);
            }
        });

        // Generate summary stats
        const totalTasks = tasks.length;
        const totalCost = tasks.reduce((sum, task) => sum + (task.cost * (365 / task.frequency)), 0);
        const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
        const seasonalTasksCount = tasks.filter(t => t.category === 'Seasonal').length;

        taskSummaryStats.innerHTML = `
            <div class="text-center">
                <div class="text-lg font-bold text-gray-900">${totalTasks}</div>
                <div class="text-xs text-gray-600">Total Tasks</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-green-600">$${Math.round(totalCost)}</div>
                <div class="text-xs text-gray-600">Annual Cost</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-red-600">${highPriorityTasks}</div>
                <div class="text-xs text-gray-600">High Priority</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-purple-600">${seasonalTasksCount}</div>
                <div class="text-xs text-gray-600">Seasonal Tasks</div>
            </div>
        `;

        // Category configuration
        const categoryConfig = window.categoryConfig || {
            'HVAC': { icon: '🌡️', color: 'blue' },
            'Water Systems': { icon: '💧', color: 'cyan' },
            'Exterior': { icon: '🏠', color: 'green' },
            'Safety': { icon: '⚠️', color: 'red' },
            'General': { icon: '🔧', color: 'gray' }
        };

        const seasonConfig = {
            'spring': { icon: '🌸', name: 'Spring' },
            'summer': { icon: '☀️', name: 'Summer' },
            'fall': { icon: '🍂', name: 'Fall' },
            'winter': { icon: '❄️', name: 'Winter' }
        };

        let categoriesHTML = '';

        // Render regular categories with simple lists
        Object.entries(tasksByCategory).forEach(([category, categoryTasks]) => {
            const config = categoryConfig[category] || { icon: '📋', color: 'gray' };
            
            categoriesHTML += `
                <div class="bg-white rounded-lg border border-gray-200 mb-4">
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h4 class="font-semibold text-gray-900 flex items-center gap-2">
                                <span class="text-lg">${config.icon}</span>
                                ${category}
                            </h4>
                            <span class="bg-${config.color}-100 text-${config.color}-700 px-2 py-1 rounded text-xs">
                                ${categoryTasks.length} tasks
                            </span>
                        </div>
                    </div>
                    <div class="p-4">
                        ${this.renderSimpleTaskList(categoryTasks)}
                    </div>
                </div>
            `;
        });

        // Render seasonal tasks with simple lists
        const hasSeasonalTasks = Object.values(seasonalTasks).some(arr => arr.length > 0);
        
        if (hasSeasonalTasks) {
            categoriesHTML += `
                <div class="bg-white rounded-lg border border-gray-200 mb-4">
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h4 class="font-semibold text-gray-900 flex items-center gap-2">
                                <span class="text-lg">🍂</span>
                                Seasonal Tasks
                            </h4>
                            <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                ${seasonalTasksCount} tasks
                            </span>
                        </div>
                    </div>
                    <div class="p-4">
            `;

            Object.entries(seasonalTasks).forEach(([season, seasonTasks]) => {
                if (seasonTasks.length > 0) {
                    const config = seasonConfig[season];
                    categoriesHTML += `
                        <div class="mb-4">
                            <h5 class="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <span>${config.icon}</span>
                                ${config.name}
                            </h5>
                            ${this.renderSimpleTaskList(seasonTasks)}
                        </div>
                    `;
                }
            });

            categoriesHTML += `
                    </div>
                </div>
            `;
        }

        taskCategoriesContainer.innerHTML = categoriesHTML;
    }

    renderSimpleTaskList(taskList) {
        if (!taskList || taskList.length === 0) {
            return '<div class="text-gray-500 text-sm">No tasks in this category.</div>';
        }

        return taskList.map(task => this.renderSimpleTaskItem(task)).join('');
    }

    renderSimpleTaskItem(task) {
        const priorityColors = {
            'high': 'text-red-600',
            'medium': 'text-yellow-600',
            'low': 'text-green-600'
        };

        const frequencyText = task.frequency === 365 ? 'Yearly' :
                            task.frequency === 180 ? 'Every 6 months' :
                            task.frequency === 90 ? 'Every 3 months' :
                            task.frequency === 60 ? 'Every 2 months' :
                            task.frequency === 30 ? 'Monthly' :
                            `Every ${task.frequency} days`;

        return `
            <div class="border-b border-gray-100 last:border-b-0 py-3">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="font-medium text-gray-900">${task.title}</div>
                        <div class="text-sm text-gray-600 mt-1">${task.description}</div>
                        <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>${frequencyText}</span>
                            <span class="${priorityColors[task.priority] || 'text-gray-500'}">${task.priority} priority</span>
                            ${task.cost > 0 ? `<span>$${task.cost}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== NAVIGATION =====
    
    goBackToHomeSetup() {
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('setup-form').style.display = 'block';
    }

    finishTaskSetup() {
        // Save data
        if (window.dataManager) {
            window.dataManager.saveData(window.homeData, window.tasks);
        }
        
        // Hide setup screens
        document.getElementById('setup-form').style.display = 'none';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Update header
        document.getElementById('header-subtitle').textContent = window.homeData?.fullAddress || 'Smart home maintenance';
        
        // Show dashboard
        this.showTab('dashboard');
        
        console.log('✅ Successfully moved to main app');
    }

    showTab(tabName) {
        // Hide all tab content
        const tabContents = ['dashboard', 'calendar', 'documents'];
        tabContents.forEach(tab => {
            const element = document.getElementById(`${tab}-view`);
            if (element) element.classList.add('hidden');
        });

        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => btn.classList.remove('active'));

        // Show selected tab content
        const selectedTab = document.getElementById(`${tabName}-view`);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }

        // Add active class to selected tab button
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // Update dashboard if needed
        if (tabName === 'dashboard') {
            this.updateDashboard();
        }
    }

    updateDashboard() {
        const tasks = window.tasks || [];
        
        if (tasks.length === 0) {
            const dashboardContent = document.getElementById('dashboard-content');
            if (dashboardContent) {
                dashboardContent.innerHTML = `
                    <div class="text-center py-8">
                        <div class="text-4xl mb-4">🏠</div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
                        <p class="text-gray-600">Complete your home setup to generate maintenance tasks.</p>
                    </div>
                `;
            }
            return;
        }

        // Update dashboard with tasks
        if (window.enhancedDashboard && typeof window.enhancedDashboard.render === 'function') {
            window.enhancedDashboard.render();
        }
    }

    // ===== TASK ACTIONS =====
    
    addTaskFromSetup() {
        this.openTaskEditModal(null, true);
    }

    completeTask(taskId) {
        if (window.dateUtils) {
            window.dateUtils.completeTaskSafe(taskId);
        }
    }

    addTaskFromDashboard() {
        this.openTaskEditModal(null, true);
    }

    editTaskFromSetup(taskId) {
        const task = window.tasks?.find(t => t.id === taskId);
        if (task) {
            this.openTaskEditModal(task, false);
        }
    }

    deleteTaskDirect(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            if (window.dataManager) {
                window.dataManager.deleteTask(taskId);
                this.refreshAllDisplays();
            }
        }
    }

    // ===== MODAL MANAGEMENT =====
    
    openTaskEditModal(task, isNewTask = false) {
        this.currentEditingTask = task;
        
        const modal = document.getElementById('task-edit-modal');
        if (!modal) return;

        // Populate form
        if (task) {
            document.getElementById('edit-task-title').value = task.title || '';
            document.getElementById('edit-task-description').value = task.description || '';
            document.getElementById('edit-task-category').value = task.category || 'General';
            document.getElementById('edit-task-frequency').value = task.frequency || 365;
            document.getElementById('edit-task-cost').value = task.cost || 0;
            document.getElementById('edit-task-priority').value = task.priority || 'medium';
        } else {
            // Clear form for new task
            document.getElementById('edit-task-title').value = '';
            document.getElementById('edit-task-description').value = '';
            document.getElementById('edit-task-category').value = 'General';
            document.getElementById('edit-task-frequency').value = 365;
            document.getElementById('edit-task-cost').value = 0;
            document.getElementById('edit-task-priority').value = 'medium';
        }

        // Show modal
        modal.classList.remove('hidden');
    }

    closeTaskEditModal() {
        const modal = document.getElementById('task-edit-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.currentEditingTask = null;
    }

    saveTaskFromEdit() {
        const taskData = {
            title: document.getElementById('edit-task-title').value,
            description: document.getElementById('edit-task-description').value,
            category: document.getElementById('edit-task-category').value,
            frequency: parseInt(document.getElementById('edit-task-frequency').value),
            cost: parseInt(document.getElementById('edit-task-cost').value),
            priority: document.getElementById('edit-task-priority').value
        };

        try {
            if (this.currentEditingTask) {
                // Update existing task
                if (window.dataManager) {
                    window.dataManager.updateTask(this.currentEditingTask.id, taskData);
                }
            } else {
                // Add new task
                if (window.dataManager) {
                    window.dataManager.addTask(taskData);
                }
            }

            this.closeTaskEditModal();
            this.refreshAllDisplays();
        } catch (error) {
            console.error('❌ Error saving task:', error);
            alert('Error saving task: ' + error.message);
        }
    }

    deleteTaskFromEdit() {
        if (this.currentEditingTask && confirm('Are you sure you want to delete this task?')) {
            if (window.dataManager) {
                window.dataManager.deleteTask(this.currentEditingTask.id);
                this.closeTaskEditModal();
                this.refreshAllDisplays();
            }
        }
    }

    // ===== UTILITY FUNCTIONS =====
    
    refreshAllDisplays() {
        if (window.dateUtils) {
            window.dateUtils.refreshAllDisplays();
        }
    }
}

console.log('🔄 Creating UIController global instance...');

// Create a global instance
window.uiController = new UIController();

console.log('✅ UIController global instance created:', !!window.uiController);

// Make well water function globally available
window.toggleWellWaterOptions = () => window.uiController.toggleWellWaterOptions();

// Export for module systems (if needed later)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
