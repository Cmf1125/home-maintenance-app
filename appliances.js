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
    // Add these methods to your ApplianceManager class (after the renderOverview method)

// Replace your existing renderAddForm method with this version:

renderAddForm() {
    const appliancesView = document.getElementById('appliances-view');
    if (!appliancesView) return;
    
    // Clear any temporary photos from previous sessions
    window.tempAppliancePhotos = [];
    
    appliancesView.innerHTML = `
        <div class="p-4">
            <div class="max-w-2xl mx-auto">
                <!-- Header -->
                <div class="flex items-center gap-4 mb-6">
                    <button onclick="window.applianceManager.showOverview()" 
                            class="text-gray-500 hover:text-gray-700 transition-colors">
                        ← Back
                    </button>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Add Appliance</h2>
                        <p class="text-gray-600 text-sm">Add a new appliance to your home inventory</p>
                    </div>
                </div>
                
                <!-- Add Form -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <form id="appliance-add-form" class="space-y-6">
                        <!-- Basic Information -->
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Appliance Name *</label>
                                <input type="text" id="appliance-name" required
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="e.g., Kitchen Refrigerator">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select id="appliance-category" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    ${this.categories.map(cat => 
                                        `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                                <input type="text" id="appliance-manufacturer"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="e.g., Whirlpool, GE, Samsung">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Model Number</label>
                                <input type="text" id="appliance-model"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="e.g., WRF535SWHZ">
                            </div>
                        </div>
                        
                        <!-- Purchase Information -->
                        <div class="grid md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                                <input type="date" id="appliance-purchase-date"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Purchase Price</label>
                                <input type="number" id="appliance-price" min="0" step="0.01"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="0.00">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Warranty (Months)</label>
                                <input type="number" id="appliance-warranty" min="0"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="12">
                            </div>
                        </div>
                        
                        <!-- Serial Number & Location -->
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                                <input type="text" id="appliance-serial"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="Serial number from appliance label">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input type="text" id="appliance-location"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="e.g., Kitchen, Basement, Garage">
                            </div>
                        </div>
                        
                        <!-- Photos Section -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Photos (Optional)</label>
                            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <!-- Photo Preview Area -->
                                <div id="photo-preview-area" class="mb-4 hidden">
                                    <p class="text-sm text-gray-600 mb-2">Added Photos:</p>
                                    <div id="photo-preview-grid" class="grid grid-cols-3 gap-2">
                                        <!-- Photos will be added here dynamically -->
                                    </div>
                                </div>
                                
                                <!-- Add Photo Button -->
                                <div class="text-center">
                                    <input type="file" id="add-photo-input" accept="image/*" class="hidden" 
                                           onchange="window.applianceManager.handleAddFormPhotoUpload(event)">
                                    <button type="button" onclick="document.getElementById('add-photo-input').click()"
                                            class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                                        📸 Add Photo
                                    </button>
                                    <p class="text-xs text-gray-500 mt-2">Add photos of model stickers, purchase receipts, or the appliance itself</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Notes -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                            <textarea id="appliance-notes" rows="3"
                                      class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                      placeholder="Additional details, maintenance notes, etc."></textarea>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="window.applianceManager.showOverview()"
                                    class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                                Cancel
                            </button>
                            <button type="submit"
                                    class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                💾 Save Appliance
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Set up form submission
    const form = document.getElementById('appliance-add-form');
    if (form) {
        form.addEventListener('submit', (e) => this.handleAddFormSubmit(e));
    }
}

// Handle photo upload for add form
handleAddFormPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        alert('❌ Please select an image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('❌ Image too large. Please select an image smaller than 5MB');
        return;
    }
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
        const photoData = {
            data: e.target.result,
            fileName: file.name,
            uploadDate: new Date().toISOString(),
            size: file.size
        };
        
        // Add to temporary storage
        if (!window.tempAppliancePhotos) window.tempAppliancePhotos = [];
        window.tempAppliancePhotos.push(photoData);
        
        // Update preview
        this.updateAddFormPhotoPreview();
        
        console.log('📸 Photo added to temp storage:', file.name);
    };
    
    reader.readAsDataURL(file);
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
}

