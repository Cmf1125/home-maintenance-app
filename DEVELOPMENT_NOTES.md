Include things like:

Your preferred working style ("break into small modules, 3-file approach")
Decisions we've made ("using localStorage, no backend yet")
Feature roadmap ("next: calendar integration, document upload")
Code patterns you like

2. Start new conversations with context
Something like:

"I'm working on Casa Care (home maintenance app). We've split it into 3 files (index.html, styles.css, app.js). Working style: modular approach, prefer small incremental changes. Ready to add calendar integration to the dashboard."

3. Reference specific conversations
You can copy/paste key decisions or code snippets from our previous chats when starting new ones.

Calendar Integration ideas:

Export tasks to .ics format (works with Google Calendar, Outlook, Apple Calendar)
Show tasks in a calendar view within the app
Sync with external calendars (requires more complexity)

Document Upload ideas:

Store insurance policies, warranties, receipts per task
Photo attachments for completed tasks
Maintenance history with photos

If you need to add features, build on the window.CasaCare system
Use window.CasaCare.dateUtils for any date handling
The modal system is now rock-solid for future enhancements

📊 What Goes Where:
data.js - Data & Storage

homeData and tasks variables
saveData(), loadData(), clearData(), exportData()
Data validation functions

task-generator.js - Task Logic

generateTaskTemplates()
generateRegionalTasks()
getClimateRegion()
All the task creation logic

ui-components.js - UI Rendering

renderTaskCategories()
renderTaskCard()
updateDashboard()
renderTasks()
updatePropertySummary()

app.js - Main Controller

initializeApp()
Navigation functions (showTaskSetup(), finishTaskSetup())
Event handlers (createMaintenancePlan(), completeTask())
Modal functions (editTaskFromSetup(), closeTaskEditModal())
