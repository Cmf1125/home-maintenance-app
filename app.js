// The Home Keeper App - Clean Simple Version with All Fixes
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
    'General': { icon: '🔧', color: 'gray' }
};

// Make it globally available
window.categoryConfig = categoryConfig;

// Create maintenance plan
function createMaintenancePlan() {
    
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

        // Generate tasks
        generateTaskTemplates();
    

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
// Add these tasks to your generateTaskTemplates() function in app.js
// (after your existing tasks, before regional tasks)

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

// FIXED: Clean simple task categories without big button at bottom
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
   const safetyTasks = tasks.filter(t => t.category === 'Safety').length;
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
           <div class="text-lg font-bold text-red-600">${safetyTasks}</div>
            <div class="text-xs text-gray-600">Safety Tasks</div>
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
    
    // Get category info from global config
    const categoryInfo = window.categoryConfig?.[task.category] || { icon: '📋', color: 'gray' };
    
    return `
        <div class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-task-id="${task.id}">
            <div class="flex items-center gap-3 flex-1">
                <span class="text-sm">${priorityDot}</span>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-gray-900 text-sm">${task.title}</span>
                        <span class="px-2 py-1 rounded-full bg-${categoryInfo.color}-50 text-${categoryInfo.color}-700 text-xs font-medium">
                            ${categoryInfo.icon} ${task.category}
                        </span>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-gray-500">
                        <span>Every ${task.frequency} days</span>
                        ${task.cost > 0 ? `<span class="text-green-600 font-medium">$${task.cost}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="editTaskFromSetup(${task.id})" class="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded transition-colors" title="Edit task">
                    ✏️
                </button>
                <button onclick="deleteTaskDirect(${task.id})" class="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded transition-colors" title="Delete task">
                    🗑️
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
    alert(`🎉 Setup Complete!\n\n✅ ${successCount} tasks scheduled automatically\n📅 Your clean, simple maintenance plan is ready!\n\nCheck your dashboard and calendar now.`);
    
    console.log('🎉 CLEAN SIMPLE TASK SETUP COMPLETION SUCCESSFUL!');
}

// Enhanced showTab function with better error handling
// In your app.js, find the showTab function and make it look like this:

