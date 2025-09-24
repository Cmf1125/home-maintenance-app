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

    // ===== YOUTUBE URL GENERATION =====
    
    generateYouTubeSearchUrl(title) {
        const searchQuery = title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '+') // Replace spaces with +
            .trim();
        const url = `https://www.youtube.com/results?search_query=how+to+${searchQuery}+maintenance`;
        console.log(`📺 Generated YouTube URL for "${title}": ${url}`);
        return url;
    }

    // ===== CATEGORY CONFIGURATION =====
    
    getCategoryConfig() {
        return {
            'HVAC': { icon: '🌡️', color: 'blue' },
            'Water Systems': { icon: '💧', color: 'cyan' },
            'Exterior': { icon: '🏠', color: 'green' },
            'Pest Control': { icon: '🐛', color: 'orange' },
            'Safety': { icon: '⚠️', color: 'red' },
            'Energy': { icon: '🔋', color: 'yellow' },
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
                // New outdoor features
                sprinklerSystem: document.getElementById('sprinkler-system')?.checked || false,
                outdoorLighting: document.getElementById('outdoor-lighting')?.checked || false,
                // New tech features
                solarPanels: document.getElementById('solar-panels')?.checked || false,
                backupGenerator: document.getElementById('backup-generator')?.checked || false,
                batteryStorage: document.getElementById('battery-storage')?.checked || false,
                smartThermostat: document.getElementById('smart-thermostat')?.checked || false,
                securitySystem: document.getElementById('security-system')?.checked || false,
                homeAutomation: document.getElementById('home-automation')?.checked || false,
                // Structural details
                roofAsphalt: document.getElementById('roof-asphalt')?.checked || false,
                roofMetal: document.getElementById('roof-metal')?.checked || false,
                roofTile: document.getElementById('roof-tile')?.checked || false,
                roofSlate: document.getElementById('roof-slate')?.checked || false,
                roofWood: document.getElementById('roof-wood')?.checked || false,
                roofFlat: document.getElementById('roof-flat')?.checked || false,
                roofAge: parseInt(document.getElementById('roof-age')?.value) || null,
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
                youtubeUrl: this.generateYouTubeSearchUrl('Test Smoke Detectors'),
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
                youtubeUrl: this.generateYouTubeSearchUrl('Clean Dryer Vent'),
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
                        youtubeUrl: this.generateYouTubeSearchUrl('Clean Gutters'),
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
                        youtubeUrl: this.generateYouTubeSearchUrl('Inspect Caulking'),
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
                youtubeUrl: this.generateYouTubeSearchUrl('Inspect Window Seals'),
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
                        youtubeUrl: this.generateYouTubeSearchUrl('Change Air Filter'),
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
                        youtubeUrl: this.generateYouTubeSearchUrl('AC Heating Tune-Up'),
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+clean+mini+split+filters',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+clean+wall+ac+filters',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+clean+electric+baseboard+heaters',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=boiler+annual+service+maintenance',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+test+well+water+quality',
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
                    youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+replace+sediment+filter',
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
                    youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+replace+uv+water+filter',
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
                    youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+refill+water+softener+salt',
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
                    youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+replace+whole+house+water+filter',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=septic+system+pumping+maintenance',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=septic+tank+treatment+pods',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=chimney+cleaning+inspection',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+stain+seal+deck',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=pool+opening+closing+maintenance',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=garage+door+maintenance+lubrication',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=basement+moisture+inspection',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        // New feature tasks
        if (homeData.features.sprinklerSystem) {
            tasks.push({
                id: id++,
                title: 'Sprinkler System Winterization',
                category: 'Exterior',
                frequency: 365,
                cost: 150,
                priority: 'medium',
                description: 'Winterize sprinkler system to prevent freezing damage',
                youtubeUrl: 'https://www.youtube.com/results?search_query=sprinkler+system+winterization',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }
        
        if (homeData.features.solarPanels) {
            tasks.push({
                id: id++,
                title: 'Solar Panel Cleaning',
                category: 'Energy',
                frequency: 180,
                cost: 200,
                priority: 'medium',
                description: 'Clean solar panels for optimal energy production',
                youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+clean+solar+panels',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }
        
        if (homeData.features.backupGenerator) {
            tasks.push({
                id: id++,
                title: 'Generator Maintenance',
                category: 'Energy',
                frequency: 180,
                cost: 150,
                priority: 'high',
                description: 'Test and service backup generator',
                youtubeUrl: 'https://www.youtube.com/results?search_query=generator+maintenance+testing',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }
        
        if (homeData.features.securitySystem) {
            tasks.push({
                id: id++,
                title: 'Security System Battery Check',
                category: 'Safety',
                frequency: 180,
                cost: 25,
                priority: 'high',
                description: 'Test security system batteries and sensors',
                youtubeUrl: 'https://www.youtube.com/results?search_query=security+system+battery+check',
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
                        youtubeUrl: 'https://www.youtube.com/results?search_query=air+conditioning+pre+summer+check',
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
                        youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+winterize+pipes',
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
                        youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+check+for+mold+home',
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
                        youtubeUrl: 'https://www.youtube.com/results?search_query=dehumidifier+maintenance+cleaning',
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
                        youtubeUrl: 'https://www.youtube.com/results?search_query=foundation+crack+inspection',
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
                        youtubeUrl: 'https://www.youtube.com/results?search_query=hvac+system+seasonal+check',
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
