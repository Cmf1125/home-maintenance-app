// Marketplace Integration Module
// Handles product recommendations and affiliate links

console.log('🛍️ Loading Marketplace module...');

class MarketplaceManager {
    constructor() {
        // Amazon Associate ID - Ready to earn revenue!
        this.amazonAssociateId = 'thehomekeeper-20';
        this.productDatabase = this.initializeProductDatabase();
        console.log('🛒 Marketplace manager initialized');
    }

    /* 
    🔧 HOW TO UPDATE PRODUCT LINKS:
    
    1. Find real products on Amazon
    2. Copy ASIN from URL: amazon.com/dp/B08N5WRWNW → ASIN: B08N5WRWNW  
    3. Update the amazonASIN field in productDatabase below
    4. Update prices by checking current Amazon prices
    
    💡 TO MAKE IT APPLIANCE-SPECIFIC:
    
    1. Connect to appliances tab data (window.userAppliances)
    2. Use getSmartRecommendations() instead of getProductRecommendations()
    3. Add appliance details like: { brand: 'Carrier', model: 'ABC123', filterSize: '16x25x1' }
    
    Example: "Change HVAC filter" + User has "Carrier 16x25x1" → Show exact 16x25x1 filters
    */

    // Product database - maps task keywords to recommended products
    // 🎯 RESEARCH TRACKER: Update ASINs in asin-research-tracker.md as you find them
    initializeProductDatabase() {
        return {
            // HVAC & Air Quality - HIGH PRIORITY 🔥
            'hvac filter': {
                products: [
                    {
                        name: 'Filtrete 16x25x1 Air Filter (4-Pack)',
                        price: '~$39.58', // Approximate - prices change daily
                        rating: '4.8/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B005GZ89WU', // TODO: Research on Amazon
                        category: 'HVAC',
                        description: 'Captures dust, pollen, and allergens',
                        sizes: ['16x25x1', '20x25x1', '16x20x1'],
                        priority: 'HIGH', // Recurring purchase
                        estCommission: '$2-5'
                    },
                    {
                        name: 'Simply 20x20x1 Air Filter, Merv 8 (6-Pack)',
                        price: '~$35.07', // Approximate - prices change daily
                        rating: '4.7/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B07G2KT7FN', // TODO: Research on Amazon
                        category: 'HVAC',
                        description: 'Premium filtration for better air quality',
                        sizes: ['20x20x1'],
                        priority: 'HIGH',
                        estCommission: '$3-8'
                    }
                ]
            },
            'smoke detector': {
                products: [
                    {
                        name: 'SITERWELL Smoke Detector(2-Pack)',
                        price: '~$26.39', 
                        rating: '4.5/5',
                        amazonASIN: 'B0DJNGHB58', // Go to Amazon, find product, copy ASIN from URL
                        category: 'Safety',
                        description: 'Battery-powered photoelectric sensor'
                    },
                    {
                        name: 'First Alert Carbon Monoxide Detector',
                        price: '~$19.99',
                        rating: '4.6/5',
                        amazonASIN: 'B000N8OYXI',
                        category: 'Safety',
                        description: 'Long-life battery, no maintenance'
                    }
                ]
            },
            'gutter': {
                products: [
                    {
                        name: 'Telescoping Gutter Cleaning Wand',
                        price: '~$22.99',
                        rating: '4.0/5',
                        amazonASIN: 'B00CLOG5MK',
                        category: 'Exterior',
                        description: 'Telescoping wand and curved attachment'
                    },
                    {
                        name: 'Gutter Guards (208ft)',
                        price: '~$120.99',
                        rating: '4.7/5',
                        amazonASIN: 'B0CFV3FGH5',
                        category: 'Exterior',
                        description: 'Reduce future cleaning needs'
                    }
                ]
            },
            'water filter': {
                products: [
                    {
                        name: 'Viqua CMB-510-HF Sediment Filter 5 Micron 4.5" x 10"',
                        price: '~$25.99',
                        rating: '4.7/5',
                        amazonASIN: 'B00ZD30POA',
                        category: 'Water',
                        description: 'Removes sediment and rust'
                    },
                    {
                        name: 'Viqua S200RL-HO Replacement UV Lamp for VH200 System',
                        price: '~$93.67',
                        rating: '4.6/5',
                        amazonASIN: 'B002WDMHPO',
                        category: 'Water',
                        description: 'Kills bacteria and viruses'
                    }
                ]
            },
            'drain': {
                products: [
                    {
                        name: 'Green Gobbler Drain Cleaner (2-Pack)',
                        price: '~$19.98',
                        rating: '4.3/5',
                        amazonASIN: 'B085FS4JTD',
                        category: 'Plumbing',
                        description: 'Eco-friendly drain treatment'
                    },
                    {
                        name: 'Drain Snake Tool 25ft (3pk)',
                        price: '~$14.95',
                        rating: '4.3/5',
                        amazonASIN: 'B08FGH2V5Q',
                        category: 'Plumbing',
                        description: 'Clear tough clogs safely'
                    }
                ]
            },
            'caulk': {
                products: [
                    {
                        name: 'All Purpose Silicone Caulk, Clear, 10 fl oz',
                        price: '~$8.87',
                        rating: '4.7/5',
                        amazonASIN: 'B0B8QPH3RW',
                        category: 'General',
                        description: 'Waterproof bathroom and kitchen sealing'
                    },
                    {
                        name: 'Caulk Gun + Removal Tool Kit',
                        price: '~$15.99',
                        rating: '4.5/5',
                        amazonASIN: 'B09Q8JMQXY',
                        category: 'Tools',
                        description: 'Professional caulking kit'
                    }
                ]
            },
            'dryer vent': {
                products: [
                    {
                        name: 'Sealegend 37-Piece 33-Feet Dryer Vent Cleaner Kit',
                        price: '~$27.95',
                        rating: '4.5/5',
                        amazonASIN: 'B09HH2CVG5',
                        category: 'Safety',
                        description: 'Complete dryer vent cleaning system',
                        priority: 'HIGH', // Safety-related, annual maintenance
                        estCommission: '$2-4'
                    }
                ]
            },
            'battery': {
                products: [
                    {
                        name: 'Energizer AA/AAA Battery Variety Pack',
                        price: '~$19.63', // Approximate - prices change daily
                        rating: '4.8/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B087GMJXMC', // TODO: Research on Amazon
                        category: 'General',
                        description: 'Long-lasting batteries for smoke detectors and devices',
                        priority: 'HIGH', // Recurring need
                        estCommission: '$1-3'
                    }
                ]
            },
            'filter': {
                products: [
                    {
                        name: 'Aerostar 20x25x1 MERV 13 - 6 Count',
                        price: '~$64.95', // Approximate - prices change daily
                        rating: '4.6/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B01CR9JLDI', // TODO: Research on Amazon
                        category: 'HVAC',
                        description: 'Common sizes for HVAC and air purifier systems',
                        priority: 'HIGH',
                        estCommission: '$2-5'
                    }
                ]
            },
            'clean': {
                products: [
                    {
                        name: 'ARM & HAMMER Baking Soda 2.7lb',
                        price: '~$6.79', // Approximate - prices change daily
                        rating: '4.8/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0CJCXLDSP', // TODO: Research on Amazon
                        category: 'General',
                        description: 'All purpose for cleaning with vinegar',
                        priority: 'MEDIUM',
                        estCommission: '$2-4'
                    },
                     {
                        name: '30% Vinegar – Pure Concentrated Active-Force Vinegar for Cleaning 128 oz (2)',
                        price: '~$39.48', // Approximate - prices change daily
                        rating: '4.8/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0DNV967D8', // TODO: Research on Amazon
                        category: 'General',
                        description: 'All purpose for cleaning',
                        priority: 'MEDIUM',
                        estCommission: '$2-4'
                    },
                    {
                        name: 'Lysol All Purpose Cleaner Spray',
                        price: '~$3.97', // Approximate - prices change daily
                        rating: '4.8/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B00QIT9NDW', // TODO: Research on Amazon
                        category: 'General',
                        description: 'All purpose for cleaning',
                        priority: 'MEDIUM',
                        estCommission: '$2-4'
                    },
                    {
                        name: 'Microfiber cleaning cloths (50 pk)',
                        price: '~$15.99', // Approximate - prices change daily
                        rating: '4.4/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B07ZF9GTCJ', // TODO: Research on Amazon
                        category: 'General',
                        description: 'All purpose for cleaning',
                        priority: 'MEDIUM',
                        estCommission: '$2-4'
                    },
                    {
                        name: 'Clorox Disinfecting Wipes (3pk)',
                        price: '~$10.86', // Approximate - prices change daily
                        rating: '4.8/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B00HSC9F2C', // TODO: Research on Amazon
                        category: 'General',
                        description: 'All purpose for cleaning',
                        priority: 'MEDIUM',
                        estCommission: '$2-4'
                    },
                    {
                        name: 'Mr. Clean Magic Eraser 6pk',
                        price: '~$8.94', // Approximate - prices change daily
                        rating: '4.6/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0CP4GXQVY', // TODO: Research on Amazon
                        category: 'General',
                        description: 'All purpose for cleaning',
                        priority: 'MEDIUM',
                        estCommission: '$2-4'
                    },
                    {
                        name: 'Swiffer Sweep & Mop Deluxe',
                        price: '~$22.24', // Approximate - prices change daily
                        rating: '4.6/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0DWNDSNKD', // TODO: Research on Amazon
                        category: 'General',
                        description: 'All purpose for cleaning',
                        priority: 'MEDIUM',
                        estCommission: '$2-4'
                    },
                    {
                        name: 'Lysol Toilet Bowl Cleaner- Bleach Free',
                        price: '~$2.27', // Approximate - prices change daily
                        rating: '4.7/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0080DTSP2', // TODO: Research on Amazon
                        category: 'General',
                        description: 'All purpose for cleaning',
                        priority: 'MEDIUM',
                        estCommission: '$2-4'
                    }
                ]
            },
            'pipe': {
                products: [
                    {
                        name: 'Frost King HC3A Automatic Electric Heat Kit Heating Cables, 3 Feet, Black',
                        price: '~$21.16', // Approximate - prices change daily
                        rating: '4.6/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B000IKSQ8U', // TODO: Research on Amazon
                        category: 'Water Systems',
                        description: 'Prevent pipe freezing and improve efficiency',
                        priority: 'SEASONAL',
                        estCommission: '$2-3'
                    }
                ]
            },
            // HVAC Feature Products
            'mini split': {
                products: [
                    {
                        name: 'Mini Split Filter Bundle Compatible with Mitsubishi Electric MAC-2330FT-E and MAC-3000FT-E',
                        price: '~$36.99', // Approximate - prices change daily
                        rating: '4.4/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0DG61JQDT', // TODO: Research on Amazon
                        category: 'HVAC',
                        description: 'Compatible filters for most mini split systems',
                        priority: 'HIGH',
                        estCommission: '$2-4'
                    },
                    {
                        name: 'Mitsubishi Electric U01 A01 100 Nano Platinum Mini Split Filter 2-Pack',
                        price: '~$46.99', // Approximate - prices change daily
                        rating: '4.5/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B08LMKWGBZ', // TODO: Research on Amazon
                        category: 'HVAC',
                        description: 'Compatible filters for most mini split systems',
                        priority: 'HIGH',
                        estCommission: '$2-4'
                    }
                ]
            },
            'wall ac': {
                products: [
                    {
                        name: 'Filtrete 16x25x1 AC Furnace Air Filter, MERV 11 4 pack',
                        price: '~$39.58', // Approximate - prices change daily
                        rating: '4.8/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B005GZ89WU', // TODO: Research on Amazon
                        category: 'HVAC',
                        description: 'Multiple sizes for wall AC units',
                        priority: 'HIGH',
                        estCommission: '$1-3'
                    }
                ]
            },
            'baseboard': {
                products: [
                    {
                        name: 'Baseboard Heater Cleaning Kit',
                        price: '~$19.99', // Approximate - prices change daily
                        rating: '4.2/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0C89V894L', // TODO: Research on Amazon
                        category: 'HVAC',
                        description: 'Specialized tools for baseboard heater maintenance',
                        priority: 'MEDIUM',
                        estCommission: '$1-2'
                    }
                ]
            },
            // Water System Feature Products
            'well water': {
                products: [
                    {
                        name: 'Drinking Water Test Strips',
                        price: '~$14.98', // Approximate - prices change daily
                        rating: '4.3/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0D2RJ1LTM', // TODO: Research on Amazon
                        category: 'Water Systems',
                        description: 'Comprehensive water quality testing',
                        priority: 'HIGH',
                        estCommission: '$2-4'
                    }
                ]
            },
            'sediment filter': {
                products: [
                    {
                        name: 'Aquaboon 5 Micron 10 x 4.5 Well Water Sediment Filter Replacement 4 pack',
                        price: '~$38.07', // Approximate - prices change daily
                        rating: '4.6/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B01LZZA5S7', // TODO: Research on Amazon
                        category: 'Water Systems',
                        description: 'Standard 10 x 4.5 sediment filters',
                        priority: 'HIGH',
                        estCommission: '$2-4'
                    }
                ]
            },
            'uv filter': {
                products: [
                    {
                        name: 'UV Sterilizer Replacement Lamp',
                        price: '~$104.79', // Approximate - prices change daily
                        rating: '4.7/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0050OMXHO', // TODO: Research on Amazon
                        category: 'Water Systems',
                        description: 'Annual replacement UV lamp for water sterilization',
                        priority: 'HIGH',
                        estCommission: '$3-6'
                    }
                ]
            },
            'water softener': {
                products: [
                    {
                        name: 'Water Softener Salt (3 40lb bag)',
                        price: '~$52.75', // Approximate - prices change daily
                        rating: '4.7/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0DZQJNWZX', // TODO: Research on Amazon
                        category: 'Water Systems',
                        description: 'High purity salt for water softener systems',
                        priority: 'HIGH',
                        estCommission: '$0.50-1'
                    },
                    {
                        name: 'Water Softener Cleaner & Sanitizer',
                        price: '~$14.97', // Approximate - prices change daily
                        rating: '4.6/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B00HVX4PSM', // TODO: Research on Amazon
                        category: 'Water Systems',
                        description: 'Annual cleaning and sanitizing solution',
                        priority: 'MEDIUM',
                        estCommission: '$1-2'
                    }
                ]
            },
            'septic': {
                products: [
                    {
                        name: 'Septic Tank Treatment (12 months)',
                        price: '~$20.37', // Approximate - prices change daily
                        rating: '4.3/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B071WMZCFC', // TODO: Research on Amazon
                        category: 'Water Systems',
                        description: 'Biological septic system treatment',
                        priority: 'HIGH',
                        estCommission: '$2-4'
                    }
                ]
            },
            // Home Feature Products
            'chimney': {
                products: [
                    {
                        name: 'Chimney Cleaning Log 2 pk',
                        price: '~$24.99', // Approximate - prices change daily
                        rating: '4.5/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0CHN5JBV3', // TODO: Research on Amazon
                        category: 'Safety',
                        description: 'Reduces creosote buildup in chimneys',
                        priority: 'MEDIUM',
                        estCommission: '$1-2'
                    }
                ]
            },
            'pool': {
                products: [
                    {
                        name: 'Pool and Hot Tub Test Strips',
                        price: '~$9.99', // Approximate - prices change daily
                        rating: '4.5/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0C4L9D87N', // TODO: Research on Amazon
                        category: 'Pool & Spa',
                        description: 'Complete water testing solution',
                        priority: 'HIGH',
                        estCommission: '$1-3'
                    },
                    {
                        name: 'Pool Shock Treatment (6-Pack)',
                        price: '~$25.42', // Approximate - prices change daily
                        rating: '4.7/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B09R839DJ1', // TODO: Research on Amazon
                        category: 'Pool & Spa',
                        description: 'Essential pool sanitizer',
                        priority: 'HIGH',
                        estCommission: '$2-5'
                    }
                ]
            },
            'deck': {
                products: [
                    {
                        name: 'Deck Stain and Sealer (1 gallon)',
                        price: '~$34.99', // Approximate - prices change daily
                        rating: '4.6/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B06XG8Z6SJ', // TODO: Research on Amazon
                        category: 'Exterior',
                        description: 'Weather protection for wood decks',
                        priority: 'HIGH',
                        estCommission: '$3-6'
                    },
                    {
                        name: 'Algae Stain Remover Multi-Surface Outdoor Cleaner',
                        price: '~$40.54', // Approximate - prices change daily
                        rating: '4.3/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0DNGFBN8F', // TODO: Research on Amazon
                        category: 'Exterior',
                        description: 'Removes dirt, mildew, and old stain',
                        priority: 'MEDIUM',
                        estCommission: '$2-3'
                    },
                    {
                        name: 'Westinghouse ePX3100v Electric Pressure Washer',
                        price: '~$129.00', // Approximate - prices change daily
                        rating: '4.7/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0BX4KL2C8', // TODO: Research on Amazon
                        category: 'Exterior',
                        description: 'High powered washer for exterior surfaces',
                        priority: 'MEDIUM',
                        estCommission: '$2-3'
                    }
                ]
            },
        
             
            
            'garage': {
                products: [
                    {
                        name: '3-IN-ONE Garage Door Lubricant',
                        price: '~$7.98', // Approximate - prices change daily
                        rating: '4.7/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B001E5DLVO', // TODO: Research on Amazon
                        category: 'General',
                        description: 'Keep Garage Door Functioning Smoothly',
                        priority: 'MEDIUM',
                        estCommission: '$1-3'
                    }
                ]
            },
            'basement': {
                products: [
                    {
                        name: 'Basement Dehumidifier',
                        price: '~$149.99', // Approximate - prices change daily
                        rating: '4.5/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B0BVZ62Y3M', // TODO: Research on Amazon
                        category: 'General',
                        description: 'Prevent moisture and mold in basements',
                        priority: 'HIGH',
                        estCommission: '$8-15'
                    }
                ]
            },
            'driveway': {
                products: [
                    {
                        name: 'Concrete Crack Filler',
                        price: '$23.93',
                        rating: '4.8/5',
                        amazonASIN: 'B0DYDH19QJ',
                        category: 'Exterior',
                        description: 'Repair cracks in concrete',
                        priority: 'MEDIUM',
                        estCommission: '$1-3'
                    },
                    {
                        name: 'Industrial Cleaner and Degreaser for Driveway',
                        price: '$10.98',
                        rating: '4.7/5',
                        amazonASIN: 'B0000AXNO5',
                        category: 'Exterior',
                        description: 'Removes oil stains and dirt from driveways',
                        priority: 'MEDIUM',
                        estCommission: '$2-4'
                    },
                    {
                        name: 'Driveway Elastomeric Emulsion Crack Filler',
                        price: '$29.60',
                        rating: '4.2/5',
                        amazonASIN: 'B000DZBGDC',
                        category: 'Exterior',
                        description: 'Repair cracks in driveway',
                        priority: 'HIGH',
                        estCommission: '$5-12'
                    }
                ]
            }
        };
    }

