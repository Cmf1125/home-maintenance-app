// The Home Keeper App - Simplified Version Using Modules
// This file now acts as a coordinator between the modules

// App data
let homeData = {};
let tasks = [];
let currentEditingTask = null;

// ===== MAIN INITIALIZATION =====

function initializeApp() {
    console.log('🏠 The Home Keeper MODULAR VERSION initializing...');
    
    // Initialize modules
    if (window.dataManager) {
        const data = window.dataManager.loadData();
        homeData = data.homeData;
        tasks = data.tasks;
    }
    
    // Make data available globally
    window.homeData = homeData;
    window.tasks = tasks;
    
    // Initialize date management
    if (window.dateUtils) {
        window.dateUtils.initializeDateManagement();
    }
    
    if (window.dataManager?.hasExistingData()) {
        // Hide setup screens
        document.getElementById('setup-form').style.display = 'none';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Update header
        document.getElementById('header-subtitle').textContent = homeData.fullAddress;
        
        // Show dashboard
        if (window.uiController) {
            window.uiController.showTab('dashboard');
        }
    }
    
    console.log('✅ Modular app initialized successfully');
}

// ===== MAIN FUNCTIONS (COORDINATORS) =====

function createMaintenancePlan() {
    try {
        if (window.taskGenerator) {
            const result = window.taskGenerator.createMaintenancePlan();
            homeData = result.homeData;
            tasks = result.tasks;
            
            // Update global references
            window.homeData = homeData;
            window.tasks = tasks;
            
            // Show task setup
            document.getElementById('setup-form').style.display = 'none';
            document.getElementById('task-setup').classList.remove('hidden');
            
            if (window.uiController) {
                window.uiController.showTaskSetup();
            }
            
            console.log('✅ Successfully moved to task setup screen');
        }
    } catch (error) {
        console.error('❌ Error in createMaintenancePlan:', error);
        alert('❌ Error creating maintenance plan. Check console for details.');
    }
}

function showTaskSetup() {
    if (window.uiController) {
        window.uiController.showTaskSetup();
    }
}

function updatePropertySummary() {
    if (window.uiController) {
        window.uiController.updatePropertySummary();
    }
}

function renderTaskCategories() {
    if (window.uiController) {
        window.uiController.renderTaskCategories();
    }
}

function goBackToHomeSetup() {
    if (window.uiController) {
        window.uiController.goBackToHomeSetup();
    }
}

function finishTaskSetup() {
    if (window.uiController) {
        window.uiController.finishTaskSetup();
    }
}

function showTab(tabName) {
    if (window.uiController) {
        window.uiController.showTab(tabName);
    }
}

function updateDashboard() {
    if (window.uiController) {
        window.uiController.updateDashboard();
    }
}

function addTaskFromSetup() {
    if (window.uiController) {
        window.uiController.addTaskFromSetup();
    }
}

function completeTask(taskId) {
    if (window.uiController) {
        window.uiController.completeTask(taskId);
    }
}

function addTaskFromDashboard() {
    if (window.uiController) {
        window.uiController.addTaskFromDashboard();
    }
}

function editTaskFromSetup(taskId) {
    if (window.uiController) {
        window.uiController.editTaskFromSetup(taskId);
    }
}

function deleteTaskDirect(taskId) {
    if (window.uiController) {
        window.uiController.deleteTaskDirect(taskId);
    }
}

function openTaskEditModal(task, isNewTask = false) {
    if (window.uiController) {
        window.uiController.openTaskEditModal(task, isNewTask);
    }
}

function closeTaskEditModal() {
    if (window.uiController) {
        window.uiController.closeTaskEditModal();
    }
}

function saveTaskFromEdit() {
    if (window.uiController) {
        window.uiController.saveTaskFromEdit();
    }
}

function deleteTaskFromEdit() {
    if (window.uiController) {
        window.uiController.deleteTaskFromEdit();
    }
}

// ===== DATA FUNCTIONS (COORDINATORS) =====

function saveData() {
    if (window.dataManager) {
        window.dataManager.saveData(homeData, tasks);
    }
}

function loadData() {
    if (window.dataManager) {
        const data = window.dataManager.loadData();
        homeData = data.homeData;
        tasks = data.tasks;
        window.homeData = homeData;
        window.tasks = tasks;
        return true;
    }
    return false;
}

