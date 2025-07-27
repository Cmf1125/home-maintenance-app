// Casa Care App - Simplified Date System
// App data
let homeData = {};
let tasks = [];
let currentEditingTask = null;

// CRITICAL FIX 1: Well water dropdown - Make function available immediately
function toggleWellWaterOptions() {
    console.log('🔧 Toggling well water options...');
    const wellWaterCheckbox = document.getElementById('well-water');
    const wellWaterOptions = document.getElementById('well-water-options');
    
    if (wellWaterCheckbox && wellWaterOptions) {
        if (wellWaterCheckbox.checked) {
            wellWaterOptions.classList.remove('hidden');
            console.log('✅ Well water options shown');
        } else {
            wellWaterOptions.classList.add('hidden');
            // Uncheck all sub-options
            const subOptions = ['sediment-filter', 'uv-filter', 'water-softener', 'whole-house-filter'];
            subOptions.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.checked = false;
            });
            console.log('✅ Well water options hidden and cleared');
        }
    } else {
        console.warn('⚠️ Well water elements not found');
    }
}

// Make it globally available immediately - CRITICAL FIX
window.toggleWellWaterOptions = toggleWellWaterOptions;

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

// Create maintenance plan
function createMaintenancePlan() {
    console.log('🔧 Creating maintenance plan...');
    
    try {
        // Collect home data
        homeData = {
            address: document.getElementById('address')?.value || '123 Main Street',
            city: document.getElementById('city')?.value || 'Anytown',
            state: document.getElementById('state')?.value || 'NY',
            zipcode: document.getElementById('zipcode')?.value || '12345',
            propertyType: document.getElementById('property-type')?.value || 'single-family',
            yearBuilt: parseInt(document.getElementById('year-built')?.value) || 2000,
            sqft: parseInt(document.getElementById('sqft')?.value) || 2000
        };
        homeData.fullAddress = `${homeData.address}, ${homeData.city}, ${homeData.state} ${homeData.zipcode}`;

        // Collect features with null checks
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
            otherFeatures: document.getElementById('other-features')?.value || ''
        };

        console.log('🏠 Home data collected:', homeData);
        console.log('🏠 Features collected:', homeData.features);

        // Generate tasks
        generateTaskTemplates();
        console.log('📋 Tasks generated:', tasks.length);

        // Update global references immediately
        window.homeData = homeData;
        window.tasks = tasks;

        // Show task setup
        document.getElementById('setup-form').style.display = 'none';
        document.getElementById('task-setup').classList.remove('hidden');
        showTaskSetup();
        
        console.log('✅ Successfully moved to task setup screen');
        
    } catch (error) {
        console.error('❌ Error in createMaintenancePlan:', error);
        alert('❌ Error creating maintenance plan. Check console for details.');
    }
}

// Generate task templates
function generateTaskTemplates() {
    console.log('🔧 Starting task generation...');
    
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
            priority: 'high',
            description: 'Test all smoke and carbon monoxide detectors',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        },
        {
            id: id++,
            title: 'Dryer Vent Cleaning',
            category: 'General',
            frequency: 365,
            cost: 100,
            priority: 'medium',
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
                priority: 'medium',
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
                priority: 'low',
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
            priority: 'low',
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
                priority: 'high',
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
                priority: 'medium',
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
            priority: 'medium',
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
            priority: 'medium',
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
            priority: 'medium',
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
            priority: 'high',
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
            priority: 'high',
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
                priority: 'medium',
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
                priority: 'medium',
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
                priority: 'medium',
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
                priority: 'medium',
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
            priority: 'high',
            description: 'Professional septic pumping',
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
            priority: 'high',
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
            priority: 'medium',
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
            priority: 'high',
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
            priority: 'medium',
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
            priority: 'medium',
            description: 'Inspect basement for signs of moisture, leaks, or mold',
            dueDate: null,
            lastCompleted: null,
            isCompleted: false,
            isTemplate: true
        });
    }

    // Generate regional seasonal tasks
    if (homeData.state) {
        const climateRegion = getClimateRegion(homeData.state);
        const regionalTasks = generateRegionalTasks(climateRegion, id, hasExteriorResponsibility);
        tasks.push(...regionalTasks);
        console.log(`🌍 Added ${regionalTasks.length} regional tasks for ${climateRegion}`);
    }

    console.log('✅ Final task count:', tasks.length);
}

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
                    priority: 'medium',
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
                    priority: 'high',
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
                    priority: 'high',
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
                    priority: 'high',
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
                    priority: 'high',
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
                        priority: 'medium',
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
                    priority: 'medium',
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
    console.log('📋 Showing task setup screen...');
    
    // Update property summary
    updatePropertySummary();
    
    // Render task categories
    renderTaskCategories();
}