    // Find products for a specific task
    getProductRecommendations(taskTitle, taskDescription = '', applianceDetails = null) {
        const searchText = `${taskTitle} ${taskDescription}`.toLowerCase();
        const recommendations = [];

        // Define priority matching - more specific keywords first
        const keywordPriority = [
            'dryer vent', 'mini split', 'wall ac', 'hvac filter', 'smoke detector', 
            'water filter', 'sediment filter', 'uv filter', 'water softener',
            'well water', 'septic', 'fireplace', 'chimney', 'pool', 'deck', 'garage', 
            'basement', 'baseboard', 'pipe', 'gutter', 'caulk', 'drain',
            'battery', 'filter'  // 'clean' removed - now only available in Shop tab
        ];

        // Search through keywords in priority order
        for (const keyword of keywordPriority) {
            if (this.productDatabase[keyword]) {
                // Handle flexible matching for hyphenated terms
                let isMatch = false;
                if (keyword === 'mini split') {
                    // Match both "mini split" and "mini-split"
                    isMatch = searchText.includes('mini split') || searchText.includes('mini-split');
                } else {
                    isMatch = searchText.includes(keyword);
                }
                
                if (isMatch) {
                    let products = this.productDatabase[keyword].products;
                    
                    // Filter by appliance-specific details if available
                    if (applianceDetails && keyword === 'hvac filter') {
                        products = this.getApplianceSpecificProducts(keyword, applianceDetails);
                    }
                    
                    recommendations.push({
                        keyword: keyword,
                        products: products
                    });
                    
                    // Stop after first match to avoid showing multiple categories
                    break;
                }
            }
        }

        return recommendations;
    }