function clearData() {
    if (window.dataManager) {
        const cleared = window.dataManager.clearData();
        if (cleared) {
            homeData = {};
            tasks = [];
            window.homeData = homeData;
            window.tasks = tasks;
        }
    }
}

function exportData() {
    if (window.dataManager) {
        window.dataManager.exportData(homeData, tasks);
    }
}

function hasExistingData() {
    if (window.dataManager) {
        return window.dataManager.hasExistingData();
    }
    return false;
}

// ===== DATE FUNCTIONS (COORDINATORS) =====

function setTaskDate(task, date) {
    if (window.dateUtils) {
        return window.dateUtils.setTaskDate(task, date);
    }
    return false;
}

function calculateNextDueDate(task, completionDate) {
    if (window.dateUtils) {
        return window.dateUtils.calculateNextDueDate(task, completionDate);
    }
    return null;
}

function ensureTaskDateConsistency(tasks) {
    if (window.dateUtils) {
        return window.dateUtils.ensureTaskDateConsistency(tasks);
    }
    return 0;
}

function completeTaskSafe(taskId) {
    if (window.dateUtils) {
        window.dateUtils.completeTaskSafe(taskId);
    }
}

function refreshAllDisplays() {
    if (window.dateUtils) {
        window.dateUtils.refreshAllDisplays();
    }
}

function migrateTaskDates() {
    if (window.dateUtils) {
        return window.dateUtils.migrateTaskDates();
    }
    return 0;
}

function initializeDateManagement() {
    if (window.dateUtils) {
        window.dateUtils.initializeDateManagement();
    }
}

// ===== TASK GENERATION FUNCTIONS (COORDINATORS) =====

function getClimateRegion(state) {
    if (window.taskGenerator) {
        return window.taskGenerator.getClimateRegion(state);
    }
    return 'GENERAL';
}

function getAutoPriority(title, category) {
    if (window.taskGenerator) {
        return window.taskGenerator.getAutoPriority(title, category);
    }
    return 'normal';
}

function generateTaskTemplates() {
    if (window.taskGenerator && window.homeData) {
        const newTasks = window.taskGenerator.generateTaskTemplates(window.homeData);
        tasks = newTasks;
        window.tasks = tasks;
    }
}

function generateRegionalTasks(climateRegion, startingId, hasExteriorResponsibility) {
    if (window.taskGenerator) {
        return window.taskGenerator.generateRegionalTasks(climateRegion, startingId, hasExteriorResponsibility);
    }
    return [];
}

// ===== WELL WATER FUNCTION =====

function toggleWellWaterOptions() {
    if (window.uiController) {
        window.uiController.toggleWellWaterOptions();
    }
}

// ===== GLOBAL EXPORTS =====

// Make functions globally available
window.createMaintenancePlan = createMaintenancePlan;
window.showTaskSetup = showTaskSetup;
window.updatePropertySummary = updatePropertySummary;
window.renderTaskCategories = renderTaskCategories;
window.goBackToHomeSetup = goBackToHomeSetup;
window.finishTaskSetup = finishTaskSetup;
window.showTab = showTab;
window.updateDashboard = updateDashboard;
window.addTaskFromSetup = addTaskFromSetup;
window.completeTask = completeTask;
window.addTaskFromDashboard = addTaskFromDashboard;
window.editTaskFromSetup = editTaskFromSetup;
window.deleteTaskDirect = deleteTaskDirect;
window.openTaskEditModal = openTaskEditModal;
window.closeTaskEditModal = closeTaskEditModal;
window.saveTaskFromEdit = saveTaskFromEdit;
window.deleteTaskFromEdit = deleteTaskFromEdit;
window.saveData = saveData;
window.loadData = loadData;
window.clearData = clearData;
window.exportData = exportData;
window.hasExistingData = hasExistingData;
window.setTaskDate = setTaskDate;
window.calculateNextDueDate = calculateNextDueDate;
window.ensureTaskDateConsistency = ensureTaskDateConsistency;
window.completeTaskSafe = completeTaskSafe;
window.refreshAllDisplays = refreshAllDisplays;
window.migrateTaskDates = migrateTaskDates;
window.initializeDateManagement = initializeDateManagement;
window.getClimateRegion = getClimateRegion;
window.getAutoPriority = getAutoPriority;
window.generateTaskTemplates = generateTaskTemplates;
window.generateRegionalTasks = generateRegionalTasks;
window.toggleWellWaterOptions = toggleWellWaterOptions;

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

console.log('✅ Simplified app.js loaded - using modular architecture'); 