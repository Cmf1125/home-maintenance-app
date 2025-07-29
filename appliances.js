// appliances.js - The Home Keeper Appliance Management Module
// Manages home appliances, warranties, maintenance schedules, and documentation

class ApplianceManager {
    constructor() {
        this.appliances = [];
        this.currentView = 'overview'; // 'overview', 'add', 'edit', 'detail'
        this.currentAppliance = null;
        this.categories = [
            { id: 'kitchen', name: 'Kitchen', icon: '🍽️' },
            { id: 'hvac', name: 'HVAC', icon: '🌡️' },
            { id: 'laundry', name: 'Laundry', icon: '🧺' },
            { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
            { id: 'utility', name: 'Utility', icon: '⚡' },
            { id: 'outdoor', name: 'Outdoor', icon: '🌳' },
            { id: 'other', name: 'Other', icon: '🏠' }
        ];
        
        console.log('⚙️ Appliance Manager: Initializing...');
        this.init();
    }
    
    init() {
        this.loadAppliances();
        this.bindEvents();
        console.log('✅ Appliance Manager: Initialized');
    }
    
    // Load appliances from storage
    loadAppliances() {
        try {
            const savedAppliances = localStorage.getItem('homeKeeperAppliances');
            this.appliances = savedAppliances ? JSON.parse(savedAppliances) : [];
            console.log(`⚙️ Appliances: Loaded ${this.appliances.length} appliances`);
        } catch (error) {
            console.error('❌ Appliances: Error loading appliances:', error);
            this.appliances = [];
        }
    }
    
    // Save appliances to storage
    saveAppliances() {
        try {
            localStorage.setItem('homeKeeperAppliances', JSON.stringify(this.appliances));
            console.log('💾 Appliances: Saved successfully');
            
            // Also save to main app data for integration
            this.updateMainAppData();
        } catch (error) {
            console.error('❌ Appliances: Error saving appliances:', error);
            if (error.name === 'QuotaExceededError') {
                alert('❌ Storage quota exceeded. Please delete some photos to free up space.');
            }
        }
    }
    
    // Update main app data for integration with tasks/calendar
    updateMainAppData() {
        if (typeof window.saveData === 'function') {
            // Make appliances available to main app
            window.applianceData = this.appliances;
            window.saveData();
        }
    }
    
    // Bind events
    bindEvents() {
        // Set up event listeners when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }
    
    setupEventListeners() {
        // We'll add specific event listeners as we build the UI
    }
    
    // Main render function
    render() {
        const appliancesView = document.getElementById('appliances-view');
        if (!appliancesView) {
            console.warn('⚠️ Appliances: Appliances view container not found');
            return;
        }
        
        switch (this.currentView) {
            case 'overview':
                this.renderOverview();
                break;
            case 'add':
                this.renderAddForm();
                break;
            case 'edit':
                this.renderEditForm();
                break;
            case 'detail':
                this.renderApplianceDetail();
                break;
            default:
                this.renderOverview();
        }
    }
    
    // Render main appliances overview
    renderOverview() {
        const appliancesView = document.getElementById('appliances-view');
        if (!appliancesView) return;
        
        const appliancesByCategory = this.groupAppliancesByCategory();
        const totalAppliances = this.appliances.length;
        const appliancesNeedingAttention = this.getAppliancesNeedingAttention();
        
        appliancesView.innerHTML = `
            <div class="p-4 space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Appliances</h2>
                        <p class="text-gray-600 text-sm">Manage your home appliances and maintenance</p>
                    </div>
                    <button onclick="window.applianceManager.showAddForm()" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors touch-btn">
                        ⚙️ Add Appliance
                    </button>
                </div>
                
                <!-- Quick Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white rounded-xl p-4 shadow-lg">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-blue-100 rounded-lg text-lg">⚙️</div>
                            <div>
                                <p class="text-xs text-gray-600">Total Appliances</p>
                                <p class="text-xl font-bold text-gray-900">${totalAppliances}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-4 shadow-lg">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-yellow-100 rounded-lg text-lg">⚠️</div>
                            <div>
                                <p class="text-xs text-gray-600">Need Attention</p>
                                <p class="text-xl font-bold text-gray-900">${appliancesNeedingAttention.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-4 shadow-lg">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-green-100 rounded-lg text-lg">🛡️</div>
                            <div>
                                <p class="text-xs text-gray-600">Under Warranty</p>
                                <p class="text-xl font-bold text-gray-900">${this.getAppliancesUnderWarranty().length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-4 shadow-lg">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-purple-100 rounded-lg text-lg">📸</div>
                            <div>
                                <p class="text-xs text-gray-600">With Photos</p>
                                <p class="text-xl font-bold text-gray-900">${this.getAppliancesWithPhotos().length}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Appliances by Category -->
                ${this.renderApplianceCategories(appliancesByCategory)}
                
                ${totalAppliances === 0 ? this.renderEmptyState() : ''}
            </div>
        `;
    }
    
    // Render appliances grouped by category
    renderApplianceCategories(appliancesByCategory) {
        if (Object.keys(appliancesByCategory).length === 0) {
            return '';
        }
        
        return `
            <div class="space-y-6">
                ${Object.entries(appliancesByCategory).map(([categoryId, appliances]) => {
                    const category = this.categories.find(c => c.id === categoryId);
                    const categoryName = category ? category.name : 'Other';
                    const categoryIcon = category ? category.icon : '🏠';
                    
                    return `
                        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div class="p-4 border-b border-gray-100">
                                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span class="text-xl">${categoryIcon}</span>
                                    ${categoryName}
                                    <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs ml-2">
                                        ${appliances.length} appliance${appliances.length !== 1 ? 's' : ''}
                                    </span>
                                </h3>
                            </div>
                            <div class="p-4">
                                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    ${appliances.map(appliance => this.renderApplianceCard(appliance)).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Render individual appliance card
    renderApplianceCard(appliance) {
        const statusInfo = this.getApplianceStatus(appliance);
        const warrantyStatus = this.getWarrantyStatus(appliance);
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                 onclick="window.applianceManager.showApplianceDetail('${appliance.id}')">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 text-sm">${appliance.name}</h4>
                        <p class="text-xs text-gray-600">${appliance.manufacturer} ${appliance.model || ''}</p>
                    </div>
                    <div class="ml-2">
                        ${statusInfo.icon}
                    </div>
                </div>
                
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs ${statusInfo.colorClass}">${statusInfo.text}</span>
                    </div>
                    
                    ${warrantyStatus ? `
                        <div class="flex items-center gap-2">
                            <span class="text-xs ${warrantyStatus.colorClass}">🛡️ ${warrantyStatus.text}</span>
                        </div>
                    ` : ''}
                    
                    ${appliance.nextMaintenance ? `
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">🔧 Next: ${appliance.nextMaintenance}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="flex gap-2 mt-3">
                    ${appliance.photos && appliance.photos.length > 0 ? 
                        `<span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">📸 ${appliance.photos.length}</span>` : ''
                    }
                    ${appliance.manualUrl ? 
                        `<span class="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">📋 Manual</span>` : ''
                    }
                </div>
            </div>
        `;
    }
    
    // Render empty state when no appliances
    renderEmptyState() {
        return `
            <div class="bg-white rounded-xl shadow-lg p-8 text-center">
                <div class="text-6xl mb-4">⚙️</div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">No Appliances Yet</h3>
                <p class="text-gray-600 mb-6">Start building your digital home manual by adding your first appliance.</p>
                <button onclick="window.applianceManager.showAddForm()" 
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors touch-btn">
                    ⚙️ Add Your First Appliance
                </button>
            </div>
        `;
    }
    
    // Show add appliance form
    showAddForm() {
        this.currentView = 'add';
        this.currentAppliance = null;
        this.render();
    }
    
    // Show appliance detail
    showApplianceDetail(applianceId) {
        this.currentAppliance = this.appliances.find(a => a.id === applianceId);
        if (this.currentAppliance) {
            this.currentView = 'detail';
            this.render();
        }
    }
    
    // Back to overview
    showOverview() {
        this.currentView = 'overview';
        this.currentAppliance = null;
        this.render();
    }
    
    // Utility functions
    groupAppliancesByCategory() {
        return this.appliances.reduce((groups, appliance) => {
            const category = appliance.category || 'other';
            if (!groups[category]) groups[category] = [];
            groups[category].push(appliance);
            return groups;
        }, {});
    }
    
    getAppliancesNeedingAttention() {
        return this.appliances.filter(appliance => {
            const status = this.getApplianceStatus(appliance);
            return status.needsAttention;
        });
    }
    
    getAppliancesUnderWarranty() {
        return this.appliances.filter(appliance => {
            if (!appliance.warrantyExpiration) return false;
            const warrantyDate = new Date(appliance.warrantyExpiration);
            return warrantyDate > new Date();
        });
    }
    
    getAppliancesWithPhotos() {
        return this.appliances.filter(appliance => 
            appliance.photos && appliance.photos.length > 0
        );
    }
    
    getApplianceStatus(appliance) {
        // Simple status logic for now - can be enhanced later
        const today = new Date();
        
        // Check warranty
        if (appliance.warrantyExpiration) {
            const warrantyDate = new Date(appliance.warrantyExpiration);
            const daysUntilExpiry = Math.ceil((warrantyDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
                return {
                    icon: '❌',
                    text: 'Out of warranty',
                    colorClass: 'text-red-600',
                    needsAttention: false
                };
            } else if (daysUntilExpiry < 30) {
                return {
                    icon: '⚠️',
                    text: 'Warranty expiring soon',
                    colorClass: 'text-yellow-600',
                    needsAttention: true
                };
            }
        }
        
        // Default good status
        return {
            icon: '✅',
            text: 'Good condition',
            colorClass: 'text-green-600',
            needsAttention: false
        };
    }
    
    getWarrantyStatus(appliance) {
        if (!appliance.warrantyExpiration) return null;
        
        const today = new Date();
        const warrantyDate = new Date(appliance.warrantyExpiration);
        const daysUntilExpiry = Math.ceil((warrantyDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
            return {
                text: 'Warranty expired',
                colorClass: 'text-red-600'
            };
        } else if (daysUntilExpiry < 30) {
            return {
                text: `Warranty expires in ${daysUntilExpiry} days`,
                colorClass: 'text-yellow-600'
            };
        } else if (daysUntilExpiry < 365) {
            const months = Math.ceil(daysUntilExpiry / 30);
            return {
                text: `${months} month${months !== 1 ? 's' : ''} warranty left`,
                colorClass: 'text-green-600'
            };
        } else {
            const years = Math.floor(daysUntilExpiry / 365);
            return {
                text: `${years} year${years !== 1 ? 's' : ''} warranty left`,
                colorClass: 'text-green-600'
            };
        }
    }
}

// appliances.js - Updated initialization section (replace the bottom part of your file)

// Make ApplianceManager available globally
window.ApplianceManager = ApplianceManager;

// Initialize when DOM is ready or immediately if already ready
function initializeApplianceManager() {
    if (!window.applianceManager) {
        console.log('⚙️ Creating new appliance manager instance...');
        window.applianceManager = new ApplianceManager();
    }
    return window.applianceManager;
}

// Initialize immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplianceManager);
} else {
    // DOM is already ready, initialize now but with a small delay to ensure all scripts are loaded
    setTimeout(initializeApplianceManager, 100);
}

// Make the initialization function available globally for manual initialization
window.initializeApplianceManager = initializeApplianceManager;

console.log('⚙️ Appliance Manager Module: Loaded successfully');