    // Get appliance-specific product recommendations
    getApplianceSpecificProducts(category, applianceDetails) {
        if (category === 'hvac filter' && applianceDetails.filterSize) {
            // Filter products by the specific filter size needed
            const allProducts = this.productDatabase['hvac filter'].products;
            return allProducts.filter(product => 
                !product.sizes || product.sizes.includes(applianceDetails.filterSize)
            );
        }
        
        // Add more appliance-specific logic here for:
        // - Water filter cartridges by model
        // - Smoke detector batteries by type  
        // - Thermostat compatibility
        
        return this.productDatabase[category]?.products || [];
    }

    // Enhanced function to get recommendations with appliance context
    getSmartRecommendations(taskTitle, userAppliances = []) {
        // Look for matching appliances in user's home
        const relevantAppliances = userAppliances.filter(appliance => {
            return taskTitle.toLowerCase().includes(appliance.type.toLowerCase()) ||
                   taskTitle.toLowerCase().includes(appliance.brand.toLowerCase());
        });

        if (relevantAppliances.length > 0) {
            const appliance = relevantAppliances[0];
            return this.getProductRecommendations(taskTitle, '', {
                brand: appliance.brand,
                model: appliance.model,
                filterSize: appliance.filterSize,
                type: appliance.type
            });
        }

        // Fallback to basic recommendations
        return this.getProductRecommendations(taskTitle);
    }

