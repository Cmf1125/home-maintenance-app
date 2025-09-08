// Task Generator Module - Handles all task creation and generation logic
// Extracted from app.js for better organization

console.log('🔄 Loading TaskGenerator module...');

class TaskGenerator {
    constructor() {
        console.log('🧠 Task Generator module initialized');
    }

    // ===== CLIMATE REGION DETECTION =====
    
    getClimateRegion(state) {
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

    // ===== PRIORITY DETECTION =====
    
    getAutoPriority(title, category) {
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

    // ===== CATEGORY CONFIGURATION =====
    
    getCategoryConfig() {
        return {
            'HVAC': { icon: '🌡️', color: 'blue' },
            'Water Systems': { icon: '💧', color: 'cyan' },
            'Exterior': { icon: '🏠', color: 'green' },
            'Pest Control': { icon: '🐛', color: 'orange' },
            'Safety': { icon: '⚠️', color: 'red' },
            'General': { icon: '🔧', color: 'gray' }
        };
    }

    // ===== MAIN TASK GENERATION =====
    
    createMaintenancePlan() {
        try {
            // Collect home data
            const homeData = {
                address: document.getElementById('address')?.value || '123 Main Street',
                city: document.getElementById('city')?.value || 'Anytown',
                state: document.getElementById('state')?.value || 'NY',
                zipcode: document.getElementById('zipcode')?.value || '12345',
                propertyType: document.getElementById('property-type')?.value || 'single-family',
                yearBuilt: parseInt(document.getElementById('year-built')?.value) || 2000,
                sqft: parseInt(document.getElementById('sqft')?.value) || 2000,
                hoaCost: parseFloat(document.getElementById('hoa-cost')?.value) || 0
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
            const tasks = this.generateTaskTemplates(homeData);

            return { homeData, tasks };
        } catch (error) {
            console.error('❌ Error in createMaintenancePlan:', error);
            throw error;
        }
    }

    generateTaskTemplates(homeData) {
        const tasks = [];
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
                title: 'Clean Dryer Vent',
                category: 'General',
                frequency: 365,
                cost: 100,
                priority: 'medium',
                description: 'Remove lint buildup from dryer vent (prevents house fires - super important!)',
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
                    title: 'Change Air Filter',
                    category: 'HVAC',
                    frequency: 90,
                    cost: 25,
                    priority: 'high',
                    description: 'Replace your air conditioning/heating filter (keeps air clean and system running efficiently)',
                    dueDate: null,
                    lastCompleted: null,
                    isCompleted: false,
                    isTemplate: true
                },
                {
                    id: id++,
                    title: 'AC/Heating Tune-Up',
                    category: 'HVAC',
                    frequency: 365,
                    cost: 150,
                    priority: 'medium',
                    description: 'Annual professional service to keep your heating and cooling system running smoothly',
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
                title: 'Septic System Maintenance',
                category: 'Water Systems',
                frequency: 1095, // 3 years
                cost: 400,
                priority: 'high',
                description: 'Professional septic pumping (required every 3 years to prevent backups and expensive repairs)',
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
                title: 'Chimney Cleaning & Safety Check',
                category: 'Safety',
                frequency: 365,
                cost: 300,
                priority: 'high',
                description: 'Professional chimney cleaning and inspection (prevents fires and carbon monoxide issues)',
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
            const climateRegion = this.getClimateRegion(homeData.state);
            const regionalTasks = this.generateRegionalTasks(climateRegion, id, hasExteriorResponsibility);
            tasks.push(...regionalTasks);
        }

        return tasks;
    }

    // ===== REGIONAL TASK GENERATION =====
    
    generateRegionalTasks(climateRegion, startingId, hasExteriorResponsibility) {
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
                        description: 'Test air conditioning system before summer',
                        dueDate: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    },
                    {
                        id: id++,
                        title: 'Winterize Pipes',
                        category: 'Seasonal',
                        frequency: 365,
                        cost: 0,
                        priority: 'high',
                        description: 'Insulate pipes and prepare for winter',
                        dueDate: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    }
                ];
                break;

            case 'SOUTHEAST_HUMID':
                regionalTasks = [
                    {
                        id: id++,
                        title: 'Check for Mold',
                        category: 'Seasonal',
                        frequency: 90,
                        cost: 0,
                        priority: 'medium',
                        description: 'Inspect for mold growth in humid areas',
                        dueDate: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    },
                    {
                        id: id++,
                        title: 'Dehumidifier Maintenance',
                        category: 'Seasonal',
                        frequency: 180,
                        cost: 50,
                        priority: 'medium',
                        description: 'Clean and maintain dehumidifier',
                        dueDate: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    }
                ];
                break;

            case 'SOUTHWEST_ARID':
                regionalTasks = [
                    {
                        id: id++,
                        title: 'Check for Cracks',
                        category: 'Seasonal',
                        frequency: 180,
                        cost: 0,
                        priority: 'medium',
                        description: 'Inspect foundation and walls for cracks from dry conditions',
                        dueDate: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    }
                ];
                break;

            default:
                // General tasks for other regions
                regionalTasks = [
                    {
                        id: id++,
                        title: 'Seasonal HVAC Check',
                        category: 'Seasonal',
                        frequency: 365,
                        cost: 0,
                        priority: 'medium',
                        description: 'Test heating and cooling systems',
                        dueDate: null,
                        lastCompleted: null,
                        isCompleted: false,
                        isTemplate: true
                    }
                ];
        }

        return regionalTasks;
    }
}

console.log('🔄 Creating TaskGenerator global instance...');

// Create a global instance
window.taskGenerator = new TaskGenerator();

console.log('✅ TaskGenerator global instance created:', !!window.taskGenerator);

// Make functions globally available
window.getClimateRegion = (state) => window.taskGenerator.getClimateRegion(state);
window.getAutoPriority = (title, category) => window.taskGenerator.getAutoPriority(title, category);
window.categoryConfig = window.taskGenerator.getCategoryConfig();

// Export for module systems (if needed later)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskGenerator;
}
