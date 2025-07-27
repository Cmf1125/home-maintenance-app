// documents.js - Casa Care Document Management Module
// Handles insurance policies, warranties, receipts, and maintenance photos

class CasaCareDocuments {
    constructor() {
        this.documents = [];
        this.currentView = 'overview'; // 'overview', 'task-docs', 'upload'
        this.currentTaskId = null;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB limit
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
    
    // Load documents from storage
    loadDocuments() {
        try {
            const savedDocs = localStorage.getItem('casaCareDocuments');
            this.documents = savedDocs ? JSON.parse(savedDocs) : [];
            console.log(`📄 Documents: Loaded ${this.documents.length} documents`);
        } catch (error) {
            console.error('❌ Documents: Error loading documents:', error);
            this.documents = [];
        }
    }
    
    // Save documents to storage
    saveDocuments() {
        try {
            localStorage.setItem('casaCareDocuments', JSON.stringify(this.documents));
            console.log('💾 Documents: Saved successfully');
        } catch (error) {
            console.error('❌ Documents: Error saving documents:', error);
            if (error.name === 'QuotaExceededError') {
                alert('❌ Storage quota exceeded. Please delete some documents to free up space.');
            }
        }
    }
    
    // Bind events
    bindEvents() {
        // We'll set up event listeners when the DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }
    
    setupEventListeners() {
        // File input change handler
        const fileInput = document.getElementById('document-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        // Camera capture button
        const cameraBtn = document.getElementById('camera-capture-btn');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => this.capturePhoto());
        }
    }
    
    // Main render function
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
    
    // Render documents overview
    renderOverview() {
        const documentsView = document.getElementById('documents-view');
        if (!documentsView) return;
        
        const documentsByType = this.groupDocumentsByType();
        const recentDocuments = this.getRecentDocuments(5);
        
        documentsView.innerHTML = `
            <div class="p-4 space-y-6">
                <!-- Header -->
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
                
                <!-- Document Categories -->
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- By Task -->
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div class="p-4 border-b border-gray-100">
                            <h3 class="text-lg font-bold text-gray-900">Documents by Task</h3>
                        </div>
                        <div class="p-4">
                            ${this.renderTaskDocumentsList()}
                        </div>
                    </div>
                    
                    <!-- Recent Documents -->
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div class="p-4 border-b border-gray-100">
                            <h3 class="text-lg font-bold text-gray-900">Recent Documents</h3>
                        </div>
                        <div class="p-4">
                            ${this.renderRecentDocumentsList(recentDocuments)}
                        </div>
                    </div>
                </div>
                
                <!-- All Documents -->
                ${this.documents.length > 0 ? `
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div class="p-4 border-b border-gray-100">
                            <h3 class="text-lg font-bold text-gray-900">All Documents</h3>
                        </div>
                        <div class="p-4">
                            ${this.renderAllDocumentsList()}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // Render upload interface
    renderUploadInterface() {
        const documentsView = document.getElementById('documents-view');
        if (!documentsView) return;
        
        documentsView.innerHTML = `
            <div class="p-4">
                <div class="max-w-2xl mx-auto">
                    <!-- Header -->
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
                    
                    <!-- Upload Form -->
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <form id="document-upload-form" class="space-y-6">
                            <!-- Document Type -->
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
                            
                            <!-- Related Task -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Related Task (Optional)</label>
                                <select id="related-task" class="w-full p-3 border border-gray-300 rounded-lg">
                                    <option value="">Select a task...</option>
                                    ${this.renderTaskOptions()}
                                </select>
                            </div>
                            
                            <!-- Document Title -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                                <input type="text" id="document-title" 
                                       class="w-full p-3 border border-gray-300 rounded-lg"
                                       placeholder="e.g., HVAC System Warranty, Repair Receipt">
                            </div>
                            
                            <!-- Description -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                                <textarea id="document-description" 
                                          class="w-full p-3 border border-gray-300 rounded-lg" 
                                          rows="3" 
                                          placeholder="Additional details about this document..."></textarea>
                            </div>
                            
                            <!-- File Upload -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">File</label>
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                    <input type="file" id="document-file-input" class="hidden" 
                                           accept="image/*,application/pdf,.pdf,.txt">
                                    
                                    <div class="space-y-4">
                                        <div class="text-4xl text-gray-400">📄</div>
                                        
                                        <div class="space-y-2">
                                            <button type="button" 
                                                    onclick="document.getElementById('document-file-input').click()"
                                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                                Choose File
                                            </button>
                                            
                                            ${this.isMobileDevice() ? `
                                                <button type="button" id="camera-capture-btn"
                                                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 ml-2">
                                                    📸 Take Photo
                                                </button>
                                            ` : ''}
                                        </div>
                                        
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
                            
                            <!-- Action Buttons -->
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
        
        // Set up form submission
        const form = document.getElementById('document-upload-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Re-bind file input events
        this.setupEventListeners();
    }
    
    // Handle file selection
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('📄 Documents: File selected:', file.name, file.type, file.size);
        
        // Validate file
        if (!this.validateFile(file)) {
            return;
        }
        
        // Show preview
        this.showFilePreview(file);
    }
    
    // Validate file
    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            alert(`❌ File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
            return false;
        }
        
        // Check file type
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
    
    // Show file preview
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
    
    // Handle form submission
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const fileInput = document.getElementById('document-file-input');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('❌ Please select a file to upload');
            return;
        }
        
        // Get form values
        const documentData = {
            id: Date.now(), // Simple ID generation
            type: document.getElementById('document-type').value,
            title: document.getElementById('document-title').value.trim(),
            description: document.getElementById('document-description').value.trim(),
            relatedTaskId: document.getElementById('related-task').value || null,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadDate: new Date().toISOString(),
            fileData: null // Will be set below
        };
        
        // Validate required fields
        if (!documentData.title) {
            alert('❌ Please enter a document title');
            document.getElementById('document-title').focus();
            return;
        }
        
        try {
            // Read file as base64
            const fileData = await this.readFileAsBase64(file);
            documentData.fileData = fileData;
            
            // Save document
            this.documents.push(documentData);
            this.saveDocuments();
            
            // Show success and return to overview
            alert(`✅ Document "${documentData.title}" uploaded successfully!`);
            this.showOverview();
            
        } catch (error) {
            console.error('❌ Documents: Error uploading file:', error);
            alert('❌ Error uploading file. Please try again.');
        }
    }
    