    // General maintenance products for tasks without specific matches
    getGeneralMaintenanceProducts() {
        return [
            {
                name: 'Home Maintenance Tool Kit (130-Piece)',
                price: '~$49.99',
                rating: '4.5/5',
                amazonASIN: 'B07TOOLSXX',
                category: 'Tools',
                description: 'Complete toolkit for home repairs'
            },
            {
                name: 'WD-40 Multi-Use Product (3-Pack)',
                price: '~$12.99',
                rating: '4.7/5',
                amazonASIN: 'B00009WD40',
                category: 'General',
                description: 'Lubricates, displaces moisture, prevents rust'
            },
            {
                name: 'BLACK+DECKER 12V MAX Drill & Home Tool Kit, 60-Piece',
                price: '~$59.99',
                rating: '4.7/5',
                amazonASIN: 'B014QUP0FE',
                category: 'General',
                description: 'Basic Home Tool Kit'
            },
             {
                name: 'WORKPRO 32-Piece SAE & Metric Combination Wrenches Set',
                price: '~$37.59',
                rating: '4.6/5',
                amazonASIN: 'B0BN39LYJ5',
                category: 'General',
                description: 'Wrench Kit'
            },
            {
                name: 'Spackle for DryWall',
                price: '~$8.97',
                rating: '4.7/5',
                amazonASIN: 'B000BQPYJ0',
                category: 'General',
                description: 'Wall Repair'
            }
            
        ];
    }