// Update property summary
function updatePropertySummary() {
    const taskSetupSummary = document.getElementById('task-setup-summary');
    if (!taskSetupSummary) {
        console.error('❌ Task setup summary element not found');
        return;
    }
    
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

    taskSetupSummary.innerHTML = `
        <div class="space-y-1 text-sm">
            <div><strong>🏠 Address:</strong> ${homeData.fullAddress}</div>
            <div><strong>🏢 Type:</strong> ${propertyTypeDisplay[homeData.propertyType]} • <strong>📐 Size:</strong> ${homeData.sqft?.toLocaleString()} sq ft • <strong>🏗️ Built:</strong> ${homeData.yearBuilt}</div>
            ${heatingCooling.length > 0 ? `<div><strong>🌡️ Heating/Cooling:</strong> ${heatingCooling.join(', ')}</div>` : ''}
            ${waterSewer.length > 0 ? `<div><strong>💧 Water/Sewer:</strong> ${waterSewer.join(', ')}</div>` : ''}
            ${otherFeatures.length > 0 ? `<div><strong>⚙️ Other Features:</strong> ${otherFeatures.join(', ')}</div>` : ''}
            <div><strong>🌍 Climate Region:</strong> ${regionDisplayNames[climateRegion]} (includes regional seasonal tasks)</div>
        </div>
    `;
}

