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
                youtubeUrl: 'https://www.youtube.com/watch?v=LKmhqdq1YnI',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+clean+dryer+vent',
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
                    youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+clean+gutters',
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
                    youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+caulk+windows+doors',
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
                youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+check+window+seals',
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
                    youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+change+air+filter+hvac',
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
                    youtubeUrl: 'https://www.youtube.com/results?search_query=hvac+tune+up+maintenance',
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

        // ===== STRUCTURAL SYSTEMS =====
        
        // Roofing Systems
        if (homeData.features.compositeRoof) {
            tasks.push({
                id: id++,
                title: 'Inspect Composite Roof',
                category: 'Exterior',
                frequency: 365,
                cost: 200,
                priority: this.getAutoPriority('Inspect Composite Roof', 'Exterior'),
                description: 'Check shingles for damage, missing pieces, and granule loss',
                youtubeUrl: 'https://www.youtube.com/results?search_query=composite+roof+inspection+maintenance',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.metalRoof) {
            tasks.push({
                id: id++,
                title: 'Inspect Metal Roof',
                category: 'Exterior',
                frequency: 730,
                cost: 150,
                priority: this.getAutoPriority('Inspect Metal Roof', 'Exterior'),
                description: 'Check for rust, loose fasteners, and damaged panels',
                youtubeUrl: 'https://www.youtube.com/results?search_query=metal+roof+inspection+maintenance',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.tileRoof) {
            tasks.push({
                id: id++,
                title: 'Inspect Tile Roof',
                category: 'Exterior',
                frequency: 365,
                cost: 250,
                priority: this.getAutoPriority('Inspect Tile Roof', 'Exterior'),
                description: 'Check for cracked, broken, or displaced tiles',
                youtubeUrl: 'https://www.youtube.com/results?search_query=tile+roof+inspection+maintenance',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        // Siding Systems
        if (homeData.features.vinylSiding) {
            tasks.push({
                id: id++,
                title: 'Clean and Inspect Vinyl Siding',
                category: 'Exterior',
                frequency: 365,
                cost: 50,
                priority: this.getAutoPriority('Clean and Inspect Vinyl Siding', 'Exterior'),
                description: 'Pressure wash siding and check for cracks or loose panels',
                youtubeUrl: 'https://www.youtube.com/results?search_query=vinyl+siding+cleaning+maintenance',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.woodSiding) {
            tasks.push({
                id: id++,
                title: 'Stain/Paint Wood Siding',
                category: 'Exterior',
                frequency: 1095,
                cost: 800,
                priority: this.getAutoPriority('Stain/Paint Wood Siding', 'Exterior'),
                description: 'Inspect, prep, and re-stain or paint wood siding',
                youtubeUrl: 'https://www.youtube.com/results?search_query=wood+siding+staining+painting+maintenance',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.aluminumSiding) {
            tasks.push({
                id: id++,
                title: 'Clean and Inspect Aluminum Siding',
                category: 'Exterior',
                frequency: 365,
                cost: 75,
                priority: this.getAutoPriority('Clean and Inspect Aluminum Siding', 'Exterior'),
                description: 'Clean siding and check for dents, scratches, or oxidation',
                youtubeUrl: 'https://www.youtube.com/results?search_query=aluminum+siding+cleaning+maintenance',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.brickExterior) {
            tasks.push({
                id: id++,
                title: 'Inspect Brick and Mortar',
                category: 'Exterior',
                frequency: 730,
                cost: 300,
                priority: this.getAutoPriority('Inspect Brick and Mortar', 'Exterior'),
                description: 'Check mortar joints and repoint as needed',
                youtubeUrl: 'https://www.youtube.com/results?search_query=brick+mortar+inspection+repointing',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        // ===== EXTERIOR ELEMENTS =====
        
        if (homeData.features.gutters) {
            tasks.push({
                id: id++,
                title: 'Clean Gutters and Downspouts',
                category: 'Exterior',
                frequency: 180,
                cost: 150,
                priority: this.getAutoPriority('Clean Gutters and Downspouts', 'Exterior'),
                description: 'Remove debris and check for proper drainage',
                youtubeUrl: 'https://www.youtube.com/results?search_query=how+to+clean+gutters+downspouts',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.windows) {
            tasks.push({
                id: id++,
                title: 'Inspect and Clean Windows',
                category: 'Exterior',
                frequency: 180,
                cost: 100,
                priority: this.getAutoPriority('Inspect and Clean Windows', 'Exterior'),
                description: 'Clean windows and check seals, caulking, and hardware',
                youtubeUrl: 'https://www.youtube.com/results?search_query=window+cleaning+maintenance+inspection',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.exteriorDoors) {
            tasks.push({
                id: id++,
                title: 'Maintain Exterior Doors',
                category: 'Exterior',
                frequency: 365,
                cost: 50,
                priority: this.getAutoPriority('Maintain Exterior Doors', 'Exterior'),
                description: 'Check weatherstripping, lubricate hinges, and touch up paint',
                youtubeUrl: 'https://www.youtube.com/results?search_query=exterior+door+maintenance+weatherstripping',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        // ===== OUTDOOR FEATURES =====
        
        if (homeData.features.driveway) {
            tasks.push({
                id: id++,
                title: 'Seal and Repair Driveway',
                category: 'Exterior',
                frequency: 1095,
                cost: 400,
                priority: this.getAutoPriority('Seal and Repair Driveway', 'Exterior'),
                description: 'Fill cracks and apply sealcoat to protect asphalt',
                youtubeUrl: 'https://www.youtube.com/results?search_query=driveway+sealing+crack+repair',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.fence) {
            tasks.push({
                id: id++,
                title: 'Inspect and Maintain Fence',
                category: 'Exterior',
                frequency: 365,
                cost: 100,
                priority: this.getAutoPriority('Inspect and Maintain Fence', 'Exterior'),
                description: 'Check for damage, clean, and stain/paint as needed',
                youtubeUrl: 'https://www.youtube.com/results?search_query=fence+maintenance+inspection+staining',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.attic) {
            tasks.push({
                id: id++,
                title: 'Inspect Attic Insulation',
                category: 'General',
                frequency: 730,
                cost: 0,
                priority: this.getAutoPriority('Inspect Attic Insulation', 'General'),
                description: 'Check insulation levels and look for air leaks',
                youtubeUrl: 'https://www.youtube.com/results?search_query=attic+insulation+inspection+maintenance',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        // ===== WATER SYSTEMS =====
        
        if (homeData.features.municipalWater) {
            tasks.push({
                id: id++,
                title: 'Test Water Quality',
                category: 'Water Systems',
                frequency: 365,
                cost: 50,
                priority: this.getAutoPriority('Test Water Quality', 'Water Systems'),
                description: 'Test municipal water for chlorine levels and potential contaminants',
                youtubeUrl: 'https://www.youtube.com/results?search_query=home+water+quality+testing',
                dueDate: null,
                lastCompleted: null,
                isCompleted: false,
                isTemplate: true
            });
        }

        if (homeData.features.municipalSewer) {
            tasks.push({
                id: id++,
                title: 'Inspect Sewer Connection',
                category: 'Water Systems',
                frequency: 1095,
                cost: 200,
                priority: this.getAutoPriority('Inspect Sewer Connection', 'Water Systems'),
                description: 'Check for tree root intrusion and blockages',
                youtubeUrl: 'https://www.youtube.com/results?search_query=sewer+line+inspection+maintenance',
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