    // Generate Amazon affiliate link - Direct product links for better tracking
    generateAmazonLink(asin, productName) {
        // Use direct product links for better affiliate tracking
        const baseUrl = 'https://www.amazon.com/dp/';
        
        // If ASIN needs research, fall back to search but warn in console
        if (asin.includes('RESEARCH_NEEDED') || asin.includes('REPLACE_WITH_REAL_ASIN')) {
            console.warn(`⚠️ RESEARCH NEEDED for: ${productName} (ASIN: ${asin})`);
            const searchTerm = encodeURIComponent(productName);
            return `https://www.amazon.com/s?k=${searchTerm}&tag=${this.amazonAssociateId}`;
        }
        
        return `${baseUrl}${asin}?tag=${this.amazonAssociateId}&linkCode=df0&hvadid=&hvpos=&hvnetw=g&hvrand=&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=&hvtargid=&ref=pd_sl_search`;
    }

    // Create HTML for product recommendations
    createProductHTML(recommendations, taskId) {
        if (!recommendations || recommendations.length === 0) return '';

        let html = '<div class="marketplace-section mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">';
        html += '<h4 class="text-sm font-semibold text-blue-900 mb-3">🛍️ Recommended Supplies</h4>';

        recommendations.forEach(rec => {
            rec.products.slice(0, 2).forEach(product => { // Show top 2 products
                html += `
                    <div class="product-card mb-3 p-3 bg-white rounded border border-gray-200 hover:shadow-md transition-shadow">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h5 class="font-medium text-gray-900 text-sm">${product.name}</h5>
                                <p class="text-xs text-gray-600 mt-1">${product.description}</p>
                                <div class="flex items-center mt-2 space-x-4">
                                    <span class="text-green-600 font-semibold">${product.price}</span>
                                    <span class="text-yellow-600 text-xs">⭐ ${product.rating}</span>
                                </div>
                            </div>
                            <button 
                                onclick="window.open('${window.marketplaceManager.generateAmazonLink(product.amazonASIN, product.name)}', '_blank')"
                                class="ml-3 bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-2 rounded-md transition-colors"
                            >
                                View on Amazon
                            </button>
                        </div>
                    </div>
                `;
            });
        });

        html += '</div>';
        return html;
    }

