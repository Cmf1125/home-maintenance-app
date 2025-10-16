// The Home Keeper App - Clean Simple Version with All Fixes

// Helper function to format numbers with commas
function formatCurrency(amount) {
    return '$' + Math.round(amount).toLocaleString();
}

// Make formatCurrency globally available
window.formatCurrency = formatCurrency;

// App data
let homeData = {};
let tasks = [];
let currentEditingTask = null;

// CRITICAL FIX 1: Well water dropdown - Make function available immediately
function toggleWellWaterOptions() {
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
    } else {
        
    }
}

// Make it globally available immediately - CRITICAL FIX
window.toggleWellWaterOptions = toggleWellWaterOptions;

// ========================================
// GOOGLE CALENDAR INTEGRATION FUNCTIONS
// ========================================

// Toggle Google Calendar sync connection
async function toggleGoogleCalendarSync() {
    try {
        if (!window.googleCalendarSync) {
            console.error('❌ Google Calendar Sync not available');
            alert('Google Calendar integration is not available. Please refresh the page.');
            return;
        }

        const syncStatus = window.googleCalendarSync.getConnectionInfo();
        
        if (syncStatus.connected) {
            // User wants to disconnect
            const confirm = window.confirm('Disconnect Google Calendar sync? Your existing calendar events will remain, but new tasks won\'t be synced.');
            if (confirm) {
                await window.googleCalendarSync.signOutFromGoogle();
                updateCalendarSyncUI();
                console.log('👋 Disconnected from Google Calendar');
            }
        } else {
            // User wants to connect
            console.log('🔄 Connecting to Google Calendar...');
            const success = await window.googleCalendarSync.signInToGoogle();
            
            if (success) {
                updateCalendarSyncUI();
                
                // Ask if they want to sync existing tasks
                const syncExisting = window.confirm('Would you like to sync your existing maintenance tasks to Google Calendar?');
                if (syncExisting) {
                    await window.googleCalendarSync.syncAllTasks();
                }
            }
        }
    } catch (error) {
        console.error('❌ Error with Google Calendar sync:', error);
        alert('Error connecting to Google Calendar. Please check your internet connection and try again.');
    }
}

// Update the calendar sync UI based on connection status
function updateCalendarSyncUI() {
    const syncTextElement = document.getElementById('calendar-sync-text');
    const syncStatusElement = document.getElementById('calendar-sync-status');
    
    if (!window.googleCalendarSync || !syncTextElement || !syncStatusElement) {
        return;
    }

    const connectionInfo = window.googleCalendarSync.getConnectionInfo();
    
    if (connectionInfo.connected) {
        syncTextElement.textContent = 'Google Calendar Connected';
        syncStatusElement.textContent = connectionInfo.userEmail ? 
            `Syncing to: ${connectionInfo.userEmail}` : 
            'Tasks sync to your calendar';
        syncStatusElement.className = 'text-xs text-green-600';
    } else {
        syncTextElement.textContent = 'Connect Google Calendar';
        syncStatusElement.textContent = 'Sync tasks to your calendar';
        syncStatusElement.className = 'text-xs text-gray-500';
    }
}

// Hook into existing task functions to sync with Google Calendar

// Enhanced task completion to sync with calendar
async function completeTaskWithCalendarSync(taskId) {
    // Complete the task normally first
    completeTask(taskId);
    
    // Then handle Google Calendar sync
    if (window.googleCalendarSync && window.googleCalendarSync.isConnected()) {
        const task = window.tasks.find(t => t.id === taskId);
        if (task && task.googleEventId) {
            await window.googleCalendarSync.deleteCalendarEvent(task);
        }
    }
}

// Enhanced task creation to sync with calendar
async function addTaskWithCalendarSync(taskData) {
    // Add the task normally first
    const taskId = addTask(taskData);
    
    // Then sync to Google Calendar if connected
    if (window.googleCalendarSync && window.googleCalendarSync.isConnected() && taskId) {
        const task = window.tasks.find(t => t.id === taskId);
        if (task) {
            await window.googleCalendarSync.syncTaskToCalendar(task);
        }
    }
    
    return taskId;
}

// Enhanced task editing to sync changes with calendar  
async function updateTaskWithCalendarSync(taskId, updates) {
    // Update the task normally first
    const taskIndex = window.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    // Apply updates
    Object.assign(window.tasks[taskIndex], updates);
    
    // Save data
    if (window.currentUser) {
        saveData();
    }
    
    // Then sync changes to Google Calendar if connected
    if (window.googleCalendarSync && window.googleCalendarSync.isConnected()) {
        const task = window.tasks[taskIndex];
        if (task.googleEventId) {
            await window.googleCalendarSync.updateCalendarEvent(task);
        } else {
            // Task doesn't have a calendar event yet, create one
            await window.googleCalendarSync.syncTaskToCalendar(task);
        }
    }
    
    // Refresh UI
    if (window.enhancedDashboard) {
        window.enhancedDashboard.render();
    }
}

// Make functions globally available
window.toggleGoogleCalendarSync = toggleGoogleCalendarSync;
window.updateCalendarSyncUI = updateCalendarSyncUI;
window.completeTaskWithCalendarSync = completeTaskWithCalendarSync;
window.addTaskWithCalendarSync = addTaskWithCalendarSync;
window.updateTaskWithCalendarSync = updateTaskWithCalendarSync;