    // Read file as base64
    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // Capture photo (mobile)
    async capturePhoto() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } // Use back camera
            });
            
            // Create a simple camera interface
            this.showCameraInterface(stream);
            
        } catch (error) {
            console.error('❌ Documents: Camera access error:', error);
            alert('❌ Unable to access camera. Please use the file picker instead.');
        }
    }
    
    // Utility functions
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    groupDocumentsByType() {
        return this.documents.reduce((groups, doc) => {
            const type = doc.type;
            if (!groups[type]) groups[type] = [];
            groups[type].push(doc);
            return groups;
        }, {});
    }
    
    getRecentDocuments(count = 5) {
        return this.documents
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, count);
    }
    
    renderTaskOptions() {
        if (!window.tasks) return '<option value="">No tasks available</option>';
        
        return window.tasks
            .map(task => `<option value="${task.id}">${task.title}</option>`)
            .join('');
    }
    
    renderTaskDocumentsList() {
        if (!window.tasks) return '<p class="text-gray-500 text-sm">No tasks available</p>';
        
        const tasksWithDocs = window.tasks
            .map(task => ({
                ...task,
                documents: this.documents.filter(doc => doc.relatedTaskId == task.id)
            }))
            .filter(task => task.documents.length > 0);
        
        if (tasksWithDocs.length === 0) {
            return '<p class="text-gray-500 text-sm">No task documents yet</p>';
        }
        
        return tasksWithDocs
            .map(task => `
                <div class="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div class="font-medium text-gray-900">${task.title}</div>
                    <div class="text-sm text-gray-600">${task.documents.length} document(s)</div>
                    <button onclick="window.casaCareDocuments.showTaskDocuments(${task.id})"
                            class="text-blue-600 hover:text-blue-800 text-sm mt-1">
                        View Documents →
                    </button>
                </div>
            `)
            .join('');
    }
    
    renderRecentDocumentsList(documents) {
        if (documents.length === 0) {
            return '<p class="text-gray-500 text-sm">No documents yet</p>';
        }
        
        return documents
            .map(doc => `
                <div class="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div class="font-medium text-gray-900">${doc.title}</div>
                    <div class="text-sm text-gray-600">${this.getDocumentTypeIcon(doc.type)} ${doc.type}</div>
                    <div class="text-xs text-gray-500">${new Date(doc.uploadDate).toLocaleDateString()}</div>
                </div>
            `)
            .join('');
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
    
    // Navigation methods
    showOverview() {
        this.currentView = 'overview';
        this.render();
    }
    
    showUploadInterface() {
        this.currentView = 'upload';
        this.render();
    }
    
    showTaskDocuments(taskId) {
        this.currentTaskId = taskId;
        this.currentView = 'task-docs';
        this.render();
    }
    
    // Document management methods
    viewDocument(documentId) {
        const doc = this.documents.find(d => d.id === documentId);
        if (!doc) {
            alert('❌ Document not found');
            return;
        }
        
        // Create a new window/tab to display the document
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
            } else {
                // For text files, show content
                newWindow.document.write(`
                    <html>
                        <head><title>${doc.title}</title></head>
                        <body style="padding:20px;font-family:Arial,sans-serif;">
                            <h1>${doc.title}</h1>
                            <pre>${doc.fileData}</pre>
                        </body>
                    </html>
                `);
            }
        }
    }
    
    deleteDocument(documentId) {
        const doc = this.documents.find(d => d.id === documentId);
        if (!doc) {
            alert('❌ Document not found');
            return;
        }
        
        if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
            this.documents = this.documents.filter(d => d.id !== documentId);
            this.saveDocuments();
            this.render(); // Refresh view
            console.log('🗑️ Documents: Document deleted:', doc.title);
        }
    }
    
    // Integration with tasks
    getTaskDocuments(taskId) {
        return this.documents.filter(doc => doc.relatedTaskId == taskId);
    }
    
    addTaskPhoto(taskId, photoData, title = 'Maintenance Photo') {
        const photo = {
            id: Date.now(),
            type: 'photo',
            title: title,
            description: 'Photo taken during task completion',
            relatedTaskId: taskId,
            fileName: `task_${taskId}_photo_${Date.now()}.jpg`,
            fileType: 'image/jpeg',
            fileSize: photoData.length,
            uploadDate: new Date().toISOString(),
            fileData: photoData
        };
        
        this.documents.push(photo);
        this.saveDocuments();
        console.log('📸 Documents: Task photo added for task', taskId);
        return photo.id;
    }
}

// Initialize the documents module
let casaCareDocuments;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CasaCareDocuments;
} else {
    // Browser environment
    window.CasaCareDocuments = CasaCareDocuments;
}

console.log('📄 Documents Module: Loaded successfully');
