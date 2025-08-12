// documents.js - FIXED VERSION for proper Firebase persistence
// Changes the global reference pattern to match appliances

class CasaCareDocuments {
    constructor() {
        this.documents = [];
        this.currentView = 'overview';
        this.currentTaskId = null;
        this.maxFileSize = 5 * 1024 * 1024;
        this.allowedTypes = {
            images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            documents: ['application/pdf', 'text/plain'],
            receipts: ['image/jpeg', 'image/png', 'application/pdf']
        };
        
        console.log('📄 Documents Module: Initializing...');
        this.init();
    }
    
    init() {
        this.loadDocuments();
        this.bindEvents();
        this.render();
        console.log('✅ Documents Module: Initialized');
    }
    
    // FIXED: Load documents using direct global reference like appliances
    loadDocuments() {
        try {
            // Use direct global reference like appliances do
            this.documents = Array.isArray(window.documentsData) ? window.documentsData : [];
            console.log(`📄 Documents: Loaded ${this.documents.length} documents from global data`);
        } catch (error) {
            console.error('❌ Documents: Error loading documents:', error);
            this.documents = [];
        }
    }
    
    saveDocuments() {
    window.documentsData = this.documents;
    window.casaCareData.documents = this.documents;
    if (window.saveData) window.saveData();
}
    
    // Rest of the class methods remain the same...
    // (keeping them for completeness but focusing on the persistence fix)
    
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
        
        const cameraBtn = document.getElementById('camera-capture-btn');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => this.capturePhoto());
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
            case 'task-docs':
                this.renderTaskDocuments();
                break;
            case 'upload':
                this.renderUploadInterface();
                break;
            default:
                this.renderOverview();
        }
    }
    
    // Simplified render methods (keeping core functionality)
    renderOverview() {
        const documentsView = document.getElementById('documents-view');
        if (!documentsView) return;
        
        const documentsByType = this.groupDocumentsByType();
        
        documentsView.innerHTML = `
            <div class="p-4 space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Documents</h2>
                        <p class="text-gray-600 text-sm">Manage warranties, receipts, and maintenance photos</p>
                    </div>
                    <button onclick="window.casaCareDocuments.showUploadInterface()" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        📄 Add Document
                    </button>
                </div>
                
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
                                <p class="text-xl font-bold text-gray-900">${documentsByType.warranties?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-4 shadow-lg">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-yellow-100 rounded-lg text-lg">🧾</div>
                            <div>
                                <p class="text-xs text-gray-600">Receipts</p>
                                <p class="text-xl font-bold text-gray-900">${documentsByType.receipts?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-4 shadow-lg">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-purple-100 rounded-lg text-lg">📸</div>
                            <div>
                                <p class="text-xs text-gray-600">Photos</p>
                                <p class="text-xl font-bold text-gray-900">${documentsByType.photos?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${this.documents.length > 0 ? `
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div class="p-4 border-b border-gray-100">
                            <h3 class="text-lg font-bold text-gray-900">All Documents</h3>
                        </div>
                        <div class="p-4">
                            ${this.renderAllDocumentsList()}
                        </div>
                    </div>
                ` : `
                    <div class="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div class="text-6xl mb-4">📄</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">No Documents Yet</h3>
                        <p class="text-gray-600 mb-6">Start by uploading warranties, receipts, or maintenance photos.</p>
                        <button onclick="window.casaCareDocuments.showUploadInterface()" 
                                class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            📄 Add Your First Document
                        </button>
                    </div>
                `}
            </div>
        `;
    }
    
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
                                    💾 Save 
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
    
    // Essential utility methods
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!this.validateFile(file)) return;
        this.showFilePreview(file);
    }
    
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
    
    // Navigation methods
    showOverview() {
        this.currentView = 'overview';
        this.render();
    }
    
    showUploadInterface() {
        this.currentView = 'upload';
        this.render();
    }
    
    // Utility methods
    groupDocumentsByType() {
        return this.documents.reduce((groups, doc) => {
            const type = doc.type;
            if (!groups[type]) groups[type] = [];
            groups[type].push(doc);
            return groups;
        }, {});
    }
    
    renderAllDocumentsList() {
        return this.documents
            .map(doc => `
                <div class="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                        <div class="font-medium text-gray-900">${doc.title}</div>
                        <div class="text-sm text-gray-600">${this.getDocumentTypeIcon(doc.type)} ${doc.type}</div>
                        <div class="text-xs text-gray-500">${new Date(doc.uploadDate).toLocaleDateString()}</div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.casaCareDocuments.viewDocument(${doc.id})"
                                class="text-blue-600 hover:text-blue-800 text-sm">
                            View
                        </button>
                        <button onclick="window.casaCareDocuments.deleteDocument(${doc.id})"
                                class="text-red-600 hover:text-red-800 text-sm">
                            Delete
                        </button>
                    </div>
                </div>
            `)
            .join('');
    }
    
    getDocumentTypeIcon(type) {
        const icons = {
            warranty: '🛡️',
            receipt: '🧾',
            insurance: '📋',
            manual: '📖',
            photo: '📸',
            other: '📄'
        };
        return icons[type] || '📄';
    }
    
    viewDocument(documentId) {
        const doc = this.documents.find(d => d.id === documentId);
        if (!doc) {
            alert('❌ Document not found');
            return;
        }
        
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            if (doc.fileType.startsWith('image/')) {
                newWindow.document.write(`
                    <html>
                        <head><title>${doc.title}</title></head>
                        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;">
                            <img src="${doc.fileData}" alt="${doc.title}" style="max-width:100%;max-height:100%;object-fit:contain;">
                        </body>
                    </html>
                `);
            } else if (doc.fileType === 'application/pdf') {
                newWindow.location = doc.fileData;
            }
        }
    }
    
    deleteDocument(documentId) {
        const doc = this.documents.find(d => d.id === documentId);
        if (!doc) {
            alert('❌ Document not found');
            return;
        // Auto-delete from Firebase Storage if fileURL exists
        const doc = this.documents.find(d => d.id === id);
        if (doc && doc.fileURL) {
            try {
                const storageRef = firebase.storage().refFromURL(doc.fileURL);
                storageRef.delete().then(() => {
                    console.log('🗑️ File deleted from storage:', doc.fileURL);
                }).catch(err => {
                    console.warn('⚠️ Could not delete file from storage:', err);
                });
            } catch (e) {
                console.error('Error deleting from storage:', e);
            }
        }
        }
        
        if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
            this.documents = this.documents.filter(d => d.id !== documentId);
            this.saveDocuments();
            this.render();
            console.log('🗑️ Documents: Document deleted:', doc.title);
        }
    }
}

// Initialize the documents module
window.CasaCareDocuments = CasaCareDocuments;
console.log('📄 Documents Module: FIXED VERSION loaded successfully');