// Climate region detection
function getClimateRegion(state) {
    const stateUpper = state.toUpperCase();
    const regions = {
        'NORTHEAST_COLD': ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
        'SOUTHEAST_HUMID': ['DE', 'MD', 'VA', 'WV', 'KY', 'TN', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'AR', 'LA'],
        'MIDWEST_CONTINENTAL': ['OH', 'IN', 'MI', 'IL', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
        'SOUTHWEST_ARID': ['TX', 'OK', 'NM', 'AZ', 'NV', 'UT', 'CO'],
        'WEST_COAST': ['CA', 'OR', 'WA'],
        'MOUNTAIN_WEST': ['MT', 'WY', 'ID'],
        'ALASKA_HAWAII': ['AK', 'HI']
    };
    
    for (const [region, states] of Object.entries(regions)) {
        if (states.includes(stateUpper)) {
            return region;
        }
    }
    return 'GENERAL';
}

// 👇 ADD THE FUNCTION RIGHT HERE 👇
function getAutoPriority(title, category) {
    // Safety tasks are always high priority
    if (category === 'Safety') return 'high';
    
    // Critical safety keywords
    const safetyKeywords = ['smoke', 'detector', 'carbon monoxide', 'chimney', 'boiler', 'fire'];
    if (safetyKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
        return 'high';
    }
    
    // Everything else is normal priority
    return 'normal';
}

// Global category configuration (shared between setup and dashboard)
const categoryConfig = {
    'HVAC': { icon: '🌡️', color: 'blue' },
    'Water Systems': { icon: '💧', color: 'cyan' },
    'Exterior': { icon: '🏠', color: 'green' },
    'Pest Control': { icon: '🐛', color: 'orange' },
    'Safety': { icon: '⚠️', color: 'red' },
    'General': { icon: '🔧', color: 'gray' },
    'Appliance': { icon: '⚙️', color: 'purple' }
};

// Make it globally available
window.categoryConfig = categoryConfig;

// Create maintenance plan
function createMaintenancePlan() {
    try {
        // Existing home data collection...
        homeData = {
            address: document.getElementById('address')?.value || '123 Main Street',
            city: document.getElementById('city')?.value || 'Anytown',
            state: document.getElementById('state')?.value || 'NY',
            zipcode: document.getElementById('zipcode')?.value || '12345',
            propertyType: document.getElementById('property-type')?.value || 'single-family',
            yearBuilt: parseInt(document.getElementById('year-built')?.value) || 2000,
            sqft: parseInt(document.getElementById('sqft')?.value) || 2000,
            hoaCost: parseFloat(document.getElementById('hoa-cost')?.value) || 0,
            ownerName: window.currentUser?.displayName || 'Homeowner'
        };
        homeData.fullAddress = `${homeData.address}, ${homeData.city}, ${homeData.state} ${homeData.zipcode}`;

        // ENHANCED: Collect features - ADD THE NEW ONES to your existing features object
        homeData.features = {
            // ===== EXISTING FEATURES (keep all of these) =====
            centralAC: document.getElementById('central-ac')?.checked || false,
            miniSplits: document.getElementById('mini-splits')?.checked || false,
            wallAC: document.getElementById('wall-ac')?.checked || false,
            electricBaseboard: document.getElementById('electric-baseboard')?.checked || false,
            boiler: document.getElementById('boiler')?.checked || false,
            municipalWater: document.getElementById('municipal-water')?.checked || false,
            wellWater: document.getElementById('well-water')?.checked || false,
            sedimentFilter: document.getElementById('sediment-filter')?.checked || false,
            uvFilter: document.getElementById('uv-filter')?.checked || false,
            waterSoftener: document.getElementById('water-softener')?.checked || false,
            wholeHouseFilter: document.getElementById('whole-house-filter')?.checked || false,
            municipalSewer: document.getElementById('municipal-sewer')?.checked || false,
            septic: document.getElementById('septic')?.checked || false,
            fireplace: document.getElementById('fireplace')?.checked || false,
            pool: document.getElementById('pool')?.checked || false,
            deck: document.getElementById('deck')?.checked || false,
            garage: document.getElementById('garage')?.checked || false,
            basement: document.getElementById('basement')?.checked || false,
            otherFeatures: document.getElementById('other-features')?.value || '',

            // ===== NEW FEATURES - ADD THESE =====
            // Energy & Smart Systems
            solarPanels: document.getElementById('solar-panels')?.checked || false,
            backupGenerator: document.getElementById('backup-generator')?.checked || false,
            batteryStorage: document.getElementById('battery-storage')?.checked || false,
            smartThermostat: document.getElementById('smart-thermostat')?.checked || false,
            securitySystem: document.getElementById('security-system')?.checked || false,

            // Structural Details (new checkbox system)
            roofAsphalt: document.getElementById('roof-asphalt')?.checked || false,
            roofMetal: document.getElementById('roof-metal')?.checked || false,
            roofTile: document.getElementById('roof-tile')?.checked || false,
            roofSlate: document.getElementById('roof-slate')?.checked || false,
            roofWood: document.getElementById('roof-wood')?.checked || false,
            roofFlat: document.getElementById('roof-flat')?.checked || false,
            roofAge: parseInt(document.getElementById('roof-age')?.value) || 0,
            
            sidingVinyl: document.getElementById('siding-vinyl')?.checked || false,
            sidingWood: document.getElementById('siding-wood')?.checked || false,
            sidingBrick: document.getElementById('siding-brick')?.checked || false,
            sidingStucco: document.getElementById('siding-stucco')?.checked || false,
            sidingFiberCement: document.getElementById('siding-fiber-cement')?.checked || false,
            sidingStone: document.getElementById('siding-stone')?.checked || false,
            
            foundationSlab: document.getElementById('foundation-slab')?.checked || false,
            foundationCrawl: document.getElementById('foundation-crawl')?.checked || false,
            foundationFullBasement: document.getElementById('foundation-full-basement')?.checked || false,
            foundationPartialBasement: document.getElementById('foundation-partial-basement')?.checked || false,
            foundationPier: document.getElementById('foundation-pier')?.checked || false,

            // Outdoor Features
            sprinklerSystem: document.getElementById('sprinkler-system')?.checked || false,
            outdoorLighting: document.getElementById('outdoor-lighting')?.checked || false,
            fencing: document.getElementById('fencing')?.checked || false,
            pavedDriveway: document.getElementById('paved-driveway')?.checked || false,
            matureLandscaping: document.getElementById('mature-landscaping')?.checked || false,
            outdoorKitchen: document.getElementById('outdoor-kitchen')?.checked || false
        };

        // Use the new task generator instead of old generateTaskTemplates
        console.log('🏠 DEBUG: taskGenerator exists:', !!window.taskGenerator);
        console.log('🏠 DEBUG: createMaintenancePlan exists:', !!(window.taskGenerator && window.taskGenerator.createMaintenancePlan));
        
        if (window.taskGenerator && window.taskGenerator.createMaintenancePlan) {
            console.log('🏠 DEBUG: Using new task generator');
            const result = window.taskGenerator.createMaintenancePlan();
            console.log('🏠 DEBUG: Task generator result:', result);
            console.log('🏠 DEBUG: homeData from generator:', result.homeData);
            console.log('🏠 DEBUG: Purchase price:', result.homeData.purchasePrice);
            console.log('🏠 DEBUG: Purchase year:', result.homeData.purchaseYear);
            window.homeData = result.homeData;
            window.tasks = result.tasks;
        } else {
            console.log('🏠 DEBUG: Using old system fallback');
            // Fallback to old system
            generateTaskTemplates();
            
            
            window.homeData = homeData;
            window.tasks = tasks;
        }

        // Switch to task setup screen
        const setupForm = document.getElementById('setup-form');
        const taskSetup = document.getElementById('task-setup');

        if (setupForm) setupForm.style.display = 'none';
        if (taskSetup) {
            taskSetup.classList.remove('hidden');
            taskSetup.style.display = 'block';
        }

        setTimeout(showTaskSetup, 0);
        console.log('✅ Successfully moved to task setup screen with expanded features');
    } catch (error) {
        console.error('❌ Error in createMaintenancePlan:', error);
        alert('❌ Error creating maintenance plan. Check console for details.');
    }
}

// Generate task templates
function generateTaskTemplates() {

    
    tasks = [];
    let id = 1;

    // Essential tasks for all homes
    const essentialTasks = [
        {
            id: id++,
            title: 'Test Smoke Detectors',
            category: 'Safety',
            frequency: 180,
            cost: 0,
           priority: getAutoPriority('Test Smoke Detectors', 'Safety'), // ← ADD THIS LINE
            description: 'Test all smoke and carbon monoxide detectors',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        },
        {
            id: id++,
            title: 'Dryer Vent Cleaning',
            category: 'Safety',
            frequency: 365,
            cost: 100,
           priority: getAutoPriority('Dryer Vent Cleaning', 'Safety'), // ← ADD THIS LINE
            description: 'Clean dryer vent to prevent fire hazard',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        }
    ];

    // Property-type specific tasks
    const hasExteriorResponsibility = ['single-family', 'townhouse', 'mobile-home'].includes(homeData.propertyType);
    
    if (hasExteriorResponsibility) {
        essentialTasks.push(
            {
                id: id++,
                title: 'Clean Gutters',
                category: 'Exterior',
                frequency: 180,
                cost: 150,
                 priority: getAutoPriority('Clean Gutters', 'Exterior'), // ← ADD THIS LINE
                description: 'Clean gutters and downspouts',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            },
            {
                id: id++,
                title: 'Inspect Caulking',
                category: 'General',
                frequency: 365,
                cost: 50,
                 priority: getAutoPriority('Inspect Caulking', 'General'), // ← ADD THIS LINE
                description: 'Check and replace caulking around windows and doors',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            }
        );
    } else {
        essentialTasks.push({
            id: id++,
            title: 'Inspect Window Seals',
            category: 'General',
            frequency: 365,
            cost: 0,
            priority: getAutoPriority('Inspect Window Seats', 'General'), // ← ADD THIS LINE
            description: 'Check window and door seals for air leaks',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    tasks.push(...essentialTasks);

    // HVAC Tasks
    if (homeData.features.centralAC) {
        tasks.push(
            {
                id: id++,
                title: 'Replace HVAC Filter',
                category: 'HVAC',
                frequency: 90,
                cost: 25,
                priority: getAutoPriority('Replace HVAC Filter', 'HVAC'), // ← ADD THIS LINE
                description: 'Replace central air system filter',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            },
            {
                id: id++,
                title: 'HVAC Professional Service',
                category: 'HVAC',
                frequency: 365,
                cost: 150,
                priority: getAutoPriority('HVAC Professional Service', 'HVAC'), // ← ADD THIS LINE
                description: 'Annual professional HVAC maintenance',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            }
        );
    }

    if (homeData.features.miniSplits) {
        tasks.push({
            id: id++,
            title: 'Clean Mini-Split Filters',
            category: 'HVAC',
            frequency: 60,
            cost: 0,
            priority: getAutoPriority('Clean Mini-Split Filters', 'HVAC'), // ← ADD THIS LINE
            description: 'Clean mini-split unit filters',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    if (homeData.features.wallAC) {
        tasks.push({
            id: id++,
            title: 'Clean Wall AC Filters',
            category: 'HVAC',
            frequency: 30,
            cost: 0,
            priority: getAutoPriority('Clean Wall AC Filters', 'HVAC'), // ← ADD THIS LINE
            description: 'Clean wall air conditioner filters',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    if (homeData.features.electricBaseboard) {
        tasks.push({
            id: id++,
            title: 'Clean Electric Baseboard Heaters',
            category: 'HVAC',
            frequency: 180,
            cost: 0,
            priority: getAutoPriority('Clean Electric Baseboard Heaters', 'HVAC'), // ← ADD THIS LINE
            description: 'Clean dust from electric baseboard heating elements',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    if (homeData.features.boiler) {
        tasks.push({
            id: id++,
            title: 'Boiler Annual Service',
            category: 'HVAC',
            frequency: 365,
            cost: 200,
            priority: getAutoPriority('Boiler Annual Service', 'HVAC'), // ← ADD THIS LINE
            description: 'Professional boiler inspection and maintenance',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // Water System Tasks
    if (homeData.features.wellWater) {
        tasks.push({
            id: id++,
            title: 'Test Well Water',
            category: 'Water Systems',
            frequency: 365,
            cost: 75,
            priority: getAutoPriority('Test Well Water', 'Water Systems'), // ← ADD THIS LINE
            description: 'Annual water quality testing',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });

        if (homeData.features.sedimentFilter) {
            tasks.push({
                id: id++,
                title: 'Replace Sediment Filter',
                category: 'Water Systems',
                frequency: 90,
                cost: 25,
                priority: getAutoPriority('Replace Sediment Filter', 'Water Systems'), // ← ADD THIS LINE
                description: 'Replace sediment filter for well water system',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.uvFilter) {
            tasks.push({
                id: id++,
                title: 'Replace UV Filter',
                category: 'Water Systems',
                frequency: 365,
                cost: 150,
                priority: getAutoPriority('Replace UV Filter', 'Water Systems'), // ← ADD THIS LINE
                description: 'Replace UV filter for water treatment',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.waterSoftener) {
            tasks.push({
                id: id++,
                title: 'Refill Water Softener Salt',
                category: 'Water Systems',
                frequency: 60,
                cost: 30,
                priority: getAutoPriority('Refill Water Softener Salt', 'Water Systems'), // ← ADD THIS LINE
                description: 'Check and refill water softener salt',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.wholeHouseFilter) {
            tasks.push({
                id: id++,
                title: 'Replace Whole House Filter',
                category: 'Water Systems',
                frequency: 180,
                cost: 50,
                priority: getAutoPriority('Replace Whole House Filter', 'Water Systems'), // ← ADD THIS LINE
                description: 'Replace whole house water filter',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }
    }

    if (homeData.features.septic) {
        tasks.push({
            id: id++,
            title: 'Septic Tank Pumping',
            category: 'Water Systems',
            frequency: 1095, // 3 years
            cost: 400,
            priority: getAutoPriority('Septic Tank Pumping', 'Water Systems'), // ← ADD THIS LINE
            description: 'Professional septic pumping',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
        
        // Monthly septic pod flush for system health
        tasks.push({
            id: id++,
            title: 'Monthly Septic Pod Flush',
            category: 'Water Systems',
            frequency: 30, // Monthly
            cost: 15,
            priority: 'medium',
            description: 'Add septic treatment pods to maintain healthy bacterial balance and prevent system issues',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // Other Feature Tasks
    if (homeData.features.fireplace) {
        tasks.push({
            id: id++,
            title: 'Chimney Inspection & Cleaning',
            category: 'Safety',
            frequency: 365,
            cost: 300,
            priority: getAutoPriority('Chimney Inspection & Cleaning', 'Safety'), // ← ADD THIS LINE
            description: 'Professional chimney cleaning and inspection',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    if (homeData.features.deck) {
        tasks.push({
            id: id++,
            title: 'Deck Staining/Sealing',
            category: 'Exterior',
            frequency: 730, // 2 years
            cost: 200,
            priority: getAutoPriority('Deck Staining/Sealing', 'Exterior'), // ← ADD THIS LINE
            description: 'Stain or seal deck to protect from weather',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    if (homeData.features.pool) {
        tasks.push({
            id: id++,
            title: 'Pool Opening/Closing',
            category: 'General',
            frequency: 182, // Twice yearly
            cost: 300,
            priority: getAutoPriority('Pool Opening/Closing', 'General'), // ← ADD THIS LINE
            description: 'Seasonal pool opening and closing',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    if (homeData.features.garage) {
        tasks.push({
            id: id++,
            title: 'Garage Door Maintenance',
            category: 'General',
            frequency: 365,
            cost: 50,
            priority: getAutoPriority('Garage Door Maintenance', 'General'), // ← ADD THIS LINE
            description: 'Lubricate garage door hardware and test safety features',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    if (homeData.features.basement) {
        tasks.push({
            id: id++,
            title: 'Check Basement for Moisture',
            category: 'General',
            frequency: 180,
            cost: 0,
            priority: getAutoPriority('Check Basement for Moisture', 'General'), // ← ADD THIS LINE
            description: 'Inspect basement for signs of moisture, leaks, or mold',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

// 🔧 ADD THIS SECTION RIGHT HERE (after basement, before the pest control comment):

    // Generate tasks for expanded features (solar, sprinklers, etc.)
    const expandedFeatureTasks = generateExpandedFeatureTasks(id);
    tasks.push(...expandedFeatureTasks);
    
    // Update ID counter
    if (expandedFeatureTasks.length > 0) {
        id = Math.max(...tasks.map(t => t.id), 0) + 1;
    }

// PEST CONTROL TASKS (for properties with exterior responsibility)
if (hasExteriorResponsibility) {
    const pestControlTasks = [
        {
            id: id++,
            title: 'Quarterly Pest Control Treatment',
            category: 'Pest Control',
            frequency: 90,
            cost: 150,
            priority: getAutoPriority('Quarterly Pest Control Treatment', 'Pest Control'),
            description: 'Professional pest control service or DIY perimeter treatment',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        },
        {
            id: id++,
            title: 'Inspect for Termite Signs',
            category: 'Pest Control',
            frequency: 365,
            cost: 0,
            priority: getAutoPriority('Inspect for Termite Signs', 'Pest Control'),
            description: 'Check foundation, basement, and crawl space for termite damage',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        }
    ];
    
    tasks.push(...pestControlTasks);
    
    // EXTERIOR TASKS (includes yard tasks - all outside work)
    const exteriorTasks = [
        {
            id: id++,
            title: 'Tree Inspection & Pruning',
            category: 'Exterior',
            frequency: 365,
            cost: 200,
            priority: getAutoPriority('Tree Inspection & Pruning', 'Exterior'),
            description: 'Inspect trees for dead branches, especially near house/power lines',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        },
        {
            id: id++,
            title: 'Lawn Fertilizer Application',
            category: 'Exterior',
            frequency: 120,
            cost: 50,
            priority: getAutoPriority('Lawn Fertilizer Application', 'Exterior'),
            description: 'Seasonal lawn fertilizing (spring, summer, fall)',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        }
    ];
    
    // Only add lawn-specific tasks for single-family/townhouse
    if (['single-family', 'townhouse'].includes(homeData.propertyType)) {
        tasks.push(...exteriorTasks);
    }
}

    // Generate regional seasonal tasks
    if (homeData.state) {
        const climateRegion = getClimateRegion(homeData.state);
        const regionalTasks = generateRegionalTasks(climateRegion, id, hasExteriorResponsibility);
        tasks.push(...regionalTasks);
    }
} // ← This closes generateTaskTemplates()

// 🔧 ADD THE NEW FUNCTION RIGHT AFTER THIS CLOSING BRACE:

// Generate tasks for expanded features (solar panels, sprinklers, etc.)
function generateExpandedFeatureTasks(startingId = 1000) {
    let expandedTasks = [];
    let id = startingId;
    
    const features = homeData?.features || {};
    
    // ⚡ Solar Panel Tasks
    if (features.solarPanels) {
        expandedTasks.push({
            id: id++,
            title: 'Solar Panel Cleaning & Inspection',
            category: 'Exterior',
            frequency: 180,
            cost: 100,
            priority: getAutoPriority('Solar Panel Cleaning & Inspection', 'Exterior'),
            description: 'Clean solar panels and inspect for damage, debris, or shading issues',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });

        expandedTasks.push({
            id: id++,
            title: 'Solar System Performance Check',
            category: 'General',
            frequency: 90,
            cost: 0,
            priority: getAutoPriority('Solar System Performance Check', 'General'),
            description: 'Review solar system performance data and energy production',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 🔋 Backup Generator Tasks
    if (features.backupGenerator) {
        expandedTasks.push({
            id: id++,
            title: 'Generator Monthly Test Run',
            category: 'Safety',
            frequency: 30,
            cost: 5,
            priority: getAutoPriority('Generator Monthly Test Run', 'Safety'),
            description: 'Run backup generator for 15-20 minutes to ensure proper operation',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });

        expandedTasks.push({
            id: id++,
            title: 'Generator Annual Service',
            category: 'Safety',
            frequency: 365,
            cost: 250,
            priority: getAutoPriority('Generator Annual Service', 'Safety'),
            description: 'Professional generator maintenance, oil change, and inspection',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 🌡️ Smart Thermostat Tasks
    if (features.smartThermostat) {
        expandedTasks.push({
            id: id++,
            title: 'Smart Thermostat Data Review',
            category: 'HVAC',
            frequency: 90,
            cost: 0,
            priority: getAutoPriority('Smart Thermostat Data Review', 'HVAC'),
            description: 'Review energy usage data and optimize thermostat settings',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 🛡️ Security System Tasks
    if (features.securitySystem) {
        expandedTasks.push({
            id: id++,
            title: 'Security System Test',
            category: 'Safety',
            frequency: 90,
            cost: 0,
            priority: getAutoPriority('Security System Test', 'Safety'),
            description: 'Test security system sensors, cameras, and communication',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 💧 Sprinkler System Tasks
    if (features.sprinklerSystem) {
        expandedTasks.push({
            id: id++,
            title: 'Sprinkler System Spring Startup',
            category: 'Exterior',
            frequency: 365,
            cost: 125,
            priority: getAutoPriority('Sprinkler System Spring Startup', 'Exterior'),
            description: 'Turn on and test sprinkler system, check for winter damage',
            season: 'spring',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });

        expandedTasks.push({
            id: id++,
            title: 'Sprinkler System Winterization',
            category: 'Exterior',
            frequency: 365,
            cost: 100,
            priority: getAutoPriority('Sprinkler System Winterization', 'Exterior'),
            description: 'Blow out and winterize sprinkler system to prevent freeze damage',
            season: 'fall',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 💡 Outdoor Lighting Tasks
    if (features.outdoorLighting) {
        expandedTasks.push({
            id: id++,
            title: 'Outdoor Lighting Inspection',
            category: 'Exterior',
            frequency: 180,
            cost: 30,
            priority: getAutoPriority('Outdoor Lighting Inspection', 'Exterior'),
            description: 'Check outdoor lighting fixtures, replace bulbs, clean fixtures',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 🛣️ Driveway Maintenance Tasks
    if (features.pavedDriveway) {
        expandedTasks.push({
            id: id++,
            title: 'Driveway Crack Sealing',
            category: 'Exterior',
            frequency: 730,
            cost: 200,
            priority: getAutoPriority('Driveway Crack Sealing', 'Exterior'),
            description: 'Seal cracks in paved driveway to prevent water damage',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 🏠 Roof Inspection (based on age)
    if (features.roofAge && features.roofAge > 10) {
        const frequency = features.roofAge > 20 ? 365 : 730;
        
        expandedTasks.push({
            id: id++,
            title: 'Professional Roof Inspection',
            category: 'Exterior',
            frequency: frequency,
            cost: 300,
            priority: getAutoPriority('Professional Roof Inspection', 'Exterior'),
            description: `Professional inspection of ${features.roofAge}-year-old ${features.roofType || 'roof'}`,
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 🌳 Mature Landscaping Tasks
    if (features.matureLandscaping) {
        expandedTasks.push({
            id: id++,
            title: 'Mature Tree Pruning',
            category: 'Exterior',
            frequency: 365,
            cost: 200,
            priority: getAutoPriority('Mature Tree Pruning', 'Exterior'),
            description: 'Professional pruning of mature trees for health and safety',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 🔧 Generator Tasks (fix naming mismatch)
    if (features.generator || features.backupGenerator) {
        expandedTasks.push({
            id: id++,
            title: 'Generator Exercise Run',
            category: 'Safety',
            frequency: 30,
            cost: 10,
            priority: getAutoPriority('Generator Exercise Run', 'Safety'),
            description: 'Run generator monthly to keep engine components lubricated',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 💦 Irrigation/Sprinkler Tasks (fix naming mismatch)
    if (features.irrigation || features.sprinklerSystem) {
        expandedTasks.push({
            id: id++,
            title: 'Sprinkler System Winterization',
            category: 'Exterior',
            frequency: 365,
            cost: 120,
            priority: getAutoPriority('Sprinkler System Winterization', 'Exterior'),
            description: 'Blow out irrigation lines before freezing weather',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
        
        expandedTasks.push({
            id: id++,
            title: 'Sprinkler System Spring Startup',
            category: 'Exterior',
            frequency: 365,
            cost: 100,
            priority: getAutoPriority('Sprinkler System Spring Startup', 'Exterior'),
            description: 'Inspect and test all zones after winter shutdown',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // 🍳 Outdoor Kitchen Tasks
    if (features.outdoorKitchen) {
        expandedTasks.push({
            id: id++,
            title: 'Clean Outdoor Kitchen',
            category: 'Exterior',
            frequency: 30,
            cost: 50,
            priority: getAutoPriority('Clean Outdoor Kitchen', 'Exterior'),
            description: 'Deep clean grill, prep surfaces, and check gas connections',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
        
        expandedTasks.push({
            id: id++,
            title: 'Winterize Outdoor Kitchen',
            category: 'Exterior',
            frequency: 365,
            cost: 100,
            priority: getAutoPriority('Winterize Outdoor Kitchen', 'Exterior'),
            description: 'Protect outdoor appliances and plumbing from winter weather',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    console.log(`✅ Generated ${expandedTasks.length} tasks for expanded features`);
    return expandedTasks;
}

// (then continue with the existing generateRegionalTasks function...)

// Generate regional seasonal tasks
function generateRegionalTasks(climateRegion, startingId, hasExteriorResponsibility) {
    let regionalTasks = [];
    let id = startingId;

    switch(climateRegion) {
        case 'NORTHEAST_COLD':
            regionalTasks = [
                {
                    id: id++,
                    title: 'Check AC Before Summer',
                    category: 'Seasonal',
                    frequency: 365,
                    cost: 0,
                    priority: getAutoPriority('Check AC Before Summer', 'Seasonal'), // ← ADD THIS LINE
                    description: 'Test air conditioning system before hot weather arrives',
                    season: 'spring',
                    dueDate: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                },
                {
                    id: id++,
                    title: 'Check Heating Before Winter',
                    category: 'Seasonal',
                    frequency: 365,
                    cost: 0,
                    priority: getAutoPriority('Check Heating Before Winter', 'Seasonal'), // ← ADD THIS LINE
                    description: 'Test heating system operation before cold weather',
                    season: 'fall',
                    dueDate: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                }
            ];

            if (hasExteriorResponsibility) {
                regionalTasks.push({
                    id: id++,
                    title: 'Winterize Outdoor Pipes',
                    category: 'Seasonal',
                    frequency: 365,
                    cost: 50,
                    priority: getAutoPriority('Winterize Outdoor Pipes', 'Seasonal'), // ← ADD THIS LINE
                    description: 'Shut off and drain outdoor water lines before first freeze',
                    season: 'fall',
                    dueDate: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                });
            }
            break;

        case 'SOUTHEAST_HUMID':
            regionalTasks = [
                {
                    id: id++,
                    title: 'AC Pre-Season Tune-Up',
                    category: 'Seasonal',
                    frequency: 365,
                    cost: 150,
                    priority: getAutoPriority('AC Pre-Season Tune-Up', 'Seasonal'), // ← ADD THIS LINE
                    description: 'Professional AC maintenance before summer heat',
                    season: 'spring',
                    dueDate: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                },
                {
                    id: id++,
                    title: 'Hurricane Emergency Kit Check',
                    category: 'Seasonal',
                    frequency: 365,
                    cost: 50,
                    priority: getAutoPriority('Hurricane Emergency Kit Check', 'Seasonal'), // ← ADD THIS LINE
                    description: 'Update emergency supplies for hurricane season',
                    season: 'spring',
                    dueDate: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                }
            ];
            break;

        case 'WEST_COAST':
            if (homeData.state.toUpperCase() === 'CA') {
                regionalTasks = [
                    {
                        id: id++,
                        title: 'Earthquake Emergency Kit Check',
                        category: 'Seasonal',
                        frequency: 365,
                        cost: 50,
                        priority: getAutoPriority('Earthquake Emergency Kit Check', 'Seasonal'), // ← ADD THIS LINE
                        description: 'Update emergency supplies and secure items',
                        season: 'spring',
                        dueDate: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    }
                ];
            }
            break;

        default:
            regionalTasks = [
                {
                    id: id++,
                    title: 'Spring System Check',
                    category: 'Seasonal',
                    frequency: 365,
                    cost: 0,
                    priority: getAutoPriority('Spring System Check', 'Seasonal'), // ← ADD THIS LINE
                    description: 'Check HVAC and prepare for warmer weather',
                    season: 'spring',
                    dueDate: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                }
            ];
    }

    return regionalTasks;
}

// Show task setup screen
function showTaskSetup() {
    
    // Update property summary
    updatePropertySummary();
    
    // Render task categories
    renderTaskCategories();
    updateCompactTaskSummary();
}

// Update property summary
    function updatePropertySummary() {
       // const taskSetupSummary = document.getElementById('task-setup-summary');
       // if (!taskSetupSummary) {
          // console.error('❌ Task setup summary element not found');
         // return;
      // }
    
    const heatingCooling = [];
    if (homeData.features.centralAC) heatingCooling.push('Central AC/Heat');
    if (homeData.features.miniSplits) heatingCooling.push('Mini-Splits');
    if (homeData.features.wallAC) heatingCooling.push('Wall AC');
    if (homeData.features.electricBaseboard) heatingCooling.push('Electric Baseboard');
    if (homeData.features.boiler) heatingCooling.push('Boiler');

    const waterSewer = [];
    if (homeData.features.municipalWater) waterSewer.push('Municipal Water');
    if (homeData.features.wellWater) {
        let wellWaterText = 'Well Water';
        const wellWaterSubs = [];
        if (homeData.features.sedimentFilter) wellWaterSubs.push('Sediment Filter');
        if (homeData.features.uvFilter) wellWaterSubs.push('UV Filter');
        if (homeData.features.waterSoftener) wellWaterSubs.push('Water Softener');
        if (homeData.features.wholeHouseFilter) wellWaterSubs.push('Whole House Filter');
        if (wellWaterSubs.length > 0) {
            wellWaterText += ` (${wellWaterSubs.join(', ')})`;
        }
        waterSewer.push(wellWaterText);
    }
    if (homeData.features.municipalSewer) waterSewer.push('Municipal Sewer');
    if (homeData.features.septic) waterSewer.push('Septic System');

    const otherFeatures = [];
    if (homeData.features.fireplace) otherFeatures.push('Fireplace');
    if (homeData.features.pool) otherFeatures.push('Pool/Spa');
    if (homeData.features.deck) otherFeatures.push('Deck/Patio');
    if (homeData.features.garage) otherFeatures.push('Garage');
    if (homeData.features.basement) otherFeatures.push('Basement');
    if (homeData.features.otherFeatures) otherFeatures.push(homeData.features.otherFeatures);

    const climateRegion = getClimateRegion(homeData.state);
    const regionDisplayNames = {
        'NORTHEAST_COLD': 'Northeast (Cold Climate)',
        'SOUTHEAST_HUMID': 'Southeast (Humid Climate)', 
        'MIDWEST_CONTINENTAL': 'Midwest (Continental Climate)',
        'SOUTHWEST_ARID': 'Southwest (Arid Climate)',
        'WEST_COAST': homeData.state.toUpperCase() === 'CA' ? 'California' : 'Pacific Northwest',
        'MOUNTAIN_WEST': 'Mountain West',
        'ALASKA_HAWAII': homeData.state.toUpperCase() === 'AK' ? 'Alaska' : 'Hawaii',
        'GENERAL': 'General Climate'
    };

    const propertyTypeDisplay = {
        'single-family': 'Single Family Home',
        'townhouse': 'Townhouse',
        'condo': 'Condo',
        'apartment': 'Apartment',
        'mobile-home': 'Mobile Home'
    };

   // taskSetupSummary.innerHTML = `
       // <div class="space-y-1 text-sm">
           // <div><strong>🏠 Address:</strong> ${homeData.fullAddress}</div>
           // <div><strong>🏢 Type:</strong> ${propertyTypeDisplay[homeData.propertyType]} • <strong>📐 Size:</strong> ${homeData.sqft?.toLocaleString()} sq ft • <strong>🏗️ Built:</strong> ${homeData.yearBuilt}</div>
           // ${heatingCooling.length > 0 ? `<div><strong>🌡️ Heating/Cooling:</strong> ${heatingCooling.join(', ')}</div>` : ''}
           // ${waterSewer.length > 0 ? `<div><strong>💧 Water/Sewer:</strong> ${waterSewer.join(', ')}</div>` : ''}
           // ${otherFeatures.length > 0 ? `<div><strong>⚙️ Other Features:</strong> ${otherFeatures.join(', ')}</div>` : ''}
           // <div><strong>🌍 Climate Region:</strong> ${regionDisplayNames[climateRegion]} (includes regional seasonal tasks)</div>
       // </div>
    //`;
}

// FIXED: Clean simple task categories without big button at bottom
function renderTaskCategories() {
const taskCategoriesContainer = document.getElementById('task-categories');

if (!taskCategoriesContainer) {
    console.error('❌ Task containers not found!');
    return;
}
    
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
   const safetyTasks = tasks.filter(t => t.category === 'Safety').length;
    const seasonalTasksCount = tasks.filter(t => t.category === 'Seasonal').length;

   // taskSummaryStats.innerHTML = `
    //     <div class="text-center">
    //         <div class="text-lg font-bold text-gray-900">${totalTasks}</div>
    //         <div class="text-xs text-gray-600">Total Tasks</div>
    //     </div>
    //     <div class="text-center">
    //         <div class="text-lg font-bold text-green-600">$${Math.round(totalCost)}</div>
    //         <div class="text-xs text-gray-600">Annual Cost</div>
    //     </div>
    //     <div class="text-center">
    //        <div class="text-lg font-bold text-red-600">${safetyTasks}</div>
    //         <div class="text-xs text-gray-600">Safety Tasks</div>
    //     </div>
    //     <div class="text-center">
    //         <div class="text-lg font-bold text-purple-600">${seasonalTasksCount}</div>
    //         <div class="text-xs text-gray-600">Seasonal Tasks</div>
    //     </div>
    // `;

    // Category configuration
    const categoryConfig = {
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
      const config = window.categoryConfig?.[category] || { icon: '📋', color: 'gray' };
        
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
                    ${renderSimpleTaskList(categoryTasks)}
                </div>
            </div>
        `;
    });

    // Render seasonal tasks with simple lists
    const hasSeasonalTasks = Object.values(seasonalTasks).some(arr => arr.length > 0);
    
    if (hasSeasonalTasks) {
        categoriesHTML += `
            <div class="bg-white rounded-lg border border-gray-200 mb-4">
                <div class="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h4 class="font-semibold text-gray-900 flex items-center gap-2">
                            <span class="text-lg">🌍</span>
                            Regional Seasonal Tasks
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
                    <div class="mb-4 last:mb-0">
                        <h5 class="font-medium text-gray-800 flex items-center gap-2 mb-2">
                            <span>${config.icon}</span>
                            ${config.name}
                        </h5>
                        ${renderSimpleTaskList(seasonTasks)}
                    </div>
                `;
            }
        });

        categoriesHTML += `
                </div>
            </div>
        `;
    }

    // REMOVED: Big "Add Custom Task" button at bottom - cleaner interface

taskCategoriesContainer.innerHTML = categoriesHTML;
}

// Update the new compact task summary
function updateCompactTaskSummary() {
    const annualCostDisplay = document.getElementById('annual-cost-display');
    const taskSummaryCompact = document.getElementById('task-summary-compact');
    
    if (!annualCostDisplay || !taskSummaryCompact) return;
    
    // Calculate total cost and category breakdown
    let totalCost = 0;
    const categoryStats = {};
    
    tasks.forEach(task => {
        totalCost += task.cost * (365 / task.frequency);
        
        const category = task.category || 'General';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    // Update cost display
    annualCostDisplay.textContent = `$${Math.round(totalCost)}`;
    
// Create category breakdown with total count
const totalTasks = tasks.length;
const categoryItems = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a) // Sort by count, highest first
    .map(([category, count]) => {
        const categoryInfo = window.categoryConfig?.[category] || { icon: '📋' };
        return `<span class="inline-block mr-4 mb-1">${categoryInfo.icon} ${category} (${count})</span>`;
    })
    .join('');

taskSummaryCompact.innerHTML = `<div class="font-medium text-gray-700 mb-1">${totalTasks} tasks across ${Object.keys(categoryStats).length} categories:</div>${categoryItems}` || 'No tasks generated';
    }

// CLEAN SIMPLE VERSION: Render simple task list (just titles with edit/delete)
function renderSimpleTaskList(taskList) {
    return `
        <div class="space-y-2">
            ${taskList.map(task => renderSimpleTaskItem(task)).join('')}
        </div>
    `;
}

// Replace your renderSimpleTaskItem function with this enhanced version:

function renderSimpleTaskItem(task) {
    const priorityDot = task.priority === 'high' ? '🔴' : 
                       task.priority === 'medium' ? '🟡' : 
                       '⚪';
    
    return `
        <div class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-task-id="${task.id}">
            <!-- Row 1: Dot + Task Name -->
            <div class="flex items-center gap-2 mb-2">
                <span class="text-sm">${priorityDot}</span>
                <span class="font-medium text-gray-900 text-sm flex-1">${task.title}</span>
            </div>
            
            <!-- Row 2: Frequency + Cost -->
            <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Every ${task.frequency} days</span>
                ${task.cost > 0 ? `<span class="text-green-600 font-medium">${formatCurrency(task.cost)}</span>` : ''}
            </div>
            
            <!-- Row 3: Review Button -->
            <div>
                <button onclick="editTaskFromSetup(${task.id})" 
                        class="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-xs font-medium transition-colors">
                    Review Task
                </button>
            </div>
        </div>
    `;
}

// Navigation functions
function goBackToHomeSetup() {
    document.getElementById('task-setup').classList.add('hidden');
    document.getElementById('setup-form').style.display = 'block';
    
    // Pre-populate form with current data
    if (homeData.address) document.getElementById('address').value = homeData.address;
    if (homeData.city) document.getElementById('city').value = homeData.city;
    if (homeData.state) document.getElementById('state').value = homeData.state;
    if (homeData.zipcode) document.getElementById('zipcode').value = homeData.zipcode;
    if (homeData.propertyType) document.getElementById('property-type').value = homeData.propertyType;
    if (homeData.yearBuilt) document.getElementById('year-built').value = homeData.yearBuilt;
    if (homeData.sqft) document.getElementById('sqft').value = homeData.sqft;
    if (homeData.hoaCost) document.getElementById('hoa-cost').value = homeData.hoaCost;
    
    // Set all checkboxes and options
    if (homeData.features) {
        Object.entries(homeData.features).forEach(([key, value]) => {
            const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element && element.type === 'checkbox') {
                element.checked = value;
            }
        });
        
        // Handle text inputs
        if (homeData.features.otherFeatures) {
            document.getElementById('other-features').value = homeData.features.otherFeatures;
        }
        
        // Show well water options if needed
        if (typeof toggleWellWaterOptions === 'function') {
            toggleWellWaterOptions();
        }
    }
}

// CLEAN SIMPLE VERSION: Complete task setup with smart due dates
function finishTaskSetup() {
    console.log('🚀 Starting clean simple task setup completion...');
    console.log(`📊 Processing ${tasks.length} tasks...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each template task with smart due dates
    tasks.forEach(task => {
        if (task.isTemplate) {
            try {
                console.log(`⚙️ Processing task: ${task.title}`);
                
                // Use smart due date calculation
                let dueDate;
                
                if (task.season) {
                    // Seasonal tasks
                    const today = new Date();
                    const currentMonth = today.getMonth();
                    let targetMonth;
                    
                    switch(task.season) {
                        case 'spring': targetMonth = 2; break; // March
                        case 'summer': targetMonth = 5; break; // June
                        case 'fall': targetMonth = 8; break; // September
                        case 'winter': targetMonth = 10; break; // November
                        default: targetMonth = currentMonth;
                    }
                    
                    let targetYear = today.getFullYear();
                    if (targetMonth < currentMonth || (targetMonth === currentMonth && today.getDate() > 15)) {
                        targetYear++;
                    }
                    
                    dueDate = new Date(targetYear, targetMonth, 15, 12, 0, 0);
                } else {
                    // Regular tasks with smart defaults
                    const today = new Date();
                    if (task.priority === 'high') {
                        dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
                    } else if (task.frequency <= 90) {
                        dueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
                    } else {
                        dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
                    }
                }
                
                // Validate the date
                if (isNaN(dueDate.getTime())) {
                    throw new Error(`Invalid due date for task ${task.title}`);
                }
                
                // Set the due date
                task.dueDate = dueDate;
                
                // CRITICAL: Set nextDue for calendar compatibility
                task.nextDue = dueDate;
                
                // Clean up template flag
                delete task.isTemplate;
                task.isCompleted = false;
                task.lastCompleted = null;
                
                console.log(`  ✅ FINAL: Task "${task.title}" due: ${task.dueDate.toLocaleDateString()}`);
                successCount++;
                
            } catch (error) {
                console.error(`❌ Error processing task ${task.title}:`, error);
                errorCount++;
            }
        }
    });
    
    console.log(`✅ Task processing complete: ${successCount} successful, ${errorCount} errors`);
    
    // Verify we have tasks with due dates
    const tasksWithDates = tasks.filter(t => t.dueDate);
    
    console.log(`📊 Final verification: ${tasksWithDates.length} tasks have due dates`);
    
    if (tasksWithDates.length === 0) {
        console.error('❌ CRITICAL: No tasks have due dates after processing!');
        alert('❌ Error: No tasks were properly scheduled. Please try again.');
        return;
    }
    
    // Save data immediately
    try {
        saveData();
        console.log('💾 Data saved successfully');
    } catch (error) {
        console.error('❌ Error saving data:', error);
        alert('❌ Error saving data. Please try again.');
        return;
    }
    
    // Update global references BEFORE switching views
    window.homeData = homeData;
    window.tasks = tasks;
    console.log('🌐 Global references updated');
    
  // Switch to main app
const taskSetupEl = document.getElementById('task-setup');
if (taskSetupEl) {
    taskSetupEl.classList.add('hidden');
    taskSetupEl.style.display = 'none'; // ensures it's fully hidden
}

document.getElementById('main-app').classList.remove('hidden');
document.getElementById('header-subtitle').textContent = homeData.fullAddress;

    // Show bottom navigation
    document.body.classList.add('main-app-active');

    // 🧹 Clean up demo mode and setup classes
if (window.isDemoMode) {
    // Remove demo banner
    const banner = document.querySelector('.demo-banner');
    if (banner) banner.remove();
    
    // Reset progress banner (though it will be hidden anyway)
    const progressBanner = document.getElementById('onboarding-progress');
    if (progressBanner) {
        progressBanner.style.top = '0';
        progressBanner.style.zIndex = '50';
    }
}

// Reset body padding and switch classes
document.body.style.paddingTop = '0';
document.body.classList.remove('setup-active');
document.body.classList.add('main-app-active');
    
    // Initialize dashboard with error handling
    try {
        console.log('🏠 Initializing dashboard...');
        
        // CRITICAL FIX: Ensure main-app is visible
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.classList.remove('hidden');
            mainApp.style.display = 'block';
        }
        
        showTab('dashboard');
        console.log('✅ Dashboard initialized successfully');
        
        // Start welcome tour for new users
        setTimeout(() => {
            startWelcomeTour();
        }, 1000); // Small delay to ensure dashboard is fully rendered
        
        // Initialize Google Calendar sync UI
        if (typeof updateCalendarSyncUI === 'function') {
            updateCalendarSyncUI();
        }
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        // Try basic fallback
        updateDashboard();
    }
    
    // Success message
    alert(`🎉 Setup Complete!\n\n✅ ${successCount} tasks scheduled automatically\n📅 Your clean, simple maintenance plan is ready!\n\nCheck your dashboard and calendar now.`);
    
    // Save to Firebase if user is logged in
    if (window.currentUser) {
        saveUserDataToFirebaseEnhanced(window.currentUser.uid, homeData, tasks)
            .then(() => {
                console.log('💾 User data saved to Firebase');
            })
            .catch((error) => {
                console.error('❌ Error saving to Firebase:', error);
            });
    }
    console.log('🎉 CLEAN SIMPLE TASK SETUP COMPLETION SUCCESSFUL!');
}

// FIXED: Enhanced showTab function that respects All Tasks view
function showTab(tabName) {
    console.log(`🔄 Switching to tab: ${tabName}`);

    // UNIFIED: Always ensure header is visible on all main tabs
    if (['dashboard', 'calendar', 'appliances', 'documents', 'planning', 'vendors'].includes(tabName)) {
        // Ensure main-app-active class is set (makes header sticky)
        document.body.classList.add('main-app-active');
        // Remove any conflicting header classes
        document.body.classList.remove('hide-header', 'show-header');
        
        console.log('✅ Header made sticky for tab:', tabName);
    }
    
    // 🎯 CRITICAL FIX: Only hide back arrow if we're actually switching away from All Tasks
    const allTasksView = document.getElementById('all-tasks-view');
    const isLeavingAllTasks = allTasksView && !allTasksView.classList.contains('hidden');
    
    if (isLeavingAllTasks) {
        console.log('🔍 Leaving All Tasks view - hiding back arrow...');
        const backButton = document.getElementById('back-to-dashboard');
        if (backButton) {
            backButton.classList.add('hidden');
            backButton.style.display = 'none';
            console.log('✅ Back arrow hidden when leaving All Tasks');
        }
    }
    
    // Ensure global references are current
   // window.tasks = tasks;
   // window.homeData = homeData;
    
    // Hide ALL views including All Tasks
    const dashboardView = document.getElementById('dashboard-view');
    const calendarView = document.getElementById('calendar-view');
    const documentsView = document.getElementById('documents-view');
    const appliancesView = document.getElementById('appliances-view');
    const planningView = document.getElementById('planning-view');
    const vendorsView = document.getElementById('vendors-view');

    if (dashboardView) dashboardView.classList.add('hidden');
    if (calendarView) calendarView.classList.add('hidden');
    if (documentsView) documentsView.classList.add('hidden');
    if (appliancesView) appliancesView.classList.add('hidden');
    if (planningView) planningView.classList.add('hidden');
    if (vendorsView) vendorsView.classList.add('hidden');
    if (allTasksView) allTasksView.classList.add('hidden');
    
    // Hide property features view
    const propertyFeaturesView = document.getElementById('property-features-view');
    if (propertyFeaturesView) propertyFeaturesView.classList.add('hidden');
    
    // CRITICAL FIX: Show/hide main-app container based on tab
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
        if (tabName === 'calendar' || tabName === 'planning' || tabName === 'vendors') {
            // Calendar, Planning, and Vendors are full-screen, hide main-app (and its footer)
            mainApp.classList.add('hidden');
            console.log('✅ Main app container hidden for full-screen tab:', tabName);
        } else {
            // All other tabs need main-app visible
            mainApp.classList.remove('hidden');
            console.log('✅ Main app container shown for regular tab:', tabName);
        }
    }
    
    // Hide footer on calendar, planning, and vendors tabs
    const footer = document.querySelector('footer');
    if (footer) {
        if (tabName === 'calendar' || tabName === 'planning' || tabName === 'vendors') {
            footer.style.display = 'none';
        } else {
            footer.style.display = '';
        }
    }
    
    // Reset body styles for non-calendar tabs (restore normal spacing)
    if (tabName !== 'calendar') {
        document.body.style.margin = '';
        document.body.style.padding = '';
    }
    
    // Update tab buttons - all buttons are white text on blue background
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('opacity-100');
        btn.classList.add('opacity-70');
    });
    
    if (tabName === 'dashboard') {
        // Show dashboard
        if (dashboardView) {
            dashboardView.classList.remove('hidden');
        }
        
        // Update tab styling - active tab is fully opaque
        const dashboardTab = document.getElementById('tab-dashboard');
        if (dashboardTab) {
            dashboardTab.classList.add('opacity-100');
            dashboardTab.classList.remove('opacity-70');
        }
        
        console.log('🏠 Initializing enhanced dashboard...');
        
        // Update header subtitles with current address
        if (window.homeData?.fullAddress) {
            const headerSubtitle = document.getElementById('header-subtitle');
            const dashboardSubtitle = document.getElementById('dashboard-subtitle');
            const subtitleText = window.homeData.fullAddress;
            
            if (headerSubtitle) headerSubtitle.textContent = subtitleText;
            if (dashboardSubtitle) dashboardSubtitle.textContent = subtitleText;
            console.log('✅ Header address updated:', subtitleText);
        }
        
        // Enhanced dashboard initialization with robust retry mechanism
        const initializeDashboard = () => {
            try {
                if (typeof EnhancedDashboard !== 'undefined') {
                    if (!window.enhancedDashboard) {
                        console.log('🆕 Creating new enhanced dashboard instance...');
                        window.enhancedDashboard = new EnhancedDashboard();
                    } else {
                        console.log('🔄 Refreshing existing enhanced dashboard...');
                        window.enhancedDashboard.render();
                    }
                    console.log('✅ Enhanced dashboard ready');
                    return true;
                } else {
                    console.warn('⚠️ EnhancedDashboard class not available yet');
                    return false;
                }
            } catch (error) {
                console.error('❌ Error with enhanced dashboard:', error);
                return false;
            }
        };

        // Try to initialize immediately
        if (!initializeDashboard()) {
            console.log('🔄 Enhanced dashboard not ready, waiting...');
            // Retry after a short delay to allow scripts to load
            setTimeout(() => {
                if (!initializeDashboard()) {
                    console.warn('⚠️ Enhanced dashboard still not ready, using basic dashboard');
                    updateDashboard();
                }
            }, 100);
        }
        
        // TIMING FIX: Additional refresh to catch any YouTube URL timing issues
        setTimeout(() => {
            console.log('🎬 Safety refresh for video buttons...');
            try {
                if (window.enhancedDashboard && window.enhancedDashboard.render) {
                    window.enhancedDashboard.render();
                    console.log('✅ Safety refresh completed (enhanced)');
                } else {
                    updateDashboard();
                    console.log('✅ Safety refresh completed (basic)');
                }
            } catch (error) {
                console.error('❌ Error during safety refresh:', error);
            }
        }, 200); // Small delay to ensure all async operations complete
        
    } else if (tabName === 'calendar') {
        // Show calendar
        if (calendarView) {
            calendarView.classList.remove('hidden');
        }
        
        // Hide footer on calendar page
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.display = 'none';
        }
        
        // Reset body margin/padding to eliminate space above calendar
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        
        // Update tab styling
        const calendarTab = document.getElementById('tab-calendar');
        if (calendarTab) {
            calendarTab.classList.add('opacity-100');
            calendarTab.classList.remove('opacity-70');
        }
        
        console.log('📅 Initializing calendar...');
        
        // Initialize calendar
        try {
            if (!window.casaCareCalendar && typeof CasaCareCalendar !== 'undefined') {
                window.casaCareCalendar = new CasaCareCalendar();
            } else if (window.casaCareCalendar) {
                window.casaCareCalendar.refresh();
            }
        } catch (error) {
            console.error('❌ Error initializing calendar:', error);
        }
        
    } else if (tabName === 'documents') {
        // Show documents
        if (documentsView) {
            documentsView.classList.remove('hidden');
        }
        
        // Update tab styling
        const documentsTab = document.getElementById('tab-documents');
        if (documentsTab) {
            documentsTab.classList.add('bg-blue-100', 'text-blue-700');
            documentsTab.classList.remove('text-gray-600');
        }
        
        console.log('📄 Initializing documents...');
        
        // Initialize documents module
        try {
            if (!window.casaCareDocuments && typeof CasaCareDocuments !== 'undefined') {
                console.log('📄 Creating new documents instance...');
                window.casaCareDocuments = new CasaCareDocuments();
            } else if (window.casaCareDocuments) {
                console.log('📄 Refreshing documents...');
                window.casaCareDocuments.render();
            }
        } catch (error) {
            console.error('❌ Error initializing documents:', error);
        }
        
    } else if (tabName === 'property-features') {
        // Show property features
        const propertyFeaturesView = document.getElementById('property-features-view');
        if (propertyFeaturesView) {
            propertyFeaturesView.classList.remove('hidden');
        }
        
        console.log('🏠 Initializing property features...');
        
        // Populate with current data
        try {
            populatePropertyFeaturesTab();
            populatePropertySummarySection();
            console.log('✅ Property features populated');
        } catch (error) {
            console.error('❌ Error populating property features:', error);
        }
        
    } else if (tabName === 'appliances') {
        // Show appliances view
        if (appliancesView) {
            appliancesView.classList.remove('hidden');
        }
        
        // Update tab styling  
        const appliancesTab = document.getElementById('tab-appliances');
        if (appliancesTab) {
            appliancesTab.classList.add('opacity-100');
            appliancesTab.classList.remove('opacity-70');
        }
        
        console.log('⚙️ Switching to appliances tab...');
        
        // Initialize or refresh appliances module
        try {
            if (!window.applianceManager) {
                console.log('⚙️ Appliance manager not found, initializing...');
                if (typeof window.initializeApplianceManager === 'function') {
                    window.applianceManager = window.initializeApplianceManager();
                } else if (typeof ApplianceManager !== 'undefined') {
                    console.log('⚙️ Creating appliance manager directly...');
                    window.applianceManager = new ApplianceManager();
                } else {
                    console.error('❌ ApplianceManager class not available');
                    return;
                }
            }
            
            if (window.applianceManager && typeof window.applianceManager.render === 'function') {
                console.log('⚙️ Rendering appliances view...');
                window.applianceManager.render();
            } else {
                console.error('❌ Appliance manager render method not available');
            }
            
        } catch (error) {
            console.error('❌ Error initializing appliances:', error);
        }
    } else if (tabName === 'planning') {
        // Show planning view
        if (planningView) {
            planningView.classList.remove('hidden');
        }
        
        // Update tab styling  
        const planningTab = document.getElementById('tab-planning');
        if (planningTab) {
            planningTab.classList.add('opacity-100');
            planningTab.classList.remove('opacity-70');
        }
        
        console.log('📊 Initializing planning & budget...');
        
        // Initialize planning functionality
        try {
            renderPlanningView();
        } catch (error) {
            console.error('❌ Error initializing planning:', error);
        }
    }
    
    if (tabName === 'vendors') {
        if (vendorsView) vendorsView.classList.remove('hidden');
        
        // Update tab styling  
        const vendorsTab = document.getElementById('tab-vendors');
        if (vendorsTab) {
            vendorsTab.classList.add('opacity-100');
            vendorsTab.classList.remove('opacity-70');
        }
        
        console.log('📇 Initializing vendors directory...');
        
        // Initialize vendors functionality with mobile-specific handling
        try {
            // Load vendors data
            loadVendors();
            
            // MOBILE FIX: Ensure vendors are rendered after a short delay for mobile
            setTimeout(() => {
                console.log('🔄 Mobile-specific vendors refresh...');
                renderVendors();
            }, 100);
            
        } catch (error) {
            console.error('❌ Error initializing vendors:', error);
        }
    }
    
    console.log(`✅ Switched to ${tabName} tab`);
}

// 🎯 ENHANCED: showAllTasks function with better back arrow handling
function showAllTasks() {
    console.log('📋 Switching to All Tasks view...');
    
    // SIMPLIFIED: Just ensure main-app-active class (header will be sticky automatically)
    document.body.classList.add('main-app-active');
    document.body.classList.remove('hide-header', 'show-header');
    
    // Hide all other views (including dashboard)
    const dashboardView = document.getElementById('dashboard-view');
    const calendarView = document.getElementById('calendar-view');
    const documentsView = document.getElementById('documents-view');
    const appliancesView = document.getElementById('appliances-view');
    const allTasksView = document.getElementById('all-tasks-view');

    if (dashboardView) dashboardView.classList.add('hidden');
    if (calendarView) calendarView.classList.add('hidden');
    if (documentsView) documentsView.classList.add('hidden');
    if (appliancesView) appliancesView.classList.add('hidden');
    
    // Show all tasks view
    if (allTasksView) {
        allTasksView.classList.remove('hidden');
        
        // Show back arrow
        setTimeout(() => {
            const backButton = document.getElementById('back-to-dashboard');
            if (backButton) {
                backButton.classList.remove('hidden');
                backButton.style.display = 'flex';
                backButton.style.visibility = 'visible';
                backButton.style.opacity = '1';
                console.log('✅ Back arrow visible with automatically sticky header!');
            }
        }, 50);
        
    } else {
        console.error('❌ All tasks view not found');
        return;
    }
    
    // Update tab styling to show no tab is selected
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'text-blue-700');
        btn.classList.add('text-gray-600');
    });
    
    // Render the content
    renderAllTasksView();
    
    console.log('✅ All Tasks view displayed with unified sticky header system');
}

function renderAllTasksView() {
    const allTasksView = document.getElementById('all-tasks-view');
    if (!allTasksView) {
        console.error('❌ All tasks view element not found');
        return;
    }
    
   // Calculate stats for All Tasks overview
let totalCost = 0;

window.tasks.forEach(task => {
    totalCost += task.cost * (365 / task.frequency);
});
    
    const totalTasks = window.tasks.filter(t => !t.isCompleted && t.dueDate).length;
    const hoaCost = window.homeData?.hoaCost || 0;
    const annualHoaCost = hoaCost * 12;
    
    // Native mobile All Tasks interface 
    allTasksView.innerHTML = `
        <div class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <div class="px-4 py-6">
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Manage All Tasks</h2>
                </div>

                <!-- Compact Overview with Native Styling -->
                <div class="bg-white/90 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20 shadow-sm">
                    <div class="flex justify-center items-center gap-6 text-sm mb-4">
                        <div class="text-center">
                            <div class="text-xl font-bold text-blue-600">${totalTasks}</div>
                            <div class="text-xs text-gray-600">Tasks</div>
                        </div>
                        <div class="text-center">
                            <div class="text-xl font-bold text-green-600">${formatCurrency(totalCost)}</div>
                            <div class="text-xs text-gray-600">Annual Cost</div>
                        </div>
                        ${hoaCost > 0 ? `
                        <div class="text-center">
                            <div class="text-xl font-bold text-purple-600">${formatCurrency(annualHoaCost)}</div>
                            <div class="text-xs text-gray-600">Annual HOA</div>
                        </div>
                        ` : ''}
                    </div>
                    <button onclick="event.stopPropagation(); window.closeDatePickerModal(); addTaskFromDashboard()" 
                            class="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-semibold shadow-lg transition-all duration-200">
                        Add Task
                    </button>
                </div>
                
               
                
                <!-- Task Categories -->
                <div id="all-tasks-categories" class="space-y-6">
                    ${renderAllTaskCategories()}
                </div>

                <!-- Tasks managed through Settings dropdown -->
            </div>
        </div>
    `;
    
    console.log('✅ All Tasks view rendered successfully');
}

function renderAllTaskCategories() {
    if (!window.tasks || window.tasks.length === 0) {
        return '<div class="text-center text-gray-500 py-8">No tasks found.</div>';
    }

    const activeTasks = window.tasks.filter(task => !task.isCompleted && task.dueDate);
    const tasksByCategory = {};

    activeTasks.forEach(task => {
        const category = task.category || 'General';
        if (!tasksByCategory[category]) tasksByCategory[category] = [];
        tasksByCategory[category].push(task);
    });

    if (Object.keys(tasksByCategory).length === 0) {
        return '<div class="text-center text-gray-500 py-8">🎉 All tasks completed!</div>';
    }

    const colorClasses = {
        'Safety': 'bg-red-50 text-red-600',
        'Exterior': 'bg-green-50 text-green-700',
        'General': 'bg-gray-50 text-gray-700',
        'HVAC': 'bg-blue-50 text-blue-700',
        'Water Systems': 'bg-cyan-50 text-cyan-700',
        'Pest Control': 'bg-lime-50 text-lime-700',
        'Seasonal': 'bg-amber-50 text-amber-700',
        'Appliance': 'bg-purple-50 text-purple-700',
    };

    return Object.entries(tasksByCategory).map(([categoryId, tasks]) => {
        const categoryInfo = window.categoryConfig?.[categoryId] || { icon: '📋', color: 'gray' };
        const categoryCost = tasks.reduce((total, task) => {
            return total + (task.cost * (365 / task.frequency));
        }, 0);

        const colorClass = colorClasses[categoryId] || 'bg-white text-gray-900';

        return `
            <div class="rounded-2xl shadow-md mb-4 overflow-hidden ${colorClass}">
                <!-- Category Header (Clickable) -->
                <div class="px-4 py-4 cursor-pointer hover:opacity-80 transition-opacity" 
                     onclick="toggleCategory('${categoryId}')">
                    <div class="flex items-center justify-between gap-4">
                        <!-- Left: icon + category name + task count -->
                        <div class="flex items-center gap-3">
                            <div class="text-xl">${categoryInfo.icon}</div>
                            <div class="flex flex-col items-start text-left">
                                <div class="text-lg font-semibold leading-snug break-words">${categoryId}</div>
                                <div class="text-sm text-gray-600">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</div>
                            </div>
                        </div>

                        <!-- Right: cost and arrow -->
                        <div class="flex items-center gap-3">
                            <span class="bg-white shadow px-3 py-1 rounded-full text-sm font-semibold text-green-600">
                                ${formatCurrency(categoryCost)}/yr
                            </span>
                            <span id="arrow-${categoryId}" class="text-gray-400 text-xl transition-transform duration-300">&#8250;</span>
                        </div>
                    </div>
                </div>
                
                <!-- Tasks List (Hidden by default) -->
                <div id="tasks-${categoryId}" class="hidden border-t border-gray-200 bg-white">
                    <div class="p-4 space-y-3">
                        ${tasks.map(task => renderAllTasksTaskItem(task)).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
function toggleCategoryTasks(button) {
  const card = button.closest('.bg-white');
  const list = card.querySelector('.category-task-list');
  const icon = button.querySelector('span');

  if (!list) return;

  const isExpanded = list.classList.toggle('expanded');
  icon.style.transform = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
}

function renderAllTasksTaskItem(task) {
    // 🎬 NEW: Ensure all tasks have YouTube URLs for new accounts
    if (!task.youtubeUrl) {
        const searchQuery = task.title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '+') // Replace spaces with +
            .trim();
        task.youtubeUrl = `https://www.youtube.com/results?search_query=how+to+${searchQuery}+maintenance`;
        console.log(`🎬 Generated missing YouTube URL for "${task.title}": ${task.youtubeUrl}`);
    }
    
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
    
    // Debug log for Safety tasks
    if (isSafetyTask) {
        console.log(`🟠 Safety task detected: "${task.title}" (category: ${task.category}, priority: ${task.priority})`);
    }
    
    // Enhanced status styling
    let statusClass = 'bg-gray-50';
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
if (isOverdue) {
    dueDateDisplay = `<span class="text-red-600 font-semibold">Overdue</span>`;
} else if (daysUntilDue === 0) {
    dueDateDisplay = `<span class="text-orange-600 font-semibold">Due today</span>`;
} else if (daysUntilDue === 1) {
    dueDateDisplay = `<span class="text-orange-600 font-semibold">Due tomorrow</span>`;
} else {
    dueDateDisplay = `<span class="text-gray-700">Due ${taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>`;
}
    
    return `
    <div class="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${statusClass}">
        <!-- Professional Status Indicator -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusGradient(urgencyDot)} rounded-t-xl"></div>
        
        <!-- Enhanced Header Row -->
        <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <!-- Modern Status Badge -->
                <div class="flex-shrink-0 w-3 h-3 rounded-full ${getStatusBadgeColor(urgencyDot)} ring-2 ring-white shadow-sm"></div>
                <div class="min-w-0 flex-1">
                    <h4 class="font-semibold text-gray-900 text-base truncate group-hover:text-blue-900 transition-colors">
                        ${task.title}
                    </h4>
                    <p class="text-sm text-gray-500 mt-1">${task.category}</p>
                </div>
            </div>
            ${task.cost > 0 ? `
                <div class="flex-shrink-0 text-right">
                    <span class="bg-green-100 text-green-800 text-sm font-semibold px-2.5 py-1 rounded-full">
                        ${formatCurrency(task.cost)}
                    </span>
                </div>
            ` : ''}
        </div>
        
        <!-- Mobile-Optimized Info Section -->
        <div class="flex items-center gap-4 text-sm mb-3">
            <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                ${dueDateDisplay}
            </div>
            <div class="flex items-center gap-1.5 text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Every ${task.frequency}d</span>
            </div>
        </div>
        
        <!-- Enhanced Button Row with Shop & Video -->
        <div class="space-y-2">
            <!-- Top Row: Video & Shop Buttons -->
            <div class="flex gap-2">
                ${task.youtubeUrl && (task.youtubeUrl.includes('youtube.com') || task.youtubeUrl.includes('youtu.be')) ? `
                <button onclick="openYouTubeVideo('${task.youtubeUrl}')" 
                    class="flex-1 bg-red-50 text-red-700 text-xs py-2 px-2 rounded-lg hover:bg-red-100 transition-all duration-200 font-medium flex items-center justify-center gap-1" 
                    title="Watch how-to video">
                    📺 How-To
                </button>
                ` : ''}
                ${hasRelevantShopLinks(task.title, task.category) ? `
                <button onclick="openTaskShop('${task.title}', '${task.category}')" 
                    class="flex-1 bg-blue-50 text-blue-700 text-xs py-2 px-2 rounded-lg hover:bg-blue-100 transition-all duration-200 font-medium flex items-center justify-center gap-1" 
                    title="Shop for supplies">
                    🛒 Shop
                </button>
                ` : needsProfessionalService(task.title, task.category) ? `
                <button onclick="findProfessionalService('${task.title}', '${task.category}')" 
                    class="flex-1 bg-green-50 text-green-700 text-xs py-2 px-2 rounded-lg hover:bg-green-100 transition-all duration-200 font-medium flex items-center justify-center gap-1" 
                    title="Find local professionals">
                    👷 Find Pro
                </button>
                ` : ''}
            </div>
            <!-- Bottom Row: History & Edit Buttons -->
            <div class="flex gap-2">
                <button onclick="showTaskHistory(${task.id})" 
                    class="flex-1 bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium" 
                    title="View task history">
                    History
                </button>
                <button onclick="editTaskFromAllTasks(${task.id})" 
                    class="flex-1 bg-blue-100 text-blue-700 text-sm py-2 px-3 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium" 
                    title="Edit task">
                    Edit
                </button>
            </div>
        </div>
    </div>
`;
}

// Helper functions for enhanced task card styling
function getStatusGradient(urgencyDot) {
    switch(urgencyDot) {
        case '🔴': return 'from-red-500 to-red-600';
        case '🟠': return 'from-orange-500 to-orange-600';
        case '🟡': return 'from-yellow-500 to-yellow-600';
        default: return 'from-gray-300 to-gray-400';
    }
}

function getStatusBadgeColor(urgencyDot) {
    switch(urgencyDot) {
        case '🔴': return 'bg-red-500';
        case '🟠': return 'bg-orange-500';
        case '🟡': return 'bg-yellow-500';
        default: return 'bg-gray-400';
    }
}

// NEW FUNCTION: Edit task specifically from All Tasks view
function editTaskFromAllTasks(taskId) {
    console.log('✏️ Editing task from All Tasks view:', taskId);
    
    const task = window.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        alert('❌ Task not found');
        return;
    }
    
    // Store that we're editing from All Tasks view
    window.editingFromAllTasks = true;
    
    // Open the modal using the existing system
    if (window.TaskManager && window.TaskManager.openModal) {
        window.TaskManager.openModal(task, false);
    } else {
        console.error('❌ TaskManager not available');
        alert('❌ Task editor not available');
    }
}

// ENHANCED: Override the TaskManager save to refresh All Tasks view
const originalTaskManagerSave = window.TaskManager?.save;
if (originalTaskManagerSave && window.TaskManager) {
    window.TaskManager.save = function() {
        // Call the original save function
        const result = originalTaskManagerSave.apply(this, arguments);
        
        // If we were editing from All Tasks, refresh that view
        if (window.editingFromAllTasks) {
            console.log('🔄 Refreshing All Tasks view after edit...');
            setTimeout(() => {
                if (typeof renderAllTasksView === 'function') {
                    renderAllTasksView();
                    console.log('✅ All Tasks view refreshed');
                }
                window.editingFromAllTasks = false; // Clear the flag
            }, 100);
        }
        
        // If we were editing appliance tasks, continue to next task
        if (window.editingApplianceTasks && window.applianceTaskEditor) {
            console.log('🔄 Moving to next appliance task...');
            setTimeout(() => {
                window.applianceTaskEditor.nextTask();
            }, 100);
        }
        
        // If we were editing from appliance view, restore the appliance modal
        if (window.editingFromApplianceView) {
            console.log('🔄 Restoring appliance view after task edit...');
            setTimeout(() => {
                // Restore the hidden appliance modal
                const applianceModal = document.getElementById('appliance-tasks-modal');
                if (applianceModal) {
                    applianceModal.style.display = 'flex';
                }
                window.editingFromApplianceView = false;
            }, 100);
        }
        
        // If we were editing from generated tasks view, restore the generated tasks modal
        if (window.editingFromGeneratedTasks) {
            console.log('🔄 Restoring generated tasks view after task edit...');
            setTimeout(() => {
                // Restore the hidden generated tasks modal
                const generatedModal = document.getElementById('generated-tasks-modal');
                if (generatedModal) {
                    generatedModal.style.display = 'flex';
                }
                window.editingFromGeneratedTasks = false;
            }, 100);
        }
        
        return result;
    };
    console.log('✅ TaskManager.save enhanced for All Tasks refresh');
}

// Also override TaskManager close to handle appliance modal restoration
const originalTaskManagerClose = window.TaskManager?.close;
if (originalTaskManagerClose && window.TaskManager) {
    window.TaskManager.close = function() {
        // If we were editing from appliance view and user cancels, restore the modal
        if (window.editingFromApplianceView) {
            console.log('🔄 Restoring appliance view after task edit cancel...');
            setTimeout(() => {
                const applianceModal = document.getElementById('appliance-tasks-modal');
                if (applianceModal) {
                    applianceModal.style.display = 'flex';
                }
                window.editingFromApplianceView = false;
            }, 100);
        }
        
        // If we were editing from generated tasks view and user cancels, restore the modal
        if (window.editingFromGeneratedTasks) {
            console.log('🔄 Restoring generated tasks view after task edit cancel...');
            setTimeout(() => {
                const generatedModal = document.getElementById('generated-tasks-modal');
                if (generatedModal) {
                    generatedModal.style.display = 'flex';
                }
                window.editingFromGeneratedTasks = false;
            }, 100);
        }
        
        // Call the original close function
        return originalTaskManagerClose.apply(this, arguments);
    };
    console.log('✅ TaskManager.close enhanced for appliance modal restoration');
}

// Make the function globally available
window.editTaskFromAllTasks = editTaskFromAllTasks;

// Make it globally available
window.showAllTasks = showAllTasks;

// UPDATE your updateDashboard function to call this setup:
function updateDashboard() {
    console.log('🔄 Running basic dashboard update...');
    
    if (!window.tasks || window.tasks.length === 0) {
        console.warn('⚠️ No tasks available for dashboard');
        return;
    }
    
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Calculate stats
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
    
    // Update DOM elements safely
    const elements = {
        'overdue-count': overdueCount,
        'week-count': weekCount,
        'total-count': totalTasks
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });

    // Update annual cost display
    const annualCostElement = document.getElementById('annual-cost-display');
    if (annualCostElement) {
        annualCostElement.textContent = formatCurrency(totalCost);
    }

    // Update HOA fee display
    const hoaCost = window.homeData?.hoaCost || 0;
    const hoaDisplayElement = document.getElementById('hoa-fee-display');
    const hoaAmountElement = document.getElementById('annual-hoa-amount');
    
    if (hoaCost > 0 && hoaDisplayElement && hoaAmountElement) {
        const annualHoaCost = hoaCost * 12; // Convert monthly to yearly
        hoaAmountElement.textContent = formatCurrency(annualHoaCost);
        hoaDisplayElement.classList.remove('hidden');
    } else if (hoaDisplayElement) {
        hoaDisplayElement.classList.add('hidden');
    }
    
    // Update home address
    const homeAddressElement = document.getElementById('home-address');
    if (homeAddressElement && window.homeData?.fullAddress) {
        homeAddressElement.textContent = `Managing maintenance for ${window.homeData.fullAddress}`;
    }
    
    // ADD THIS LINE: Set up click handlers for basic dashboard
    setupBasicDashboardClicks();
    
    console.log(`📊 Basic dashboard updated: ${overdueCount} overdue, ${weekCount} this week, ${totalTasks} total, annual cost: ${formatCurrency(totalCost)}, annual HOA: ${formatCurrency(hoaCost * 12)}`);
}

// Basic dashboard click handler for Total Tasks card
function setupBasicDashboardClicks() {
    const totalCard = document.getElementById('total-card');
    if (totalCard) {
        // Remove any existing click handlers
        totalCard.replaceWith(totalCard.cloneNode(true));
        const newTotalCard = document.getElementById('total-card');
        
        if (newTotalCard) {
            newTotalCard.addEventListener('click', () => {
                console.log('📋 Total Tasks clicked (basic dashboard) - navigating to All Tasks');
                if (typeof showAllTasks === 'function') {
                    showAllTasks();
                } else {
                    console.error('❌ showAllTasks function not found');
                }
            });
            console.log('✅ Basic dashboard Total Tasks click handler added');
        }
    }
}


// FIXED: Enhanced Add Task function for setup with better modal handling
function addTaskFromSetup() {
    console.log('➕ Adding custom task from setup...');
    
    // Verify modal is available
    const modal = document.getElementById('task-edit-modal');
    if (!modal) {
        console.error('❌ Task edit modal not found');
        alert('❌ Cannot add task: Edit modal not available. Please check that you are on the correct page.');
        return;
    }
    
    // Find next available ID
    const maxId = Math.max(...tasks.map(t => t.id), 0);
    
    // Create new task object
    const newTask = {
        id: maxId + 1,
        title: '',
        description: '',
        category: 'General',
        frequency: 365,
        cost: 0,
        priority: 'medium',
        dueDate: new Date(),
        lastCompleted: null,
        isCompleted: false,
        youtubeUrl: '', // Will be auto-generated when user saves
        isTemplate: true // Important: mark as template so it gets processed correctly
    };
    
    console.log('📋 New task created:', newTask);
    
    // Open modal for new task
    openTaskEditModal(newTask, true);
}

// FIXED: Enhanced task completion with better calendar sync
// Enhanced task completion - now opens modal instead of direct completion
function completeTask(taskId) {
    console.log(`✅ Opening completion modal for task ${taskId}...`);
    
    const task = window.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        alert('❌ Task not found');
        return;
    }

    // Store the task ID for the modal
    window.currentCompletingTask = task;
    console.log('🎯 Task stored for completion:', task.title);
    
    // Always create a fresh modal (remove any existing one first)
    const existingModal = document.getElementById('task-completion-modal');
    if (existingModal && existingModal.parentNode) {
        existingModal.parentNode.removeChild(existingModal);
        console.log('🗑️ Removed existing modal');
    }
    // Initialize photos array
    window.completionPhotos = [];
    console.log('🧹 Initialized completion photos array');
    
    // Create new modal directly in body
    const newModal = document.createElement('div');
    newModal.id = 'task-completion-modal';
    newModal.innerHTML = `
        <div class="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto m-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold">✅ Complete Task</h3>
                <button onclick="closeCompletionModal()" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>
            
            <div class="space-y-4">
                <!-- Task Name Display -->
                <div class="bg-blue-50 p-3 rounded-lg">
                    <div class="font-medium text-blue-900">${task.title}</div>
                    <div class="text-sm text-blue-700 mt-1">Due: ${new Date(task.dueDate).toLocaleDateString()} • ${task.category} • Every ${task.frequency} days</div>
                </div>
                
                <!-- Photo Upload -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">📷 Completion Photos (Optional)</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer" onclick="document.getElementById('completion-photo-input').click()">
                        <div class="text-gray-600">
                            <span class="text-2xl block mb-2">📸</span>
                            <span class="text-sm">Click to add before/after photos</span>
                        </div>
                        <input type="file" id="completion-photo-input" multiple accept="image/*" style="display: none;" onchange="handlePhotoUpload(event)">
                    </div>
                    <div id="photo-preview" class="mt-2 space-y-2"></div>
                </div>
                
                <!-- Actual Cost -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">💰 Actual Cost Spent</label>
                    <div class="flex items-center">
                        <span class="text-gray-500 mr-2">$</span>
                        <input type="number" id="completion-actual-cost" step="0.01" min="0" placeholder="0.00"
                               class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base">
                    </div>
                </div>
                
                <!-- Notes -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">📝 Completion Notes (Optional)</label>
                    <textarea id="completion-notes" rows="3" placeholder="Add any notes about the task completion..."
                              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"></textarea>
                </div>
                
                <!-- Completion button -->
                <button onclick="enhancedTaskCompletion()" class="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 font-medium">
                    ✅ Complete Task
                </button>
            </div>
        </div>
    `;
    
    // Set styles directly
    newModal.style.position = 'fixed';
    newModal.style.top = '0';
    newModal.style.left = '0';
    newModal.style.width = '100vw';
    newModal.style.height = '100vh';
    newModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    newModal.style.zIndex = '999999';
    newModal.style.display = 'flex';
    newModal.style.alignItems = 'center';
    newModal.style.justifyContent = 'center';
    newModal.style.padding = '16px';
    
    // Add to body
    document.body.appendChild(newModal);
    console.log('✅ New modal created and added to body');
    console.log('✅ Modal should now be visible!');
    
    // Double-check visibility
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(modal);
        console.log('🔍 Modal computed display:', computedStyle.display);
        console.log('🔍 Modal computed visibility:', computedStyle.visibility);
        console.log('🔍 Modal computed opacity:', computedStyle.opacity);
    }, 100);
}

// Original task completion logic - now called from modal
function processTaskCompletion(taskId, completionData = {}) {
    console.log(`✅ Processing completion for task ${taskId}...`);
    
    const task = window.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        return false;
    }

    const oldDueDate = task.dueDate ? new Date(task.dueDate) : new Date();
    const completionDate = new Date();
    
    // Create completion record
    const completionRecord = {
        id: Date.now(), // Simple ID
        completedAt: completionDate,
        actualCost: completionData.actualCost || 0,
        notes: completionData.notes || '',
        photos: completionData.photos || [],
        previousDueDate: oldDueDate,
        nextDueDate: null // Will be set below
    };
    
    // Initialize completionHistory if it doesn't exist
    if (!task.completionHistory) {
        task.completionHistory = [];
    }
    
    // Mark as completed with timestamp
    task.lastCompleted = completionDate;
    task.isCompleted = false; // Will be due again in the future
    
    // Calculate next due date from current due date + frequency
    const nextDueDate = new Date(oldDueDate.getTime() + task.frequency * 24 * 60 * 60 * 1000);
    completionRecord.nextDueDate = nextDueDate;
    
    // Add completion record to history
    task.completionHistory.push(completionRecord);
    
    // CRITICAL: Set both dueDate and nextDue for full compatibility
    task.dueDate = nextDueDate;
    task.nextDue = nextDueDate;
    
    console.log(`📅 Task "${task.title}" completed with enhanced data!`);
    console.log(`  Old due date: ${oldDueDate.toLocaleDateString()}`);
    console.log(`  Next due date: ${nextDueDate.toLocaleDateString()}`);
    console.log(`  Completion record:`, completionRecord);
    
    // Save data immediately
    try {
        saveData();
        console.log('💾 Data saved after task completion');
    } catch (error) {
        console.error('❌ Error saving data after completion:', error);
        alert('❌ Error saving task completion');
        return;
    }
    
    // Global tasks array is already updated (task variable is a reference)
    
    // Refresh enhanced dashboard
    if (window.enhancedDashboard && typeof window.enhancedDashboard.render === 'function') {
        console.log('🔄 Refreshing enhanced dashboard...');
        window.enhancedDashboard.render();
    } else {
        console.log('🔄 Refreshing basic dashboard...');
        updateDashboard();
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
                // Try to recreate calendar if refresh doesn't work
                if (typeof CasaCareCalendar !== 'undefined') {
                    window.casaCareCalendar = new CasaCareCalendar();
                    console.log('✅ Calendar recreated successfully');
                }
            }
        } catch (error) {
            console.error('❌ Error refreshing calendar:', error);
        }
    } else {
        console.warn('⚠️ Calendar not found, attempting to create...');
        if (typeof CasaCareCalendar !== 'undefined') {
            try {
                window.casaCareCalendar = new CasaCareCalendar();
                console.log('✅ Calendar created successfully after task completion');
            } catch (error) {
                console.error('❌ Error creating calendar:', error);
            }
        }
    }
    
    // Success message
    alert(`✅ Task "${task.title}" completed!\nNext due: ${nextDueDate.toLocaleDateString()}`);
}

// FIXED: Enhanced Edit Task function for setup with better modal handling
function editTaskFromSetup(taskId) {
    console.log(`✏️ Editing task from setup: ${taskId}`);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        alert('❌ Task not found');
        return;
    }
    
    console.log('📋 Task found for editing:', task);
    
    // Verify modal is available
    const modal = document.getElementById('task-edit-modal');
    if (!modal) {
        console.error('❌ Task edit modal not found');
        alert('❌ Cannot edit task: Edit modal not available. Please check that you are on the correct page.');
        return;
    }
    
    // Open the task edit modal
    openTaskEditModal(task, false);
}

// Delete task directly
function deleteTaskDirect(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            const deletedTask = tasks.splice(taskIndex, 1)[0];
            console.log(`🗑️ Deleted task: ${deletedTask.title}`);
            
            // Update global reference
            window.tasks = tasks;
            
            // Re-render task categories
            renderTaskCategories();
            
            alert(`✅ Task "${deletedTask.title}" deleted successfully!`);
        }
    }
}

// FIXED: Enhanced modal functions with better error checking
function openTaskEditModal(task, isNewTask = false) {
    console.log('Opening modal for:', task.title || 'New Task');
    
    const modal = document.getElementById('task-edit-modal');
    if (!modal) {
        alert('Modal not found');
        return;
    }
    
    // Simple show
    modal.classList.remove('hidden');
    modal.style.display = 'block';
    
    // Fill basic fields
    document.getElementById('edit-task-name').value = task.title || '';
    document.getElementById('edit-task-description').value = task.description || '';
    document.getElementById('edit-task-cost').value = task.cost || 0;
    document.getElementById('edit-task-frequency').value = task.frequency || 365;
    document.getElementById('edit-task-priority').value = task.priority || 'medium';
    
    currentEditingTask = task;
    window.currentEditingTask = task;
}

// Close task edit modal
function closeTaskEditModal() {
    const modal = document.getElementById('task-edit-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentEditingTask = null;
    window.currentEditingTask = null;
    console.log('✅ Task edit modal closed');
}

// Save task from edit modal
function saveTaskFromEdit() {
    console.log('💾 Saving task from edit modal...');
    
    if (!currentEditingTask && !window.currentEditingTask) {
        console.error('❌ No task being edited');
        alert('❌ No task selected for editing');
        return;
    }
    
    // Use either local or global currentEditingTask
    const editingTask = currentEditingTask || window.currentEditingTask;
    
    // Get form values - FIXED ORDER: Get category BEFORE using it for priority
    const title = document.getElementById('edit-task-name').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();
    const cost = parseFloat(document.getElementById('edit-task-cost').value) || 0;
    const frequency = parseInt(document.getElementById('edit-task-frequency').value) || 365;
    const category = document.getElementById('edit-task-category')?.value || 'General'; // GET CATEGORY FIRST
    const priority = getAutoPriority(title, category); // NOW use it for priority
    const dueDateInput = document.getElementById('edit-task-due-date');
    
    console.log('📝 Form values:', { title, description, cost, frequency, category, priority });
    
    // Validate inputs
    if (!title) {
        alert('❌ Task name is required');
        document.getElementById('edit-task-name').focus();
        return;
    }
    
    // Description is optional now
    
    if (frequency <= 0) {
        alert('❌ Frequency must be greater than 0');
        document.getElementById('edit-task-frequency').focus();
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
    const isNewTask = !tasks.find(t => t.id === editingTask.id);
    console.log('🆕 Is new task:', isNewTask);
    
    // Update task properties
    editingTask.title = title;
    editingTask.description = description;
    editingTask.cost = cost;
    editingTask.frequency = frequency;
    editingTask.priority = priority;
    editingTask.category = category;
    editingTask.dueDate = dueDate;
    editingTask.nextDue = dueDate; // Calendar compatibility
    
    if (isNewTask) {
        // Add to tasks array
        tasks.push(editingTask);
        window.tasks = tasks; // Update global reference
        console.log('✅ New task added to global array');
    } else {
        // Update global reference to ensure changes are reflected
        window.tasks = tasks;
        console.log('✅ Existing task updated');
    }
    
    // Determine if we're in setup or main app by checking which screen is visible
    const taskSetupVisible = !document.getElementById('task-setup').classList.contains('hidden');
    const mainAppVisible = !document.getElementById('main-app').classList.contains('hidden');
    
    if (taskSetupVisible) {
        // We're in task setup, re-render categories
        console.log('🔄 Refreshing task setup categories...');
        renderTaskCategories();
    } else if (mainAppVisible) {
        // We're in main app, save and refresh
        console.log('🔄 Saving data and refreshing main app...');
        saveData();
        
        // Refresh dashboard
        if (window.enhancedDashboard && typeof window.enhancedDashboard.render === 'function') {
            window.enhancedDashboard.render();
        } else {
            updateDashboard();
        }
        
        // Refresh calendar
        if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
            window.casaCareCalendar.refresh();
        }
    } else {
        // Default behavior - save everything
        console.log('🔄 Default save and refresh...');
        saveData();
        if (window.enhancedDashboard && typeof window.enhancedDashboard.render === 'function') {
            window.enhancedDashboard.render();
        } else {
            updateDashboard();
        }
    }
    
    // Close modal
    closeTaskEditModal();
    
    alert(`✅ Task "${title}" ${isNewTask ? 'added' : 'updated'} successfully!`);
    console.log('✅ Task save completed successfully');
    console.log('🔍 Starting refresh check...');
    
    // Simple refresh: Check which view is active and refresh it
    const allTasksView = document.getElementById('all-tasks-view');
    const dashboardView = document.getElementById('dashboard-view');
    
    if (allTasksView && !allTasksView.classList.contains('hidden')) {
        // We're in All Tasks view - reload data then refresh
        console.log('🔄 Refreshing All Tasks view after save...');
        if (window.loadTasksFromFirebase) {
            window.loadTasksFromFirebase().then(() => {
                if (typeof renderAllTasksView === 'function') {
                    renderAllTasksView();
                    console.log('✅ All Tasks view refreshed with fresh data');
                }
            });
        } else if (typeof renderAllTasksView === 'function') {
            renderAllTasksView();
        }
    } else if (dashboardView && !dashboardView.classList.contains('hidden')) {
        // We're in main dashboard - reload data then refresh  
        console.log('🔄 Refreshing dashboard after save...');
        if (window.loadTasksFromFirebase) {
            window.loadTasksFromFirebase().then(() => {
                showTab('dashboard');
                console.log('✅ Dashboard refreshed with fresh data');
            });
        } else {
            showTab('dashboard');
        }
    }
}
// Delete task from edit modal
function deleteTaskFromEdit() {
    if (!currentEditingTask) {
        console.error('❌ No task being edited');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${currentEditingTask.title}"?`)) {
        const taskIndex = tasks.findIndex(t => t.id === currentEditingTask.id);
        if (taskIndex > -1) {
            const deletedTask = tasks.splice(taskIndex, 1)[0];
            console.log(`🗑️ Deleted task: ${deletedTask.title}`);
            
            // Update global reference
            window.tasks = tasks;
            
            // Save data if we're in the main app
            if (!document.getElementById('main-app').classList.contains('hidden')) {
                saveData();
                
                // Refresh dashboard
                if (window.enhancedDashboard) {
                    window.enhancedDashboard.render();
                } else {
                    updateDashboard();
                }
                
                // Refresh calendar
                if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
                    window.casaCareCalendar.refresh();
                }
            } else {
                // We're in task setup, re-render categories
                renderTaskCategories();
            }
            
            // Close modal
            closeTaskEditModal();
            
            alert(`✅ Task "${deletedTask.title}" deleted successfully!`);
        }
    }
}

// Utility functions
// Enhanced Home Info Functions - Replace the existing showHomeInfo function

/**
 * Open editable home info modal instead of simple alert
 */
function showHomeInfo() {
    console.log('🏠 Opening editable home info modal...');
    
    if (!homeData.fullAddress) {
        alert('🏠 No home information set yet. Complete the setup to add your home details.');
        return;
    }
    
    // Open the modal
    const modal = document.getElementById('home-info-modal');
    if (!modal) {
        console.error('❌ Home info modal not found');
        alert('❌ Cannot edit home info: Modal not available.');
        return;
    }
    
    // Populate the form with current data
    populateHomeInfoForm();
    
    // Show modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    console.log('✅ Home info modal opened');
}

/**
 * Populate the home info form with current data
 */
function populateHomeInfoForm() {
    const fields = [
        ['edit-home-address', homeData.address || ''],
        ['edit-home-city', homeData.city || ''],
        ['edit-home-state', homeData.state || ''],
        ['edit-home-zipcode', homeData.zipcode || ''],
        ['edit-home-property-type', homeData.propertyType || 'single-family'],
        ['edit-home-year-built', homeData.yearBuilt || 2000],
        ['edit-home-sqft', homeData.sqft || 2000]
    ];
    
    fields.forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        } else {
            console.warn(`⚠️ Element not found: ${id}`);
        }
    });
    
    console.log('📝 Home info form populated with current data');
}

/**
 * Close the home info modal
 */
function closeHomeInfoModal() {
    const modal = document.getElementById('home-info-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
    console.log('✅ Home info modal closed');
}

/**
 * Save the updated home information
 */
function saveHomeInfo() {
    console.log('💾 Saving updated home information...');
    
    // Get form values
    const newAddress = document.getElementById('edit-home-address').value.trim();
    const newCity = document.getElementById('edit-home-city').value.trim();
    const newState = document.getElementById('edit-home-state').value.trim();
    const newZipcode = document.getElementById('edit-home-zipcode').value.trim();
    const newPropertyType = document.getElementById('edit-home-property-type').value;
    const newYearBuilt = parseInt(document.getElementById('edit-home-year-built').value) || 2000;
    const newSqft = parseInt(document.getElementById('edit-home-sqft').value) || 2000;
    
    // Validate required fields
    if (!newAddress || !newCity || !newState || !newZipcode) {
        alert('❌ Please fill in all address fields');
        return;
    }
    
    if (newState.length !== 2) {
        alert('❌ State must be 2 letters (e.g., NY, CA, TX)');
        document.getElementById('edit-home-state').focus();
        return;
    }
    
    // Update homeData object
    const oldAddress = homeData.fullAddress;
    
    homeData.address = newAddress;
    homeData.city = newCity;
    homeData.state = newState.toUpperCase();
    homeData.zipcode = newZipcode;
    homeData.propertyType = newPropertyType;
    homeData.yearBuilt = newYearBuilt;
    homeData.sqft = newSqft;
    homeData.fullAddress = `${newAddress}, ${newCity}, ${homeData.state} ${newZipcode}`;
    
    // Update global reference
    window.homeData = homeData;
    
    // Save to storage
    try {
        saveData();
        console.log('💾 Home data saved successfully');
    } catch (error) {
        console.error('❌ Error saving home data:', error);
        alert('❌ Error saving changes. Please try again.');
        return;
    }
    
    // Update UI elements that show the address
    const headerSubtitle = document.getElementById('header-subtitle');
    if (headerSubtitle) {
        headerSubtitle.textContent = homeData.fullAddress;
    }
    
    const homeAddressElement = document.getElementById('home-address');
    if (homeAddressElement) {
        homeAddressElement.textContent = `Managing maintenance for ${homeData.fullAddress}`;
    }
    
    // Close modal
    closeHomeInfoModal();
    
    // Show success message
    const addressChanged = oldAddress !== homeData.fullAddress;
    if (addressChanged) {
        alert(`✅ Home information updated!\n\nNew address: ${homeData.fullAddress}\n\nYour existing tasks and schedules remain unchanged.`);
    } else {
        alert(`✅ Home information updated successfully!\n\nProperty details have been saved.`);
    }
    
    console.log('✅ Home information updated:', homeData.fullAddress);
}

// Make functions globally available
window.showHomeInfo = showHomeInfo;
window.closeHomeInfoModal = closeHomeInfoModal;
window.saveHomeInfo = saveHomeInfo;
window.populateHomeInfoForm = populateHomeInfoForm;

function clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        homeData = {};
        tasks = [];
        
        // Clear from Firebase instead of localStorage
        if (window.currentUser) {
            saveUserDataToFirebaseEnhanced(window.currentUser.uid, {}, [])
                .then(() => {
                    console.log('✅ Data cleared from Firebase');
                })
                .catch((error) => {
                    console.error('❌ Error clearing Firebase data:', error);
                });
        }
        
        document.getElementById('setup-form').style.display = 'block';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('header-subtitle').textContent = 'Smart home maintenance';

        // Hide bottom navigation during reset
        document.body.classList.remove('main-app-active');
        
        alert('✅ All data cleared. Starting fresh!');
    }
}

// ===== PROPERTY FEATURES EDITING =====

/**
 * Populate the property features form with current data (for the tab)
 */
// Store the initial form state when the tab loads
let initialFormState = null;

function populatePropertyFeaturesTab() {
    if (!window.homeData || !window.homeData.features) {
        console.warn('⚠️ No homeData.features available for populating property features tab');
        return;
    }
    
    const homeData = window.homeData;
    
    // Map of feature IDs to their current values (updated for tab IDs)
    const featureMap = {
        'features-central-ac': homeData.features.centralAC,
        'features-mini-splits': homeData.features.miniSplits,
        'features-wall-ac': homeData.features.wallAC,
        'features-electric-baseboard': homeData.features.electricBaseboard,
        'features-boiler': homeData.features.boiler,
        'features-municipal-water': homeData.features.municipalWater,
        'features-well-water': homeData.features.wellWater,
        'features-sediment-filter': homeData.features.sedimentFilter,
        'features-uv-filter': homeData.features.uvFilter,
        'features-water-softener': homeData.features.waterSoftener,
        'features-whole-house-filter': homeData.features.wholeHouseFilter,
        'features-municipal-sewer': homeData.features.municipalSewer,
        'features-septic': homeData.features.septic,
        'features-fireplace': homeData.features.fireplace,
        'features-pool': homeData.features.pool,
        'features-deck': homeData.features.deck,
        'features-garage': homeData.features.garage,
        'features-basement': homeData.features.basement,
        'features-solar-panels': homeData.features.solarPanels,
        'features-battery-backup': homeData.features.batteryBackup,
        'features-generator': homeData.features.generator,
        'features-irrigation': homeData.features.irrigation,
        'features-security-system': homeData.features.securitySystem,
        'features-outdoor-kitchen': homeData.features.outdoorKitchen,
        // Structural Features
        'features-composite-roof': homeData.features.compositeRoof,
        'features-metal-roof': homeData.features.metalRoof,
        'features-tile-roof': homeData.features.tileRoof,
        'features-vinyl-siding': homeData.features.vinylSiding,
        'features-wood-siding': homeData.features.woodSiding,
        'features-aluminum-siding': homeData.features.aluminumSiding,
        'features-brick-exterior': homeData.features.brickExterior,
        'features-gutters': homeData.features.gutters,
        'features-windows': homeData.features.windows,
        'features-exterior-doors': homeData.features.exteriorDoors,
        'features-driveway': homeData.features.driveway,
        'features-fence': homeData.features.fence,
        'features-attic': homeData.features.attic
    };
    
    // Set checkbox values
    Object.entries(featureMap).forEach(([id, value]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = value || false;
        } else {
            console.warn(`⚠️ Checkbox not found: ${id}`);
        }
    });
    
    // Capture the initial form state after populating
    setTimeout(() => {
        initialFormState = {
            centralAC: document.getElementById('features-central-ac')?.checked || false,
            miniSplits: document.getElementById('features-mini-splits')?.checked || false,
            wallAC: document.getElementById('features-wall-ac')?.checked || false,
            electricBaseboard: document.getElementById('features-electric-baseboard')?.checked || false,
            boiler: document.getElementById('features-boiler')?.checked || false,
            municipalWater: document.getElementById('features-municipal-water')?.checked || false,
            wellWater: document.getElementById('features-well-water')?.checked || false,
            sedimentFilter: document.getElementById('features-sediment-filter')?.checked || false,
            uvFilter: document.getElementById('features-uv-filter')?.checked || false,
            waterSoftener: document.getElementById('features-water-softener')?.checked || false,
            wholeHouseFilter: document.getElementById('features-whole-house-filter')?.checked || false,
            municipalSewer: document.getElementById('features-municipal-sewer')?.checked || false,
            septic: document.getElementById('features-septic')?.checked || false,
            fireplace: document.getElementById('features-fireplace')?.checked || false,
            pool: document.getElementById('features-pool')?.checked || false,
            deck: document.getElementById('features-deck')?.checked || false,
            garage: document.getElementById('features-garage')?.checked || false,
            basement: document.getElementById('features-basement')?.checked || false,
            solarPanels: document.getElementById('features-solar-panels')?.checked || false,
            batteryBackup: document.getElementById('features-battery-backup')?.checked || false,
            sprinklerSystem: document.getElementById('features-sprinkler-system')?.checked || false,
            securitySystem: document.getElementById('features-security-system')?.checked || false,
            compositeRoof: document.getElementById('features-composite-roof')?.checked || false,
            metalRoof: document.getElementById('features-metal-roof')?.checked || false,
            tileRoof: document.getElementById('features-tile-roof')?.checked || false,
            vinylSiding: document.getElementById('features-vinyl-siding')?.checked || false,
            woodSiding: document.getElementById('features-wood-siding')?.checked || false,
            aluminumSiding: document.getElementById('features-aluminum-siding')?.checked || false,
            brickExterior: document.getElementById('features-brick-exterior')?.checked || false,
            gutters: document.getElementById('features-gutters')?.checked || false,
            windows: document.getElementById('features-windows')?.checked || false,
            exteriorDoors: document.getElementById('features-exterior-doors')?.checked || false,
            driveway: document.getElementById('features-driveway')?.checked || false,
            fence: document.getElementById('features-fence')?.checked || false,
            attic: document.getElementById('features-attic')?.checked || false
        };
    }, 100);
    
    console.log('📝 Property features tab populated with current data');
}

/**
 * Save property features changes from the tab
 */
function savePropertyFeaturesFromTab() {
    console.log('💾 Saving property features changes...');
    
    if (!homeData.features) {
        homeData.features = {};
    }
    
    // Store old features to compare what changed - use captured initial state
    const oldFeatures = initialFormState || {};
    // Get new feature values from tab form
    const newFeatures = {
        centralAC: document.getElementById('features-central-ac')?.checked || false,
        miniSplits: document.getElementById('features-mini-splits')?.checked || false,
        wallAC: document.getElementById('features-wall-ac')?.checked || false,
        electricBaseboard: document.getElementById('features-electric-baseboard')?.checked || false,
        boiler: document.getElementById('features-boiler')?.checked || false,
        municipalWater: document.getElementById('features-municipal-water')?.checked || false,
        wellWater: document.getElementById('features-well-water')?.checked || false,
        sedimentFilter: document.getElementById('features-sediment-filter')?.checked || false,
        uvFilter: document.getElementById('features-uv-filter')?.checked || false,
        waterSoftener: document.getElementById('features-water-softener')?.checked || false,
        wholeHouseFilter: document.getElementById('features-whole-house-filter')?.checked || false,
        municipalSewer: document.getElementById('features-municipal-sewer')?.checked || false,
        septic: document.getElementById('features-septic')?.checked || false,
        fireplace: document.getElementById('features-fireplace')?.checked || false,
        pool: document.getElementById('features-pool')?.checked || false,
        deck: document.getElementById('features-deck')?.checked || false,
        garage: document.getElementById('features-garage')?.checked || false,
        basement: document.getElementById('features-basement')?.checked || false,
        solarPanels: document.getElementById('features-solar-panels')?.checked || false,
        batteryBackup: document.getElementById('features-battery-backup')?.checked || false,
        generator: document.getElementById('features-generator')?.checked || false,
        irrigation: document.getElementById('features-irrigation')?.checked || false,
        securitySystem: document.getElementById('features-security-system')?.checked || false,
        outdoorKitchen: document.getElementById('features-outdoor-kitchen')?.checked || false,
        // Structural Features
        compositeRoof: document.getElementById('features-composite-roof')?.checked || false,
        metalRoof: document.getElementById('features-metal-roof')?.checked || false,
        tileRoof: document.getElementById('features-tile-roof')?.checked || false,
        vinylSiding: document.getElementById('features-vinyl-siding')?.checked || false,
        woodSiding: document.getElementById('features-wood-siding')?.checked || false,
        aluminumSiding: document.getElementById('features-aluminum-siding')?.checked || false,
        brickExterior: document.getElementById('features-brick-exterior')?.checked || false,
        gutters: document.getElementById('features-gutters')?.checked || false,
        windows: document.getElementById('features-windows')?.checked || false,
        exteriorDoors: document.getElementById('features-exterior-doors')?.checked || false,
        driveway: document.getElementById('features-driveway')?.checked || false,
        fence: document.getElementById('features-fence')?.checked || false,
        attic: document.getElementById('features-attic')?.checked || false
    };
    
    // Detect changes and show summary
    const changes = detectFeatureChanges(oldFeatures, newFeatures);
    
    // Update home data
    homeData.features = newFeatures;
    
    // Show change summary and ask about task generation
    if (changes.added.length > 0 || changes.removed.length > 0) {
        showChangeDetectionPrompt(changes, oldFeatures, newFeatures);
    } else {
        // No changes, just save and go back
        saveFeatureChanges();
        showTab('dashboard');
    }
    
    console.log('✅ Property features updated:', newFeatures);
}

/**
 * Detect changes between old and new feature sets
 */
function detectFeatureChanges(oldFeatures, newFeatures) {
    const featureNames = {
        centralAC: 'Central Air Conditioning',
        miniSplits: 'Mini-Split Systems',
        wallAC: 'Wall AC Units',
        electricBaseboard: 'Electric Baseboard Heating',
        boiler: 'Boiler',
        municipalWater: 'Municipal Water',
        wellWater: 'Well Water',
        sedimentFilter: 'Sediment Filter',
        uvFilter: 'UV Filter',
        waterSoftener: 'Water Softener',
        wholeHouseFilter: 'Whole House Filter',
        municipalSewer: 'Municipal Sewer',
        septic: 'Septic System',
        fireplace: 'Fireplace/Chimney',
        pool: 'Swimming Pool',
        deck: 'Deck/Patio',
        garage: 'Garage',
        basement: 'Basement',
        solarPanels: 'Solar Panels',
        batteryBackup: 'Battery Backup System',
        generator: 'Generator',
        irrigation: 'Irrigation/Sprinkler System',
        securitySystem: 'Security System',
        outdoorKitchen: 'Outdoor Kitchen',
        compositeRoof: 'Composite/Asphalt Roof',
        metalRoof: 'Metal Roof',
        tileRoof: 'Tile/Slate Roof',
        vinylSiding: 'Vinyl Siding',
        woodSiding: 'Wood Siding',
        aluminumSiding: 'Aluminum Siding',
        brickExterior: 'Brick/Stone Exterior',
        gutters: 'Gutters & Downspouts',
        windows: 'Windows',
        exteriorDoors: 'Exterior Doors',
        driveway: 'Driveway',
        fence: 'Fence',
        attic: 'Attic/Insulation'
    };
    
    const added = [];
    const removed = [];
    
    Object.entries(newFeatures).forEach(([feature, isEnabled]) => {
        const wasEnabled = oldFeatures[feature];
        if (isEnabled && !wasEnabled) {
            added.push(featureNames[feature] || feature);
        } else if (!isEnabled && wasEnabled) {
            removed.push(featureNames[feature] || feature);
        }
    });
    
    return { added, removed };
}

/**
 * Show change detection prompt to user
 */
function showChangeDetectionPrompt(changes, oldFeatures, newFeatures) {
    let message = '🏠 Property Features Updated\n\n';
    
    if (changes.added.length > 0) {
        message += '✅ ADDED FEATURES:\n';
        changes.added.forEach(feature => {
            message += `• ${feature}\n`;
        });
        message += '\n';
    }
    
    if (changes.removed.length > 0) {
        message += '❌ REMOVED FEATURES:\n';
        changes.removed.forEach(feature => {
            message += `• ${feature}\n`;
        });
        message += '\n';
    }
    
    if (changes.added.length > 0) {
        message += 'Would you like us to automatically generate maintenance tasks for the new features?';
        
        if (confirm(message)) {
            // Generate tasks for new features
            generateTasksForNewFeatures(oldFeatures, newFeatures);
        }
    }
    
    // Save changes and navigate back
    saveFeatureChanges();
    showTab('dashboard');
}

/**
 * Save feature changes to Firebase
 */
function saveFeatureChanges() {
    try {
        if (window.currentUser) {
            saveUserDataToFirebaseEnhanced(window.currentUser.uid, homeData, window.tasks || [])
                .then(() => {
                    console.log('✅ Property features saved to Firebase');
                })
                .catch((error) => {
                    console.error('❌ Error saving to Firebase:', error);
                });
        }
    } catch (error) {
        console.error('❌ Error saving property features:', error);
    }
    
    // Refresh UI
    refreshAfterFeatureUpdate();
}

/**
 * Generate new tasks for newly added features
 */
function generateTasksForNewFeatures(oldFeatures, newFeatures) {
    console.log('🔄 Checking for new features to generate tasks...');
    
    const newlyAddedFeatures = [];
    
    // Check which features were added (changed from false/undefined to true)
    Object.entries(newFeatures).forEach(([feature, isEnabled]) => {
        const wasEnabled = oldFeatures[feature];
        if (isEnabled && !wasEnabled) {
            newlyAddedFeatures.push(feature);
        }
    });
    
    if (newlyAddedFeatures.length === 0) {
        console.log('📋 No new features added, no new tasks to generate');
        return;
    }
    
    console.log('🆕 New features detected:', newlyAddedFeatures);
    
    // Use the task generator to create tasks for new features
    if (window.taskGenerator && homeData) {
        const newTasks = window.taskGenerator.generateTaskTemplates(homeData);
        
        // Also generate advanced feature tasks
        const expandedTasks = generateExpandedFeatureTasks(Math.max(...(window.tasks || []).map(t => t.id), 0) + 1);
        newTasks.push(...expandedTasks);
        
        const currentTaskIds = (window.tasks || []).map(t => t.title);
        
        // Add only tasks that don't already exist
        newTasks.forEach(newTask => {
            if (!currentTaskIds.includes(newTask.title)) {
                // Set initial due date
                if (!newTask.dueDate) {
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + 7); // Default to 1 week from now
                    newTask.dueDate = dueDate;
                    newTask.nextDue = dueDate;
                }
                
                // Ensure we have tasks array
                if (!window.tasks) window.tasks = [];
                
                // Add the new task
                window.tasks.push(newTask);
                console.log(`✅ Added new task: ${newTask.title}`);
            }
        });
    }
}

/**
 * Refresh UI after feature update
 */
function refreshAfterFeatureUpdate() {
    // Refresh dashboard if visible
    if (window.enhancedDashboard && typeof window.enhancedDashboard.render === 'function') {
        window.enhancedDashboard.render();
    }
    
    // Refresh All Tasks view if visible
    const allTasksView = document.getElementById('all-tasks-view');
    if (allTasksView && !allTasksView.classList.contains('hidden')) {
        if (typeof renderAllTasksView === 'function') {
            renderAllTasksView();
        }
    }
    
    // Refresh calendar if visible
    const calendarView = document.getElementById('calendar-view');
    if (calendarView && !calendarView.classList.contains('hidden')) {
        if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
            window.casaCareCalendar.refresh();
        }
    }
}

// Make functions globally available
window.populatePropertyFeaturesTab = populatePropertyFeaturesTab;
window.savePropertyFeaturesFromTab = savePropertyFeaturesFromTab;

function exportData() {
    const data = {
        homeData: homeData,
        tasks: tasks,
        exportDate: new Date().toISOString(),
        version: '2.1'
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "casa_care_backup.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('📄 Data exported successfully!');
}

// Function to export task list (moved from All Tasks to Settings)
function exportTaskList() {
    if (!window.tasks || window.tasks.length === 0) {
        alert('❌ No tasks to export');
        return;
    }
    
    const activeTasks = window.tasks.filter(t => !t.isCompleted && t.dueDate);
    
    let csvContent = "Task,Description,Category,Priority,Due Date,Cost,Frequency,Last Completed\n";
    
    activeTasks.forEach(task => {
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
    
    console.log('📋 Task list exported from Settings');
    alert('📋 Task list exported successfully!');
}

function saveData() {
    // Ensure calendar compatibility before saving
    if (window.tasks) {
        window.tasks.forEach(task => {
            if (task.dueDate && !task.nextDue) {
                task.nextDue = task.dueDate;
            }
        });
    }
    
    // Check if user is logged in
    if (!window.currentUser) {
        console.warn('⚠️ No user logged in, cannot save to Firebase');
        return;
    }
    
    console.log('💾 Using enhanced save to preserve all data...');
    
    // FIXED: Use enhanced save that preserves ALL data types
    saveUserDataToFirebaseEnhanced(window.currentUser.uid, window.homeData || {}, window.tasks || [])
        .then((success) => {
            if (success) {
                console.log('✅ Enhanced save completed - all data preserved');
            } else {
                console.warn('⚠️ Enhanced save failed, trying fallback...');
                // Fallback to original save
                return saveUserDataToFirebaseEnhanced(window.currentUser.uid, window.homeData || {}, window.tasks || []);
            }
        })
        .then(() => {
            console.log('✅ Data saved successfully');
            
            // REFRESH: Check which view is active and refresh it after enhanced save
            console.log('🔍 Enhanced save complete - checking for view refresh...');
            const allTasksView = document.getElementById('all-tasks-view');
            const dashboardView = document.getElementById('dashboard-view');
            
            if (allTasksView && !allTasksView.classList.contains('hidden')) {
                // We're in All Tasks view - reload data then refresh
                console.log('🔄 Refreshing All Tasks view after enhanced save...');
                if (window.loadTasksFromFirebase) {
                    window.loadTasksFromFirebase().then(() => {
                        if (typeof renderAllTasksView === 'function') {
                            renderAllTasksView();
                            console.log('✅ All Tasks view refreshed with fresh data after enhanced save');
                        }
                    });
                } else if (typeof renderAllTasksView === 'function') {
                    renderAllTasksView();
                }
            } else if (dashboardView && !dashboardView.classList.contains('hidden')) {
                // We're in main dashboard - reload data then refresh  
                console.log('🔄 Refreshing dashboard after enhanced save...');
                if (window.loadTasksFromFirebase) {
                    window.loadTasksFromFirebase().then(() => {
                        showTab('dashboard');
                        console.log('✅ Dashboard refreshed with fresh data after enhanced save');
                    });
                } else {
                    showTab('dashboard');
                }
            }
        })
        .catch((error) => {
            console.error('❌ Failed to save data:', error);
        });
}

async function loadData() {
    // Check if user is logged in
    if (!window.currentUser) {
        console.warn('⚠️ No user logged in, cannot load from Firebase');
        return false;
    }
    
    try {
        const userDoc = await db.collection('users').doc(window.currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            if (userData.homeData && userData.tasks) {
                window.homeData = userData.homeData;
                window.tasks = userData.tasks;
                
                // Load vendors if they exist
                if (userData.vendors) {
                    vendors = userData.vendors;
                    console.log(`✅ Loaded ${vendors.length} vendors from Firebase`);
                } else {
                    vendors = [];
                    console.log('📂 No vendors found, starting with empty list');
                }
                
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
                
                console.log('✅ Data loaded from Firebase with calendar compatibility');
                return true;
            }
        }
        
        console.log('ℹ️ No data found in Firebase for this user');
        return false;
    } catch (error) {
        console.error('❌ Failed to load data from Firebase:', error);
        return false;
    }
}

async function hasExistingData() {
    const dataLoaded = await loadData();
    return dataLoaded && homeData.fullAddress;
}

// Enhanced initialization
async function initializeApp() {
    console.log('🏠 The Home Keeper CLEAN SIMPLE VERSION WITH ALL FIXES initializing...');
    
    // Make well water function available globally ASAP
    window.toggleWellWaterOptions = toggleWellWaterOptions;
    
    // Make tasks and homeData available globally for other scripts
    window.tasks = tasks;
    window.homeData = homeData;
    
    // Initialize global document data
    if (!window.documentsData) {
        window.documentsData = [];
    }
    
    // Check for existing data (now async)
    const hasData = await hasExistingData();
    
    if (hasData) {
        // Hide setup screens
        document.getElementById('setup-form').style.display = 'none';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Update header
        document.getElementById('header-subtitle').textContent = homeData.fullAddress;
        // Show bottom navigation for returning users
        document.body.classList.add('main-app-active');
        
        // Update global references
        window.tasks = tasks;
        window.homeData = homeData;
        
        // Show dashboard
        showTab('dashboard');
        
        // Initialize Google Calendar sync UI
        if (typeof updateCalendarSyncUI === 'function') {
            updateCalendarSyncUI();
        }
        
        console.log(`👋 Welcome back! Loaded ${tasks.length} tasks for ${homeData.fullAddress}`);
    } else {
        document.getElementById('setup-form').style.display = 'block';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }
    
    initializeDateManagement();
    
    console.log('✅ The Home Keeper CLEAN SIMPLE VERSION WITH ALL FIXES initialized successfully!');
}

// Export functions to global scope
window.createMaintenancePlan = createMaintenancePlan;
window.finishTaskSetup = finishTaskSetup;
window.goBackToHomeSetup = goBackToHomeSetup;
window.showTab = showTab;
window.completeTask = completeTask;
window.addTaskFromDashboard = addTaskFromDashboard;
window.addTaskFromSetup = addTaskFromSetup;
window.editTaskFromSetup = editTaskFromSetup;
window.deleteTaskDirect = deleteTaskDirect;
window.openTaskEditModal = openTaskEditModal;
window.closeTaskEditModal = closeTaskEditModal;
window.saveTaskFromEdit = saveTaskFromEdit;
window.deleteTaskFromEdit = deleteTaskFromEdit;
window.showHomeInfo = showHomeInfo;
window.clearData = clearData;
window.exportData = exportData;
window.showAllTasks = showAllTasks;
window.exportTaskList = exportTaskList;

// NEW: Property confirmation functions
function showPropertyConfirmation() {
    // Scroll to top for consistent experience
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Collect home data (same as before)
    homeData = {
        address: document.getElementById('address')?.value || '123 Main Street',
        city: document.getElementById('city')?.value || 'Anytown',
        state: document.getElementById('state')?.value || 'NY',
        zipcode: document.getElementById('zipcode')?.value || '12345',
        propertyType: document.getElementById('property-type')?.value || 'single-family',
        yearBuilt: parseInt(document.getElementById('year-built')?.value) || 2000,
        sqft: parseInt(document.getElementById('sqft')?.value) || 2000,
        hoaCost: parseFloat(document.getElementById('hoa-cost')?.value) || 0,
        ownerName: window.currentUser?.displayName || 'Homeowner'
    };
    homeData.fullAddress = `${homeData.address}, ${homeData.city}, ${homeData.state} ${homeData.zipcode}`;

    // Collect features
    homeData.features = {
        centralAC: document.getElementById('central-ac')?.checked || false,
        miniSplits: document.getElementById('mini-splits')?.checked || false,
        wallAC: document.getElementById('wall-ac')?.checked || false,
        electricBaseboard: document.getElementById('electric-baseboard')?.checked || false,
        boiler: document.getElementById('boiler')?.checked || false,
        municipalWater: document.getElementById('municipal-water')?.checked || false,
        wellWater: document.getElementById('well-water')?.checked || false,
        sedimentFilter: document.getElementById('sediment-filter')?.checked || false,
        uvFilter: document.getElementById('uv-filter')?.checked || false,
        waterSoftener: document.getElementById('water-softener')?.checked || false,
        wholeHouseFilter: document.getElementById('whole-house-filter')?.checked || false,
        municipalSewer: document.getElementById('municipal-sewer')?.checked || false,
        septic: document.getElementById('septic')?.checked || false,
        fireplace: document.getElementById('fireplace')?.checked || false,
        pool: document.getElementById('pool')?.checked || false,
        deck: document.getElementById('deck')?.checked || false,
        garage: document.getElementById('garage')?.checked || false,
        basement: document.getElementById('basement')?.checked || false,
        otherFeatures: document.getElementById('other-features')?.value || '',

        // ===== NEW FEATURES - ADD THESE =====
            // Energy & Smart Systems
            solarPanels: document.getElementById('solar-panels')?.checked || false,
            backupGenerator: document.getElementById('backup-generator')?.checked || false,
            batteryStorage: document.getElementById('battery-storage')?.checked || false,
            smartThermostat: document.getElementById('smart-thermostat')?.checked || false,
            securitySystem: document.getElementById('security-system')?.checked || false,

            // Structural Details (new checkbox system)
            roofAsphalt: document.getElementById('roof-asphalt')?.checked || false,
            roofMetal: document.getElementById('roof-metal')?.checked || false,
            roofTile: document.getElementById('roof-tile')?.checked || false,
            roofSlate: document.getElementById('roof-slate')?.checked || false,
            roofWood: document.getElementById('roof-wood')?.checked || false,
            roofFlat: document.getElementById('roof-flat')?.checked || false,
            roofAge: parseInt(document.getElementById('roof-age')?.value) || 0,
            
            sidingVinyl: document.getElementById('siding-vinyl')?.checked || false,
            sidingWood: document.getElementById('siding-wood')?.checked || false,
            sidingBrick: document.getElementById('siding-brick')?.checked || false,
            sidingStucco: document.getElementById('siding-stucco')?.checked || false,
            sidingFiberCement: document.getElementById('siding-fiber-cement')?.checked || false,
            sidingStone: document.getElementById('siding-stone')?.checked || false,
            
            foundationSlab: document.getElementById('foundation-slab')?.checked || false,
            foundationCrawl: document.getElementById('foundation-crawl')?.checked || false,
            foundationFullBasement: document.getElementById('foundation-full-basement')?.checked || false,
            foundationPartialBasement: document.getElementById('foundation-partial-basement')?.checked || false,
            foundationPier: document.getElementById('foundation-pier')?.checked || false,

            // Outdoor Features
            sprinklerSystem: document.getElementById('sprinkler-system')?.checked || false,
            outdoorLighting: document.getElementById('outdoor-lighting')?.checked || false,
            fencing: document.getElementById('fencing')?.checked || false,
            pavedDriveway: document.getElementById('paved-driveway')?.checked || false,
            matureLandscaping: document.getElementById('mature-landscaping')?.checked || false,
            outdoorKitchen: document.getElementById('outdoor-kitchen')?.checked || false
        
    };

    // Update confirmation summary
    updateConfirmationSummary();

    // Show confirmation page
    document.getElementById('setup-form').style.display = 'none';
    document.getElementById('property-confirmation').classList.remove('hidden');
}

// ENHANCED: updateConfirmationSummary function with new categories
function updateConfirmationSummary() {
    const confirmationSummary = document.getElementById('confirmation-summary');
    if (!confirmationSummary) return;
    
    // Build existing summary content
    const heatingCooling = [];
    if (homeData.features.centralAC) heatingCooling.push('Central AC/Heat');
    if (homeData.features.miniSplits) heatingCooling.push('Mini-Splits');
    if (homeData.features.wallAC) heatingCooling.push('Wall AC');
    if (homeData.features.electricBaseboard) heatingCooling.push('Electric Baseboard');
    if (homeData.features.boiler) heatingCooling.push('Boiler');

    const waterSewer = [];
    if (homeData.features.municipalWater) waterSewer.push('Municipal Water');
    if (homeData.features.wellWater) {
        let wellWaterText = 'Well Water';
        const wellWaterSubs = [];
        if (homeData.features.sedimentFilter) wellWaterSubs.push('Sediment Filter');
        if (homeData.features.uvFilter) wellWaterSubs.push('UV Filter');
        if (homeData.features.waterSoftener) wellWaterSubs.push('Water Softener');
        if (homeData.features.wholeHouseFilter) wellWaterSubs.push('Whole House Filter');
        if (wellWaterSubs.length > 0) {
            wellWaterText += ` (${wellWaterSubs.join(', ')})`;
        }
        waterSewer.push(wellWaterText);
    }
    if (homeData.features.municipalSewer) waterSewer.push('Municipal Sewer');
    if (homeData.features.septic) waterSewer.push('Septic System');

    const basicFeatures = [];
    if (homeData.features.fireplace) basicFeatures.push('Fireplace');
    if (homeData.features.pool) basicFeatures.push('Pool/Spa');
    if (homeData.features.deck) basicFeatures.push('Deck/Patio');
    if (homeData.features.garage) basicFeatures.push('Garage');
    if (homeData.features.basement) basicFeatures.push('Basement');
    if (homeData.features.otherFeatures) basicFeatures.push(homeData.features.otherFeatures);

    // NEW: Build Energy & Smart Systems section
    const energySmart = [];
    if (homeData.features.solarPanels) energySmart.push('Solar Panels');
    if (homeData.features.backupGenerator) energySmart.push('Backup Generator');
    if (homeData.features.batteryStorage) energySmart.push('Battery Storage');
    if (homeData.features.smartThermostat) energySmart.push('Smart Thermostat');
    if (homeData.features.securitySystem) energySmart.push('Security System');

    // NEW: Build Structural Details section
    const structuralDetails = [];
    
    // Check roof types (new checkbox system)
    const roofTypes = [];
    if (homeData.features.roofAsphalt) roofTypes.push('Asphalt Shingles');
    if (homeData.features.roofMetal) roofTypes.push('Metal Roofing');
    if (homeData.features.roofTile) roofTypes.push('Tile Roof');
    if (homeData.features.roofSlate) roofTypes.push('Slate Roof');
    if (homeData.features.roofWood) roofTypes.push('Wood Shakes');
    if (homeData.features.roofFlat) roofTypes.push('Flat/Membrane Roof');
    
    if (roofTypes.length > 0) {
        structuralDetails.push(roofTypes.join(', '));
    }
    
    if (homeData.features.roofAge && homeData.features.roofAge > 0) {
        structuralDetails.push(`${homeData.features.roofAge} year old roof`);
    }
    
    // Check siding types (new checkbox system)
    const sidingTypes = [];
    if (homeData.features.sidingVinyl) sidingTypes.push('Vinyl Siding');
    if (homeData.features.sidingWood) sidingTypes.push('Wood Siding');
    if (homeData.features.sidingBrick) sidingTypes.push('Brick');
    if (homeData.features.sidingStucco) sidingTypes.push('Stucco');
    if (homeData.features.sidingFiberCement) sidingTypes.push('Fiber Cement');
    if (homeData.features.sidingStone) sidingTypes.push('Stone/Masonry');
    
    if (sidingTypes.length > 0) {
        structuralDetails.push(sidingTypes.join(', '));
    }
    
    // Check foundation types (new checkbox system)
    const foundationTypes = [];
    if (homeData.features.foundationSlab) foundationTypes.push('Concrete Slab');
    if (homeData.features.foundationCrawl) foundationTypes.push('Crawl Space');
    if (homeData.features.foundationFullBasement) foundationTypes.push('Full Basement');
    if (homeData.features.foundationPartialBasement) foundationTypes.push('Partial Basement');
    if (homeData.features.foundationPier) foundationTypes.push('Pier & Beam');
    
    if (foundationTypes.length > 0) {
        structuralDetails.push(foundationTypes.join(', '));
    }

    // NEW: Build Outdoor Features section
    const outdoorFeatures = [];
    if (homeData.features.sprinklerSystem) outdoorFeatures.push('Sprinkler System');
    if (homeData.features.outdoorLighting) outdoorFeatures.push('Outdoor Lighting');
    if (homeData.features.fencing) outdoorFeatures.push('Fencing');
    if (homeData.features.pavedDriveway) outdoorFeatures.push('Paved Driveway');
    if (homeData.features.matureLandscaping) outdoorFeatures.push('Mature Landscaping');
    if (homeData.features.outdoorKitchen) outdoorFeatures.push('Outdoor Kitchen');

    const propertyTypeDisplay = {
        'single-family': 'Single Family Home',
        'townhouse': 'Townhouse',
        'condo': 'Condo',
        'apartment': 'Apartment',
        'mobile-home': 'Mobile Home'
    };

    // Build the enhanced confirmation HTML
    let summaryHTML = `
        <div><strong>📍 Address:</strong> ${homeData.fullAddress}</div>
        <div><strong>🏢 Type:</strong> ${propertyTypeDisplay[homeData.propertyType]} • <strong>📐 Size:</strong> ${homeData.sqft?.toLocaleString()} sq ft • <strong>🏗️ Built:</strong> ${homeData.yearBuilt}</div>
    `;

    // Add existing categories
    if (heatingCooling.length > 0) {
        summaryHTML += `<div><strong>🌡️ Heating/Cooling:</strong> ${heatingCooling.join(', ')}</div>`;
    }
    
    if (waterSewer.length > 0) {
        summaryHTML += `<div><strong>💧 Water/Sewer:</strong> ${waterSewer.join(', ')}</div>`;
    }

    // Add basic features
    if (basicFeatures.length > 0) {
        summaryHTML += `<div><strong>🏠 Basic Features:</strong> ${basicFeatures.join(', ')}</div>`;
    }

    // NEW: Add Energy & Smart Systems
    if (energySmart.length > 0) {
        summaryHTML += `<div><strong>⚡ Energy & Smart Systems:</strong> ${energySmart.join(', ')}</div>`;
    }

    // NEW: Add Structural Details (show even if basic)
    if (structuralDetails.length > 0) {
        summaryHTML += `<div><strong>🏗️ Structural Details:</strong> ${structuralDetails.join(', ')}</div>`;
    }

    // NEW: Add Outdoor Features
    if (outdoorFeatures.length > 0) {
        summaryHTML += `<div><strong>🌳 Outdoor Features:</strong> ${outdoorFeatures.join(', ')}</div>`;
    }

    confirmationSummary.innerHTML = summaryHTML;
}

function proceedToTaskGeneration() {
    console.log('🚀 Proceeding to task generation...');
    
    // Use the new task generator system to get tasks with proper YouTube URLs
    console.log('🔍 DEBUG: window.taskGenerator exists:', !!window.taskGenerator);
    console.log('🔍 DEBUG: window.taskGenerator.createMaintenancePlan exists:', !!(window.taskGenerator && window.taskGenerator.createMaintenancePlan));
    
    if (window.taskGenerator && window.taskGenerator.createMaintenancePlan) {
        console.log('🚀 Using new task generator with YouTube URLs');
        const result = window.taskGenerator.createMaintenancePlan();
        window.homeData = result.homeData;
        window.tasks = result.tasks;
        console.log(`🚀 Generated ${result.tasks.length} tasks with YouTube URLs`);
    } else {
        console.log('🚀 Fallback to old system - task generator not available');
        console.log('🔍 Available on window:', Object.keys(window).filter(k => k.includes('task') || k.includes('Task')));
        // Fallback to old system
        generateTaskTemplates();
        window.homeData = homeData;
        window.tasks = tasks;
    }
    
   // Hide confirmation page and setup form
    document.getElementById('property-confirmation').classList.add('hidden');
    document.getElementById('setup-form').style.display = 'none';
    
    // Show task setup
    document.getElementById('task-setup').classList.remove('hidden');
    document.getElementById('task-setup').style.display = 'block';
    
    // Run your existing task setup display
    setTimeout(showTaskSetup, 0);
    
    console.log('✅ Moved to task setup page');
}

function goBackFromConfirmation() {
    // Scroll to top for consistent experience
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide confirmation page
    document.getElementById('property-confirmation').classList.add('hidden');
    
    // Show setup form
    document.getElementById('setup-form').style.display = 'block';
    
    // Show Step 3 (the last step where they left off)
    document.querySelectorAll('.onboarding-step').forEach(step => {
        step.classList.add('hidden');
    });
    const step3 = document.querySelector('.onboarding-step[data-step="3"]');
    if (step3) {
        step3.classList.remove('hidden');
    }

    // Update progress bar to Step 3
    const totalSteps = 5;
    const step = 3;
    const percent = Math.round((step / totalSteps) * 100);
    document.getElementById('progress-label').textContent = `Step ${step} of ${totalSteps}`;
    document.getElementById('progress-percent').textContent = `${percent}% Complete`;
    document.getElementById('progress-bar-fill').style.width = `${percent}%`;
}

// Initialize app
document.addEventListener('DOMContentLoaded', initializeApp);
if (document.readyState !== 'loading') {
    initializeApp();
}

console.log('🏠 The Home Keeper CLEAN SIMPLE VERSION WITH ALL FIXES script loaded successfully!');

// ========================================
// STEP 4: ORGANIZED NAMESPACE SYSTEM
// Keeps calendar-critical functions global, organizes UI functions under namespace
// ========================================

// Create main app namespace
window.CasaCare = window.CasaCare || {};

// ========================================
// KEEP THESE GLOBAL (CALENDAR CRITICAL) ✅
// ========================================

// These MUST stay global for calendar synchronization:
// window.completeTask - already set by date management system ✅
// window.saveData - already global ✅
// window.loadData - already global ✅
// window.tasks - already global ✅
// window.homeData - already global ✅

// These are called by HTML onclick handlers, must stay global:
// window.createMaintenancePlan - already global ✅
// window.finishTaskSetup - already global ✅
// window.showTab - already global ✅
// window.toggleWellWaterOptions - already global ✅

// ========================================
// ORGANIZE UNDER NAMESPACE (UI FUNCTIONS) 🏗️
// ========================================

// Setup and navigation functions
CasaCare.setup = {
    goBackToHomeSetup: typeof goBackToHomeSetup !== 'undefined' ? goBackToHomeSetup : function() { console.warn('goBackToHomeSetup not defined'); },
    addTaskFromSetup: typeof addTaskFromSetup !== 'undefined' ? addTaskFromSetup : function() { console.warn('addTaskFromSetup not defined'); },
    editTaskFromSetup: typeof editTaskFromSetup !== 'undefined' ? editTaskFromSetup : function() { console.warn('editTaskFromSetup not defined'); },
    deleteTaskDirect: typeof deleteTaskDirect !== 'undefined' ? deleteTaskDirect : function() { console.warn('deleteTaskDirect not defined'); }
};

// Dashboard functions  
CasaCare.dashboard = {
    addTaskFromDashboard: typeof addTaskFromDashboard !== 'undefined' ? addTaskFromDashboard : function() { console.warn('addTaskFromDashboard not defined'); },
    editTaskFromDashboard: typeof editTaskFromDashboard !== 'undefined' ? editTaskFromDashboard : function() { console.warn('editTaskFromDashboard not defined'); },
    rescheduleTaskFromDashboard: typeof rescheduleTaskFromDashboard !== 'undefined' ? rescheduleTaskFromDashboard : function() { console.warn('rescheduleTaskFromDashboard not defined'); },
    exportTaskList: typeof exportTaskList !== 'undefined' ? exportTaskList : function() { console.warn('exportTaskList not defined'); }
};

// Modal management
CasaCare.modals = {
    openTaskEditModal: typeof openTaskEditModal !== 'undefined' ? openTaskEditModal : function() { console.warn('openTaskEditModal not defined'); },
    closeTaskEditModal: typeof closeTaskEditModal !== 'undefined' ? closeTaskEditModal : function() { console.warn('closeTaskEditModal not defined'); },
    saveTaskFromEdit: typeof saveTaskFromEdit !== 'undefined' ? saveTaskFromEdit : function() { console.warn('saveTaskFromEdit not defined'); },
    deleteTaskFromEdit: typeof deleteTaskFromEdit !== 'undefined' ? deleteTaskFromEdit : function() { console.warn('deleteTaskFromEdit not defined'); },
    
    // Date picker modal functions
    closeDatePickerModal: typeof closeDatePickerModal !== 'undefined' ? closeDatePickerModal : function() { console.warn('closeDatePickerModal not defined'); },
    setQuickDate: typeof setQuickDate !== 'undefined' ? setQuickDate : function() { console.warn('setQuickDate not defined'); },
    confirmReschedule: typeof confirmReschedule !== 'undefined' ? confirmReschedule : function() { console.warn('confirmReschedule not defined'); }
};

// Utility functions
CasaCare.utils = {
    showHomeInfo: typeof showHomeInfo !== 'undefined' ? showHomeInfo : function() { console.warn('showHomeInfo not defined'); },
    clearData: typeof clearData !== 'undefined' ? clearData : function() { console.warn('clearData not defined'); },
    exportData: typeof exportData !== 'undefined' ? exportData : function() { console.warn('exportData not defined'); },
    closeHomeInfoModal: typeof closeHomeInfoModal !== 'undefined' ? closeHomeInfoModal : function() { console.warn('closeHomeInfoModal not defined'); },
    saveHomeInfo: typeof saveHomeInfo !== 'undefined' ? saveHomeInfo : function() { console.warn('saveHomeInfo not defined'); },
    populateHomeInfoForm: typeof populateHomeInfoForm !== 'undefined' ? populateHomeInfoForm : function() { console.warn('populateHomeInfoForm not defined'); },
    
};

// Component instances (these stay global for inter-component communication)
CasaCare.components = {
    enhancedDashboard: null, // Will be set when dashboard initializes
    calendar: null, // Will be set when calendar initializes  
    documents: null // Will be set when documents initializes
};

// ========================================
// DEBUGGING AND DIAGNOSTICS 🔍
// ========================================

CasaCare.debug = {
    listGlobalFunctions: function() {
        console.log('🌍 GLOBAL FUNCTIONS (Calendar Critical):');
        const criticalGlobals = [
            'completeTask', 'saveData', 'loadData', 'tasks', 'homeData',
            'createMaintenancePlan', 'finishTaskSetup', 'showTab', 'toggleWellWaterOptions'
        ];
        
        criticalGlobals.forEach(name => {
            const exists = typeof window[name] !== 'undefined';
            const type = typeof window[name];
            console.log(`  ${name}: ${exists ? '✅' : '❌'} (${type})`);
        });
    },
    
    listNamespacedFunctions: function() {
        console.log('🏗️ NAMESPACED FUNCTIONS:');
        Object.keys(CasaCare).forEach(namespace => {
            if (typeof CasaCare[namespace] === 'object' && namespace !== 'debug') {
                console.log(`  CasaCare.${namespace}:`, Object.keys(CasaCare[namespace]));
            }
        });
    },
    
    testCalendarSync: function() {
        console.log('📅 TESTING CALENDAR SYNC:');
        
        // Test tasks array
        const tasksExist = Array.isArray(window.tasks);
        console.log(`  window.tasks: ${tasksExist ? '✅' : '❌'} (${tasksExist ? window.tasks.length : 0} tasks)`);
        
        // Test date consistency
        if (tasksExist && window.tasks.length > 0) {
            let syncedCount = 0;
            let totalWithDates = 0;
            
            window.tasks.forEach(task => {
                if (task.dueDate || task.nextDue) {
                    totalWithDates++;
                    if (task.dueDate && task.nextDue) {
                        const dueTime = new Date(task.dueDate).getTime();
                        const nextTime = new Date(task.nextDue).getTime();
                        if (Math.abs(dueTime - nextTime) <= 1000) {
                            syncedCount++;
                        }
                    }
                }
            });
            
            console.log(`  Date sync status: ${syncedCount}/${totalWithDates} tasks synced (${syncedCount === totalWithDates ? '✅ PERFECT' : '⚠️ NEEDS ATTENTION'})`);
        }
        
        // Test calendar object
        const calendarExists = typeof window.casaCareCalendar === 'object' && window.casaCareCalendar !== null;
        console.log(`  window.casaCareCalendar: ${calendarExists ? '✅' : '❌'}`);
        
        // Test complete task function
        const completeTaskExists = typeof window.completeTask === 'function';
        console.log(`  window.completeTask: ${completeTaskExists ? '✅' : '❌'}`);
        
        // Test enhanced dashboard
        const dashboardExists = typeof window.enhancedDashboard === 'object' && window.enhancedDashboard !== null;
        console.log(`  window.enhancedDashboard: ${dashboardExists ? '✅' : '❌'}`);
        
        return {
            tasksArray: tasksExist,
            calendarObject: calendarExists, 
            completeTaskFunction: completeTaskExists,
            dashboardObject: dashboardExists,
            tasksCount: tasksExist ? window.tasks.length : 0,
            syncStatus: tasksExist && window.tasks.length > 0 ? 'tested' : 'no-tasks'
        };
    },
    
    fixDateSync: function() {
        console.log('🔧 ATTEMPTING TO FIX DATE SYNC ISSUES...');
        
        if (!window.tasks || !Array.isArray(window.tasks)) {
            console.log('❌ No tasks array found');
            return false;
        }
        
        const fixed = ensureTaskDateConsistency(window.tasks);
        
        if (fixed > 0) {
            try {
                saveData();
                console.log(`✅ Fixed ${fixed} tasks and saved data`);
                
                // Refresh displays
                if (window.enhancedDashboard && typeof window.enhancedDashboard.render === 'function') {
                    window.enhancedDashboard.render();
                }
                if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
                    window.casaCareCalendar.refresh();
                }
                
                return true;
            } catch (error) {
                console.error('❌ Error saving fixes:', error);
                return false;
            }
        } else {
            console.log('✅ No sync issues found - all tasks are properly synchronized');
            return true;
        }
    }
};

// ========================================
// COMPONENT REFERENCE UPDATES 🔗
// ========================================

// Update component references when they initialize
const originalInitializeApp = typeof initializeApp !== 'undefined' ? initializeApp : function() {};

function initializeAppWithNamespace() {

    // Call original initialization
    if (typeof originalInitializeApp === 'function') {
        originalInitializeApp();
    }
    
    // Set up component references after a short delay to ensure they're created
    setTimeout(() => {
        if (window.enhancedDashboard) {
            CasaCare.components.enhancedDashboard = window.enhancedDashboard;
        }
        if (window.casaCareCalendar) {
            CasaCare.components.calendar = window.casaCareCalendar;
        }
        if (window.casaCareDocuments) {
            CasaCare.components.documents = window.casaCareDocuments;
        }
    }, 100);
}

// Update the global initializeApp reference
window.initializeApp = initializeAppWithNamespace;

// ========================================
// MAKE DEBUG FUNCTIONS EASILY ACCESSIBLE 🧪
// ========================================

// Make the main debug function globally available (this was missing before!)
window.debugCasaCare = CasaCare.debug.testCalendarSync;
window.fixCalendarSync = CasaCare.debug.fixDateSync;
window.listGlobalFunctions = CasaCare.debug.listGlobalFunctions;
window.listNamespacedFunctions = CasaCare.debug.listNamespacedFunctions;

// ========================================
// FINAL INITIALIZATION 🚀
// ========================================

// ========================================
// SMART INSTALLATION BANNER SYSTEM
// Shows device-specific PWA installation instructions
// ========================================

class InstallationBanner {
    constructor() {
        this.banner = null;
        this.isInstalled = false;
        this.isDismissed = false;
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.banner = document.getElementById('install-banner');
        if (!this.banner) {
            console.warn('⚠️ Install banner element not found');
            return;
        }
        
        // Check if user previously dismissed the banner
        this.isDismissed = localStorage.getItem('install-banner-dismissed') === 'true';
        
        // Check if app is already installed
        this.checkIfInstalled();
        
        // Set up event listeners
        this.bindEvents();
        
        // Show banner if appropriate
        setTimeout(() => this.showBannerIfNeeded(), 2000); // Delay to not overwhelm new users
    }
    
    bindEvents() {
        // Close button
        const closeBtn = document.getElementById('install-banner-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.dismissBanner());
        }
        
        // Listen for app installation
        window.addEventListener('beforeinstallprompt', (e) => {
            // App can be installed
            this.isInstalled = false;
        });
        
        window.addEventListener('appinstalled', (e) => {
            // App was installed
            this.isInstalled = true;
            this.hideBanner();
        });
    }
    
    checkIfInstalled() {
        // Check if running as installed PWA
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }
        
        // Check if launched from home screen (iOS)
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
        }
    }
    
    showBannerIfNeeded() {
        // Don't show if already installed, dismissed, or no banner element
        if (this.isInstalled || this.isDismissed || !this.banner) {
            return;
        }
        
        // Get device-specific instructions
        const instructions = this.getInstallInstructions();
        if (!instructions) {
            return; // Don't show on unsupported browsers
        }
        
        // Update banner text
        const instructionsElement = document.getElementById('install-instructions');
        if (instructionsElement) {
            instructionsElement.innerHTML = instructions;
        }
        
        // Show the banner
        this.showBanner();
    }
    
    getInstallInstructions() {
        const userAgent = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isAndroid = /Android/.test(userAgent);
        const isChrome = /Chrome/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !isChrome;
        const isFirefox = /Firefox/.test(userAgent);
        const isEdge = /Edg/.test(userAgent);
        
        if (isIOS) {
            if (isSafari) {
                return `Tap <strong>Share</strong> <span style="font-size: 16px;">⤴</span> → <strong>"Add to Home Screen"</strong>`;
            } else if (isChrome) {
                return `Tap <strong>Share</strong> <span style="font-size: 16px;">⤴</span> → scroll down → <strong>"Add to Home Screen"</strong><br><small style="opacity: 0.8;">💡 For easier installation, try opening in Safari</small>`;
            } else {
                return `Open in Safari for best installation experience`;
            }
        } else if (isAndroid) {
            if (isChrome) {
                return `Tap menu <strong>⋮</strong> → <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>`;
            } else if (isFirefox) {
                return `Tap menu <strong>⋮</strong> → <strong>"Install"</strong> or <strong>"Add to Home Screen"</strong>`;
            } else {
                return `Look for <strong>"Add to Home Screen"</strong> or <strong>"Install"</strong> in your browser menu`;
            }
        } else {
            // Desktop
            if (isChrome || isEdge) {
                return `Look for the <strong>install icon</strong> <span style="font-size: 16px;">⊕</span> in your address bar`;
            } else {
                return `Use Chrome, Edge, or Firefox for the best installation experience`;
            }
        }
        
        return null; // Don't show on unsupported browsers
    }
    
    showBanner() {
        if (!this.banner) return;
        
        this.banner.classList.remove('hidden');
        document.body.classList.add('install-banner-visible');
        
        // Animate in
        setTimeout(() => {
            this.banner.classList.add('show');
        }, 100);
        
        console.log('📱 Install banner shown');
    }
    
    hideBanner() {
        if (!this.banner) return;
        
        this.banner.classList.remove('show');
        document.body.classList.remove('install-banner-visible');
        
        setTimeout(() => {
            this.banner.classList.add('hidden');
        }, 300);
    }
    
    dismissBanner() {
        this.hideBanner();
        this.isDismissed = true;
        
        // Remember dismissal for 7 days
        const dismissUntil = new Date();
        dismissUntil.setDate(dismissUntil.getDate() + 7);
        localStorage.setItem('install-banner-dismissed', 'true');
        localStorage.setItem('install-banner-dismiss-until', dismissUntil.toISOString());
        
        console.log('📱 Install banner dismissed for 7 days');
    }
    
    // Public method to manually show the banner
    show() {
        this.isDismissed = false;
        localStorage.removeItem('install-banner-dismissed');
        this.showBannerIfNeeded();
    }
}

// Initialize the installation banner system
let installBanner;

// Make it available globally for debugging
window.showInstallBanner = function() {
    if (installBanner) {
        installBanner.show();
    }
};

// Initialize when app starts
document.addEventListener('DOMContentLoaded', () => {
    installBanner = new InstallationBanner();
});

// Also initialize if DOM is already ready
if (document.readyState !== 'loading') {
    installBanner = new InstallationBanner();
}

console.log('📱 Smart installation banner system loaded');

function toggleCategory(categoryId) {
    const tasksDiv = document.getElementById(`tasks-${categoryId}`);
    const arrow = document.getElementById(`arrow-${categoryId}`);
    
    if (tasksDiv.classList.contains('hidden')) {
        // Show tasks
        tasksDiv.classList.remove('hidden');
        arrow.style.transform = 'rotate(90deg)';
    } else {
        // Hide tasks
        tasksDiv.classList.add('hidden');
        arrow.style.transform = 'rotate(0deg)';
    }
}

// Make it globally available
window.toggleCategory = toggleCategory;

// Override functions to use TaskManager
window.openTaskEditModal = function(task, isNew) {
    window.TaskManager.openModal(task, isNew);
};

window.saveTaskFromEdit = function() {
    window.TaskManager.save();
};

window.closeTaskEditModal = function() {
    window.TaskManager.close();
};

// Fixed showStep function in app.js - replace the existing one
document.addEventListener('DOMContentLoaded', function () {
  let currentStep = 1;
  const totalSteps = 5;

  function showStep(step) {
    document.querySelectorAll('.onboarding-step').forEach(div => {
      div.classList.add('hidden');
      if (parseInt(div.dataset.step) === step) {
        div.classList.remove('hidden');
      }
    });

    // FIXED: Only update progress elements if they exist
    const progressLabel = document.getElementById('progress-label');
    const progressPercent = document.getElementById('progress-percent');
    const progressBarFill = document.getElementById('progress-bar-fill');
    
    if (progressLabel && progressPercent && progressBarFill) {
      const percent = Math.round((step / totalSteps) * 100);
      progressLabel.textContent = `Step ${step} of ${totalSteps}`;
      progressPercent.textContent = `${percent}%`;
      progressBarFill.style.width = `${percent}%`;
    }
    
    // Always scroll to top for consistent experience
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Button listeners - UPDATED for 6 steps
  const stepButtons = [
    // Forward navigation
    { id: 'next-to-step-2', action: () => { currentStep = 2; showStep(currentStep); } },
    { id: 'next-to-step-3', action: () => { currentStep = 3; showStep(currentStep); } },
    { id: 'next-to-step-4', action: () => { currentStep = 4; showStep(currentStep); } },
    { id: 'next-to-step-5', action: () => { currentStep = 5; showStep(currentStep); } },
    // Backward navigation
    { id: 'back-to-step-1', action: () => { currentStep = 1; showStep(currentStep); } },
    { id: 'back-to-step-2', action: () => { currentStep = 2; showStep(currentStep); } },
    { id: 'back-to-step-3', action: () => { currentStep = 3; showStep(currentStep); } },
    { id: 'back-to-step-4', action: () => { currentStep = 4; showStep(currentStep); } }
  ];

  stepButtons.forEach(btn => {
    const el = document.getElementById(btn.id);
    if (el) {
      el.addEventListener('click', btn.action);
    } else {
      console.warn(`Button with ID '${btn.id}' not found`);
    }
  });

  // Show the first step initially
  showStep(currentStep);
});
function goBackToHomeSetup() {
    const taskSetup = document.getElementById('task-setup');
    if (taskSetup) {
        taskSetup.classList.add('hidden');
        taskSetup.style.display = 'none';
    }

    const setupForm = document.getElementById('setup-form');
    if (setupForm) {
        setupForm.style.display = 'block';
        setupForm.classList.remove('hidden');
    }

    // Show Step 3 only, hide other steps
    document.querySelectorAll('.onboarding-step').forEach(step => {
        step.classList.add('hidden');
    });
    const step3 = document.querySelector('.onboarding-step[data-step="3"]');
    if (step3) {
        step3.classList.remove('hidden');
    }

    // Update progress bar to Step 3
    const totalSteps = 5;
    const step = 3;
    const percent = Math.round((step / totalSteps) * 100);
    document.getElementById('progress-label').textContent = `Step ${step} of ${totalSteps}`;
    document.getElementById('progress-percent').textContent = `${percent}%`;
    document.getElementById('progress-bar-fill').style.width = `${percent}%`;
}
// Real-time task preview functionality
function updateTaskPreview() {
    // Get current form state - EXISTING FEATURES
    const propertyType = document.getElementById('property-type')?.value || 'single-family';
    const centralAC = document.getElementById('central-ac')?.checked || false;
    const miniSplits = document.getElementById('mini-splits')?.checked || false;
    const wellWater = document.getElementById('well-water')?.checked || false;
    const septic = document.getElementById('septic')?.checked || false;
    const fireplace = document.getElementById('fireplace')?.checked || false;
    const pool = document.getElementById('pool')?.checked || false;
    const deck = document.getElementById('deck')?.checked || false;
    
    // NEW: Get advanced features state
    const solarPanels = document.getElementById('solar-panels')?.checked || false;
    const backupGenerator = document.getElementById('backup-generator')?.checked || false;
    const smartThermostat = document.getElementById('smart-thermostat')?.checked || false;
    const securitySystem = document.getElementById('security-system')?.checked || false;
    const sprinklerSystem = document.getElementById('sprinkler-system')?.checked || false;
    const outdoorLighting = document.getElementById('outdoor-lighting')?.checked || false;
    const pavedDriveway = document.getElementById('paved-driveway')?.checked || false;
    const matureLandscaping = document.getElementById('mature-landscaping')?.checked || false;
    const roofAge = parseInt(document.getElementById('roof-age')?.value) || 0;
    
    // Calculate preview stats
    let taskCount = 2; // Base safety tasks
    let annualCost = 100; // Base cost
    let safetyTasks = 2; // Base safety tasks
    
    // EXISTING FEATURES: Add tasks based on features
    if (centralAC) { taskCount += 2; annualCost += 175; }
    if (miniSplits) { taskCount += 1; annualCost += 50; }
    if (wellWater) { taskCount += 2; annualCost += 150; }
    if (septic) { taskCount += 1; annualCost += 400; }
    if (fireplace) { taskCount += 1; annualCost += 300; safetyTasks += 1; }
    if (pool) { taskCount += 1; annualCost += 300; }
    if (deck) { taskCount += 1; annualCost += 200; }
    
    // NEW FEATURES: Add tasks for advanced features
    if (solarPanels) { 
        taskCount += 2; // Cleaning & performance check
        annualCost += 100; 
    }
    if (backupGenerator) { 
        taskCount += 2; // Monthly test + annual service
        annualCost += 310; // $5 * 12 + $250
        safetyTasks += 1; // Generator is safety-related
    }
    if (smartThermostat) { 
        taskCount += 1; // Data review
        annualCost += 0; 
    }
    if (securitySystem) { 
        taskCount += 1; // System test
        annualCost += 0;
        safetyTasks += 1; // Security is safety-related
    }
    if (sprinklerSystem) { 
        taskCount += 2; // Spring startup + winterization
        annualCost += 225; 
    }
    if (outdoorLighting) { 
        taskCount += 1; // Inspection & bulb replacement
        annualCost += 60; 
    }
    if (pavedDriveway) { 
        taskCount += 1; // Crack sealing every 2 years
        annualCost += 100; 
    }
    if (matureLandscaping) { 
        taskCount += 1; // Professional tree pruning
        annualCost += 200; 
    }
    if (roofAge > 10) { 
        taskCount += 1; // Professional roof inspection
        annualCost += roofAge > 20 ? 300 : 150; // More frequent for older roofs
    }
    
    // Property type adjustments
    if (['single-family', 'townhouse'].includes(propertyType)) {
        taskCount += 3; // Exterior tasks
        annualCost += 250;
    }
    
    // Update display with animation
    animateNumber('preview-task-count', taskCount);
    animateNumber('preview-annual-cost', annualCost, '$');
    animateNumber('preview-safety-tasks', safetyTasks);
    
    // Update HOA fee display
    const hoaCost = parseFloat(document.getElementById('hoa-cost')?.value) || 0;
    const hoaNote = document.getElementById('hoa-fee-note');
    const hoaAmount = document.getElementById('preview-hoa-cost');
    
    if (hoaCost > 0) {
        const annualHoaCost = hoaCost * 12; // Convert monthly to yearly
        hoaAmount.textContent = '$' + annualHoaCost;
        hoaNote.classList.remove('hidden');
    } else {
        hoaNote.classList.add('hidden');
    }
}

function animateNumber(elementId, newValue, prefix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const oldValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
    
    // Add pulse animation
    element.style.transform = 'scale(1.1)';
    element.style.color = '#2563eb';
    
    // Animate number change
    const startTime = Date.now();
    const duration = 500;
    
    function updateNumber() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.round(oldValue + (newValue - oldValue) * progress);
        element.textContent = prefix + currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            // Reset animation
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 200);
        }
    }
    
    updateNumber();
}

// Bind to form changes
document.addEventListener('DOMContentLoaded', function() {
    // Add listeners to all form inputs
    const formInputs = document.querySelectorAll('#setup-form input[type="checkbox"], #setup-form select, .property-card');
    
    formInputs.forEach(input => {
        if (input.classList.contains('property-card')) {
            input.addEventListener('click', () => {
                setTimeout(updateTaskPreview, 100);
            });
        } else {
            input.addEventListener('change', updateTaskPreview);
        }
    });
    
    // Initial update
    setTimeout(updateTaskPreview, 500);
});

// ========================================
// ENHANCED TASK COMPLETION MODAL FUNCTIONS
// ========================================

// Storage for completion photos (as base64 strings for localStorage compatibility)
window.completionPhotos = [];

// Close completion modal
function closeCompletionModal() {
    const modal = document.getElementById('task-completion-modal');
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
    window.currentCompletingTask = null;
    window.completionPhotos = [];
}

function simpleTaskCompletion() {
    console.log('✅ Simple task completion triggered');
    if (!window.currentCompletingTask) {
        console.error('❌ No task selected for completion');
        return;
    }
    
    // Use the existing processTaskCompletion function
    const success = processTaskCompletion(window.currentCompletingTask.id, {});
    
    if (success !== false) {
        closeCompletionModal();
        console.log(`✅ "${window.currentCompletingTask.title}" completed successfully!`);
        alert(`✅ "${window.currentCompletingTask.title}" completed successfully!`);
    }
}

function enhancedTaskCompletion() {
    console.log('✅ Enhanced task completion triggered');
    if (!window.currentCompletingTask) {
        console.error('❌ No task selected for completion');
        return;
    }
    
    // Collect completion data
    const costInput = document.getElementById('completion-actual-cost');
    const notesInput = document.getElementById('completion-notes');
    
    const completionData = {
        actualCost: costInput ? parseFloat(costInput.value) || 0 : 0,
        notes: notesInput ? notesInput.value.trim() : '',
        photos: [...(window.completionPhotos || [])] // Clone the array
    };
    
    console.log('📝 Enhanced completion data:', completionData);
    
    // Process the completion using existing logic
    const success = processTaskCompletion(window.currentCompletingTask.id, completionData);
    
    if (success !== false) {
        closeCompletionModal();
        console.log(`✅ "${window.currentCompletingTask.title}" completed successfully!`);
        
        // Show success message with details
        let message = `✅ "${window.currentCompletingTask.title}" completed successfully!`;
        if (completionData.actualCost > 0) {
            message += `\n💰 Cost: $${completionData.actualCost.toFixed(2)}`;
        }
        if (completionData.photos.length > 0) {
            message += `\n📷 ${completionData.photos.length} photo(s) saved`;
        }
        alert(message);
    }
}

// Handle photo upload
function handlePhotoUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const previewContainer = document.getElementById('photo-preview');
    
    Array.from(files).forEach((file, index) => {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert(`Photo "${file.name}" is too large. Please use photos under 5MB.`);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoData = {
                name: file.name,
                data: e.target.result, // base64 string
                size: file.size,
                uploadedAt: new Date().toISOString()
            };
            
            window.completionPhotos.push(photoData);
            
            // Create preview element
            const previewDiv = document.createElement('div');
            previewDiv.className = 'flex items-center justify-between bg-gray-50 p-2 rounded border';
            previewDiv.innerHTML = `
                <div class="flex items-center">
                    <img src="${e.target.result}" class="w-12 h-12 object-cover rounded mr-3">
                    <div>
                        <div class="text-sm font-medium">${file.name}</div>
                        <div class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)}KB</div>
                    </div>
                </div>
                <button onclick="removeCompletionPhoto(${window.completionPhotos.length - 1})" 
                        class="text-red-500 hover:text-red-700 ml-2">×</button>
            `;
            previewContainer.appendChild(previewDiv);
        };
        reader.readAsDataURL(file);
    });
}

// Remove a completion photo
function removeCompletionPhoto(index) {
    if (index >= 0 && index < window.completionPhotos.length) {
        window.completionPhotos.splice(index, 1);
        
        // Rebuild preview
        const previewContainer = document.getElementById('photo-preview');
        previewContainer.innerHTML = '';
        
        window.completionPhotos.forEach((photo, i) => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'flex items-center justify-between bg-gray-50 p-2 rounded border';
            previewDiv.innerHTML = `
                <div class="flex items-center">
                    <img src="${photo.data}" class="w-12 h-12 object-cover rounded mr-3">
                    <div>
                        <div class="text-sm font-medium">${photo.name}</div>
                        <div class="text-xs text-gray-500">${(photo.size / 1024).toFixed(1)}KB</div>
                    </div>
                </div>
                <button onclick="removeCompletionPhoto(${i})" 
                        class="text-red-500 hover:text-red-700 ml-2">×</button>
            `;
            previewContainer.appendChild(previewDiv);
        });
    }
}

// Confirm and process task completion
function confirmTaskCompletion() {
    if (!window.currentCompletingTask) {
        console.error('❌ No task selected for completion');
        return;
    }
    
    // Get form data
    const actualCost = parseFloat(document.getElementById('completion-actual-cost').value) || 0;
    const notes = document.getElementById('completion-notes').value.trim();
    
    const completionData = {
        actualCost: actualCost,
        notes: notes,
        photos: [...window.completionPhotos] // Clone the array
    };
    
    console.log('📝 Completion data:', completionData);
    
    // Process the completion using existing logic
    const success = processTaskCompletion(window.currentCompletingTask.id, completionData);
    
    if (success !== false) {
        // Close the modal
        closeCompletionModal();
        
        // Show success message
        const message = `✅ "${window.currentCompletingTask.title}" completed successfully!`;
        console.log(message);
        
        // You could add a toast notification here
        alert(message);
    }
}

// Make modal functions available globally
window.closeCompletionModal = closeCompletionModal;
window.handlePhotoUpload = handlePhotoUpload;
window.removeCompletionPhoto = removeCompletionPhoto;
window.confirmTaskCompletion = confirmTaskCompletion;
window.simpleTaskCompletion = simpleTaskCompletion;
window.enhancedTaskCompletion = enhancedTaskCompletion;

// Show task completion history
function showTaskHistory(taskId) {
    console.log(`📋 Opening history for task ${taskId}...`);
    
    const task = window.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        alert('❌ Task not found');
        return;
    }
    
    const completionHistory = task.completionHistory || [];
    console.log(`📋 Found ${completionHistory.length} completion records for "${task.title}"`);
    
    // Remove any existing history modal
    const existingModal = document.getElementById('task-history-modal');
    if (existingModal && existingModal.parentNode) {
        existingModal.parentNode.removeChild(existingModal);
    }
    
    // Create history modal
    const historyModal = document.createElement('div');
    historyModal.id = 'task-history-modal';
    
    let historyHTML = '';
    if (completionHistory.length === 0) {
        historyHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">📋</div>
                <div class="text-lg font-medium">No History Yet</div>
                <div class="text-sm">Complete this task to start building maintenance history</div>
            </div>
        `;
    } else {
        historyHTML = completionHistory
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .map((record, index) => {
                const date = new Date(record.completedAt);
                const photosHtml = record.photos && record.photos.length > 0 ? 
                    `<div class="mt-2">
                        <div class="text-sm font-medium text-gray-700 mb-1">📷 Photos (${record.photos.length})</div>
                        <div class="flex gap-2 flex-wrap">
                            ${record.photos.map((photo, photoIndex) => 
                                `<img src="${photo.data}" class="w-16 h-16 object-cover rounded border cursor-pointer" 
                                      onclick="showPhotoModal('${photo.data}', '${photo.name}')"
                                      title="${photo.name}">`
                            ).join('')}
                        </div>
                    </div>` : '';
                
                return `
                    <div class="border border-gray-200 rounded-lg p-4 ${index === 0 ? 'bg-green-50' : 'bg-gray-50'}">
                        <div class="flex items-center justify-between mb-2">
                            <div class="font-medium text-gray-900">
                                ${index === 0 ? '✅ Most Recent' : `📋 Completion #${completionHistory.length - index}`}
                            </div>
                            <div class="text-sm text-gray-500">${date.toLocaleDateString()}</div>
                        </div>
                        ${record.actualCost > 0 ? `<div class="text-sm text-green-700 font-medium">💰 Cost: $${record.actualCost.toFixed(2)}</div>` : ''}
                        ${record.notes ? `<div class="text-sm text-gray-700 mt-1"><span class="font-medium">📝 Notes:</span> ${record.notes}</div>` : ''}
                        ${photosHtml}
                    </div>
                `;
            }).join('');
    }
    
    historyModal.innerHTML = `
        <div class="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto m-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold">📋 Maintenance History</h3>
                <button onclick="closeHistoryModal()" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>
            
            <!-- Task Info -->
            <div class="bg-blue-50 p-3 rounded-lg mb-4">
                <div class="font-medium text-blue-900">${task.title}</div>
                <div class="text-sm text-blue-700 mt-1">${task.category} • Every ${task.frequency} days</div>
            </div>
            
            <!-- History Records -->
            <div class="space-y-3">
                ${historyHTML}
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-200">
                <button onclick="closeHistoryModal()" class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium">
                    Close
                </button>
            </div>
        </div>
    `;
    
    // Set modal styles
    historyModal.style.position = 'fixed';
    historyModal.style.top = '0';
    historyModal.style.left = '0';
    historyModal.style.width = '100vw';
    historyModal.style.height = '100vh';
    historyModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    historyModal.style.zIndex = '999999';
    historyModal.style.display = 'flex';
    historyModal.style.alignItems = 'center';
    historyModal.style.justifyContent = 'center';
    historyModal.style.padding = '16px';
    
    document.body.appendChild(historyModal);
    console.log('✅ History modal created and displayed');
}

function closeHistoryModal() {
    const modal = document.getElementById('task-history-modal');
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

function showPhotoModal(photoData, photoName) {
    // Remove any existing photo modal
    const existingModal = document.getElementById('photo-view-modal');
    if (existingModal && existingModal.parentNode) {
        existingModal.parentNode.removeChild(existingModal);
    }
    
    const photoModal = document.createElement('div');
    photoModal.id = 'photo-view-modal';
    photoModal.innerHTML = `
        <div class="bg-white rounded-xl max-w-4xl max-h-[90vh] p-4 m-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold">${photoName}</h3>
                <button onclick="closePhotoModal()" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>
            <div class="flex justify-center">
                <img src="${photoData}" class="max-w-full max-h-[70vh] object-contain rounded">
            </div>
        </div>
    `;
    
    photoModal.style.position = 'fixed';
    photoModal.style.top = '0';
    photoModal.style.left = '0';
    photoModal.style.width = '100vw';
    photoModal.style.height = '100vh';
    photoModal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    photoModal.style.zIndex = '9999999';
    photoModal.style.display = 'flex';
    photoModal.style.alignItems = 'center';
    photoModal.style.justifyContent = 'center';
    photoModal.style.padding = '16px';
    
    document.body.appendChild(photoModal);
}

function closePhotoModal() {
    const modal = document.getElementById('photo-view-modal');
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

window.showTaskHistory = showTaskHistory;
window.closeHistoryModal = closeHistoryModal;
window.showPhotoModal = showPhotoModal;
window.closePhotoModal = closePhotoModal;

// DEBUG: Clear all modals and fix scrolling
window.clearAllModals = function() {
    console.log('🧹 Clearing all modals and fixing scrolling...');
    
    // Remove all possible modal elements
    const modalIds = [
        'task-completion-modal',
        'task-history-modal', 
        'photo-view-modal',
        'task-edit-modal',
        'date-picker-modal'
    ];
    
    modalIds.forEach(id => {
        const modal = document.getElementById(id);
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
            console.log(`✅ Removed ${id}`);
        }
    });
    
    // Remove ALL fixed/absolute positioned elements with high z-index
    const allElements = document.querySelectorAll('*');
    let removedCount = 0;
    allElements.forEach(el => {
        const computed = window.getComputedStyle(el);
        const zIndex = parseInt(computed.zIndex);
        const position = computed.position;
        
        if (zIndex > 1000 && (position === 'fixed' || position === 'absolute')) {
            console.log(`🔍 Found high z-index element:`, {
                tag: el.tagName,
                id: el.id,
                class: el.className,
                zIndex: zIndex,
                position: position,
                display: computed.display
            });
            
            // Remove it completely
            if (el.parentNode) {
                el.parentNode.removeChild(el);
                removedCount++;
                console.log(`🗑️ Removed blocking element`);
            }
        }
    });
    
    // Aggressive CSS reset for scrolling
    document.body.style.cssText = '';
    document.documentElement.style.cssText = '';
    document.body.style.overflow = 'auto !important';
    document.documentElement.style.overflow = 'auto !important';
    document.body.style.position = 'static';
    document.documentElement.style.position = 'static';
    document.body.style.height = 'auto';
    document.documentElement.style.height = 'auto';
    
    // Clear any event listeners that might be preventing scroll
    window.onscroll = null;
    window.ontouchmove = null;
    document.onscroll = null;
    document.ontouchmove = null;
    
    console.log(`✅ Removed ${removedCount} blocking elements, scrolling should work now`);
    console.log('🔄 Try scrolling now, or refresh page if still stuck');
};

// DEBUG: Test modal manually
window.testModal = function() {
    console.log('🧪 Testing modal manually...');
    const modal = document.getElementById('task-completion-modal');
    if (!modal) {
        console.error('❌ Modal not found!');
        return;
    }
    console.log('✅ Modal found, showing...');
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(255, 0, 0, 0.8)'; // Bright red background
    modal.style.zIndex = '999999'; // Much higher z-index
    modal.classList.remove('hidden');
    
    // Debug info
    const rect = modal.getBoundingClientRect();
    const computed = window.getComputedStyle(modal);
    console.log('🔍 Modal bounding rect:', rect);
    console.log('🔍 Modal parent:', modal.parentElement);
    console.log('🔍 Modal computed z-index:', computed.zIndex);
    console.log('🔍 Modal computed position:', computed.position);
    
    // Check if there are other elements with high z-index
    const allElements = document.querySelectorAll('*');
    const highZIndexElements = [];
    allElements.forEach(el => {
        const zIndex = parseInt(window.getComputedStyle(el).zIndex);
        if (zIndex > 1000) {
            highZIndexElements.push({element: el, zIndex: zIndex});
        }
    });
    console.log('🔍 Elements with high z-index:', highZIndexElements);
    
    console.log('🧪 Modal should now be visible with red background');
};

// DEBUG: Test reschedule system
window.testReschedule = function() {
    console.log('🧪 TESTING RESCHEDULE SYSTEM:');
    console.log('  rescheduleTaskFromDashboard:', typeof window.rescheduleTaskFromDashboard);
    console.log('  tasks available:', !!window.tasks);
    console.log('  tasks count:', window.tasks?.length || 0);
    
    if (window.tasks && window.tasks.length > 0) {
        console.log('  Testing with first task:', window.tasks[0].title);
        try {
            window.rescheduleTaskFromDashboard(window.tasks[0].id);
        } catch (error) {
            console.error('  ERROR:', error);
        }
    }
};

// ===== PLANNING & BUDGET FUNCTIONALITY =====

function renderPlanningView() {
    console.log('📊 Rendering planning view...');
    
    const planningItems = generatePlanningItems();
    
    // Sort items by priority and timeline
    const immediateItems = planningItems.filter(item => item.timeline === 'immediate');
    const upcomingItems = planningItems.filter(item => item.timeline === 'upcoming');
    const futureItems = planningItems.filter(item => item.timeline === 'future');
    
    // Update counts
    document.getElementById('immediate-count').textContent = immediateItems.length;
    document.getElementById('upcoming-count').textContent = upcomingItems.length;
    document.getElementById('future-count').textContent = futureItems.length;
    
    // Render items
    renderPlanningSection('immediate-items', immediateItems);
    renderPlanningSection('upcoming-items', upcomingItems);
    renderPlanningSection('future-items', futureItems);
}

function generatePlanningItems() {
    const items = [];
    const currentYear = new Date().getFullYear();
    
    // Check roof age (we collect this during onboarding)
    if (window.homeData?.features?.roofAge) {
        const roofAge = window.homeData.features.roofAge;
        if (roofAge >= 15) {
            items.push({
                type: 'roof',
                title: roofAge >= 20 ? 'Roof Replacement' : 'Roof Replacement Planning',
                description: roofAge >= 20 
                    ? `Your ${roofAge}-year-old roof is nearing end of life (typical lifespan: 20-25 years)`
                    : `Start budgeting for roof replacement - roof is ${roofAge} years old (typical lifespan: 20-25 years)`,
                cost: '$15,000 - $25,000',
                timeline: roofAge >= 20 ? 'immediate' : 'upcoming',
                priority: roofAge >= 20 ? 'high' : 'medium',
                icon: '🏠',
                isEstimate: false // Roof age is collected during onboarding
            });
        }
    }
    
    // Check appliances (use appliance tab data if available)
    if (window.appliances && window.appliances.length > 0) {
        window.appliances.forEach(appliance => {
            const age = appliance.age || 0;
            const typicalLifespan = getApplianceLifespan(appliance.type);
            
            if (age >= typicalLifespan - 2) {
                items.push({
                    type: 'appliance',
                    title: `${appliance.name} Replacement`,
                    description: `${appliance.type} is ${age} years old (typical lifespan: ${typicalLifespan} years)`,
                    cost: getApplianceReplacementCost(appliance.type),
                    timeline: age >= typicalLifespan ? 'immediate' : 'upcoming',
                    priority: age >= typicalLifespan ? 'high' : 'medium',
                    icon: '⚙️',
                    isEstimate: false // Appliance data is actual, not estimate
                });
            }
        });
    }
    
    // Check HVAC system age (use actual age if available, otherwise estimate from house age)
    const hvacAge = window.homeData?.systemAges?.hvac;
    if (hvacAge !== undefined) {
        // Use actual HVAC age
        if (hvacAge >= 15) {
            items.push({
                type: 'hvac',
                title: 'HVAC System Replacement',
                description: `HVAC system is ${hvacAge} years old (typical lifespan: 15-20 years)`,
                cost: '$8,000 - $15,000',
                timeline: hvacAge >= 18 ? 'immediate' : 'upcoming',
                priority: hvacAge >= 18 ? 'high' : 'medium',
                icon: '🌡️',
                isEstimate: false
            });
        }
    } else if (window.homeData?.yearBuilt) {
        // Fall back to house age estimate
        const houseAge = currentYear - window.homeData.yearBuilt;
        if (houseAge >= 18) {
            items.push({
                type: 'hvac',
                title: 'HVAC System Replacement',
                description: `HVAC system likely needs replacement (house built in ${window.homeData.yearBuilt})`,
                cost: '$8,000 - $15,000',
                timeline: houseAge >= 25 ? 'immediate' : 'upcoming',
                priority: houseAge >= 25 ? 'high' : 'medium',
                icon: '🌡️',
                isEstimate: true
            });
        }
    }
    
    // Check all major home systems
    const systemDefinitions = [
        {
            type: 'waterHeater',
            title: 'Water Heater Replacement',
            icon: '💧',
            lifespan: { min: 8, max: 12, immediate: 10 },
            cost: '$1,200 - $2,500'
        },
        {
            type: 'furnace',
            title: 'Furnace Replacement',
            icon: '🔥',
            lifespan: { min: 15, max: 20, immediate: 18 },
            cost: '$3,000 - $6,000'
        },
        {
            type: 'airConditioner',
            title: 'Air Conditioner Replacement',
            icon: '❄️',
            lifespan: { min: 12, max: 18, immediate: 15 },
            cost: '$3,000 - $7,000'
        },
        {
            type: 'dishwasher',
            title: 'Dishwasher Replacement',
            icon: '🍽️',
            lifespan: { min: 8, max: 12, immediate: 10 },
            cost: '$400 - $1,200'
        },
        {
            type: 'washingMachine',
            title: 'Washing Machine Replacement',
            icon: '👕',
            lifespan: { min: 10, max: 14, immediate: 12 },
            cost: '$500 - $1,500'
        },
        {
            type: 'dryer',
            title: 'Dryer Replacement',
            icon: '🌪️',
            lifespan: { min: 10, max: 15, immediate: 13 },
            cost: '$400 - $1,200'
        },
        {
            type: 'refrigerator',
            title: 'Refrigerator Replacement',
            icon: '🧊',
            lifespan: { min: 10, max: 15, immediate: 13 },
            cost: '$800 - $2,500'
        },
        {
            type: 'garbageDisposal',
            title: 'Garbage Disposal Replacement',
            icon: '🗑️',
            lifespan: { min: 8, max: 12, immediate: 10 },
            cost: '$150 - $400'
        },
        {
            type: 'windows',
            title: 'Window Replacement',
            icon: '🪟',
            lifespan: { min: 20, max: 30, immediate: 25 },
            cost: '$8,000 - $15,000'
        },
        {
            type: 'flooring',
            title: 'Flooring Replacement',
            icon: '🏠',
            lifespan: { min: 15, max: 25, immediate: 20 },
            cost: '$5,000 - $12,000'
        }
    ];

    systemDefinitions.forEach(system => {
        const actualAge = window.homeData?.systemAges?.[system.type];
        
        if (actualAge !== undefined) {
            // Use actual system age
            if (actualAge >= system.lifespan.min) {
                items.push({
                    type: system.type,
                    title: system.title,
                    description: `${system.title.replace(' Replacement', '')} is ${actualAge} years old (typical lifespan: ${system.lifespan.min}-${system.lifespan.max} years)`,
                    cost: system.cost,
                    timeline: actualAge >= system.lifespan.immediate ? 'immediate' : 'upcoming',
                    priority: actualAge >= system.lifespan.immediate ? 'high' : 'medium',
                    icon: system.icon,
                    isEstimate: false
                });
            }
        } else if (window.homeData?.yearBuilt) {
            // Fall back to house age estimate
            const houseAge = currentYear - window.homeData.yearBuilt;
            if (houseAge >= system.lifespan.min) {
                items.push({
                    type: system.type,
                    title: system.title,
                    description: `${system.title.replace(' Replacement', '')} likely needs replacement (house built in ${window.homeData.yearBuilt})`,
                    cost: system.cost,
                    timeline: houseAge >= system.lifespan.immediate ? 'immediate' : 'upcoming',
                    priority: houseAge >= system.lifespan.immediate ? 'high' : 'medium',
                    icon: system.icon,
                    isEstimate: true
                });
            }
        }
    });
    
    // Add some generic planning items if we have relevant features
    if (window.homeData?.features?.deck) {
        items.push({
            type: 'deck',
            title: 'Deck Refinishing',
            description: 'Wood decks typically need refinishing every 3-5 years',
            cost: '$800 - $1,500',
            timeline: 'upcoming',
            priority: 'low',
            icon: '🪵'
        });
    }
    
    if (window.homeData?.features?.driveway) {
        items.push({
            type: 'driveway',
            title: 'Driveway Resurfacing',
            description: 'Asphalt driveways need resurfacing every 10-15 years',
            cost: '$3,000 - $6,000',
            timeline: 'future',
            priority: 'low',
            icon: '🛣️'
        });
    }
    
    // Add custom planning items
    const customItems = window.homeData?.customPlanningItems || [];
    customItems.forEach(customItem => {
        items.push(customItem);
    });
    
    // Filter out hidden items
    const hiddenItems = window.homeData?.hiddenPlanningItems || [];
    const filteredItems = items.filter(item => {
        return !hiddenItems.some(hidden => 
            hidden.type === item.type && hidden.title === item.title
        );
    });
    
    console.log(`📊 Generated ${items.length} planning items (${customItems.length} custom), ${filteredItems.length} after filtering hidden items`);
    
    return filteredItems;
}

function renderPlanningSection(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No items in this category</p>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${item.icon}</span>
                    <div>
                        <h3 class="font-semibold text-gray-900">${item.title}</h3>
                        <p class="text-sm text-gray-600">${item.description}</p>
                        ${item.isEstimate ? `
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                📅 Estimate based on house age
                            </span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded-full ${getPriorityColors(item.priority)}">
                    ${item.priority.toUpperCase()}
                </span>
            </div>
            <div class="flex items-center justify-between mt-3">
                <span class="text-lg font-bold text-gray-900">${item.cost}</span>
                <div class="flex gap-2">
                    ${item.isEstimate ? `
                    <button onclick="updateSystemAge('${item.type}', '${item.title}')" 
                            class="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded text-xs font-medium transition-colors">
                        📝 Update Age
                    </button>
                    ` : ''}
                    <button onclick="deletePlanningItem('${item.type}', '${item.title}')" 
                            class="bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded text-xs font-medium transition-colors" 
                            title="Remove this item from planning">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getPriorityColors(priority) {
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getApplianceLifespan(type) {
    const lifespans = {
        'refrigerator': 12,
        'dishwasher': 10,
        'washing-machine': 11,
        'dryer': 13,
        'oven': 15,
        'microwave': 9,
        'water-heater': 10,
        'furnace': 18,
        'air-conditioner': 15
    };
    return lifespans[type] || 12;
}

function getApplianceReplacementCost(type) {
    const costs = {
        'refrigerator': '$800 - $2,500',
        'dishwasher': '$400 - $1,200',
        'washing-machine': '$500 - $1,500',
        'dryer': '$400 - $1,200',
        'oven': '$600 - $2,000',
        'microwave': '$100 - $400',
        'water-heater': '$800 - $1,800',
        'furnace': '$3,000 - $8,000',
        'air-conditioner': '$3,000 - $7,000'
    };
    return costs[type] || '$500 - $2,000';
}

// ===== SYSTEM AGE UPDATE FUNCTIONALITY =====

let currentSystemType = null;
let currentSystemTitle = null;

function updateSystemAge(systemType, systemTitle) {
    console.log(`📝 Opening system age update for: ${systemType} - ${systemTitle}`);
    
    currentSystemType = systemType;
    currentSystemTitle = systemTitle;
    
    // Update modal content
    document.getElementById('system-type-display').textContent = systemTitle;
    
    // Update description based on system type
    const systemInfo = {
        'hvac': 'HVAC systems typically last 15-20 years.',
        'waterHeater': 'Water heaters typically last 8-12 years.',
        'furnace': 'Furnaces typically last 15-20 years.',
        'airConditioner': 'Air conditioners typically last 12-18 years.',
        'dishwasher': 'Dishwashers typically last 8-12 years.',
        'washingMachine': 'Washing machines typically last 10-14 years.',
        'dryer': 'Dryers typically last 10-15 years.',
        'refrigerator': 'Refrigerators typically last 10-15 years.',
        'garbageDisposal': 'Garbage disposals typically last 8-12 years.',
        'windows': 'Windows typically last 20-30 years.',
        'flooring': 'Flooring typically lasts 15-25 years.'
    };
    
    const description = systemInfo[systemType] || 'Help us provide more accurate replacement planning.';
    document.getElementById('system-age-description').textContent = 
        `${description} Enter the actual age for more accurate planning.`;
    
    // Get current age if available
    const currentAge = window.homeData?.systemAges?.[systemType];
    const ageInput = document.getElementById('system-age-input');
    if (currentAge !== undefined) {
        ageInput.value = currentAge;
    } else {
        ageInput.value = '';
    }
    
    // Show modal
    document.getElementById('system-age-modal').classList.remove('hidden');
}

function closeSystemAgeModal() {
    document.getElementById('system-age-modal').classList.add('hidden');
    currentSystemType = null;
    currentSystemTitle = null;
}

function saveSystemAge() {
    const ageInput = document.getElementById('system-age-input');
    const selectedAge = parseInt(ageInput.value);
    
    if (isNaN(selectedAge) || selectedAge < 0) {
        alert('Please select a valid age for the system.');
        return;
    }
    
    // Initialize systemAges if it doesn't exist
    if (!window.homeData.systemAges) {
        window.homeData.systemAges = {};
    }
    
    // Save the system age
    window.homeData.systemAges[currentSystemType] = selectedAge;
    
    console.log(`✅ Saved ${currentSystemType} age: ${selectedAge} years`);
    
    // Save to Firebase
    if (window.currentUser) {
        saveUserDataToFirebaseEnhanced(window.currentUser.uid, window.homeData, window.tasks || [])
            .then(() => {
                console.log('✅ System age saved to Firebase');
                
                // Refresh planning view to show updated data
                renderPlanningView();
                
                // Show success message
                showToast(`✅ Updated ${currentSystemTitle} age to ${selectedAge} years`);
            })
            .catch((error) => {
                console.error('❌ Error saving system age:', error);
                showToast('❌ Error saving system age');
            });
    }
    
    // Close modal
    closeSystemAgeModal();
}

// Delete planning item function
function deletePlanningItem(itemType, itemTitle) {
    const confirmMessage = `Are you sure you want to remove "${itemTitle}" from your planning?\n\nThis will hide it from all planning calculations.`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    console.log('🗑️ Deleting planning item:', itemTitle, 'Type:', itemType);
    
    // Initialize hidden planning items if it doesn't exist
    if (!window.homeData.hiddenPlanningItems) {
        window.homeData.hiddenPlanningItems = [];
    }
    
    // Add to hidden items list
    const hiddenItem = {
        type: itemType,
        title: itemTitle,
        hiddenAt: new Date().toISOString()
    };
    
    window.homeData.hiddenPlanningItems.push(hiddenItem);
    
    // Save to Firebase
    if (window.currentUser) {
        const db = firebase.firestore();
        db.collection('users').doc(window.currentUser.uid).update({
            'features.hiddenPlanningItems': window.homeData.hiddenPlanningItems
        })
        .then(() => {
            console.log('✅ Hidden planning item saved to Firebase');
            
            // Refresh planning view
            renderPlanningView();
            
            // Show success message
            showToast(`✅ Removed "${itemTitle}" from planning`);
        })
        .catch((error) => {
            console.error('❌ Error saving hidden planning item:', error);
            showToast('❌ Error removing item from planning');
        });
    }
}

// Add Planning Item Modal Functions
function showAddPlanningItemModal() {
    document.getElementById('add-planning-item-modal').classList.remove('hidden');
}

function closeAddPlanningItemModal() {
    document.getElementById('add-planning-item-modal').classList.add('hidden');
    // Clear form
    document.getElementById('custom-item-name').value = '';
    document.getElementById('custom-item-description').value = '';
    document.getElementById('custom-item-cost').value = '';
    document.getElementById('custom-item-timeline').value = 'upcoming';
    document.getElementById('custom-item-priority').value = 'medium';
    document.getElementById('custom-item-icon').value = '';
}

function saveCustomPlanningItem() {
    // Get form values
    const name = document.getElementById('custom-item-name').value.trim();
    const description = document.getElementById('custom-item-description').value.trim();
    const cost = document.getElementById('custom-item-cost').value.trim();
    const timeline = document.getElementById('custom-item-timeline').value;
    const priority = document.getElementById('custom-item-priority').value;
    const icon = document.getElementById('custom-item-icon').value.trim() || '🏠';
    
    // Validate required fields
    if (!name) {
        alert('Please enter an item name');
        document.getElementById('custom-item-name').focus();
        return;
    }
    
    if (!description) {
        alert('Please enter a description');
        document.getElementById('custom-item-description').focus();
        return;
    }
    
    if (!cost) {
        alert('Please enter an estimated cost');
        document.getElementById('custom-item-cost').focus();
        return;
    }
    
    console.log('💾 Saving custom planning item:', name);
    
    // Create custom planning item
    const customItem = {
        type: 'custom',
        title: name,
        description: description,
        cost: cost,
        timeline: timeline,
        priority: priority,
        icon: icon,
        isCustom: true,
        isEstimate: false,
        createdAt: new Date().toISOString()
    };
    
    // Initialize custom planning items if it doesn't exist
    if (!window.homeData.customPlanningItems) {
        window.homeData.customPlanningItems = [];
    }
    
    // Add to custom items list
    window.homeData.customPlanningItems.push(customItem);
    
    // Save to Firebase
    if (window.currentUser) {
        const db = firebase.firestore();
        db.collection('users').doc(window.currentUser.uid).update({
            'features.customPlanningItems': window.homeData.customPlanningItems
        })
        .then(() => {
            console.log('✅ Custom planning item saved to Firebase');
            
            // Refresh planning view
            renderPlanningView();
            
            // Close modal
            closeAddPlanningItemModal();
            
            // Show success message
            showToast(`✅ Added "${name}" to planning`);
        })
        .catch((error) => {
            console.error('❌ Error saving custom planning item:', error);
            showToast('❌ Error adding item to planning');
        });
    }
}

function showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Fade out after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ===== CONTEXTUAL SHOPPING FUNCTIONALITY =====

// Professional service tasks that require contractors, not DIY supplies
const professionalServiceTasks = [
    'chimney inspection and cleaning',
    'chimney inspection', 
    'chimney cleaning',
    'inspect chimney',
    'clean chimney',
    'hvac maintenance',
    'furnace maintenance', 
    'air conditioning maintenance',
    'electrical inspection',
    'plumbing inspection',
    'roof inspection',
    'foundation inspection',
    'septic pumping',
    'septic inspection',
    'pest control',
    'termite inspection',
    'tree removal',
    'major appliance repair',
    'water heater maintenance',
    'sewer line inspection'
];

function isProfessionalServiceTask(taskTitle) {
    const title = taskTitle.toLowerCase();
    return professionalServiceTasks.some(serviceTask => 
        title.includes(serviceTask) || serviceTask.includes(title)
    );
}

function hasRelevantShopLinks(taskTitle, taskCategory) {
    // Don't show shop button for professional service tasks
    if (isProfessionalServiceTask(taskTitle)) {
        return false;
    }
    
    // Check if we have curated products for this task
    const searchTerms = generateShopSearchTerms(taskTitle, taskCategory);
    return searchTerms.length > 0;
}

function needsProfessionalService(taskTitle, taskCategory) {
    return isProfessionalServiceTask(taskTitle);
}

function openTaskShop(taskTitle, taskCategory) {
    console.log(`🛒 Opening shop for task: ${taskTitle} (${taskCategory})`);
    
    // Generate contextual search terms based on task title and category
    const searchTerms = generateShopSearchTerms(taskTitle, taskCategory);
    
    // Open single most relevant shopping link
    if (searchTerms.length > 0) {
        window.open(`https://www.amazon.com/s?k=${encodeURIComponent(searchTerms[0])}&ref=nb_sb_noss`, '_blank');
    }
}

function findProfessionalService(taskTitle, taskCategory) {
    console.log(`👷 Finding professional for task: ${taskTitle} (${taskCategory})`);
    
    // Create search terms for professional services
    const cleanTitle = taskTitle.toLowerCase()
        .replace(/inspect|check|test/g, '')
        .replace(/and/g, '')
        .trim();
    
    const locationSearch = window.homeData?.city || 'near me';
    const searchQuery = `${cleanTitle} service ${locationSearch}`;
    
    // Open Google search for local professionals
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
}

function generateShopSearchTerms(taskTitle, taskCategory) {
    const title = taskTitle.toLowerCase();
    
    // Curated product recommendations for specific tasks (single most relevant product)
    const curatedProducts = {
        // HVAC & Air Quality
        'clean mini-split filters': 'mini split cleaning kit coil cleaner',
        'clean mini split filters': 'mini split cleaning kit coil cleaner',
        'replace air filter': 'HVAC air filter 16x25x1',
        'clean dryer vent': 'dryer vent cleaning kit',
        'dryer vent cleaning': 'dryer vent cleaning kit',
        
        // Water Systems
        'replace sediment filter': 'whole house sediment filter 5 micron',
        'replace uv filter': 'UV water filter bulb replacement',
        'replace viqua sediment filter': 'whole house sediment filter 5 micron',
        'test water quality': 'home water test kit TDS',
        
        // Safety & Batteries
        'test smoke detector': '9V lithium batteries smoke detector',
        'replace smoke detector battery': '9V lithium battery 10 year',
        'smoke detector battery': '9V lithium battery 10 year',
        'test carbon monoxide detector': 'carbon monoxide detector battery',
        'carbon monoxide detector': 'carbon monoxide detector battery',
        
        // Cleaning & Maintenance
        'clean gutters': 'gutter cleaning tools scoop',
        'gutter cleaning': 'gutter cleaning tools scoop',
        'chimney inspection and cleaning': 'chimney cleaning kit brush rod',
        'chimney inspection': 'chimney cleaning kit brush rod',
        'chimney cleaning': 'chimney cleaning kit brush rod',
        'inspect chimney': 'chimney cleaning kit brush rod',
        'clean chimney': 'chimney cleaning kit brush rod',
        'caulk windows': 'exterior silicone caulk paintable',
        'weatherstrip doors': 'door weatherstrip seal foam',
        'clean outdoor furniture': 'outdoor furniture cleaner deck',
        
        // Seasonal & Exterior
        'winterize outdoor faucets': 'outdoor faucet covers insulated',
        'trim bushes': 'hedge trimmer cordless',
        'prune trees': 'pruning shears bypass',
        'mulch garden beds': 'organic mulch bags',
        
        // Septic & Plumbing
        'flush septic': 'septic tank treatment bacteria',
        'septic flush': 'septic tank treatment bacteria',
        'monthly septic pod flush': 'septic tank treatment bacteria',
        'septic pod flush': 'septic tank treatment bacteria',
        'lubricate garage door': 'garage door lubricant spray',
        'garage door lubrication': 'garage door lubricant spray',
        
        // Filters & Replacements
        'air filter': 'HVAC air filter',
        'furnace filter': 'furnace filter MERV 11',
        'water filter': 'water filter replacement cartridge',
        
        // General Cleaning
        'pressure wash': 'pressure washer detergent',
        'deck cleaning': 'deck cleaner brightener',
        'window cleaning': 'window cleaner squeegee'
    };
    
    // Check for exact matches first
    const exactMatch = curatedProducts[title];
    if (exactMatch) {
        return [exactMatch]; // Return as single-item array
    }
    
    // Check for partial matches with better keyword matching
    for (const [taskName, product] of Object.entries(curatedProducts)) {
        // Split task names into keywords for better matching
        const taskKeywords = taskName.split(' ');
        const titleWords = title.split(' ');
        
        // Check if key words match
        const hasKeywordMatch = taskKeywords.some(keyword => 
            titleWords.some(word => word.includes(keyword) || keyword.includes(word))
        );
        
        if (hasKeywordMatch || title.includes(taskName) || taskName.includes(title)) {
            return [product]; // Return as single-item array
        }
    }
    
    // Fallback to keyword-based searches for uncurated tasks
    if (title.includes('filter') && title.includes('air')) {
        return ['HVAC air filter'];
    }
    if (title.includes('battery')) {
        return ['9V batteries'];
    }
    if (title.includes('caulk')) {
        return ['exterior caulk'];
    }
    
    // Return empty array if no good matches - this will hide the shop button
    return [];
}

// ===== VENDOR DIRECTORY FUNCTIONALITY =====

// Global vendor data
let vendors = [];

// Load vendors from Firebase
async function loadVendors() {
    if (!window.auth?.currentUser) {
        console.log('⚠️ No authenticated user, skipping vendor load');
        // Still render empty state for testing
        renderVendors();
        return;
    }

    try {
        const userDoc = await window.db.collection('users').doc(window.auth.currentUser.uid).get();
        if (userDoc.exists && userDoc.data().vendors) {
            vendors = userDoc.data().vendors;
            console.log(`✅ Loaded ${vendors.length} vendors from Firebase`);
            renderVendors();
        } else {
            vendors = [];
            console.log('📂 No vendors found, starting with empty list');
            renderVendors();
        }
    } catch (error) {
        console.error('❌ Error loading vendors:', error);
        vendors = [];
        renderVendors();
    }
}

// Save vendors to Firebase
async function saveVendors() {
    if (!window.auth?.currentUser) {
        console.error('❌ No authenticated user for saving vendors');
        return;
    }

    try {
        await window.db.collection('users').doc(window.auth.currentUser.uid).update({
            vendors: vendors
        });
        console.log('✅ Vendors saved to Firebase');
    } catch (error) {
        console.error('❌ Error saving vendors:', error);
        throw error;
    }
}

// Render vendors in the list
function renderVendors() {
    const vendorsList = document.getElementById('vendors-list');
    if (!vendorsList) {
        console.error('❌ vendors-list element not found');
        return;
    }
    
    console.log(`🔄 Rendering ${vendors.length} vendors`);

    if (vendors.length === 0) {
        vendorsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-4">📞</div>
                <p class="text-lg font-medium mb-2">No vendors added yet</p>
                <p class="text-sm">Add your preferred service providers to keep their contact info handy</p>
            </div>
        `;
        return;
    }

    vendorsList.innerHTML = vendors.map(vendor => `
        <div class="bg-white rounded-lg shadow p-4 border">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h3 class="font-semibold text-lg text-gray-900">${vendor.name}</h3>
                    <p class="text-sm text-gray-600">${vendor.category} • Contact: ${vendor.contact}</p>
                </div>
                <button onclick="deleteVendor('${vendor.id}')" 
                        class="text-red-500 hover:text-red-700 p-1">
                    🗑️
                </button>
            </div>
            
            <div class="space-y-2 text-sm">
                ${vendor.phone ? `
                    <div class="flex items-center gap-2">
                        <span class="text-gray-500">📞</span>
                        <a href="tel:${vendor.phone}" class="text-blue-600 hover:underline">${vendor.phone}</a>
                    </div>
                ` : ''}
                
                ${vendor.email ? `
                    <div class="flex items-center gap-2">
                        <span class="text-gray-500">✉️</span>
                        <a href="mailto:${vendor.email}" class="text-blue-600 hover:underline">${vendor.email}</a>
                    </div>
                ` : ''}
                
                ${vendor.website ? `
                    <div class="flex items-center gap-2">
                        <span class="text-gray-500">🌐</span>
                        <a href="${vendor.website}" target="_blank" class="text-blue-600 hover:underline">Website</a>
                    </div>
                ` : ''}
                
                ${vendor.notes ? `
                    <div class="flex items-start gap-2">
                        <span class="text-gray-500">📝</span>
                        <span class="text-gray-700">${vendor.notes}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Show add vendor modal
function showAddVendorModal() {
    const modal = document.getElementById('add-vendor-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Clear form
        document.getElementById('vendor-name').value = '';
        document.getElementById('vendor-contact').value = '';
        document.getElementById('vendor-phone').value = '';
        document.getElementById('vendor-email').value = '';
        document.getElementById('vendor-website').value = '';
        document.getElementById('vendor-category').value = '';
        document.getElementById('vendor-notes').value = '';
        // Focus on name field
        document.getElementById('vendor-name').focus();
    }
}

// Close add vendor modal
function closeAddVendorModal() {
    const modal = document.getElementById('add-vendor-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Add vendor
async function addVendor() {
    const name = document.getElementById('vendor-name').value.trim();
    const contact = document.getElementById('vendor-contact').value.trim();
    const phone = document.getElementById('vendor-phone').value.trim();
    const email = document.getElementById('vendor-email').value.trim();
    const website = document.getElementById('vendor-website').value.trim();
    const category = document.getElementById('vendor-category').value.trim();
    const notes = document.getElementById('vendor-notes').value.trim();

    // Validation
    if (!name) {
        alert('❌ Vendor name is required');
        document.getElementById('vendor-name').focus();
        return;
    }

    if (!contact) {
        alert('❌ Contact person is required');
        document.getElementById('vendor-contact').focus();
        return;
    }

    if (!phone && !email && !website) {
        alert('❌ At least one contact method (phone, email, or website) is required');
        return;
    }

    // Email validation
    if (email && !email.includes('@')) {
        alert('❌ Please enter a valid email address');
        document.getElementById('vendor-email').focus();
        return;
    }

    // Website validation
    if (website && !website.startsWith('http')) {
        const confirmAdd = confirm('⚠️ Website should start with http:// or https://. Add anyway?');
        if (!confirmAdd) {
            document.getElementById('vendor-website').focus();
            return;
        }
    }

    try {
        // Create vendor object
        const vendor = {
            id: Date.now().toString(), // Simple ID generation
            name: name,
            contact: contact,
            category: category,
            phone: phone || null,
            email: email || null,
            website: website || null,
            notes: notes || null,
            dateAdded: new Date().toISOString()
        };

        // Add to vendors array
        vendors.push(vendor);

        // Save to Firebase
        await saveVendors();

        // Re-render vendors list
        renderVendors();

        // Close modal
        closeAddVendorModal();

        // Show success message
        showToast(`✅ Added ${name} to vendor directory`);

        console.log('✅ Vendor added successfully:', vendor);

    } catch (error) {
        console.error('❌ Error adding vendor:', error);
        showToast('❌ Error adding vendor');
    }
}

// Delete vendor
async function deleteVendor(vendorId) {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) {
        console.error('❌ Vendor not found:', vendorId);
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete "${vendor.name}"?\n\nThis action cannot be undone.`);
    if (!confirmDelete) return;

    try {
        // Remove from vendors array
        vendors = vendors.filter(v => v.id !== vendorId);

        // Save to Firebase
        await saveVendors();

        // Re-render vendors list
        renderVendors();

        // Show success message
        showToast(`✅ Deleted ${vendor.name} from vendor directory`);

        console.log('✅ Vendor deleted successfully:', vendor.name);

    } catch (error) {
        console.error('❌ Error deleting vendor:', error);
        showToast('❌ Error deleting vendor');
    }
}

// Make vendor functions globally available
window.loadVendors = loadVendors;
window.showAddVendorModal = showAddVendorModal;
window.closeAddVendorModal = closeAddVendorModal;
window.addVendor = addVendor;
window.deleteVendor = deleteVendor;
