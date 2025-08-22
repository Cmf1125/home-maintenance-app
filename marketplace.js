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
                        name: 'Gutter Cleaning Tool Kit',
                        price: '~$29.99',
                        rating: '4.3/5',
                        amazonASIN: 'B07XQZQZQZ',
                        category: 'Exterior',
                        description: 'Telescoping wand and curved attachment'
                    },
                    {
                        name: 'Gutter Guards (200ft)',
                        price: '~$89.99',
                        rating: '4.2/5',
                        amazonASIN: 'B08XQZQZQZ',
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
                        price: '~$16.99',
                        rating: '4.3/5',
                        amazonASIN: 'B0154IFRWY',
                        category: 'Plumbing',
                        description: 'Eco-friendly drain treatment'
                    },
                    {
                        name: 'Drain Snake Tool 25ft',
                        price: '~$12.99',
                        rating: '4.1/5',
                        amazonASIN: 'B07DRAINXX',
                        category: 'Plumbing',
                        description: 'Clear tough clogs safely'
                    }
                ]
            },
            'caulk': {
                products: [
                    {
                        name: 'DAP Silicone Sealant (Clear, 6-Pack)',
                        price: '~$18.99',
                        rating: '4.4/5',
                        amazonASIN: 'B000BQOXKY',
                        category: 'General',
                        description: 'Waterproof bathroom and kitchen sealing'
                    },
                    {
                        name: 'Caulk Gun + Removal Tool Kit',
                        price: '~$14.99',
                        rating: '4.2/5',
                        amazonASIN: 'B07CAULKXX',
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
            'fireplace': {
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
            if (this.productDatabase[keyword] && searchText.includes(keyword)) {
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
        
        // Populate HVAC products
        this.populateCategory('hvac-products', ['hvac filter']);
        
        // Populate Water products  
        this.populateCategory('water-products', ['water filter']);
        
        // Populate Safety products
        this.populateCategory('safety-products', ['smoke detector']);
        
        // Populate Cleaning products
        this.populateCategory('cleaning-products', ['clean']);
        
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
                this.productDatabase[keyword].products.slice(0, 2).forEach(product => {
                    html += this.createProductCardHTML(product);
                });
            }
        });
        
        container.innerHTML = html;
    }
    
    // Create compact product card for marketplace categories
    createProductCardHTML(product) {
        return `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">${product.name}</div>
                    <div class="flex items-center mt-1 space-x-2">
                        <span class="text-green-600 font-semibold text-xs">${product.price}</span>
                        <span class="text-yellow-600 text-xs">⭐ ${product.rating}</span>
                    </div>
                </div>
                <button 
                    onclick="window.open('${this.generateAmazonLink(product.amazonASIN, product.name)}', '_blank')"
                    class="ml-2 bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 rounded transition-colors"
                >
                    Buy
                </button>
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
            html += `
                <div class="bg-white p-4 rounded-lg border border-orange-200">
                    <h4 class="font-semibold text-gray-900 mb-2">${product.name}</h4>
                    <p class="text-sm text-gray-600 mb-3">${product.description}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="text-green-600 font-bold">${product.price}</span>
                            <span class="text-yellow-600 text-sm">⭐ ${product.rating}</span>
                        </div>
                        <button 
                            onclick="window.open('${this.generateAmazonLink(product.amazonASIN, product.name)}', '_blank')"
                            class="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-2 rounded transition-colors"
                        >
                            View Details
                        </button>
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
            html += `
                <div class="bg-white p-3 rounded-lg border border-green-200">
                    <h5 class="font-medium text-gray-900 mb-1">${product.name}</h5>
                    <p class="text-xs text-gray-600 mb-2">${product.description}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-green-600 font-semibold text-sm">${product.price}</span>
                        <button 
                            onclick="window.open('${this.generateAmazonLink(product.amazonASIN, product.name)}', '_blank')"
                            class="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition-colors"
                        >
                            Buy on Amazon
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
}

// Initialize marketplace manager
window.marketplaceManager = new MarketplaceManager();

console.log('✅ Marketplace module loaded successfully');
