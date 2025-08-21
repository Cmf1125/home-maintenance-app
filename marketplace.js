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
                        name: 'Filtrete 16x25x1 Air Filter (6-Pack)',
                        price: '$24.99', // TODO: Update with real Amazon price
                        rating: '4.5/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'RESEARCH_NEEDED_FILTRETE', // TODO: Research on Amazon
                        category: 'HVAC',
                        description: 'Captures dust, pollen, and allergens',
                        sizes: ['16x25x1', '20x25x1', '16x20x1'],
                        priority: 'HIGH', // Recurring purchase
                        estCommission: '$2-5'
                    },
                    {
                        name: 'Nordic Pure 16x25x1 MERV 12 (12-Pack)',
                        price: '$49.99', // TODO: Update with real Amazon price
                        rating: '4.7/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'RESEARCH_NEEDED_NORDIC', // TODO: Research on Amazon
                        category: 'HVAC',
                        description: 'Premium filtration for better air quality',
                        sizes: ['16x25x1', '20x25x1', '16x20x1'],
                        priority: 'HIGH',
                        estCommission: '$3-8'
                    }
                ]
            },
            'smoke detector': {
                products: [
                    {
                        name: 'SITERWELL Smoke Detector(2-Pack)',
                        price: '$26.39', 
                        rating: '4.5/5',
                        amazonASIN: 'B0DJNGHB58', // Go to Amazon, find product, copy ASIN from URL
                        category: 'Safety',
                        description: 'Battery-powered photoelectric sensor'
                    },
                    {
                        name: 'First Alert Carbon Monoxide Detector',
                        price: '$19.99',
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
                        price: '$29.99',
                        rating: '4.3/5',
                        amazonASIN: 'B07XQZQZQZ',
                        category: 'Exterior',
                        description: 'Telescoping wand and curved attachment'
                    },
                    {
                        name: 'Gutter Guards (200ft)',
                        price: '$89.99',
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
                        name: 'Whole House Sediment Filter (3-Pack)',
                        price: '$24.99',
                        rating: '4.5/5',
                        amazonASIN: 'B001E5PY5Q',
                        category: 'Water',
                        description: 'Removes sediment and rust'
                    },
                    {
                        name: 'UV Water Sterilizer System',
                        price: '$199.99',
                        rating: '4.8/5',
                        amazonASIN: 'B08XWATER1',
                        category: 'Water',
                        description: 'Kills bacteria and viruses'
                    }
                ]
            },
            'drain': {
                products: [
                    {
                        name: 'Green Gobbler Drain Cleaner (2-Pack)',
                        price: '$16.99',
                        rating: '4.3/5',
                        amazonASIN: 'B0154IFRWY',
                        category: 'Plumbing',
                        description: 'Eco-friendly drain treatment'
                    },
                    {
                        name: 'Drain Snake Tool 25ft',
                        price: '$12.99',
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
                        price: '$18.99',
                        rating: '4.4/5',
                        amazonASIN: 'B000BQOXKY',
                        category: 'General',
                        description: 'Waterproof bathroom and kitchen sealing'
                    },
                    {
                        name: 'Caulk Gun + Removal Tool Kit',
                        price: '$14.99',
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
                        price: '$27.95', // TODO: Update with real Amazon price
                        rating: '4.5/5', // TODO: Update with real Amazon rating
                        amazonASIN: 'B09HH2CVG5', // TODO: Research on Amazon
                        category: 'Safety',
                        description: 'Complete dryer vent cleaning system',
                        priority: 'HIGH', // Safety-related, annual maintenance
                        estCommission: '$2-4'
                    },
                ]
            }
        };
    }

    // Find products for a specific task
    getProductRecommendations(taskTitle, taskDescription = '', applianceDetails = null) {
        const searchText = `${taskTitle} ${taskDescription}`.toLowerCase();
        const recommendations = [];

        // Search through product database
        for (const [keyword, data] of Object.entries(this.productDatabase)) {
            if (searchText.includes(keyword)) {
                let products = data.products;
                
                // Filter by appliance-specific details if available
                if (applianceDetails && keyword === 'hvac filter') {
                    products = this.getApplianceSpecificProducts(keyword, applianceDetails);
                }
                
                recommendations.push({
                    keyword: keyword,
                    products: products
                });
            }
        }

        // Don't show generic recommendations for tasks without specific matches
        // This prevents every task from showing the same generic kit

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
                price: '$49.99',
                rating: '4.5/5',
                amazonASIN: 'B07TOOLSXX',
                category: 'Tools',
                description: 'Complete toolkit for home repairs'
            },
            {
                name: 'WD-40 Multi-Use Product (3-Pack)',
                price: '$12.99',
                rating: '4.7/5',
                amazonASIN: 'B00009WD40',
                category: 'General',
                description: 'Lubricates, displaces moisture, prevents rust'
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
    
    // Populate seasonal products
    populateSeasonalProducts() {
        const container = document.getElementById('seasonal-products');
        if (!container) return;
        
        const currentMonth = new Date().getMonth();
        let seasonalItems = [];
        
        // Spring (Mar-May)
        if (currentMonth >= 2 && currentMonth <= 4) {
            seasonalItems = [
                { name: 'Spring Gutter Cleaning Kit', price: '$29.99', description: 'Clean out winter debris' },
                { name: 'HVAC Tune-up Kit', price: '$45.99', description: 'Prep for summer cooling' },
                { name: 'Deck Cleaning Supplies', price: '$24.99', description: 'Spring deck maintenance' }
            ];
        }
        // Summer (Jun-Aug)  
        else if (currentMonth >= 5 && currentMonth <= 7) {
            seasonalItems = [
                { name: 'AC Filter Multi-Pack', price: '$34.99', description: 'Keep AC running efficiently' },
                { name: 'Pool Maintenance Kit', price: '$89.99', description: 'Summer pool care essentials' },
                { name: 'Sprinkler System Check Kit', price: '$19.99', description: 'Maintain your irrigation' }
            ];
        }
        // Fall (Sep-Nov)
        else if (currentMonth >= 8 && currentMonth <= 10) {
            seasonalItems = [
                { name: 'Heating System Prep Kit', price: '$39.99', description: 'Ready for winter heating' },
                { name: 'Weatherproofing Bundle', price: '$54.99', description: 'Seal gaps before winter' },
                { name: 'Chimney Cleaning Kit', price: '$32.99', description: 'Safe fireplace season' }
            ];
        }
        // Winter (Dec-Feb)
        else {
            seasonalItems = [
                { name: 'Pipe Freeze Prevention Kit', price: '$28.99', description: 'Protect against frozen pipes' },
                { name: 'Winter Safety Bundle', price: '$41.99', description: 'Ice melt, emergency supplies' },
                { name: 'Indoor Air Quality Kit', price: '$67.99', description: 'Combat dry winter air' }
            ];
        }
        
        let html = '';
        seasonalItems.forEach(item => {
            html += `
                <div class="bg-white p-3 rounded-lg border border-green-200">
                    <h5 class="font-medium text-gray-900 mb-1">${item.name}</h5>
                    <p class="text-xs text-gray-600 mb-2">${item.description}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-green-600 font-semibold text-sm">${item.price}</span>
                        <button class="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded">
                            Shop
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
