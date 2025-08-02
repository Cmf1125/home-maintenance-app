 <!-- Task Edit Modal -->
        <div id="task-edit-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold" id="task-edit-title">Edit Task</h3>
                    <button onclick="closeTaskEditModal()" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
                </div>
                
                <div class="space-y-4">
                    <!-- Task Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                        <input type="text" id="edit-task-name" 
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                               placeholder="Enter task name" required>
                    </div>
                    
                   <!-- Description -->
<div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
    <textarea id="edit-task-description" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base" 
              rows="3" placeholder="Optional: Describe what needs to be done"></textarea>
</div>
                    
                    <!-- Due Date -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                        <input type="date" id="edit-task-due-date" 
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base" required>
                    </div>
                    
                    <!-- Frequency and Cost Row - IMPROVED -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Frequency (days) *</label>
                            <input type="number" id="edit-task-frequency" 
                                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                                   min="1" placeholder="365" required>
                            <p class="text-xs text-gray-500 mt-1">How often to repeat</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                            <input type="number" id="edit-task-cost" 
                                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                                   min="0" step="0.01" placeholder="0.00">
                            <p class="text-xs text-gray-500 mt-1">Estimated cost per task</p>
                        </div>
                    </div>
                    
                    <!-- Category -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="edit-task-category" 
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base">
                            <option value="General">🔧 General</option>
                            <option value="HVAC">🌡️ HVAC</option>
                            <option value="Water Systems">💧 Water Systems</option>
                            <option value="Exterior">🏠 Exterior</option>
                            <option value="Pest Control">🐛 Pest Control</option>
                            <option value="Safety">⚠️ Safety</option>
                            <option value="Seasonal">🌍 Seasonal</option>
                        </select>
                        <p class="text-xs text-gray-500 mt-1">💡 Priority is automatically set: Safety tasks = High, others = Medium</p>
                    </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-3 mt-6">
                    <button onclick="deleteTaskFromEdit()" 
                            class="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors touch-btn">
                        🗑️ Delete
                    </button>
                    <button onclick="closeTaskEditModal()" 
                            class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors touch-btn">
                        Cancel
                    </button>
                    <button onclick="saveTaskFromEdit()" 
                            class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors touch-btn">
                        💾 Save Task
                    </button>
                </div>
                
                <!-- Helper Text -->
                <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p class="text-xs text-blue-800">
                        <strong>💡 Tip:</strong> Frequency determines how often this task repeats after completion. 
                        For example, 90 days means the task will be due again 90 days after you mark it complete.
                    </p>
                </div>
            </div>
        </div>