// Render task categories
function renderTaskCategories() {
    const taskCategoriesContainer = document.getElementById('task-categories');
    const taskSummaryStats = document.getElementById('task-summary-stats');
    
    if (!taskCategoriesContainer || !taskSummaryStats) {
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

    // Render regular categories
    Object.entries(tasksByCategory).forEach(([category, categoryTasks]) => {
        const config = categoryConfig[category] || { icon: '📋', color: 'gray' };
        
        categoriesHTML += `
            <div class="task-category">
                <div class="bg-gray-50 p-4 border-b border-gray-100">
                    <div class="flex items-center justify-between">
                        <h4 class="font-semibold text-gray-900 flex items-center gap-2">
                            <span class="text-lg">${config.icon}</span>
                            ${category} (${categoryTasks.length} tasks)
                        </h4>
                        <span class="bg-${config.color}-100 text-${config.color}-700 px-2 py-1 rounded text-xs">
                            $${Math.round(categoryTasks.reduce((sum, task) => sum + (task.cost * (365 / task.frequency)), 0))} annual
                        </span>
                    </div>
                </div>
                <div class="p-4 space-y-3">
                    ${categoryTasks.map(task => renderTaskCard(task)).join('')}
                </div>
            </div>
        `;
    });

    // Render seasonal tasks
    const hasSeasonalTasks = Object.values(seasonalTasks).some(arr => arr.length > 0);
    
    if (hasSeasonalTasks) {
        categoriesHTML += `
            <div class="task-category">
                <div class="bg-gradient-to-r from-purple-100 to-pink-100 p-4 border-b border-gray-100">
                    <div class="flex items-center justify-between">
                        <h4 class="font-semibold text-gray-900 flex items-center gap-2">
                            <span class="text-lg">🌍</span>
                            Regional Seasonal Tasks (${tasks.filter(t => t.category === 'Seasonal').length} tasks)
                        </h4>
                        <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                            Climate-Specific
                        </span>
                    </div>
                </div>
                <div class="p-4 space-y-6">
        `;

        Object.entries(seasonalTasks).forEach(([season, seasonTasks]) => {
            if (seasonTasks.length > 0) {
                const config = seasonConfig[season];
                categoriesHTML += `
                    <div class="seasonal-${season} rounded-lg p-4">
                        <h5 class="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <span class="text-lg">${config.icon}</span>
                            ${config.name} Tasks (${seasonTasks.length})
                        </h5>
                        <div class="space-y-3">
                            ${seasonTasks.map(task => renderTaskCard(task)).join('')}
                        </div>
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

// SIMPLIFIED: Render individual task card with only Due Date
function renderTaskCard(task) {
    const suggestedDate = getSuggestedDueDate(task);
    const priorityClass = task.priority === 'high' ? 'bg-red-100 text-red-700' : 
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700';
    
    const isRegionalTask = task.category === 'Seasonal';
    const regionalBadge = isRegionalTask ? 
        `<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">🌍 Regional</span>` : '';
    
    return `
        <div class="border border-gray-200 rounded-lg p-4 ${isRegionalTask ? 'bg-purple-50' : ''}" data-task-id="${task.id}">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${task.title}</h4>
                    <p class="text-sm text-gray-600 mt-1">${task.description}</p>
                    <div class="flex items-center gap-3 mt-2 text-sm">
                        ${regionalBadge}
                        <span class="text-gray-600">Every ${task.frequency} days</span>
                        <span class="text-gray-600">$${task.cost}</span>
                        <span class="px-2 py-1 rounded text-xs ${priorityClass}">${task.priority} priority</span>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <button onclick="editTaskFromSetup(${task.id})" class="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 text-sm touch-btn">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteTaskDirect(${task.id})" class="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 text-sm touch-btn" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="w-full">
                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" id="due-date-${task.id}" value="${suggestedDate}" 
                       class="w-full p-2 border rounded text-sm"
                       onchange="updateTaskDueDate(${task.id}, this.value)">
            </div>
        </div>
    `;
}

// SIMPLIFIED: Get suggested due date for a task
function getSuggestedDueDate(task) {
    const today = new Date();
    
    if (task.season) {
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
        
        const seasonalDate = new Date(targetYear, targetMonth, 15);
        return seasonalDate.toISOString().split('T')[0];
    }
    
    // Regular task defaults
    if (task.priority === 'high') {
        const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return startDate.toISOString().split('T')[0];
    } else if (task.frequency <= 90) {
        const startDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
        return startDate.toISOString().split('T')[0];
    } else {
        const startDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        return startDate.toISOString().split('T')[0];
    }
}

// SIMPLIFIED: Update task due date
function updateTaskDueDate(taskId, dueDateStr) {
    console.log(`🔄 Updating due date for task ${taskId} to: ${dueDateStr}`);
    
    const task = tasks.find(t => t.id === taskId);
    if (task && dueDateStr) {
        // Just store the date string for now, will be converted to Date object in finishTaskSetup
        task.tempDueDate = dueDateStr;
        console.log(`  📅 Temp due date stored: ${dueDateStr}`);
    } else {
        console.warn(`  ⚠️ Could not update task ${taskId}: task=${!!task}, dueDate="${dueDateStr}"`);
    }
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

// SIMPLIFIED: Complete task setup
function finishTaskSetup() {
    console.log('🚀 Starting simplified task setup completion...');
    console.log(`📊 Processing ${tasks.length} tasks...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each template task
    tasks.forEach(task => {
        if (task.isTemplate) {
            try {
                console.log(`⚙️ Processing task: ${task.title}`);
                
                // Get the due date input
                const dueDateInput = document.getElementById(`due-date-${task.id}`);
                let dueDate;
                
                if (dueDateInput && dueDateInput.value) {
                    // Use the user-selected date
                    dueDate = new Date(dueDateInput.value + 'T12:00:00');
                    console.log(`  📅 Using CUSTOM due date: ${dueDate.toLocaleDateString()}`);
                } else if (task.tempDueDate) {
                    // Use stored temp date
                    dueDate = new Date(task.tempDueDate + 'T12:00:00');
                    console.log(`  📅 Using TEMP due date: ${dueDate.toLocaleDateString()}`);
                } else {
                    // Use suggested default date
                    const suggestedDate = getSuggestedDueDate(task);
                    dueDate = new Date(suggestedDate + 'T12:00:00');
                    console.log(`  📅 Using DEFAULT due date: ${dueDate.toLocaleDateString()}`);
                }
                
                // Validate the date
                if (isNaN(dueDate.getTime())) {
                    throw new Error(`Invalid due date for task ${task.title}`);
                }
                
                // Set the due date
                task.dueDate = dueDate;
                
                // CRITICAL: Set nextDue for calendar compatibility
                task.nextDue = dueDate;
                
                // Clean up template flag and temp date
                delete task.isTemplate;
                delete task.tempDueDate;
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
    
    // Detailed verification logging
    console.log('\n📋 FINAL TASK VERIFICATION:');
    tasksWithDates.forEach(task => {
        console.log(`  • "${task.title}" → Due: ${task.dueDate.toLocaleDateString()}`);
    });
    
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
    document.getElementById('task-setup').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('header-subtitle').textContent = homeData.fullAddress;
    
    // Initialize dashboard with error handling
    try {
        console.log('🏠 Initializing dashboard...');
        showTab('dashboard');
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        // Try basic fallback
        updateDashboard();
    }
    
    // Success message
    alert(`🎉 Setup Complete!\n\n✅ ${successCount} tasks scheduled successfully\n📅 Your personalized maintenance plan is ready!\n\nCheck your dashboard and calendar now.`);
    
    console.log('🎉 TASK SETUP COMPLETION SUCCESSFUL!');
}

// Enhanced showTab function with better error handling
function showTab(tabName) {
    console.log(`🔄 Switching to tab: ${tabName}`);
    
    // Ensure global references are current
    window.tasks = tasks;
    window.homeData = homeData;
    
   // Hide all views
const dashboardView = document.getElementById('dashboard-view');
const calendarView = document.getElementById('calendar-view');
const documentsView = document.getElementById('documents-view');

if (dashboardView) dashboardView.classList.add('hidden');
if (calendarView) calendarView.classList.add('hidden');
if (documentsView) documentsView.classList.add('hidden');
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'text-blue-700');
        btn.classList.add('text-gray-600');
    });
    
    if (tabName === 'dashboard') {
        // Show dashboard
        if (dashboardView) {
            dashboardView.classList.remove('hidden');
        }
        
        // Update tab styling
        const dashboardTab = document.getElementById('tab-dashboard');
        if (dashboardTab) {
            dashboardTab.classList.add('bg-blue-100', 'text-blue-700');
            dashboardTab.classList.remove('text-gray-600');
        }
        
        console.log('🏠 Initializing enhanced dashboard...');
        console.log(`📊 Tasks available: ${window.tasks ? window.tasks.length : 'undefined'}`);
        console.log(`📊 Tasks with due dates: ${window.tasks ? window.tasks.filter(t => t.dueDate).length : 'undefined'}`);
        
        // Enhanced dashboard initialization with fallback
        try {
            // Try to initialize enhanced dashboard
            if (typeof EnhancedDashboard !== 'undefined') {
                if (!window.enhancedDashboard) {
                    console.log('🆕 Creating new enhanced dashboard instance...');
                    window.enhancedDashboard = new EnhancedDashboard();
                } else {
                    console.log('🔄 Refreshing existing enhanced dashboard...');
                    window.enhancedDashboard.render();
                }
                console.log('✅ Enhanced dashboard ready');
            } else {
                console.warn('⚠️ EnhancedDashboard class not available, using basic dashboard');
                updateDashboard();
            }
        } catch (error) {
            console.error('❌ Error with enhanced dashboard, falling back to basic:', error);
            updateDashboard();
        }
        
    } else if (tabName === 'calendar') {
        // Show calendar
        if (calendarView) {
            calendarView.classList.remove('hidden');
        }
        
        // Update tab styling
        const calendarTab = document.getElementById('tab-calendar');
        if (calendarTab) {
            calendarTab.classList.add('bg-blue-100', 'text-blue-700');
            calendarTab.classList.remove('text-gray-600');
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
    }
}

// Basic dashboard fallback function
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
        'total-count': totalTasks,
        'annual-cost': '$' + Math.round(totalCost)
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // Update home address
    const homeAddressElement = document.getElementById('home-address');
    if (homeAddressElement && window.homeData) {
        homeAddressElement.textContent = `Managing maintenance for ${window.homeData.fullAddress}`;
    }
    
    console.log(`📊 Basic dashboard updated: ${overdueCount} overdue, ${weekCount} this week, ${totalTasks} total`);
}

// NEW: Close task edit modal (available for both setup and dashboard)
function closeTaskEditModal() {
    const modal = document.getElementById('task-edit-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentEditingTask = null;
    window.currentEditingTask = null;
    console.log('✅ Task edit modal closed (from app.js)');
}

// FIXED: Add missing function for task setup Add Task button
function addTaskFromSetup() {
    console.log('➕ Adding custom task from setup...');
    
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
        isTemplate: true // Important: mark as template so it gets processed correctly
    };
    
    // Open modal for new task
    openTaskEditModal(newTask, true);
}

// FIXED: Calendar sync - update complete task to ensure proper sync
function completeTask(taskId) {
    console.log(`✅ Completing task ${taskId}...`);
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const oldDueDate = task.dueDate ? new Date(task.dueDate) : new Date();
        
        task.lastCompleted = new Date();
        
        // Calculate next due date from current due date + frequency
        task.dueDate = new Date(oldDueDate.getTime() + task.frequency * 24 * 60 * 60 * 1000);
        task.isCompleted = false; // Will be due again in the future
        
        // CRITICAL: Update nextDue for calendar compatibility
        task.nextDue = task.dueDate;
        
        console.log(`📅 Task "${task.title}" completed!`);
        console.log(`  Old due date: ${oldDueDate.toLocaleDateString()}`);
        console.log(`  Next due date: ${task.dueDate.toLocaleDateString()}`);
        console.log(`  Frequency: ${task.frequency} days`);
        
        // Save data
        saveData();
        
        // Update global references
        window.tasks = tasks;
        
        // Refresh enhanced dashboard or fallback
        if (window.enhancedDashboard && typeof window.enhancedDashboard.render === 'function') {
            window.enhancedDashboard.render();
        } else {
            updateDashboard();
        }
        
        // Refresh calendar if it exists
        if (window.casaCareCalendar && typeof window.casaCareCalendar.refresh === 'function') {
            window.casaCareCalendar.refresh();
        }
        
        alert(`✅ Task "${task.title}" completed!\nNext due: ${task.dueDate.toLocaleDateString()}`);
    } else {
        console.error('❌ Task not found:', taskId);
    }
}

// NEW: Add Task functionality for dashboard
function addTaskFromDashboard() {
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
    const maxId = Math.max(...tasks.map(t => t.id), 0);
    
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
    
    tasks.push(newTask);
    window.tasks = tasks;
    
    // Save data
    saveData();
    
    // Refresh dashboard
    if (window.enhancedDashboard && typeof window.enhancedDashboard.render === 'function') {
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

// Utility functions
function showHomeInfo() {
    if (homeData.fullAddress) {
        alert(`🏠 Home Info\n\n${homeData.fullAddress}\nBuilt: ${homeData.yearBuilt} • ${homeData.sqft?.toLocaleString()} sq ft`);
    } else {
        alert('🏠 No home information set yet. Complete the setup to add your home details.');
    }
}

function clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        homeData = {};
        tasks = [];
        
        localStorage.removeItem('casaCareData');
        
        document.getElementById('setup-form').style.display = 'block';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('header-subtitle').textContent = 'Smart home maintenance';
        
        alert('✅ All data cleared. Starting fresh!');
    }
}

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

function saveData() {
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
        version: '2.1'
    };
    
    try {
        localStorage.setItem('casaCareData', JSON.stringify(data));
        console.log('✅ Data saved to browser storage with calendar compatibility');
    } catch (error) {
        console.error('❌ Failed to save data:', error);
        throw error; // Re-throw so caller can handle
    }
}

function loadData() {
    try {
        const savedData = localStorage.getItem('casaCareData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            homeData = data.homeData || {};
            tasks = data.tasks || [];
            
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
            return true;
        }
    } catch (error) {
        console.error('❌ Failed to load data:', error);
    }
    return false;
}

function hasExistingData() {
    return loadData() && homeData.fullAddress;
}

// Enhanced initialization
function initializeApp() {
    console.log('🏠 Casa Care SIMPLIFIED VERSION initializing...');
    
    // Make well water function available globally ASAP
    window.toggleWellWaterOptions = toggleWellWaterOptions;
    
    // Make tasks and homeData available globally for other scripts
    window.tasks = tasks;
    window.homeData = homeData;
    
    if (hasExistingData()) {
        console.log('👋 Existing data found, loading main app...');
        
        // Hide setup screens
        document.getElementById('setup-form').style.display = 'none';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Update header
        document.getElementById('header-subtitle').textContent = homeData.fullAddress;
        
        // Update global references
        window.tasks = tasks;
        window.homeData = homeData;
        
        // Show dashboard
        showTab('dashboard');
        
        console.log(`👋 Welcome back! Loaded ${tasks.length} tasks for ${homeData.fullAddress}`);
    } else {
        console.log('🆕 New user, showing setup form...');
        document.getElementById('setup-form').style.display = 'block';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }
    
    console.log('✅ Casa Care SIMPLIFIED VERSION initialized successfully!');
}

// FIXED: Add missing functions for task setup and proper modals

// Missing function: Edit task from setup
function editTaskFromSetup(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        return;
    }
    
    // Open the task edit modal
    openTaskEditModal(task);
}

// Missing function: Delete task directly
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

// NEW: Open task edit modal (UPDATED with category support)
function openTaskEditModal(task, isNewTask = false) {
    const modal = document.getElementById('task-edit-modal');
    if (!modal) {
        console.error('❌ Task edit modal not found');
        return;
    }
    
    // Store current editing task
    currentEditingTask = task;
    
    // Update modal title
    const modalTitle = document.getElementById('task-edit-title');
    if (modalTitle) {
        modalTitle.textContent = isNewTask ? 'Add New Task' : 'Edit Task';
    }
    
    // Fill form fields
    document.getElementById('edit-task-name').value = task.title || '';
    document.getElementById('edit-task-description').value = task.description || '';
    document.getElementById('edit-task-cost').value = task.cost || 0;
    document.getElementById('edit-task-frequency').value = task.frequency || 365;
    document.getElementById('edit-task-priority').value = task.priority || 'medium';
    
    // Handle category if field exists
    const categoryField = document.getElementById('edit-task-category');
    if (categoryField) {
        categoryField.value = task.category || 'General';
    }
    
    // Handle due date
    const dueDateInput = document.getElementById('edit-task-due-date');
    if (dueDateInput) {
        if (task.dueDate) {
            const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
            dueDateInput.value = dueDate.toISOString().split('T')[0];
        } else {
            dueDateInput.value = new Date().toISOString().split('T')[0];
        }
    }
    
    // Show/hide delete button
    const deleteButton = modal.querySelector('[onclick="deleteTaskFromEdit()"]');
    if (deleteButton) {
        deleteButton.style.display = isNewTask ? 'none' : 'block';
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Focus on task name
    setTimeout(() => document.getElementById('edit-task-name').focus(), 100);
}

// NEW: Close task edit modal
function closeTaskEditModal() {
    const modal = document.getElementById('task-edit-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentEditingTask = null;
}

// NEW: Save task from edit modal (UPDATED to handle setup vs dashboard context)
function saveTaskFromEdit() {
    console.log('💾 Saving task from edit modal...');
    
    if (!currentEditingTask && !window.currentEditingTask) {
        console.error('❌ No task being edited');
        alert('❌ No task selected for editing');
        return;
    }
    
    // Use either local or global currentEditingTask
    const editingTask = currentEditingTask || window.currentEditingTask;
    
    // Get form values
    const title = document.getElementById('edit-task-name').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();
    const cost = parseFloat(document.getElementById('edit-task-cost').value) || 0;
    const frequency = parseInt(document.getElementById('edit-task-frequency').value) || 365;
    const priority = document.getElementById('edit-task-priority').value;
    const category = document.getElementById('edit-task-category')?.value || 'General';
    const dueDateInput = document.getElementById('edit-task-due-date');
    
    console.log('📝 Form values collected:', { title, description, cost, frequency, priority, category });
    
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
        // Use current date if no date provided
        dueDate = new Date();
    }
    
    console.log('📅 Due date processed:', dueDate.toLocaleDateString());
    
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
        // Update global reference
        window.tasks = tasks;
        console.log('✅ New task added to array:', editingTask);
    } else {
        console.log('✅ Existing task updated:', editingTask);
    }
    
    // Determine if we're in setup or main app by checking which screen is visible
    const taskSetupVisible = !document.getElementById('task-setup').classList.contains('hidden');
    const mainAppVisible = !document.getElementById('main-app').classList.contains('hidden');
    
    console.log('🔍 Context check - Task setup visible:', taskSetupVisible, 'Main app visible:', mainAppVisible);
    
    if (taskSetupVisible) {
        // We're in task setup, re-render categories
        console.log('🔄 Re-rendering task categories for setup');
        renderTaskCategories();
    } else if (mainAppVisible) {
        // We're in main app, save and refresh
        console.log('💾 Saving data and refreshing dashboard');
        
        // Save data
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
        console.log('⚠️ Unknown context - assuming main app and saving');
        // Default behavior if we can't determine context
        saveData();
        if (window.enhancedDashboard) {
            window.enhancedDashboard.render();
        } else {
            updateDashboard();
        }
    }
    
    // Close modal
    closeTaskEditModal();
    
    alert(`✅ Task "${title}" ${isNewTask ? 'added' : 'updated'} successfully!`);
}

// NEW: Delete task from edit modal
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
window.createMaintenancePlan = createMaintenancePlan;
window.finishTaskSetup = finishTaskSetup;
window.goBackToHomeSetup = goBackToHomeSetup;
window.showTab = showTab;
window.completeTask = completeTask;
window.addTaskFromDashboard = addTaskFromDashboard;
window.showHomeInfo = showHomeInfo;
window.clearData = clearData;
window.exportData = exportData;

// Initialize app
document.addEventListener('DOMContentLoaded', initializeApp);
if (document.readyState !== 'loading') {
    initializeApp();
}

console.log('🏠 Casa Care SIMPLIFIED VERSION script loaded successfully!');