// FIXED: Enhanced showTab function that respects All Tasks view
function showTab(tabName) {
    console.log(`🔄 Switching to tab: ${tabName}`);

    // Show header on all main tabs (dashboard, calendar, etc.)
    if (['dashboard', 'calendar', 'appliances', 'documents'].includes(tabName)) {
        document.body.classList.remove('hide-header');
        document.body.classList.add('show-header');
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
    window.tasks = tasks;
    window.homeData = homeData;
    
    // Hide ALL views including All Tasks
    const dashboardView = document.getElementById('dashboard-view');
    const calendarView = document.getElementById('calendar-view');
    const documentsView = document.getElementById('documents-view');
    const appliancesView = document.getElementById('appliances-view');

    if (dashboardView) dashboardView.classList.add('hidden');
    if (calendarView) calendarView.classList.add('hidden');
    if (documentsView) documentsView.classList.add('hidden');
    if (appliancesView) appliancesView.classList.add('hidden');
    if (allTasksView) allTasksView.classList.add('hidden');
    
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
        
        // Enhanced dashboard initialization with fallback
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
        
    } else if (tabName === 'appliances') {
        // Show appliances view
        if (appliancesView) {
            appliancesView.classList.remove('hidden');
        }
        
        // Update tab styling  
        const appliancesTab = document.getElementById('tab-appliances');
        if (appliancesTab) {
            appliancesTab.classList.add('bg-blue-100', 'text-blue-700');
            appliancesTab.classList.remove('text-gray-600');
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
    }
    
    console.log(`✅ Switched to ${tabName} tab`);
}

// 🎯 ENHANCED: showAllTasks function with better back arrow handling
function showAllTasks() {
    console.log('📋 Switching to All Tasks view...');
    
    // 🎯 NEW: Show header for All Tasks view
    document.body.classList.remove('hide-header');
    document.body.classList.add('show-header');
    
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
            console.log('🔍 Looking for back button...', !!backButton);
            
            if (backButton) {
                backButton.classList.remove('hidden');
                backButton.style.display = 'flex';
                backButton.style.visibility = 'visible';
                backButton.style.opacity = '1';
                console.log('✅ Back arrow should now be visible!');
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
    
    console.log('✅ All Tasks view displayed with header and back arrow');
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
    
    // Enhanced All Tasks interface with annual cost
    allTasksView.innerHTML = `
        <div class="p-4">
            <div class="bg-white rounded-xl p-6 shadow-lg max-w-4xl mx-auto">
                <div class="text-center mb-6">
                    <div class="text-4xl mb-4">📋</div>
                    <h2 class="text-xl font-bold text-gray-900 mb-2">Manage All Tasks</h2>
                    <p class="text-gray-600 text-sm">Edit your maintenance tasks and view annual costs</p>
                </div>
                
                <!-- Simplified Complete Overview -->
<div class="bg-gray-50 p-4 rounded-lg mb-6">
    <h3 class="font-semibold text-gray-900 mb-3">📊 Complete Overview</h3>
    <div class="grid grid-cols-2 gap-6 text-sm max-w-md mx-auto">
        <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${totalTasks}</div>
            <div class="text-sm text-gray-600">Total Active Tasks</div>
        </div>
        <div class="text-center">
            <div class="text-2xl font-bold text-green-600">$${Math.round(totalCost)}</div>
            <div class="text-sm text-gray-600">Annual Cost</div>
        </div>
    </div>
</div>
                
                <!-- Add Custom Task Button -->
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900">Your Maintenance Tasks</h3>
                   <button onclick="event.stopPropagation(); window.closeDatePickerModal(); addTaskFromDashboard()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm touch-btn">
                        ➕ Add Task
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

    // Group active tasks by category (copying your existing logic)
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

    return Object.entries(tasksByCategory).map(([categoryId, tasks]) => {
        const categoryInfo = window.categoryConfig?.[categoryId] || { icon: '📋', color: 'gray' };
        
        // Calculate annual cost for this category
        const categoryCost = tasks.reduce((total, task) => {
            return total + (task.cost * (365 / task.frequency));
        }, 0);
        
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div class="p-4 border-b border-gray-100">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2 flex-1 min-w-0">
                            <span class="text-xl">${categoryInfo.icon}</span>
                            <span class="truncate">${categoryId}</span>
                            <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs whitespace-nowrap">
                                ${tasks.length} task${tasks.length !== 1 ? 's' : ''}
                            </span>
                        </h3>
                        <div class="text-right flex-shrink-0">
                            <div class="text-lg font-bold text-green-600">$${Math.round(categoryCost)}</div>
                            <div class="text-xs text-gray-500">annual cost</div>
                        </div>
                    </div>
                </div>
                <div class="p-4">
                    <div class="space-y-2">
                        ${tasks.map(task => renderAllTasksTaskItem(task)).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAllTasksTaskItem(task) {
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
        dueDateDisplay = `<span class="text-red-600 font-semibold">${Math.abs(daysUntilDue)}d overdue</span>`;
    } else if (daysUntilDue === 0) {
        dueDateDisplay = `<span class="text-orange-600 font-semibold">Due today</span>`;
    } else if (daysUntilDue <= 7) {
        dueDateDisplay = `<span class="text-orange-600">Due in ${daysUntilDue}d</span>`;
    } else {
        dueDateDisplay = `<span class="text-gray-700">Due ${taskDate.toLocaleDateString()}</span>`;
    }
    
    return `
        <div class="flex items-center justify-between py-3 px-4 ${statusClass} rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-3 flex-1">
                <span class="text-sm">${urgencyDot}</span>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-gray-900 text-sm">${task.title}</span>
                        ${isSafetyTask ? '<span class="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">🟠 Safety</span>' : ''}
                    </div>
                    <div class="flex items-center gap-3 text-xs text-gray-500">
                        <span>Every ${task.frequency} days</span>
                        ${task.cost > 0 ? `<span class="text-green-600 font-medium">$${task.cost}</span>` : ''}
                        <span>${dueDateDisplay}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="editTaskFromAllTasks(${task.id})" 
                        class="text-blue-600 hover:text-blue-800 text-sm px-3 py-2 rounded-lg transition-colors border border-blue-200 hover:bg-blue-50" 
                        title="Edit task">
                    ✏️ Edit
                </button>
            </div>
        </div>
    `;
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
        
        return result;
    };
    console.log('✅ TaskManager.save enhanced for All Tasks refresh');
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
    
    // Update home address
    const homeAddressElement = document.getElementById('home-address');
    if (homeAddressElement && window.homeData?.fullAddress) {
        homeAddressElement.textContent = `Managing maintenance for ${window.homeData.fullAddress}`;
    }
    
    // ADD THIS LINE: Set up click handlers for basic dashboard
    setupBasicDashboardClicks();
    
    console.log(`📊 Basic dashboard updated: ${overdueCount} overdue, ${weekCount} this week, ${totalTasks} total`);
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


// FIXED: Enhanced Add Task function for setup with forced timing
function addTaskFromSetup() {
    console.log('➕ Adding custom task from setup...');
    
    // Verify modal is available
    const modal = document.getElementById('task-edit-modal');
    if (!modal) {
        console.error('❌ Task edit modal not found');
        alert('❌ Cannot add task: Edit modal not available.');
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
        isTemplate: true
    };
    
    console.log('📋 New task created for setup:', newTask);
    
    // FORCE IMMEDIATE DISPLAY with timeout
    setTimeout(() => {
        if (window.TaskManager && window.TaskManager.openModal) {
            console.log('🚀 Opening modal with forced timing...');
            window.TaskManager.openModal(newTask, true);
            
            // FORCE the modal to show immediately
            const modal = document.getElementById('task-edit-modal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.remove('hidden');
                modal.style.zIndex = '99999';
                console.log('✅ Modal forced to display');
            }
        } else {
            console.error('❌ TaskManager not available');
            alert('❌ Task editor not available');
        }
    }, 100); // Small delay to ensure DOM is ready
}

// FIXED: Enhanced task completion with better calendar sync
function completeTask(taskId) {
    console.log(`✅ Completing task ${taskId}...`);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        alert('❌ Task not found');
        return;
    }

    const oldDueDate = task.dueDate ? new Date(task.dueDate) : new Date();
    
    // Mark as completed with timestamp
    task.lastCompleted = new Date();
    task.isCompleted = false; // Will be due again in the future
    
    // Calculate next due date from current due date + frequency
    const nextDueDate = new Date(oldDueDate.getTime() + task.frequency * 24 * 60 * 60 * 1000);
    
    // CRITICAL: Set both dueDate and nextDue for full compatibility
    task.dueDate = nextDueDate;
    task.nextDue = nextDueDate;
    
    console.log(`📅 Task "${task.title}" completed!`);
    console.log(`  Old due date: ${oldDueDate.toLocaleDateString()}`);
    console.log(`  Next due date: ${nextDueDate.toLocaleDateString()}`);
    console.log(`  Frequency: ${task.frequency} days`);
    console.log(`  Both dueDate and nextDue set: ${task.dueDate} | ${task.nextDue}`);
    
    // Save data immediately
    try {
        saveData();
        console.log('💾 Data saved after task completion');
    } catch (error) {
        console.error('❌ Error saving data after completion:', error);
        alert('❌ Error saving task completion');
        return;
    }
    
    // Update global references
    window.tasks = tasks;
    
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

// Add Task functionality for dashboard
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
        nextDue: dueDate, // Calendar compatibility
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
    
    // ENHANCED DEBUG: Refresh All Tasks view if it's currently visible
    console.log('🔍 DEBUG: Checking if All Tasks view needs refresh...');
    
    const allTasksView = document.getElementById('all-tasks-view');
    console.log('🔍 All Tasks view element found:', !!allTasksView);
    
    if (allTasksView) {
        const hasHiddenClass = allTasksView.classList.contains('hidden');
        const computedDisplay = window.getComputedStyle(allTasksView).display;
        const isVisible = !hasHiddenClass && computedDisplay !== 'none';
        
        console.log('🔍 All Tasks view has hidden class:', hasHiddenClass);
        console.log('🔍 All Tasks view computed display:', computedDisplay);
        console.log('🔍 All Tasks view is visible:', isVisible);
        console.log('🔍 renderAllTasksView function exists:', typeof renderAllTasksView === 'function');
        
        if (!hasHiddenClass) {
            console.log('🔄 Refreshing All Tasks view after adding task...');
            setTimeout(() => {
                if (typeof renderAllTasksView === 'function') {
                    renderAllTasksView();
                    console.log('✅ All Tasks view refreshed');
                } else {
                    console.error('❌ renderAllTasksView function not found!');
                }
            }, 100);
        } else {
            console.log('⏭️ All Tasks view is hidden, skipping refresh');
        }
    } else {
        console.error('❌ All Tasks view element not found!');
    }
    
    console.log('✅ New task added:', newTask);
    alert(`✅ Task "${title}" added successfully!`);
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
    console.log('🏠 The Home Keeper CLEAN SIMPLE VERSION WITH ALL FIXES initializing...');
    
    // Make well water function available globally ASAP
    window.toggleWellWaterOptions = toggleWellWaterOptions;
    
    // Make tasks and homeData available globally for other scripts
    window.tasks = tasks;
    window.homeData = homeData;
    
    if (hasExistingData()) {
        
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
        document.getElementById('setup-form').style.display = 'block';
        document.getElementById('task-setup').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }
    
   // ADD THIS LINE at the end:
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