    // Simplified version for dashboard - just "View on Amazon" link
    createDashboardProductHTML(recommendations, taskId) {
        if (!recommendations || recommendations.length === 0) return '';

        const firstProduct = recommendations[0]?.products[0];
        if (!firstProduct) return '';

        return `
            <div class="marketplace-section mt-2">
                <button 
                    onclick="window.open('${window.marketplaceManager.generateAmazonLink(firstProduct.amazonASIN, firstProduct.name)}', '_blank')"
                    class="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                    🛍️ View supplies on Amazon
                </button>
            </div>
        `;
    }

    // Add marketplace integration to existing task card
    enhanceTaskWithMarketplace(taskElement, task) {
        const recommendations = this.getProductRecommendations(task.title, task.description);
        const marketplaceHTML = this.createProductHTML(recommendations, task.id);
        
        // Find a good place to insert the marketplace section
        const taskActions = taskElement.querySelector('.task-actions') || 
                           taskElement.querySelector('.flex.items-center:last-child');
        
        if (taskActions && marketplaceHTML) {
            // Create marketplace container
            const marketplaceDiv = document.createElement('div');
            marketplaceDiv.innerHTML = marketplaceHTML;
            
            // Insert after task actions
            taskActions.parentNode.insertBefore(marketplaceDiv.firstElementChild, taskActions.nextSibling);
        }
    }

