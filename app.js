// App data
let homeData = {};
let tasks = [];
let currentEditingTask = null;

// Toggle well water sub-options
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
    }
}

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
            address: document.getElementById('address').value || '123 Main Street',
            city: document.getElementById('city').value || 'Anytown',
            state: document.getElementById('state').value || 'NY',
            zipcode: document.getElementById('zipcode').value || '12345',
            propertyType: document.getElementById('property-type').value || 'single-family',
            yearBuilt: parseInt(document.getElementById('year-built').value) || 2000,
            sqft: parseInt(document.getElementById('sqft').value) || 2000
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
            otherFeatures: document.getElementById('other-features')?.value || ''
        };

        console.log('🏠 Home data collected:', homeData);
        console.log('🏠 Features collected:', homeData.features);

        // Generate tasks
        generateTaskTemplates();
        console.log('📋 Tasks generated:', tasks.length);

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
            nextDue: null,
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
            nextDue: null,
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
                nextDue: null,
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
                nextDue: null,
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
            nextDue: null,
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
                nextDue: null,
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
                nextDue: null,
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
            nextDue: null,
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
            nextDue: null,
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
            nextDue: null,
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
            nextDue: null,
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
            nextDue: null,
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
                nextDue: null,
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
                nextDue: null,
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
                nextDue: null,
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
                nextDue: null,
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
            nextDue: null,
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
            nextDue: null,
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
            nextDue: null,
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
            nextDue: null,
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
            nextDue: null,
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
            nextDue: null,
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
                    nextDue: null,
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
                    nextDue: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                },
                {
                    id: id++,
                    title: 'Weather Strip Check',
                    category: 'Seasonal',
                    frequency: 365,
                    cost: 25,
                    priority: 'medium',
                    description: 'Check and replace weather stripping around doors and windows',
                    season: 'fall',
                    nextDue: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                },
                {
                    id: id++,
                    title: 'Winter Emergency Kit Check',
                    category: 'Seasonal',
                    frequency: 365,
                    cost: 50,
                    priority: 'medium',
                    description: 'Prepare emergency supplies for winter weather',
                    season: 'winter',
                    nextDue: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                }
            ];

            if (hasExteriorResponsibility) {
                regionalTasks.push(
                    {
                        id: id++,
                        title: 'Winterize Outdoor Pipes',
                        category: 'Seasonal',
                        frequency: 365,
                        cost: 50,
                        priority: 'high',
                        description: 'Shut off and drain outdoor water lines before first freeze',
                        season: 'fall',
                        nextDue: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    },
                    {
                        id: id++,
                        title: 'Check for Ice Dams',
                        category: 'Seasonal',
                        frequency: 365,
                        cost: 0,
                        priority: 'medium',
                        description: 'Inspect roof and gutters for ice dam formation',
                        season: 'winter',
                        nextDue: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    }
                );
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
                    nextDue: null,
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
                    nextDue: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                },
                {
                    id: id++,
                    title: 'Check for Mold/Humidity Issues',
                    category: 'Seasonal',
                    frequency: 365,
                    cost: 0,
                    priority: 'medium',
                    description: 'Inspect for mold growth due to high humidity',
                    season: 'summer',
                    nextDue: null,
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
                        nextDue: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    },
                    {
                        id: id++,
                        title: 'Fire Safety Check',
                        category: 'Seasonal',
                        frequency: 365,
                        cost: 0,
                        priority: 'high',
                        description: 'Review fire evacuation plan and emergency supplies',
                        season: 'summer',
                        nextDue: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    }
                ];

                if (hasExteriorResponsibility) {
                    regionalTasks.push({
                        id: id++,
                        title: 'Wildfire Risk Assessment',
                        category: 'Seasonal',
                        frequency: 365,
                        cost: 0,
                        priority: 'high',
                        description: 'Clear defensible space, check emergency supplies',
                        season: 'spring',
                        nextDue: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    });
                }
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
                    nextDue: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                },
                {
                    id: id++,
                    title: 'Fall Weather Prep',
                    category: 'Seasonal',
                    frequency: 365,
                    cost: 0,
                    priority: 'medium',
                    description: 'Prepare heating system for cooler weather',
                    season: 'fall',
                    nextDue: null,
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

// Render individual task card
function renderTaskCard(task) {
    const suggestedDate = getSuggestedStartDate(task);
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
            
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" id="start-date-${task.id}" value="${suggestedDate}" 
                           class="w-full p-2 border rounded text-sm"
                           onchange="updateTaskStartDate(${task.id}, this.value)">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Next Due</label>
                    <input type="text" id="next-due-${task.id}" value="${getNextDueFromStart(suggestedDate, task.frequency)}" 
                           class="w-full p-2 border rounded text-sm bg-gray-50" readonly>
                </div>
            </div>
        </div>
    `;
}

// Helper functions
function getSuggestedStartDate(task) {
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

function getNextDueFromStart(startDateStr, frequency) {
    if (!startDateStr) return '';
    const startDate = new Date(startDateStr);
    const nextDue = new Date(startDate.getTime() + frequency * 24 * 60 * 60 * 1000);
    return nextDue.toLocaleDateString();
}

function updateTaskStartDate(taskId, startDateStr) {
    const task = tasks.find(t => t.id === taskId);
    if (task && startDateStr) {
        const nextDueElement = document.getElementById(`next-due-${taskId}`);
        if (nextDueElement) {
            nextDueElement.value = getNextDueFromStart(startDateStr, task.frequency);
        }
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
        toggleWellWaterOptions();
    }
}

// Replace your finishTaskSetup function with this debugged version:

// Replace your finishTaskSetup and showTab functions with these fixed versions:

// Replace your finishTaskSetup function with this GUARANTEED working version:

function finishTaskSetup() {
    console.log('🚀 GUARANTEED WORKING TASK SETUP...');
    
    let processed = 0;
    
    // Process every single task - since debug shows all inputs exist and have values
    tasks.forEach(task => {
        if (task.isTemplate) {
            console.log(`Processing: ${task.title}`);
            
            // Get the start date - we KNOW from debug this exists and has a value
            const startDateInput = document.getElementById(`start-date-${task.id}`);
            let startDate;
            
            if (startDateInput && startDateInput.value) {
                // Use the custom date
                startDate = new Date(startDateInput.value + 'T12:00:00');
                console.log(`  Custom date: ${startDate.toLocaleDateString()}`);
            } else {
                // This shouldn't happen based on debug, but just in case
                startDate = new Date(Date.now() + (task.priority === 'high' ? 7 : 30) * 24 * 60 * 60 * 1000);
                console.log(`  Fallback date: ${startDate.toLocaleDateString()}`);
            }
            
            // Calculate due date
            task.nextDue = new Date(startDate.getTime() + task.frequency * 24 * 60 * 60 * 1000);
            console.log(`  Due date: ${task.nextDue.toLocaleDateString()}`);
            
            // Clean up
            delete task.isTemplate;
            task.isCompleted = false;
            
            processed++;
        }
    });
    
    console.log(`✅ Processed ${processed} tasks successfully!`);
    
    // Verify results
    const tasksWithDates = tasks.filter(t => t.nextDue);
    console.log(`✅ Verification: ${tasksWithDates.length} tasks now have due dates`);
    
    // Save immediately
    saveData();
    console.log('💾 Data saved');
    
    // Update globals immediately  
    window.tasks = tasks;
    window.homeData = homeData;
    console.log('🌐 Globals updated');
    
    // Switch to main app
    document.getElementById('task-setup').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('header-subtitle').textContent = homeData.fullAddress;
    
    // Initialize dashboard
    console.log('🏠 Initializing dashboard...');
    showTab('dashboard');
    
    // Success!
    alert(`🎉 Success! ${processed} tasks scheduled with your custom dates!\n\nCheck your dashboard and calendar now!`);
    
    console.log('🎉 TASK SETUP COMPLETE!');
}
    
    // Save and update global references
    saveData();
    window.tasks = tasks;
    window.homeData = homeData;
    
    // Show main app
    document.getElementById('task-setup').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('header-subtitle').textContent = homeData.fullAddress;
    
    // Initialize enhanced dashboard
    showTab('dashboard');
    console.log('🎉 Setup complete with enhanced dashboard!');
}

function showTab(tabName) {
    console.log(`🔄 Switching to tab: ${tabName}`);
    
    // Hide all views
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('calendar-view').classList.add('hidden');
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'text-blue-700');
        btn.classList.add('text-gray-600');
    });
    
    // Show selected view and update tab
    if (tabName === 'dashboard') {
        document.getElementById('dashboard-view').classList.remove('hidden');
        document.getElementById('tab-dashboard').classList.add('bg-blue-100', 'text-blue-700');
        document.getElementById('tab-dashboard').classList.remove('text-gray-600');
        
        // Make sure global references are up to date
        window.tasks = tasks;
        window.homeData = homeData;
        
        console.log('🏠 Initializing enhanced dashboard...');
        console.log('📊 Available tasks for dashboard:', window.tasks ? window.tasks.length : 'undefined');
        console.log('📊 Tasks with due dates:', window.tasks ? window.tasks.filter(t => t.nextDue).length : 'undefined');
        
        // Initialize or refresh enhanced dashboard
        if (!window.enhancedDashboard) {
            console.log('🆕 Creating new enhanced dashboard instance...');
            window.enhancedDashboard = new EnhancedDashboard();
        } else {
            console.log('🔄 Refreshing existing enhanced dashboard...');
            window.enhancedDashboard.render();
        }
        
        // Also call the basic updateDashboard as fallback
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        
    } else if (tabName === 'calendar') {
        document.getElementById('calendar-view').classList.remove('hidden');
        document.getElementById('tab-calendar').classList.add('bg-blue-100', 'text-blue-700');
        document.getElementById('tab-calendar').classList.remove('text-gray-600');
        
        // Update global task reference for calendar
        window.tasks = tasks;
        window.homeData = homeData;
        
        console.log('📅 Initializing calendar...');
        
        // Initialize calendar if not already done
        if (!window.casaCareCalendar) {
            // Add calendar HTML structure if not present
            const calendarView = document.getElementById('calendar-view');
            if (calendarView && !calendarView.hasChildNodes()) {
                calendarView.innerHTML = '<div class="calendar-container"></div>';
                // Calendar will be initialized by calendar.js
                if (window.CasaCareCalendar) {
                    window.casaCareCalendar = new CasaCareCalendar();
                }
            }
        } else {
            // Refresh calendar to show latest task data
            window.casaCareCalendar.refresh();
        }
    }
}

// Enhanced complete task function that works with enhanced dashboard
function completeTask(taskId) {
    console.log(`✅ Completing task ${taskId}...`);
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.lastCompleted = new Date();
        task.nextDue = new Date(Date.now() + task.frequency * 24 * 60 * 60 * 1000);
        task.isCompleted = false; // Will be due again in the future
        
        console.log(`📅 Task "${task.title}" completed! Next due: ${task.nextDue.toLocaleDateString()}`);
        
        // Save data
        saveData();
        
        // Update global references
        window.tasks = tasks;
        
        // Refresh enhanced dashboard
        if (window.enhancedDashboard) {
            console.log('🔄 Refreshing enhanced dashboard after task completion...');
            window.enhancedDashboard.render();
        } else {
            // Fallback to basic dashboard
            updateDashboard();
        }
        
        // Refresh calendar if it exists
        if (window.casaCareCalendar) {
            window.casaCareCalendar.refresh();
        }
        
        alert(`✅ Task "${task.title}" completed! Next due: ${task.nextDue.toLocaleDateString()}`);
    } else {
        console.error('❌ Task not found:', taskId);
    }
}

// Add this debugging function to check enhanced dashboard status
function debugEnhancedDashboard() {
    console.log('=== ENHANCED DASHBOARD DEBUG ===');
    console.log('Enhanced dashboard exists:', !!window.enhancedDashboard);
    console.log('EnhancedDashboard class available:', typeof EnhancedDashboard);
    console.log('Tasks available:', window.tasks ? window.tasks.length : 'undefined');
    console.log('Tasks with due dates:', window.tasks ? window.tasks.filter(t => t.nextDue).length : 'undefined');
    
    // Check for required HTML elements
    const requiredElements = [
        'dashboard-view', 'tasks-list', 'overdue-card', 'week-card', 
        'total-card', 'cost-card', 'overdue-count', 'week-count', 
        'total-count', 'annual-cost', 'tasks-list-title'
    ];
    
    console.log('Required HTML elements:');
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`  ${id}: ${element ? '✅' : '❌'}`);
    });
    
    return {
        dashboardExists: !!window.enhancedDashboard,
        classAvailable: typeof EnhancedDashboard !== 'undefined',
        tasksCount: window.tasks ? window.tasks.length : 0,
        tasksWithDates: window.tasks ? window.tasks.filter(t => t.nextDue).length : 0
    };
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
        version: '2.0'
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
    const data = { 
        homeData: homeData, 
        tasks: tasks,
        version: '2.0'
    };
    
    try {
        localStorage.setItem('casaCareData', JSON.stringify(data));
        console.log('✅ Data saved to browser storage');
    } catch (error) {
        console.error('❌ Failed to save data:', error);
    }
}

function loadData() {
    try {
        const savedData = localStorage.getItem('casaCareData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            homeData = data.homeData || {};
            tasks = data.tasks || [];
            
            // Restore dates
            tasks.forEach(task => {
                if (task.nextDue) task.nextDue = new Date(task.nextDue);
                if (task.lastCompleted) task.lastCompleted = new Date(task.lastCompleted);
            });
            
            console.log('✅ Data loaded from browser storage');
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

function initializeApp() {
    console.log('🏠 Casa Care working version loaded');
    
    // Make tasks and homeData available globally for calendar
    window.tasks = tasks;
    window.homeData = homeData;
    
    if (hasExistingData()) {
        document.getElementById('setup-form').style.display = 'none';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        document.getElementById('header-subtitle').textContent = homeData.fullAddress;
        
        // Update global references
        window.tasks = tasks;
        window.homeData = homeData;
        
        showTab('dashboard');
        
        console.log('👋 Welcome back! Loaded existing home data');
    } else {
        document.getElementById('setup-form').style.display = 'block';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
        console.log('🆕 New user - showing setup form');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', initializeApp);
if (document.readyState !== 'loading') {
    initializeApp();
}

console.log('🏠 Casa Care working version script loaded successfully!');
