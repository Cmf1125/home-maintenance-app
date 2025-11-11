// documents.js - Enhanced UX Version with Clickable Cards and Better Modal Design
// Changes the global reference pattern to match appliances

class CasaCareDocuments {
    constructor() {
        this.documents = [];
        this.currentView = 'overview';
        this.currentDocument = null; // For edit modal
        this.maxFileSize = 5 * 1024 * 1024;
        this.allowedTypes = {
            images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            documents: ['application/pdf', 'text/plain'],
            receipts: ['image/jpeg', 'image/png', 'application/pdf']
        };
        
        console.log('📄 Documents Module: Initializing with enhanced UX...');
        this.init();
    }
    
    init() {
        this.loadDocuments();
        this.bindEvents();
        this.render();
        console.log('✅ Documents Module: Enhanced UX initialized');
    }
    
    // Load documents using direct global reference like appliances
    loadDocuments() {
        try {
            this.documents = Array.isArray(window.documentsData) ? window.documentsData : [];
            console.log(`📄 Documents: Loaded ${this.documents.length} documents from global data`);
        } catch (error) {
            console.error('❌ Documents: Error loading documents:', error);
            this.documents = [];
        }
    }
    
    // Save documents using direct global reference like appliances
    saveDocuments() {
        try {
            console.log('💾 Documents: Using integrated save to preserve all data...');
            
            // Update direct global reference like appliances
            window.documentsData = this.documents;
            
            if (!window.currentUser) {
                console.warn('⚠️ Documents: not logged in, skipping save');
                return;
            }
            
            // Use main save function to preserve ALL data
            if (typeof window.saveData === 'function') {
                window.saveData();
                console.log('✅ Documents: Saved using integrated system');
            } else {
                console.error('❌ Main saveData function not available');
            }
            
        } catch (error) {
            console.error('❌ Documents: Error saving:', error);
            alert('❌ Failed to save documents. Please try again.');
        }
    }
    
    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }
    
    setupEventListeners() {
        const fileInput = document.getElementById('document-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
    }
    
    render() {
        const documentsView = document.getElementById('documents-view');
        if (!documentsView) {
            console.warn('⚠️ Documents: Documents view container not found');
            return;
        }
        
        switch (this.currentView) {
            case 'overview':
                this.renderOverview();
                break;
            case 'upload':
                this.renderUploadInterface();
                break;
            default:
                this.renderOverview();
        }
    }
    
    // Enhanced overview with clickable cards
    renderOverview() {
        const documentsView = document.getElementById('documents-view');
        if (!documentsView) return;
        
        const documentsByType = this.groupDocumentsByType();
        
        documentsView.innerHTML = `
            <div class="p-4 space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Documents</h2>
                        <p class="text-gray-600 text-sm">Manage warranties, receipts, and maintenance photos</p>
                    </div>
                    <button onclick="window.casaCareDocuments.showUploadInterface()" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors touch-btn">
                        📄 Add Document
                    </button>
                </div>
                
                <!-- Quick Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white rounded-xl p-4 shadow-lg">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-blue-100 rounded-lg text-lg">📋</div>
                            <div>
                                <p class="text-xs text-gray-600">Total Documents</p>
                                <p class="text-xl font-bold text-gray-900">${this.documents.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-4 shadow-lg">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-green-100 rounded-lg text-lg">🛡️</div>
                            <div>
                                <p class="text-xs text-gray-600">Warranties</p>
                                <p class="text-xl font-bold text-gray-900">${documentsByType.warranty?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-4 shadow-lg">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-yellow-100 rounded-lg text-lg">🧾</div>
                            <div>
                                <p class="text-xs text-gray-600">Receipts</p>
                                <p class="text-xl font-bold text-gray-900">${documentsByType.receipt?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-4 shadow-lg">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-purple-100 rounded-lg text-lg">📸</div>
                            <div>
                                <p class="text-xs text-gray-600">Photos</p>
                                <p class="text-xl font-bold text-gray-900">${documentsByType.photo?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${this.documents.length > 0 ? `
                    <!-- Enhanced Documents Grid -->
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div class="p-4 border-b border-gray-100">
                            <h3 class="text-lg font-bold text-gray-900">All Documents</h3>
                            <p class="text-sm text-gray-600 mt-1">Click a document to edit, or use 📎 to open file directly</p>
                        </div>
                        <div class="p-4">
                            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${this.documents.map(doc => this.renderEnhancedDocumentCard(doc)).join('')}
                            </div>
                        </div>
                    </div>
                ` : this.renderEmptyState()}
            </div>
            
            <!-- Enhanced Edit Modal -->
            ${this.renderEditModal()}
        `;
    }
    
    // NEW: Enhanced clickable document cards
    renderEnhancedDocumentCard(doc) {
        const typeInfo = this.getDocumentTypeInfo(doc.type);
        const fileSize = doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown size';
        const uploadDate = new Date(doc.uploadDate).toLocaleDateString();
        
        return `
            <div class="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                 onclick="window.casaCareDocuments.openEditModal(${doc.id})">
                
                <!-- Document Header -->
                <div class="flex items-start gap-3 mb-3">
                    <div class="p-2 ${typeInfo.bgColor} rounded-lg flex-shrink-0">
                        <span class="text-lg">${typeInfo.icon}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            ${doc.title}
                        </h4>
                        <p class="text-sm text-gray-600">${typeInfo.label}</p>
                    </div>
                    
                    <!-- Quick File Access Button -->
                    <button onclick="event.stopPropagation(); window.casaCareDocuments.openFile(${doc.id})"
                            class="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg"
                            title="Open file directly">
                        <span class="text-blue-600">📎</span>
                    </button>
                </div>
                
                <!-- Document Info -->
                <div class="space-y-1">
                    ${doc.description ? `
                        <p class="text-sm text-gray-700 line-clamp-2">${doc.description}</p>
                    ` : ''}
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <span>${uploadDate}</span>
                        <span>${fileSize}</span>
                    </div>
                </div>
                
                <!-- Visual Indicator for Clickability -->
                <div class="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-xs text-blue-600 font-medium">Click to edit document →</span>
                </div>
            </div>
        `;
    }
    
    // NEW: Enhanced edit modal
    renderEditModal() {
        return `
            <!-- Document Edit Modal -->
            <div id="document-edit-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 p-4" style="padding-bottom: 120px;">
                <div class="bg-white rounded-xl w-full max-w-md max-h-[75vh] overflow-y-auto shadow-2xl">
                    <div class="sticky top-0 bg-white p-4 border-b border-gray-200 rounded-t-xl">
                        <div class="flex items-center justify-between">
                            <h3 class="text-xl font-bold text-gray-900">Document Details</h3>
                            <button onclick="window.casaCareDocuments.closeEditModal()" 
                                    class="text-gray-500 hover:text-gray-700 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">×</button>
                        </div>
                    </div>
                    
                    <div class="p-4 space-y-4" style="padding-bottom: 2rem;">
                        <!-- Document Preview Section -->
                        <div id="document-preview-section" class="text-center p-4 bg-gray-50 rounded-lg">
                            <!-- Will be populated with document preview -->
                        </div>
                        
                        <!-- Editable Fields -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                                <input type="text" id="edit-doc-title" 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                                       placeholder="Enter document title">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <select id="edit-doc-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base">
                                    <option value="warranty">🛡️ Warranty</option>
                                    <option value="receipt">🧾 Receipt</option>
                                    <option value="insurance">📋 Insurance Policy</option>
                                    <option value="manual">📖 Manual/Instructions</option>
                                    <option value="photo">📸 Maintenance Photo</option>
                                    <option value="other">📄 Other Document</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                                <textarea id="edit-doc-description" rows="3"
                                          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                                          placeholder="Additional details about this document..."></textarea>
                            </div>
                            
                            <!-- File Information -->
                            <div id="file-info-section" class="bg-blue-50 rounded-lg p-3">
                                <!-- Will be populated with file details -->
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="space-y-3 pt-4">
                            <!-- Primary Action: Open File -->
                            <button onclick="window.casaCareDocuments.openCurrentFile()" 
                                    class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                📎 Open File
                            </button>
                            
                            <!-- Secondary Actions -->
                            <div class="flex gap-3">
                                <button onclick="window.casaCareDocuments.saveDocumentEdits()" 
                                        class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                                    💾 Save Changes
                                </button>
                                <button onclick="window.casaCareDocuments.closeEditModal()" 
                                        class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                                    Cancel
                                </button>
                            </div>
                            
                            <!-- Danger Zone -->
                            <div class="pt-4 border-t border-gray-200">
                                <button onclick="window.casaCareDocuments.confirmDeleteDocument()" 
                                        class="w-full bg-red-50 text-red-600 py-3 rounded-lg hover:bg-red-100 transition-colors font-medium">
                                    🗑️ Delete Document
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // NEW: Open edit modal for a document
    openEditModal(documentId) {
        const doc = this.documents.find(d => d.id == documentId);
        if (!doc) {
            alert('❌ Document not found');
            return;
        }
        
        this.currentDocument = doc;
        
        // Show modal
        const modal = document.getElementById('document-edit-modal');
        if (!modal) {
            console.error('❌ Document edit modal not found');
            return;
        }
        
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        // Populate modal content
        this.populateEditModal(doc);
        
        // Focus on title field
        setTimeout(() => {
            const titleField = document.getElementById('edit-doc-title');
            if (titleField) titleField.focus();
        }, 100);
        
        console.log('📝 Document edit modal opened for:', doc.title);
    }
    
    // NEW: Populate edit modal with document data
    populateEditModal(doc) {
        // Fill form fields
        document.getElementById('edit-doc-title').value = doc.title || '';
        document.getElementById('edit-doc-type').value = doc.type || 'other';
        document.getElementById('edit-doc-description').value = doc.description || '';
        
        // Update preview section
        const previewSection = document.getElementById('document-preview-section');
        const typeInfo = this.getDocumentTypeInfo(doc.type);
        
        if (doc.fileType && doc.fileType.startsWith('image/') && doc.fileData) {
            previewSection.innerHTML = `
                <img src="${doc.fileData}" alt="${doc.title}" 
                     class="max-w-full h-32 object-cover rounded-lg mx-auto cursor-pointer"
                     onclick="window.casaCareDocuments.openCurrentFile()"
                     title="Click to view full size">
                <p class="text-sm text-gray-600 mt-2">${doc.fileName}</p>
            `;
        } else {
            previewSection.innerHTML = `
                <div class="p-4">
                    <div class="text-4xl mb-2">${typeInfo.icon}</div>
                    <p class="font-medium text-gray-900">${doc.fileName}</p>
                    <p class="text-sm text-gray-600">${typeInfo.label}</p>
                </div>
            `;
        }
        
        // Update file info section
        const fileInfoSection = document.getElementById('file-info-section');
        const fileSize = doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown size';
        const uploadDate = new Date(doc.uploadDate).toLocaleDateString();
        
        fileInfoSection.innerHTML = `
            <div class="text-sm">
                <div class="font-medium text-gray-900 mb-2">📁 File Information</div>
                <div class="space-y-1 text-gray-600">
                    <div>📎 ${doc.fileName}</div>
                    <div>📏 ${fileSize}</div>
                    <div>📅 Uploaded ${uploadDate}</div>
                    <div>🏷️ ${doc.fileType || 'Unknown type'}</div>
                </div>
            </div>
        `;
    }
    
    // NEW: Close edit modal
    closeEditModal() {
        const modal = document.getElementById('document-edit-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        this.currentDocument = null;
        console.log('✅ Document edit modal closed');
    }
    
    // NEW: Save document edits
    saveDocumentEdits() {
        if (!this.currentDocument) {
            alert('❌ No document selected for editing');
            return;
        }
        
        // Get form values
        const title = document.getElementById('edit-doc-title').value.trim();
        const type = document.getElementById('edit-doc-type').value;
        const description = document.getElementById('edit-doc-description').value.trim();
        
        if (!title) {
            alert('❌ Document title is required');
            document.getElementById('edit-doc-title').focus();
            return;
        }
        
        // Update document
        this.currentDocument.title = title;
        this.currentDocument.type = type;
        this.currentDocument.description = description;
        this.currentDocument.lastModified = new Date().toISOString();
        
        // Save to storage
        this.saveDocuments();
        
        // Close modal and refresh view
        this.closeEditModal();
        this.render();
        
        alert(`✅ Document "${title}" updated successfully!`);
        console.log('✅ Document updated:', this.currentDocument);
    }
    
    // NEW: Confirm and delete document
    confirmDeleteDocument() {
        if (!this.currentDocument) {
            alert('❌ No document selected');
            return;
        }
        
        const confirmation = confirm(
            `Are you sure you want to delete "${this.currentDocument.title}"?\n\n` +
            `This action cannot be undone.`
        );
        
        if (confirmation) {
            const docTitle = this.currentDocument.title;
            
            // Remove from documents array
            this.documents = this.documents.filter(d => d.id !== this.currentDocument.id);
            
            // Save changes
            this.saveDocuments();
            
            // Close modal and refresh
            this.closeEditModal();
            this.render();
            
            alert(`✅ Document "${docTitle}" deleted successfully!`);
            console.log('🗑️ Document deleted:', docTitle);
        }
    }
    
    // ENHANCED: Open file for current document
    openCurrentFile() {
        if (this.currentDocument) {
            this.openFile(this.currentDocument.id);
        }
    }
    
    // ENHANCED: Open file by ID with mobile-friendly close button
    openFile(documentId) {
        const doc = this.documents.find(d => d.id == documentId);
        if (!doc) {
            alert('❌ Document not found');
            return;
        }
        
        if (!doc.fileData) {
            alert('❌ File data not available');
            return;
        }
        
        // Check if mobile device
        const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Open file in new window/tab
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            if (doc.fileType && doc.fileType.startsWith('image/')) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${doc.title}</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body { 
                                    margin: 0; 
                                    padding: 0;
                                    display: flex; 
                                    justify-content: center; 
                                    align-items: center; 
                                    min-height: 100vh; 
                                    background: #000;
                                    font-family: system-ui, -apple-system, sans-serif;
                                    position: relative;
                                }
                                img { 
                                    max-width: 95vw; 
                                    max-height: 95vh; 
                                    object-fit: contain;
                                    touch-action: pan-zoom;
                                }
                                .header {
                                    position: fixed;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    background: rgba(0,0,0,0.8);
                                    color: white;
                                    padding: 12px 16px;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    z-index: 100;
                                    backdrop-filter: blur(10px);
                                }
                                .title {
                                    font-size: 16px;
                                    font-weight: 500;
                                    flex: 1;
                                    margin-right: 16px;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                                .close-btn {
                                    background: rgba(255,255,255,0.2);
                                    border: none;
                                    color: white;
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 50%;
                                    font-size: 18px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    transition: background-color 0.2s;
                                    flex-shrink: 0;
                                }
                                .close-btn:hover, .close-btn:active {
                                    background: rgba(255,255,255,0.3);
                                }
                                ${isMobile ? `
                                .instructions {
                                    position: fixed;
                                    bottom: 20px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    background: rgba(0,0,0,0.8);
                                    color: white;
                                    padding: 8px 16px;
                                    border-radius: 20px;
                                    font-size: 12px;
                                    opacity: 0.8;
                                    z-index: 100;
                                }
                                ` : ''}
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <div class="title">${doc.title}</div>
                                <button class="close-btn" onclick="window.close()" title="Close">×</button>
                            </div>
                            <img src="${doc.fileData}" alt="${doc.title}">
                            ${isMobile ? '<div class="instructions">Pinch to zoom • Tap × to close</div>' : ''}
                        </body>
                    </html>
                `);
            } else if (doc.fileType === 'application/pdf') {
                // For PDFs, create a wrapper with close button
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${doc.title}</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body { 
                                    margin: 0; 
                                    padding: 0;
                                    font-family: system-ui, -apple-system, sans-serif;
                                    height: 100vh;
                                    display: flex;
                                    flex-direction: column;
                                }
                                .header {
                                    background: #2563eb;
                                    color: white;
                                    padding: 12px 16px;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    flex-shrink: 0;
                                }
                                .title {
                                    font-size: 16px;
                                    font-weight: 500;
                                    flex: 1;
                                    margin-right: 16px;
                                }
                                .close-btn {
                                    background: rgba(255,255,255,0.2);
                                    border: none;
                                    color: white;
                                    width: 36px;
                                    height: 36px;
                                    border-radius: 50%;
                                    font-size: 18px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                }
                                .close-btn:hover {
                                    background: rgba(255,255,255,0.3);
                                }
                                iframe {
                                    flex: 1;
                                    width: 100%;
                                    border: none;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <div class="title">📄 ${doc.title}</div>
                                <button class="close-btn" onclick="window.close()">×</button>
                            </div>
                            <iframe src="${doc.fileData}" title="${doc.title}"></iframe>
                        </body>
                    </html>
                `);
            } else {
                // For other file types, create a simple viewer with close
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${doc.title}</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body { 
                                    font-family: system-ui, -apple-system, sans-serif;
                                    padding: 0;
                                    margin: 0;
                                    background: #f5f5f5;
                                    min-height: 100vh;
                                    display: flex;
                                    flex-direction: column;
                                }
                                .header {
                                    background: #2563eb;
                                    color: white;
                                    padding: 12px 16px;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                }
                                .title {
                                    font-size: 16px;
                                    font-weight: 500;
                                    flex: 1;
                                    margin-right: 16px;
                                }
                                .close-btn {
                                    background: rgba(255,255,255,0.2);
                                    border: none;
                                    color: white;
                                    width: 36px;
                                    height: 36px;
                                    border-radius: 50%;
                                    font-size: 18px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                }
                                .close-btn:hover {
                                    background: rgba(255,255,255,0.3);
                                }
                                .container {
                                    flex: 1;
                                    max-width: 600px;
                                    margin: 40px auto;
                                    background: white;
                                    padding: 40px 20px;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    text-align: center;
                                }
                                .icon { font-size: 64px; margin-bottom: 20px; }
                                .doc-title { font-size: 24px; font-weight: 600; margin-bottom: 10px; }
                                .subtitle { color: #666; margin-bottom: 30px; }
                                .download-btn {
                                    background: #2563eb;
                                    color: white;
                                    padding: 12px 24px;
                                    border: none;
                                    border-radius: 6px;
                                    text-decoration: none;
                                    display: inline-block;
                                    font-weight: 500;
                                    margin: 8px;
                                }
                                .download-btn:hover { background: #1d4ed8; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <div class="title">📄 ${doc.title}</div>
                                <button class="close-btn" onclick="window.close()">×</button>
                            </div>
                            <div class="container">
                                <div class="icon">📄</div>
                                <div class="doc-title">${doc.title}</div>
                                <div class="subtitle">${doc.fileType || 'Document'}</div>
                                <a href="${doc.fileData}" download="${doc.fileName}" class="download-btn">
                                    📥 Download File
                                </a>
                            </div>
                        </body>
                    </html>
                `);
            }
        } else {
            alert('❌ Unable to open file. Please check your popup blocker settings.');
        }
        
        console.log('📎 File opened with mobile-friendly close:', doc.title);
    }
    
    // Enhanced render upload interface (keeping existing functionality)
    renderUploadInterface() {
        const documentsView = document.getElementById('documents-view');
        if (!documentsView) return;
        
        documentsView.innerHTML = `
            <div class="p-4">
                <div class="max-w-2xl mx-auto">
                    <div class="flex items-center gap-4 mb-6">
                        <button onclick="window.casaCareDocuments.showOverview()" 
                                class="text-gray-500 hover:text-gray-700">
                            ← Back
                        </button>
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900">Add Document</h2>
                            <p class="text-gray-600 text-sm">Upload warranties, receipts, or maintenance photos</p>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <form id="document-upload-form" class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                                <select id="document-type" class="w-full p-3 border border-gray-300 rounded-lg">
                                    <option value="warranty">🛡️ Warranty</option>
                                    <option value="receipt">🧾 Receipt</option>
                                    <option value="insurance">📋 Insurance Policy</option>
                                    <option value="manual">📖 Manual/Instructions</option>
                                    <option value="photo">📸 Maintenance Photo</option>
                                    <option value="other">📄 Other Document</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                                <input type="text" id="document-title" 
                                       class="w-full p-3 border border-gray-300 rounded-lg"
                                       placeholder="e.g., HVAC System Warranty, Repair Receipt">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                                <textarea id="document-description" 
                                          class="w-full p-3 border border-gray-300 rounded-lg" 
                                          rows="3" 
                                          placeholder="Additional details about this document..."></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">File</label>
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input type="file" id="document-file-input" class="hidden" 
                                           accept="image/*,application/pdf,.pdf,.txt">
                                    
                                    <div class="space-y-4">
                                        <div class="text-4xl text-gray-400">📄</div>
                                        
                                        <button type="button" 
                                                onclick="document.getElementById('document-file-input').click()"
                                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                            Choose File
                                        </button>
                                        
                                        <p class="text-sm text-gray-500">
                                            Supports: Images (JPG, PNG), PDFs, Text files<br>
                                            Max size: 5MB
                                        </p>
                                        
                                        <div id="file-preview" class="hidden mt-4">
                                            <!-- File preview will appear here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex gap-3 pt-4">
                                <button type="button" onclick="window.casaCareDocuments.showOverview()"
                                        class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit"
                                        class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                                    💾 Save Document
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        const form = document.getElementById('document-upload-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        this.setupEventListeners();
    }
    
    // Enhanced empty state
    renderEmptyState() {
        return `
            <div class="bg-white rounded-xl shadow-lg p-8 text-center">
                <div class="text-6xl mb-4">📄</div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">No Documents Yet</h3>
                <p class="text-gray-600 mb-6">Start building your digital home manual by uploading your first document.</p>
                <button onclick="window.casaCareDocuments.showUploadInterface()" 
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors touch-btn">
                    📄 Add Your First Document
                </button>
            </div>
        `;
    }
    
    // Enhanced document type info with better styling
    getDocumentTypeInfo(type) {
        const typeMap = {
            warranty: { icon: '🛡️', label: 'Warranty', bgColor: 'bg-green-100' },
            receipt: { icon: '🧾', label: 'Receipt', bgColor: 'bg-yellow-100' },
            insurance: { icon: '📋', label: 'Insurance Policy', bgColor: 'bg-blue-100' },
            manual: { icon: '📖', label: 'Manual/Instructions', bgColor: 'bg-purple-100' },
            photo: { icon: '📸', label: 'Maintenance Photo', bgColor: 'bg-pink-100' },
            other: { icon: '📄', label: 'Other Document', bgColor: 'bg-gray-100' }
        };
        return typeMap[type] || typeMap.other;
    }
    
    // Keep existing utility methods
    showOverview() {
        this.currentView = 'overview';
        this.render();
    }
    
    showUploadInterface() {
        this.currentView = 'upload';
        this.render();
    }
    
    groupDocumentsByType() {
        return this.documents.reduce((groups, doc) => {
            const type = doc.type;
            if (!groups[type]) groups[type] = [];
            groups[type].push(doc);
            return groups;
        }, {});
    }
    
    // Keep existing file handling methods
    validateFile(file) {
        if (file.size > this.maxFileSize) {
            alert(`❌ File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
            return false;
        }
        
        const allAllowedTypes = [
            ...this.allowedTypes.images,
            ...this.allowedTypes.documents,
            ...this.allowedTypes.receipts
        ];
        
        if (!allAllowedTypes.includes(file.type)) {
            alert('❌ Unsupported file type. Please use JPG, PNG, PDF, or TXT files.');
            return false;
        }
        
        return true;
    }
    
    showFilePreview(file) {
        const preview = document.getElementById('file-preview');
        if (!preview) return;
        
        preview.classList.remove('hidden');
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `
                    <div class="space-y-2">
                        <img src="${e.target.result}" alt="Preview" class="max-w-full h-32 object-cover rounded-lg mx-auto">
                        <p class="text-sm text-gray-600">${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = `
                <div class="space-y-2">
                    <div class="text-4xl text-gray-400">📄</div>
                    <p class="text-sm text-gray-600">${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
                </div>
            `;
        }
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!this.validateFile(file)) return;
        this.showFilePreview(file);
    }
    
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const fileInput = document.getElementById('document-file-input');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('❌ Please select a file to upload');
            return;
        }
        
        const documentData = {
            id: Date.now(),
            type: document.getElementById('document-type').value,
            title: document.getElementById('document-title').value.trim(),
            description: document.getElementById('document-description').value.trim(),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadDate: new Date().toISOString(),
            fileData: null
        };
        
        if (!documentData.title) {
            alert('❌ Please enter a document title');
            document.getElementById('document-title').focus();
            return;
        }
        
        try {
            const fileData = await this.readFileAsBase64(file);
            documentData.fileData = fileData;
            
            this.documents.push(documentData);
            this.saveDocuments();
            
            alert(`✅ Document "${documentData.title}" uploaded successfully!`);
            this.showOverview();
            
        } catch (error) {
            console.error('❌ Documents: Error uploading file:', error);
            alert('❌ Error uploading file. Please try again.');
        }
    }
    
    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Initialize the documents module
window.CasaCareDocuments = CasaCareDocuments;

// Make key functions globally available
window.openDocumentEditModal = function(documentId) {
    if (window.casaCareDocuments) {
        window.casaCareDocuments.openEditModal(documentId);
    }
};

window.openDocumentFile = function(documentId) {
    if (window.casaCareDocuments) {
        window.casaCareDocuments.openFile(documentId);
    }
};

console.log('📄 Enhanced Documents Module: Loaded with improved UX - clickable cards, better modals, and integrated file access');