    // Render the main marketplace tab
    renderMarketplace() {
        console.log('🛍️ Rendering marketplace...');
        
        // Populate HVAC products - show all HVAC related items
        this.populateCategory('hvac-products', ['hvac filter', 'filter', 'mini split', 'wall ac', 'baseboard']);
        
        // Populate Water products - show all water system items
        this.populateCategory('water-products', ['water filter', 'sediment filter', 'uv filter', 'water softener', 'well water', 'septic']);
        
        // Populate Safety products - show all safety items
        this.populateCategory('safety-products', ['smoke detector', 'dryer vent', 'fireplace', 'chimney']);
        
        // Populate Cleaning products - show all cleaning items
        this.populateCategory('cleaning-products', ['clean']);
        
        // Populate General Maintenance & Exterior products
        this.populateCategory('general-products', ['gutter', 'drain', 'caulk', 'battery', 'pipe', 'deck', 'garage', 'basement', 'pool', 'driveway']);
        
        // Populate Tool kits
        this.populateToolkits();
        
        // Populate Seasonal products
        this.populateSeasonalProducts();
        
        console.log('✅ Marketplace populated');
    }
    
    // Populate a specific category container
    populateCategory(containerId, keywords) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = '';
        keywords.forEach(keyword => {
            if (this.productDatabase[keyword]) {
                // Show ALL products for every category in the Shop tab
                this.productDatabase[keyword].products.forEach(product => {
                    html += this.createProductCardHTML(product);
                });
            }
        });
        