// Update photo preview in add form
updateAddFormPhotoPreview() {
    const previewArea = document.getElementById('photo-preview-area');
    const previewGrid = document.getElementById('photo-preview-grid');
    
    if (!previewArea || !previewGrid || !window.tempAppliancePhotos) return;
    
    if (window.tempAppliancePhotos.length === 0) {
        previewArea.classList.add('hidden');
        return;
    }
    
    previewArea.classList.remove('hidden');
    
    previewGrid.innerHTML = window.tempAppliancePhotos.map((photo, index) => `
        <div class="relative group">
            <img src="${photo.data}" alt="Preview" 
                 class="w-full h-20 object-cover rounded border">
            <button onclick="window.applianceManager.removeAddFormPhoto(${index})"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                ×
            </button>
            <div class="text-xs text-gray-500 mt-1 truncate">${photo.fileName}</div>
        </div>
    `).join('');
}

// Remove photo from add form
removeAddFormPhoto(index) {
    if (window.tempAppliancePhotos && window.tempAppliancePhotos[index]) {
        window.tempAppliancePhotos.splice(index, 1);
        this.updateAddFormPhotoPreview();
        console.log('🗑️ Photo removed from temp storage');
    }
}

// Render edit appliance form
renderEditForm() {
    if (!this.currentAppliance) {
        this.showOverview();
        return;
    }
    
    const appliancesView = document.getElementById('appliances-view');
    if (!appliancesView) return;
    
    appliancesView.innerHTML = `
        <div class="p-4">
            <div class="max-w-2xl mx-auto">
                <!-- Header -->
                <div class="flex items-center gap-4 mb-6">
                    <button onclick="window.applianceManager.showOverview()" 
                            class="text-gray-500 hover:text-gray-700 transition-colors">
                        ← Back
                    </button>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Edit Appliance</h2>
                        <p class="text-gray-600 text-sm">Update appliance information</p>
                    </div>
                </div>
                
                <!-- Edit Form (similar to add form but with values filled) -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <p class="text-gray-600 mb-4">Edit form coming soon...</p>
                    <button onclick="window.applianceManager.showOverview()"
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Back to Overview
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Render appliance detail view
renderApplianceDetail() {
    if (!this.currentAppliance) {
        this.showOverview();
        return;
    }
    
    const appliancesView = document.getElementById('appliances-view');
    if (!appliancesView) return;
    
    appliancesView.innerHTML = `
        <div class="p-4">
            <div class="max-w-2xl mx-auto">
                <!-- Header -->
                <div class="flex items-center gap-4 mb-6">
                    <button onclick="window.applianceManager.showOverview()" 
                            class="text-gray-500 hover:text-gray-700 transition-colors">
                        ← Back
                    </button>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">${this.currentAppliance.name}</h2>
                        <p class="text-gray-600 text-sm">Appliance Details</p>
                    </div>
                </div>
                
                <!-- Detail View -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <p class="text-gray-600 mb-4">Detailed view coming soon...</p>
                    <button onclick="window.applianceManager.showOverview()"
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Back to Overview
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Handle add form submission
handleAddFormSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('appliance-name').value.trim();
    const category = document.getElementById('appliance-category').value;
    const manufacturer = document.getElementById('appliance-manufacturer').value.trim();
    const model = document.getElementById('appliance-model').value.trim();
    const purchaseDate = document.getElementById('appliance-purchase-date').value;
    const price = parseFloat(document.getElementById('appliance-price').value) || 0;
    const warranty = parseInt(document.getElementById('appliance-warranty').value) || 0;
    const serial = document.getElementById('appliance-serial').value.trim();
    const location = document.getElementById('appliance-location').value.trim();
    const notes = document.getElementById('appliance-notes').value.trim();
    
    // Validate required fields
    if (!name) {
        alert('❌ Please enter an appliance name');
        document.getElementById('appliance-name').focus();
        return;
    }
    
    // Create new appliance object
    const newAppliance = {
        id: Date.now(), // Simple ID generation
        name: name,
        category: category,
        manufacturer: manufacturer || 'Unknown',
        model: model,
        purchaseDate: purchaseDate,
        purchasePrice: price,
        warrantyMonths: warranty,
        warrantyExpiration: this.calculateWarrantyExpiration(purchaseDate, warranty),
        serialNumber: serial,
        location: location,
        notes: notes,
        photos: [],
        createdDate: new Date().toISOString()
    };
    
    // Add to appliances array
    this.appliances.push(newAppliance);
    
    // Save to storage
    this.saveAppliances();
    
    // Show success message and return to overview
    alert(`✅ Appliance "${name}" added successfully!`);
    this.showOverview();
    
    console.log('✅ New appliance added:', newAppliance);
}