        container.innerHTML = html;
    }
    
    // Create compact product card for marketplace categories - clickable with clean pricing
    createProductCardHTML(product) {
        // Clean up price - remove ~ symbol
        const cleanPrice = product.price.replace(/~/g, '');
        
        // Get category-specific styling
        const categoryStyles = {
            'HVAC': {
                bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
                border: 'border-blue-200',
                hoverBg: 'hover:from-blue-100 hover:to-indigo-100',
                icon: '🌡️',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                textHover: 'group-hover:text-blue-800'
            },
            'Safety': {
                bg: 'bg-gradient-to-r from-red-50 to-pink-50',
                border: 'border-red-200',
                hoverBg: 'hover:from-red-100 hover:to-pink-100',
                icon: '⚠️',
                iconBg: 'bg-red-100',
                iconColor: 'text-red-600',
                textHover: 'group-hover:text-red-800'
            },
            'Water Systems': {
                bg: 'bg-gradient-to-r from-cyan-50 to-blue-50',
                border: 'border-cyan-200',
                hoverBg: 'hover:from-cyan-100 hover:to-blue-100',
                icon: '💧',
                iconBg: 'bg-cyan-100',
                iconColor: 'text-cyan-600',
                textHover: 'group-hover:text-cyan-800'
            },
            'Exterior': {
                bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
                border: 'border-green-200',
                hoverBg: 'hover:from-green-100 hover:to-emerald-100',
                icon: '🏠',
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600',
                textHover: 'group-hover:text-green-800'
            },
            'General': {
                bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
                border: 'border-gray-200',
                hoverBg: 'hover:from-gray-100 hover:to-slate-100',
                icon: '🔧',
                iconBg: 'bg-gray-100',
                iconColor: 'text-gray-600',
                textHover: 'group-hover:text-gray-800'
            }
        };
        
        const style = categoryStyles[product.category] || categoryStyles['General'];
        
        return `
            <div 
                onclick="window.open('${this.generateAmazonLink(product.amazonASIN, product.name)}', '_blank')"
                class="flex items-center gap-3 p-4 ${style.bg} ${style.hoverBg} ${style.border} rounded-lg border cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
            >
                <!-- Category Icon -->
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 ${style.iconBg} rounded-lg flex items-center justify-center">
                        <span class="text-lg">${style.icon}</span>
                    </div>
                </div>
                
                <!-- Product Info -->
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 truncate ${style.textHover} text-sm leading-tight">${product.name}</div>
                    <div class="flex items-center mt-1 space-x-3">
                        <span class="text-green-700 font-bold text-sm">${cleanPrice}</span>
                        <span class="text-amber-600 text-sm font-medium">⭐ ${product.rating}</span>
                        <span class="text-xs ${style.iconColor} font-medium px-2 py-1 ${style.iconBg} rounded-full">${product.category}</span>
                    </div>
                </div>
                
                <!-- Arrow -->
                <div class="flex-shrink-0 ${style.iconColor} ${style.textHover}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            </div>
        `;
    }
    
    // Populate tool kits section
    populateToolkits() {
        const container = document.getElementById('toolkit-products');
        if (!container) return;
        
        const toolkits = this.getGeneralMaintenanceProducts();
        let html = '';
        
        toolkits.forEach(product => {
            // Clean up price - remove ~ symbol
            const cleanPrice = product.price.replace(/~/g, '');
            
            html += `
                <div 
                    onclick="window.open('${this.generateAmazonLink(product.amazonASIN, product.name)}', '_blank')"
                    class="bg-white p-4 rounded-lg border border-orange-200 hover:border-orange-300 hover:shadow-md cursor-pointer transition-all group"
                >
                    <h4 class="font-semibold text-gray-900 mb-2 group-hover:text-orange-700">${product.name}</h4>
                    <p class="text-sm text-gray-600 mb-3">${product.description}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="text-green-600 font-bold">${cleanPrice}</span>
                            <span class="text-yellow-600 text-sm">⭐ ${product.rating}</span>
                        </div>
                        <div class="text-orange-600 group-hover:text-orange-700">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Populate seasonal products using real products from database
    populateSeasonalProducts() {
        const container = document.getElementById('seasonal-products');
        if (!container) return;
        
        const currentMonth = new Date().getMonth();
        let seasonalProducts = [];
        
        // Spring (Mar-May) - Gutter cleaning, HVAC prep, deck care
        if (currentMonth >= 2 && currentMonth <= 4) {
            seasonalProducts = [
                ...this.productDatabase['gutter']?.products.slice(0, 1) || [],
                ...this.productDatabase['hvac filter']?.products.slice(0, 1) || [],
                ...this.productDatabase['deck']?.products.slice(0, 1) || []
            ];
        }
        // Summer (Jun-Aug) - AC filters, pool maintenance
        else if (currentMonth >= 5 && currentMonth <= 7) {
            seasonalProducts = [
                ...this.productDatabase['hvac filter']?.products.slice(0, 1) || [],
                ...this.productDatabase['pool']?.products.slice(0, 2) || []
            ];
        }
        // Fall (Sep-Nov) - Heating prep, weatherproofing, chimney
        else if (currentMonth >= 8 && currentMonth <= 10) {
            seasonalProducts = [
                ...this.productDatabase['filter']?.products.slice(0, 1) || [],
                ...this.productDatabase['caulk']?.products.slice(0, 1) || [],
                ...this.productDatabase['fireplace']?.products.slice(0, 1) || []
            ];
        }
        // Winter (Dec-Feb) - Pipe protection, indoor air
        else {
            seasonalProducts = [
                ...this.productDatabase['pipe']?.products.slice(0, 1) || [],
                ...this.productDatabase['battery']?.products.slice(0, 1) || [],
                ...this.productDatabase['hvac filter']?.products.slice(0, 1) || []
            ];
        }
        
        let html = '';
        seasonalProducts.forEach(product => {
            // Clean up price - remove ~ symbol
            const cleanPrice = product.price.replace(/~/g, '');
            
            html += `
                <div 
                    onclick="window.open('${this.generateAmazonLink(product.amazonASIN, product.name)}', '_blank')"
                    class="bg-white p-3 rounded-lg border border-green-200 hover:border-green-300 hover:shadow-md cursor-pointer transition-all group"
                >
                    <h5 class="font-medium text-gray-900 mb-1 group-hover:text-green-700">${product.name}</h5>
                    <p class="text-xs text-gray-600 mb-2">${product.description}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-green-600 font-semibold text-sm">${cleanPrice}</span>
                        <div class="text-green-600 group-hover:text-green-700">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // Filter shop categories based on dropdown selection
    filterByCategory(selectedCategory) {
        console.log('🔍 Filtering shop by category:', selectedCategory);
        
        // Get all category sections
        const categories = [
            { id: 'hvac-category', value: 'hvac' },
            { id: 'water-category', value: 'water' },
            { id: 'safety-category', value: 'safety' },
            { id: 'cleaning-category', value: 'cleaning' },
            { id: 'general-category', value: 'general' },
            { id: 'toolkits-category', value: 'toolkits' },
            { id: 'seasonal-category', value: 'seasonal' }
        ];

        categories.forEach(category => {
            const element = document.getElementById(category.id);
            if (element) {
                if (selectedCategory === 'all' || selectedCategory === category.value) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            }
        });

        console.log(`✅ Shop filtered to show: ${selectedCategory === 'all' ? 'all categories' : selectedCategory}`);
    }
}

// Initialize marketplace manager
window.marketplaceManager = new MarketplaceManager();

// Global function for shop category filtering
function filterShopCategory() {
    const select = document.getElementById('shop-category-filter');
    if (select && window.marketplaceManager) {
        window.marketplaceManager.filterByCategory(select.value);
    }
}

console.log('✅ Marketplace module loaded successfully');