// Calculate warranty expiration date
calculateWarrantyExpiration(purchaseDate, warrantyMonths) {
    if (!purchaseDate || !warrantyMonths) return null;
    
    const purchase = new Date(purchaseDate);
    const expiration = new Date(purchase);
    expiration.setMonth(expiration.getMonth() + warrantyMonths);
    
    return expiration.toISOString().split('T')[0]; // Return as YYYY-MM-DD
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
    
    // Replace your existing renderApplianceCard method with this version:

renderApplianceCard(appliance) {
    const statusInfo = this.getApplianceStatus(appliance);
    const warrantyStatus = this.getWarrantyStatus(appliance);
    
    return `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group">
            <!-- Edit Button (appears on hover) -->
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="window.applianceManager.editAppliance('${appliance.id}')" 
                        class="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-lg text-sm transition-colors"
                        title="Edit appliance">
                    ✏️
                </button>
            </div>
            
            <!-- Clickable area for details -->
            <div class="cursor-pointer" onclick="window.applianceManager.showApplianceDetail('${appliance.id}')">
                <div class="flex items-start justify-between mb-3 pr-8">
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
                    
                    ${appliance.location ? `
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">📍 ${appliance.location}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="flex gap-2 mt-3 flex-wrap">
                    ${appliance.photos && appliance.photos.length > 0 ? 
                        `<span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">📸 ${appliance.photos.length}</span>` : ''
                    }
                    ${appliance.serialNumber ? 
                        `<span class="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">🔢 Serial</span>` : ''
                    }
                    ${appliance.purchaseDate ? 
                        `<span class="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">📅 ${new Date(appliance.purchaseDate).getFullYear()}</span>` : ''
                    }
                </div>
            </div>
        </div>
    `;
}
    // Add these methods to your ApplianceManager class:

// Edit appliance method
editAppliance(applianceId) {
    this.currentAppliance = this.appliances.find(a => a.id == applianceId);
    if (this.currentAppliance) {
        this.currentView = 'edit';
        this.render();
    } else {
        console.error('Appliance not found:', applianceId);
        alert('❌ Appliance not found');
    }
}

// Updated renderEditForm method (replace the placeholder one)
renderEditForm() {
    if (!this.currentAppliance) {
        this.showOverview();
        return;
    }
    
    const appliancesView = document.getElementById('appliances-view');
    if (!appliancesView) return;
    
    appliancesView.innerHTML = `
        <div class="p-4">
            <div class="max-w-2xl mx-auto">
                <!-- Header -->
                <div class="flex items-center gap-4 mb-6">
                    <button onclick="window.applianceManager.showOverview()" 
                            class="text-gray-500 hover:text-gray-700 transition-colors">
                        ← Back
                    </button>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Edit Appliance</h2>
                        <p class="text-gray-600 text-sm">Update ${this.currentAppliance.name}</p>
                    </div>
                </div>
                
                <!-- Edit Form -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <form id="appliance-edit-form" class="space-y-6">
                        <!-- Basic Information -->
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Appliance Name *</label>
                                <input type="text" id="edit-appliance-name" required
                                       value="${this.currentAppliance.name || ''}"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="e.g., Kitchen Refrigerator">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select id="edit-appliance-category" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    ${this.categories.map(cat => 
                                        `<option value="${cat.id}" ${cat.id === this.currentAppliance.category ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                                <input type="text" id="edit-appliance-manufacturer"
                                       value="${this.currentAppliance.manufacturer || ''}"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="e.g., Whirlpool, GE, Samsung">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Model Number</label>
                                <input type="text" id="edit-appliance-model"
                                       value="${this.currentAppliance.model || ''}"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="e.g., WRF535SWHZ">
                            </div>
                        </div>
                        
                        <!-- Purchase Information -->
                        <div class="grid md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                                <input type="date" id="edit-appliance-purchase-date"
                                       value="${this.currentAppliance.purchaseDate || ''}"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Purchase Price</label>
                                <input type="number" id="edit-appliance-price" min="0" step="0.01"
                                       value="${this.currentAppliance.purchasePrice || ''}"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="0.00">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Warranty (Months)</label>
                                <input type="number" id="edit-appliance-warranty" min="0"
                                       value="${this.currentAppliance.warrantyMonths || ''}"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="12">
                            </div>
                        </div>
                        
                        <!-- Serial Number & Location -->
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                                <input type="text" id="edit-appliance-serial"
                                       value="${this.currentAppliance.serialNumber || ''}"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="Serial number from appliance label">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input type="text" id="edit-appliance-location"
                                       value="${this.currentAppliance.location || ''}"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="e.g., Kitchen, Basement, Garage">
                            </div>
                        </div>
                        
                        <!-- Photos Section -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <!-- Existing Photos -->
                                ${this.currentAppliance.photos && this.currentAppliance.photos.length > 0 ? `
                                    <div class="mb-4">
                                        <p class="text-sm text-gray-600 mb-2">Current Photos:</p>
                                        <div class="grid grid-cols-3 gap-2">
                                            ${this.currentAppliance.photos.map((photo, index) => `
                                                <div class="relative group">
                                                    <img src="${photo.data}" alt="Appliance photo" 
                                                         class="w-full h-20 object-cover rounded cursor-pointer"
                                                         onclick="window.applianceManager.viewPhoto('${this.currentAppliance.id}', ${index})">
                                                    <button onclick="window.applianceManager.deletePhoto('${this.currentAppliance.id}', ${index})"
                                                            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                        ×
                                                    </button>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <!-- Add New Photo -->
                                <div class="text-center">
                                    <input type="file" id="edit-photo-input" accept="image/*" class="hidden" 
                                           onchange="window.applianceManager.handlePhotoUpload(event, 'edit')">
                                    <button type="button" onclick="document.getElementById('edit-photo-input').click()"
                                            class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                                        📸 Add Photo
                                    </button>
                                    <p class="text-xs text-gray-500 mt-2">Click to add photos of model stickers, receipts, or the appliance</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Notes -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea id="edit-appliance-notes" rows="3"
                                      class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                      placeholder="Additional details, maintenance notes, etc.">${this.currentAppliance.notes || ''}</textarea>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="window.applianceManager.deleteAppliance('${this.currentAppliance.id}')"
                                    class="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors">
                                🗑️ Delete
                            </button>
                            <button type="button" onclick="window.applianceManager.showOverview()"
                                    class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                                Cancel
                            </button>
                            <button type="submit"
                                    class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                💾 Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Set up form submission
    const form = document.getElementById('appliance-edit-form');
    if (form) {
        form.addEventListener('submit', (e) => this.handleEditFormSubmit(e));
    }
}

// Handle photo upload
handlePhotoUpload(event, context = 'add') {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        alert('❌ Please select an image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('❌ Image too large. Please select an image smaller than 5MB');
        return;
    }
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
        const photoData = {
            data: e.target.result,
            fileName: file.name,
            uploadDate: new Date().toISOString(),
            size: file.size
        };
        
        if (context === 'edit' && this.currentAppliance) {
            // Add to current appliance
            if (!this.currentAppliance.photos) this.currentAppliance.photos = [];
            this.currentAppliance.photos.push(photoData);
            
            // Re-render the edit form to show the new photo
            this.renderEditForm();
            
            console.log('📸 Photo added to appliance:', this.currentAppliance.name);
        } else {
            // Store temporarily for add form
            if (!window.tempAppliancePhotos) window.tempAppliancePhotos = [];
            window.tempAppliancePhotos.push(photoData);
            
            // Update add form preview (you'll need to implement this)
            console.log('📸 Photo added to temp storage');
        }
    };
    
    reader.readAsDataURL(file);
}

// View photo in full size
viewPhoto(applianceId, photoIndex) {
    const appliance = this.appliances.find(a => a.id == applianceId);
    if (!appliance || !appliance.photos || !appliance.photos[photoIndex]) {
        alert('❌ Photo not found');
        return;
    }
    
    const photo = appliance.photos[photoIndex];
    
    // Create a modal to view the photo
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.onclick = () => document.body.removeChild(modal);
    
    modal.innerHTML = `
        <div class="max-w-4xl max-h-full">
            <img src="${photo.data}" alt="Appliance photo" 
                 class="max-w-full max-h-full object-contain rounded-lg">
            <div class="text-center mt-4">
                <p class="text-white text-sm">${photo.fileName}</p>
                <p class="text-gray-300 text-xs">Click anywhere to close</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Delete photo
deletePhoto(applianceId, photoIndex) {
    const appliance = this.appliances.find(a => a.id == applianceId);
    if (!appliance || !appliance.photos || !appliance.photos[photoIndex]) {
        alert('❌ Photo not found');
        return;
    }
    
    if (confirm('Delete this photo?')) {
        appliance.photos.splice(photoIndex, 1);
        this.saveAppliances();
        
        // Re-render current view
        if (this.currentView === 'edit') {
            this.renderEditForm();
        } else {
            this.render();
        }
        
        console.log('🗑️ Photo deleted from appliance:', appliance.name);
    }
}

// Handle edit form submission
handleEditFormSubmit(event) {
    event.preventDefault();
    
    if (!this.currentAppliance) {
        alert('❌ No appliance selected for editing');
        return;
    }
    
    // Get form values
    const name = document.getElementById('edit-appliance-name').value.trim();
    const category = document.getElementById('edit-appliance-category').value;
    const manufacturer = document.getElementById('edit-appliance-manufacturer').value.trim();
    const model = document.getElementById('edit-appliance-model').value.trim();
    const purchaseDate = document.getElementById('edit-appliance-purchase-date').value;
    const price = parseFloat(document.getElementById('edit-appliance-price').value) || 0;
    const warranty = parseInt(document.getElementById('edit-appliance-warranty').value) || 0;
    const serial = document.getElementById('edit-appliance-serial').value.trim();
    const location = document.getElementById('edit-appliance-location').value.trim();
    const notes = document.getElementById('edit-appliance-notes').value.trim();
    
    // Validate required fields
    if (!name) {
        alert('❌ Please enter an appliance name');
        document.getElementById('edit-appliance-name').focus();
        return;
    }
    
    // Update appliance object
    this.currentAppliance.name = name;
    this.currentAppliance.category = category;
    this.currentAppliance.manufacturer = manufacturer || 'Unknown';
    this.currentAppliance.model = model;
    this.currentAppliance.purchaseDate = purchaseDate;
    this.currentAppliance.purchasePrice = price;
    this.currentAppliance.warrantyMonths = warranty;
    this.currentAppliance.warrantyExpiration = this.calculateWarrantyExpiration(purchaseDate, warranty);
    this.currentAppliance.serialNumber = serial;
    this.currentAppliance.location = location;
    this.currentAppliance.notes = notes;
    this.currentAppliance.lastModified = new Date().toISOString();
    
    // Save to storage
    this.saveAppliances();
    
    // Show success message and return to overview
    alert(`✅ Appliance "${name}" updated successfully!`);
    this.showOverview();
    
    console.log('✅ Appliance updated:', this.currentAppliance);
}

// Delete appliance
deleteAppliance(applianceId) {
    const appliance = this.appliances.find(a => a.id == applianceId);
    if (!appliance) {
        alert('❌ Appliance not found');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${appliance.name}"? This action cannot be undone.`)) {
        this.appliances = this.appliances.filter(a => a.id != applianceId);
        this.saveAppliances();
        
        alert(`✅ Appliance "${appliance.name}" deleted successfully!`);
        this.showOverview();
        
        console.log('🗑️ Appliance deleted:', appliance.name);
    }
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
